/**
 * Vercel Serverless Function Entry Point
 * Directs all /api/* requests to the Express.js application instance
 */

const { app } = require('../backend/server');

module.exports = app;
