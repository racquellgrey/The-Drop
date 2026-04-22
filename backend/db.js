"use strict";

/**
 * Serverless-safe MySQL access layer.
 *
 * On Vercel, each cold start creates a new Node process. To avoid exhausting
 * connections we:
 *   1. Use a *pool* (not a single connection).
 *   2. Cache the pool on `globalThis` so warm invocations reuse it.
 *   3. Require TLS when DB_SSL=true (production managed DBs).
 *
 * Credentials are ONLY read from environment variables. Nothing is hard-coded
 * and nothing is logged.
 */

const mysql = require("mysql2/promise");

function buildPool() {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
    DB_CONNECTION_LIMIT,
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error(
      "Database is not configured: DB_HOST, DB_USER and DB_NAME are required."
    );
  }

  return mysql.createPool({
    host: DB_HOST,
    port: parseInt(DB_PORT || "3306", 10),
    user: DB_USER,
    password: DB_PASSWORD || "",
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(DB_CONNECTION_LIMIT || "3", 10),
    maxIdle: parseInt(DB_CONNECTION_LIMIT || "3", 10),
    idleTimeout: 60_000,
    enableKeepAlive: true,
    ssl: DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  });
}

function getPool() {
  if (!globalThis.__theDropPool) {
    globalThis.__theDropPool = buildPool();
  }
  return globalThis.__theDropPool;
}

async function ping() {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.ping();
      return true;
    } finally {
      conn.release();
    }
  } catch {
    return false;
  }
}

module.exports = { getPool, ping };
