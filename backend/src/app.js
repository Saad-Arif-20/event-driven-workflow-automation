// src/app.js
// Express application setup — all middleware, routes, and error handling
// Intentionally separated from index.js for testability

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const logger = require('./utils/logger');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());  // Sets secure HTTP headers (XSS, HSTS, etc.)

app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Request Parsing ────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`→ ${req.method} ${req.path}`);
  next();
});

// ── Global Rate Limiter ────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// ── Global Error Handler ───────────────────────────────────────────────────
// Must have 4 params for Express to treat it as an error handler
app.use(errorHandler);

module.exports = app;
