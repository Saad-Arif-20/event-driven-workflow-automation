// src/modules/auth/auth.routes.js
const { Router } = require('express');
const controller = require('./auth.controller');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = Router();

router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);

module.exports = router;
