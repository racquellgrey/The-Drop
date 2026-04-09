require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "thedrop",
};

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "frontend")));

let connection = null;
let connected = false;

// Auto-connect to MySQL on startup
async function initDB() {
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    connected = true;
    console.log("Connected to MySQL database: thedrop");
  } catch (err) {
    console.error("Failed to connect to MySQL:", err.message);
  }
}

// ── STATUS / CONNECT / DISCONNECT ────────────────────────────

app.get("/status", (req, res) => {
  res.json({ connected });
});

app.post("/connect", async (req, res) => {
  try {
    if (connected && connection) {
      return res.json({ success: true, message: "Already connected to the database." });
    }
    connection = await mysql.createConnection(DB_CONFIG);
    connected = true;
    res.json({ success: true, message: "Database connection established successfully." });
  } catch (error) {
    connection = null;
    connected = false;
    res.status(500).json({ success: false, message: "Failed to connect to the database.", error: error.message });
  }
});

app.post("/disconnect", async (req, res) => {
  try {
    if (!connected || !connection) {
      return res.json({ success: true, message: "No active database connection." });
    }
    await connection.end();
    connection = null;
    connected = false;
    res.json({ success: true, message: "Database connection closed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to close the database connection.", error: error.message });
  }
});

// ── API ROUTES ────────────────────────────────────────────────

