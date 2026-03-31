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
      database: "thedrop"
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
      database: "thedrop"
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

app.get('/api/drops', async (req, res) => {
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

app.get('/api/products', async (req, res) => {
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

app.get('/api/stats', async (req, res) => {
  try {
    const [[{ products }]]  = await connection.query('SELECT COUNT(*) AS products FROM product');
    const [[{ retailers }]] = await connection.query('SELECT COUNT(*) AS retailers FROM retailer');
    const [[{ drops }]]     = await connection.query("SELECT COUNT(*) AS drops FROM drop_event WHERE status != 'completed'");
    res.json({ products, retailers, drops });
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