// src/modules/user/user.routes.js
const { Router } = require('express');
const controller = require('./user.controller');
const { authenticate } = require('../../middleware/authMiddleware');

const router = Router();
router.use(authenticate);

router.get('/me', controller.getProfile);
router.get('/dashboard-stats', controller.getDashboardStats);

module.exports = router;
