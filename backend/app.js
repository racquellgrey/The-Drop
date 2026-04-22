"use strict";

/**
 * Express application factory.
 *
 * This module exports the configured `app` with NO call to `listen()`, so it
 * can be used as:
 *   - A standard HTTP server (see server.js, for local dev).
 *   - A Vercel serverless function handler (see ../api/index.js).
 *
 * Security posture:
 *   - helmet: safe default HTTP headers.
 *   - express-rate-limit: per-IP throttling on auth & write routes.
 *   - CORS is permissive for this coursework app to avoid blocking browser
 *     flows during local demos.
 *   - JSON body size is capped.
 *   - SQL error messages are NOT echoed to clients in production.
 *   - Credentials are read from env vars only; nothing is logged.
 */

// Load .env ONLY in local dev. On Vercel, env vars are injected by the
// platform and dotenv must not overwrite them.
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  require("dotenv").config();
}

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { getPool, ping } = require("./db");

const IS_PROD = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1); // Vercel terminates TLS; trust 1 hop of X-Forwarded-*.

// ── Security middleware ──────────────────────────────────────

// NOTE: The frontend relies on inline onclick/onsubmit handlers and inline
// <script> blocks in several pages. Allowing 'unsafe-inline' on script-src
// weakens XSS protection, but it's necessary until the frontend is migrated
// to external event listeners. Tracked in docs/SECURITY.md.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "frame-ancestors": ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Keep CORS simple for this project so local and hosted frontends both work
// without extra origin config.
app.use(cors());

app.use(express.json({ limit: "100kb" }));

// Rate limits. Writes / auth get the tighter bucket.
const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 250,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);

// ── Static frontend ──────────────────────────────────────────

app.use(
  express.static(path.join(__dirname, "..", "frontend"), {
    fallthrough: true,
    index: "index.html",
    maxAge: IS_PROD ? "1h" : 0,
  })
);

// ── Helpers ──────────────────────────────────────────────────

/**
 * Wraps an async route so thrown errors flow to the error handler instead of
 * crashing the function. Never leak SQL/driver messages in production.
 */
const h = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function sendError(res, err, status = 500) {
  // In prod: generic message. In dev: include err.message for debugging.
  const body = { error: "Internal server error." };
  if (!IS_PROD && err && err.message) body.detail = err.message;
  res.status(status).json(body);
}

// ── Status ───────────────────────────────────────────────────

app.get(
  "/status",
  h(async (_req, res) => {
    const connected = await ping();
    res.json({ connected });
  })
);

// ── API ROUTES ───────────────────────────────────────────────

