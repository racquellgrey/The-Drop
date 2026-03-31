const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "frontend")));

let connection = null;
let connected = false;

// Auto-connect to MySQL on startup
async function initDB() {
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password123",
      database: "thedrop",
    });
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
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password123",
      database: "thedrop",
    });
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

// ── START ─────────────────────────────────────────────────────

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});