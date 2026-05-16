// src/modules/event/event.routes.js
const { Router } = require('express');
const controller = require('./event.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { eventLimiter } = require('../../middleware/rateLimiter');

const router = Router();

// POST /events — public endpoint for external systems to fire triggers
// Protected by event-specific rate limiter
router.post('/', eventLimiter, controller.receiveEvent);

// GET /events — protected, for debugging/auditing
router.get('/', authenticate, controller.listEvents);

module.exports = router;
