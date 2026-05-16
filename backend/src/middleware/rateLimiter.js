// src/middleware/rateLimiter.js
// Rate limiting middleware using express-rate-limit

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/helpers');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests from this IP, please try again after 15 minutes',
      429
    );
  },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many login attempts, please try again after 15 minutes',
      429
    );
  },
});

// Event ingestion limiter (external systems calling /events)
const eventLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 events per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 'Event rate limit exceeded', 429);
  },
});

module.exports = { apiLimiter, authLimiter, eventLimiter };
