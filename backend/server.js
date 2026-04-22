"use strict";

/**
 * Local development entry point.
 *
 * On Vercel we use ../api/index.js as the serverless handler and never call
 * listen(). This file only runs when you do `npm run dev` / `npm start`
 * locally.
 */

const app = require("./app");
const { ping } = require("./db");

const PORT = parseInt(process.env.PORT || "5000", 10);

(async () => {
  const ok = await ping();
  if (!ok) {
    console.warn(
      "WARN: could not reach MySQL on startup. Check backend/.env and that the DB is running."
    );
  } else {
    console.log(`Connected to MySQL database: ${process.env.DB_NAME}`);
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();
