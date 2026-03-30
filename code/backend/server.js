const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve the frontend folder on localhost
app.use(express.static(path.join(__dirname, "..", "frontend")));

let connection = null;
let connected = false;

app.get("/status", (req, res) => {
  res.json({ connected });
});

app.post("/connect", async (req, res) => {
    try {
      if (connected && connection) {
        return res.json({
          success: true,
          message: "Already connected to the database."
        });
      }
  
      connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password123",
        database: "thedrop"
      });
  
      connected = true;
  
      res.json({
        success: true,
        message: "Database connection established successfully."
      });
    } catch (error) {
      console.error("Connect error:", error);
  
      connection = null;
      connected = false;
  
      res.status(500).json({
        success: false,
        message: "Failed to connect to the database.",
        error: error.message
      });
    }
  });

app.post("/disconnect", async (req, res) => {
  try {
    if (!connected || !connection) {
      return res.json({
        success: true,
        message: "No active database connection."
      });
    }

    await connection.end();
    connection = null;
    connected = false;

    res.json({
      success: true,
      message: "Database connection closed successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to close the database connection.",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});