app.get("/api/drops", async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT d.*, r.name AS retailer_name
      FROM drop_event d
      JOIN retailer r ON d.retailer_id = r.retailer_id
      ORDER BY d.drop_start_at ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT p.*, r.name AS retailer_name
      FROM product p
      JOIN retailer r ON p.retailer_id = r.retailer_id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — single product detail
app.get("/api/products/:id", async (req, res) => {
  try {
    const [[product]] = await connection.query(`
      SELECT p.*, r.name AS retailer_name
      FROM product p
      JOIN retailer r ON p.retailer_id = r.retailer_id
      WHERE p.product_id = ?
    `, [req.params.id]);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id/reviews — all ratings + feedback for a product
app.get("/api/products/:id/reviews", async (req, res) => {
  try {
    const [reviews] = await connection.query(`
      SELECT
        u.user_id,
        u.username,
        u.first_name,
        u.last_name,
        rt.stars,
        rt.purchase_id,
        rt.created_at AS rated_at,
        f.text        AS feedback_text,
        f.created_at  AS feedback_at
      FROM rating rt
      JOIN users u ON rt.user_id = u.user_id
      LEFT JOIN feedback f
        ON f.user_id = rt.user_id
       AND f.product_id = rt.product_id
       AND f.purchase_id = rt.purchase_id
      WHERE rt.product_id = ?
      ORDER BY rt.created_at DESC
    `, [req.params.id]);

    const [[{ avg_stars, review_count }]] = await connection.query(
      "SELECT AVG(stars) AS avg_stars, COUNT(*) AS review_count FROM rating WHERE product_id = ?",
      [req.params.id]
    );

    res.json({ reviews, avg_stars: parseFloat(avg_stars) || 0, review_count: parseInt(review_count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/reviews — submit a rating + optional feedback
app.post("/api/products/:id/reviews", async (req, res) => {
  const { user_id, purchase_id, stars, text } = req.body;
  const product_id = req.params.id;

  if (!user_id || !purchase_id || stars == null) {
    return res.status(400).json({ success: false, message: "user_id, purchase_id, and stars are required." });
  }
  if (stars < 1 || stars > 5) {
    return res.status(400).json({ success: false, message: "Stars must be between 1 and 5." });
  }

  try {
    // Verify the user actually purchased this product
    const [purchases] = await connection.query(
      "SELECT purchase_id FROM purchase WHERE purchase_id = ? AND user_id = ? AND product_id = ?",
      [purchase_id, user_id, product_id]
    );
    if (!purchases.length) {
      return res.json({ success: false, message: "You must purchase this product before reviewing it." });
    }

    // Check for duplicate rating
    const [existing] = await connection.query(
      "SELECT rating_id FROM rating WHERE user_id = ? AND product_id = ? AND purchase_id = ?",
      [user_id, product_id, purchase_id]
    );
    if (existing.length) {
      return res.json({ success: false, message: "You have already reviewed this purchase." });
    }

    await connection.query(
      "INSERT INTO rating (user_id, product_id, purchase_id, stars) VALUES (?, ?, ?, ?)",
      [user_id, product_id, purchase_id, stars]
    );

    if (text && text.trim()) {
      await connection.query(
        "INSERT INTO feedback (user_id, product_id, purchase_id, text) VALUES (?, ?, ?, ?)",
        [user_id, product_id, purchase_id, text.trim()]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id/user-status/:user_id — purchase & review status for logged-in user
app.get("/api/products/:id/user-status/:user_id", async (req, res) => {
  const { id: product_id, user_id } = req.params;
  try {
    const [purchases] = await connection.query(
      "SELECT purchase_id FROM purchase WHERE user_id = ? AND product_id = ? ORDER BY purchased_at DESC LIMIT 1",
      [user_id, product_id]
    );
    const has_purchased = purchases.length > 0;
    const purchase_id   = has_purchased ? purchases[0].purchase_id : null;

    let has_reviewed = false;
    if (has_purchased) {
      const [ratings] = await connection.query(
        "SELECT rating_id FROM rating WHERE user_id = ? AND product_id = ?",
        [user_id, product_id]
      );
      has_reviewed = ratings.length > 0;
    }

    res.json({ has_purchased, purchase_id, has_reviewed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const [[{ products }]]  = await connection.query("SELECT COUNT(*) AS products FROM product");
    const [[{ retailers }]] = await connection.query("SELECT COUNT(*) AS retailers FROM retailer");
    const [[{ drops }]]     = await connection.query("SELECT COUNT(*) AS drops FROM drop_event WHERE status != 'completed'");
    res.json({ products, retailers, drops });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await connection.query(
      "SELECT user_id, email, username, first_name, last_name FROM users WHERE email = ? AND password_hash = ?",
      [email, password]
    );
    if (!rows.length) {
      return res.json({ success: false, message: "Invalid email or password." });
    }
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/requests/:user_id
app.get("/api/requests/:user_id", async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT r.*, d.name AS drop_name, d.drop_id
      FROM requests r
      JOIN availability_schedule s ON r.schedule_id = s.schedule_id
      JOIN drop_event d ON s.drop_id = d.drop_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests
app.post("/api/requests", async (req, res) => {
  const { user_id, drop_id } = req.body;
  try {
    const [schedules] = await connection.query(
      "SELECT schedule_id FROM availability_schedule WHERE drop_id = ? LIMIT 1",
      [drop_id]
    );
    if (!schedules.length) {
      return res.json({ success: false, message: "No availability schedule found for this drop." });
    }
    const schedule_id = schedules[0].schedule_id;

    const [existing] = await connection.query(
      "SELECT request_id FROM requests WHERE user_id = ? AND schedule_id = ?",
      [user_id, schedule_id]
    );
    if (existing.length) {
      return res.json({ success: false, message: "You have already requested this drop." });
    }

    const [result] = await connection.query(
      "INSERT INTO requests (user_id, schedule_id, request_status) VALUES (?, ?, ?)",
      [user_id, schedule_id, "pending"]
    );
    res.json({ success: true, request_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/requests/:request_id
app.delete("/api/requests/:request_id", async (req, res) => {
  try {
    await connection.query("DELETE FROM requests WHERE request_id = ?", [req.params.request_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/purchase
app.post("/api/purchase", async (req, res) => {
  const { user_id, items } = req.body;
  try {
    for (const item of items) {
      const [schedules] = await connection.query(
        "SELECT schedule_id, retailer_id FROM availability_schedule WHERE product_id = ? AND is_available = true LIMIT 1",
        [item.product_id]
      );

      let schedule_id, retailer_id;

      if (!schedules.length) {
        const [[product]] = await connection.query(
          "SELECT retailer_id FROM product WHERE product_id = ?",
          [item.product_id]
        );
        schedule_id = 1;
        retailer_id = product.retailer_id;
      } else {
        schedule_id = schedules[0].schedule_id;
        retailer_id = schedules[0].retailer_id;
      }

      await connection.query(
        "INSERT INTO purchase (user_id, retailer_id, schedule_id, product_id, qty, total_amount, purchase_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [user_id, retailer_id, schedule_id, item.product_id, item.qty, (item.price * item.qty).toFixed(2), "pending"]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/purchases/:user_id
app.get("/api/purchases/:user_id", async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT pu.*, p.name AS product_name
      FROM purchase pu
      JOIN product p ON pu.product_id = p.product_id
      WHERE pu.user_id = ?
      ORDER BY pu.purchased_at DESC
    `, [req.params.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/retailer/login
app.post('/api/retailer/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await connection.query(
      'SELECT retailer_id, name, email FROM retailer WHERE email = ? AND password_hash = ?',
      [email, password]
    );
    if (!rows.length) return res.json({ success: false, message: 'Invalid email or password.' });
    res.json({ success: true, retailer: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/retailer/:id/products
app.get('/api/retailer/:id/products', async (req, res) => {
  try {
    const [rows] = await connection.query(
      'SELECT * FROM product WHERE retailer_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/retailer/products — create product
app.post('/api/retailer/products', async (req, res) => {
  const { name, brand, sku, price, colorway, description, retailer_id } = req.body;
  try {
    const [result] = await connection.query(
      'INSERT INTO product (retailer_id, sku, name, brand, colorway, price, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [retailer_id, sku, name, brand, colorway || null, price, description || null]
    );
    res.json({ success: true, product_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/retailer/products/:id — update product
app.put('/api/retailer/products/:id', async (req, res) => {
  const { name, brand, sku, price, colorway, description } = req.body;
  try {
    await connection.query(
      'UPDATE product SET name = ?, brand = ?, sku = ?, price = ?, colorway = ?, description = ? WHERE product_id = ?',
      [name, brand, sku, price, colorway || null, description || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/retailer/products/:id
app.delete('/api/retailer/products/:id', async (req, res) => {
  try {
    await connection.query('DELETE FROM product WHERE product_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/retailer/:id/drops
app.get('/api/retailer/:id/drops', async (req, res) => {
  try {
    const [rows] = await connection.query(
      'SELECT * FROM drop_event WHERE retailer_id = ? ORDER BY drop_start_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/retailer/drops — create drop
app.post('/api/retailer/drops', async (req, res) => {
  const { name, description, drop_start_at, drop_end_at, status, retailer_id } = req.body;
  try {
    const [result] = await connection.query(
      'INSERT INTO drop_event (retailer_id, name, description, drop_start_at, drop_end_at, status) VALUES (?, ?, ?, ?, ?, ?)',
      [retailer_id, name, description || null, drop_start_at, drop_end_at || null, status]
    );
    res.json({ success: true, drop_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/retailer/drops/:id — update drop
app.put('/api/retailer/drops/:id', async (req, res) => {
  const { name, description, drop_start_at, drop_end_at, status } = req.body;
  try {
    await connection.query(
      'UPDATE drop_event SET name = ?, description = ?, drop_start_at = ?, drop_end_at = ?, status = ? WHERE drop_id = ?',
      [name, description || null, drop_start_at, drop_end_at || null, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/retailer/drops/:id
app.delete('/api/retailer/drops/:id', async (req, res) => {
  try {
    await connection.query('DELETE FROM drop_event WHERE drop_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/retailer/:id/orders
app.get('/api/retailer/:id/orders', async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT pu.*, p.name AS product_name, u.email AS buyer_email
      FROM purchase pu
      JOIN product p ON pu.product_id = p.product_id
      JOIN users u ON pu.user_id = u.user_id
      WHERE pu.retailer_id = ?
      ORDER BY pu.purchased_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── START ─────────────────────────────────────────────────────

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});