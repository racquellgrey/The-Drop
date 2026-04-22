"use strict";

/**
 * Vercel serverless entry point.
 *
 * Vercel invokes this file for any request routed to /api/* (see vercel.json).
 * We delegate to the Express app, which handles routing internally. Static
 * assets in /frontend are served directly by Vercel's edge (see vercel.json),
 * so they never hit this function.
 */

module.exports = require("../backend/app");