app.get(
  "/api/drops",
  h(async (_req, res) => {
    try {
      const [rows] = await getPool().query(`
        SELECT d.*, r.name AS retailer_name
        FROM drop_event d
        JOIN retailer r ON d.retailer_id = r.retailer_id
        ORDER BY d.drop_start_at ASC
      `);
      res.json(rows);
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/products",
  h(async (_req, res) => {
    try {
      const [rows] = await getPool().query(`
        SELECT p.*, r.name AS retailer_name
        FROM product p
        JOIN retailer r ON p.retailer_id = r.retailer_id
        ORDER BY p.created_at DESC
      `);
      res.json(rows);
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/products/:id",
  h(async (req, res) => {
    try {
      const [[product]] = await getPool().query(
        `SELECT p.*, r.name AS retailer_name
         FROM product p
         JOIN retailer r ON p.retailer_id = r.retailer_id
         WHERE p.product_id = ?`,
        [req.params.id]
      );
      if (!product) return res.status(404).json({ error: "Product not found." });
      res.json(product);
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/products/:id/reviews",
  h(async (req, res) => {
    try {
      const [reviews] = await getPool().query(
        `SELECT
           u.user_id, u.username, u.first_name, u.last_name,
           rt.stars, rt.purchase_id, rt.created_at AS rated_at,
           f.text AS feedback_text, f.created_at AS feedback_at
         FROM rating rt
         JOIN users u ON rt.user_id = u.user_id
         LEFT JOIN feedback f
           ON f.user_id = rt.user_id
          AND f.product_id = rt.product_id
          AND f.purchase_id = rt.purchase_id
         WHERE rt.product_id = ?
         ORDER BY rt.created_at DESC`,
        [req.params.id]
      );

      const [[{ avg_stars, review_count }]] = await getPool().query(
        "SELECT AVG(stars) AS avg_stars, COUNT(*) AS review_count FROM rating WHERE product_id = ?",
        [req.params.id]
      );

      res.json({
        reviews,
        avg_stars: parseFloat(avg_stars) || 0,
        review_count: parseInt(review_count, 10),
      });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.post(
  "/api/products/:id/reviews",
  h(async (req, res) => {
    const { user_id, purchase_id, stars, text } = req.body || {};
    const product_id = req.params.id;

    if (!user_id || !purchase_id || stars == null) {
      return res.status(400).json({
        success: false,
        message: "user_id, purchase_id, and stars are required.",
      });
    }
    if (stars < 1 || stars > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Stars must be between 1 and 5." });
    }

    try {
      const pool = getPool();
      const [purchases] = await pool.query(
        "SELECT purchase_id FROM purchase WHERE purchase_id = ? AND user_id = ? AND product_id = ?",
        [purchase_id, user_id, product_id]
      );
      if (!purchases.length) {
        return res.json({
          success: false,
          message: "You must purchase this product before reviewing it.",
        });
      }

      const [existing] = await pool.query(
        "SELECT rating_id FROM rating WHERE user_id = ? AND product_id = ? AND purchase_id = ?",
        [user_id, product_id, purchase_id]
      );
      if (existing.length) {
        return res.json({
          success: false,
          message: "You have already reviewed this purchase.",
        });
      }

      await pool.query(
        "INSERT INTO rating (user_id, product_id, purchase_id, stars) VALUES (?, ?, ?, ?)",
        [user_id, product_id, purchase_id, stars]
      );

      if (text && String(text).trim()) {
        await pool.query(
          "INSERT INTO feedback (user_id, product_id, purchase_id, text) VALUES (?, ?, ?, ?)",
          [user_id, product_id, purchase_id, String(text).trim()]
        );
      }

      res.json({ success: true });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/products/:id/user-status/:user_id",
  h(async (req, res) => {
    const { id: product_id, user_id } = req.params;
    try {
      const pool = getPool();
      const [purchases] = await pool.query(
        "SELECT purchase_id FROM purchase WHERE user_id = ? AND product_id = ? ORDER BY purchased_at DESC LIMIT 1",
        [user_id, product_id]
      );
      const has_purchased = purchases.length > 0;
      const purchase_id = has_purchased ? purchases[0].purchase_id : null;

      let has_reviewed = false;
      if (has_purchased) {
        const [ratings] = await pool.query(
          "SELECT rating_id FROM rating WHERE user_id = ? AND product_id = ?",
          [user_id, product_id]
        );
        has_reviewed = ratings.length > 0;
      }

      res.json({ has_purchased, purchase_id, has_reviewed });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/stats",
  h(async (_req, res) => {
    try {
      const pool = getPool();
      const [[{ products }]] = await pool.query(
        "SELECT COUNT(*) AS products FROM product"
      );
      const [[{ retailers }]] = await pool.query(
        "SELECT COUNT(*) AS retailers FROM retailer"
      );
      const [[{ drops }]] = await pool.query(
        "SELECT COUNT(*) AS drops FROM drop_event WHERE status != 'completed'"
      );
      res.json({ products, retailers, drops });
    } catch (err) {
      sendError(res, err);
    }
  })
);

// ── Auth ─────────────────────────────────────────────────────
// NOTE: This demo stores passwords in plaintext to match the coursework spec.
// Before any real-world deployment, switch to argon2/bcrypt hashes.

app.post(
  "/api/signup",
  authLimiter,
  h(async (req, res) => {
    const { email, username, password, first_name, last_name, phone } =
      req.body || {};
    const emailTrim = typeof email === "string" ? email.trim() : "";
    const userTrim = typeof username === "string" ? username.trim() : "";
    const passStr = typeof password === "string" ? password : "";

    if (!emailTrim || !userTrim || !passStr) {
      return res.status(400).json({
        success: false,
        message: "Email, username, and password are required.",
      });
    }
    if (passStr.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    try {
      const pool = getPool();
      const [emailTaken] = await pool.query(
        "SELECT user_id FROM users WHERE email = ?",
        [emailTrim]
      );
      if (emailTaken.length) {
        return res.json({
          success: false,
          message: "An account with this email already exists.",
        });
      }
      const [userTaken] = await pool.query(
        "SELECT user_id FROM users WHERE username = ?",
        [userTrim]
      );
      if (userTaken.length) {
        return res.json({
          success: false,
          message: "This username is already taken.",
        });
      }

      const fn = typeof first_name === "string" ? first_name.trim() || null : null;
      const ln = typeof last_name === "string" ? last_name.trim() || null : null;
      const ph = typeof phone === "string" ? phone.trim() || null : null;

      const [result] = await pool.query(
        "INSERT INTO users (email, username, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)",
        [emailTrim, userTrim, passStr, fn, ln, ph]
      );

      const [rows] = await pool.query(
        "SELECT user_id, email, username, first_name, last_name FROM users WHERE user_id = ?",
        [result.insertId]
      );
      res.json({ success: true, user: rows[0] });
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res.json({
          success: false,
          message: "Email or username is already in use.",
        });
      }
      sendError(res, err);
    }
  })
);

app.post(
  "/api/login",
  authLimiter,
  h(async (req, res) => {
    const { email, password } = req.body || {};
    try {
      const [rows] = await getPool().query(
        "SELECT user_id, email, username, first_name, last_name FROM users WHERE email = ? AND password_hash = ?",
        [email, password]
      );
      if (!rows.length) {
        return res.json({ success: false, message: "Invalid email or password." });
      }
      res.json({ success: true, user: rows[0] });
    } catch (err) {
      sendError(res, err);
    }
  })
);

// ── Requests ─────────────────────────────────────────────────

app.get(
  "/api/requests/:user_id",
  h(async (req, res) => {
    try {
      const [rows] = await getPool().query(
        `SELECT r.*, d.name AS drop_name, d.drop_id
         FROM requests r
         JOIN availability_schedule s ON r.schedule_id = s.schedule_id
         JOIN drop_event d ON s.drop_id = d.drop_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [req.params.user_id]
      );
      res.json(rows);
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.post(
  "/api/requests",
  h(async (req, res) => {
    const { user_id, drop_id } = req.body || {};
    try {
      const pool = getPool();
      const [schedules] = await pool.query(
        "SELECT schedule_id FROM availability_schedule WHERE drop_id = ? LIMIT 1",
        [drop_id]
      );
      if (!schedules.length) {
        return res.json({
          success: false,
          message: "No availability schedule found for this drop.",
        });
      }
      const schedule_id = schedules[0].schedule_id;

      const [existing] = await pool.query(
        "SELECT request_id FROM requests WHERE user_id = ? AND schedule_id = ?",
        [user_id, schedule_id]
      );
      if (existing.length) {
        return res.json({
          success: false,
          message: "You have already requested this drop.",
        });
      }

      const [result] = await pool.query(
        "INSERT INTO requests (user_id, schedule_id, request_status) VALUES (?, ?, ?)",
        [user_id, schedule_id, "pending"]
      );
      res.json({ success: true, request_id: result.insertId });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.delete(
  "/api/requests/:request_id",
  h(async (req, res) => {
    try {
      await getPool().query("DELETE FROM requests WHERE request_id = ?", [
        req.params.request_id,
      ]);
      res.json({ success: true });
    } catch (err) {
      sendError(res, err);
    }
  })
);

// ── Purchase ─────────────────────────────────────────────────

app.post(
  "/api/purchase",
  h(async (req, res) => {
    const { user_id, items } = req.body || {};
    if (!Array.isArray(items) || !items.length) {
      return res
        .status(400)
        .json({ success: false, message: "items must be a non-empty array." });
    }
    try {
      const pool = getPool();
      for (const item of items) {
        const [schedules] = await pool.query(
          "SELECT schedule_id, retailer_id FROM availability_schedule WHERE product_id = ? AND is_available = true LIMIT 1",
          [item.product_id]
        );

        let schedule_id, retailer_id;
        if (!schedules.length) {
          const [[product]] = await pool.query(
            "SELECT retailer_id FROM product WHERE product_id = ?",
            [item.product_id]
          );
          schedule_id = 1;
          retailer_id = product.retailer_id;
        } else {
          schedule_id = schedules[0].schedule_id;
          retailer_id = schedules[0].retailer_id;
        }

        await pool.query(
          "INSERT INTO purchase (user_id, retailer_id, schedule_id, product_id, qty, total_amount, purchase_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            user_id,
            retailer_id,
            schedule_id,
            item.product_id,
            item.qty,
            (item.price * item.qty).toFixed(2),
            "pending",
          ]
        );
      }
      res.json({ success: true });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/purchases/:user_id",
  h(async (req, res) => {
    try {
      const [rows] = await getPool().query(
        `SELECT pu.*, p.name AS product_name
         FROM purchase pu
         JOIN product p ON pu.product_id = p.product_id
         WHERE pu.user_id = ?
         ORDER BY pu.purchased_at DESC`,
        [req.params.user_id]
      );
      res.json(rows);
    } catch (err) {
      sendError(res, err);
    }
  })
);

// ── Retailer ─────────────────────────────────────────────────

app.post(
  "/api/retailer/login",
  authLimiter,
  h(async (req, res) => {
    const { email, password } = req.body || {};
    try {
      const [rows] = await getPool().query(
        "SELECT retailer_id, name, email FROM retailer WHERE email = ? AND password_hash = ?",
        [email, password]
      );
      if (!rows.length) {
        return res.json({ success: false, message: "Invalid email or password." });
      }
      res.json({ success: true, retailer: rows[0] });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/retailer/:id/products",
  h(async (req, res) => {
    try {
      const [rows] = await getPool().query(
        "SELECT * FROM product WHERE retailer_id = ? ORDER BY created_at DESC",
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.post(
  "/api/retailer/products",
  h(async (req, res) => {
    const { name, brand, sku, price, colorway, description, retailer_id } =
      req.body || {};
    try {
      const [result] = await getPool().query(
        "INSERT INTO product (retailer_id, sku, name, brand, colorway, price, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [retailer_id, sku, name, brand, colorway || null, price, description || null]
      );
      res.json({ success: true, product_id: result.insertId });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.put(
  "/api/retailer/products/:id",
  h(async (req, res) => {
    const { name, brand, sku, price, colorway, description } = req.body || {};
    try {
      await getPool().query(
        "UPDATE product SET name = ?, brand = ?, sku = ?, price = ?, colorway = ?, description = ? WHERE product_id = ?",
        [name, brand, sku, price, colorway || null, description || null, req.params.id]
      );
      res.json({ success: true });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.delete(
  "/api/retailer/products/:id",
  h(async (req, res) => {
    try {
      await getPool().query("DELETE FROM product WHERE product_id = ?", [
        req.params.id,
      ]);
      res.json({ success: true });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/retailer/:id/drops",
  h(async (req, res) => {
    try {
      const [rows] = await getPool().query(
        "SELECT * FROM drop_event WHERE retailer_id = ? ORDER BY drop_start_at DESC",
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.post(
  "/api/retailer/drops",
  h(async (req, res) => {
    const { name, description, drop_start_at, drop_end_at, status, retailer_id } =
      req.body || {};
    try {
      const [result] = await getPool().query(
        "INSERT INTO drop_event (retailer_id, name, description, drop_start_at, drop_end_at, status) VALUES (?, ?, ?, ?, ?, ?)",
        [retailer_id, name, description || null, drop_start_at, drop_end_at || null, status]
      );
      res.json({ success: true, drop_id: result.insertId });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.put(
  "/api/retailer/drops/:id",
  h(async (req, res) => {
    const { name, description, drop_start_at, drop_end_at, status } =
      req.body || {};
    try {
      await getPool().query(
        "UPDATE drop_event SET name = ?, description = ?, drop_start_at = ?, drop_end_at = ?, status = ? WHERE drop_id = ?",
        [name, description || null, drop_start_at, drop_end_at || null, status, req.params.id]
      );
      res.json({ success: true });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.delete(
  "/api/retailer/drops/:id",
  h(async (req, res) => {
    try {
      await getPool().query("DELETE FROM drop_event WHERE drop_id = ?", [
        req.params.id,
      ]);
      res.json({ success: true });
    } catch (err) {
      sendError(res, err);
    }
  })
);

app.get(
  "/api/retailer/:id/orders",
  h(async (req, res) => {
    try {
      const [rows] = await getPool().query(
        `SELECT pu.*, p.name AS product_name, u.email AS buyer_email
         FROM purchase pu
         JOIN product p ON pu.product_id = p.product_id
         JOIN users u ON pu.user_id = u.user_id
         WHERE pu.retailer_id = ?
         ORDER BY pu.purchased_at DESC`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      sendError(res, err);
    }
  })
);

// ── 404 + error handler ──────────────────────────────────────

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Final error handler — never leak stack traces in production.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  sendError(res, err);
});

module.exports = app;
