// src/routes/index.js
// Central router — mounts all module routes under their prefixes

const { Router } = require('express');
const { getQueueStats } = require('../services/queueService');
const { sendSuccess } = require('../utils/helpers');
const { asyncHandler } = require('../utils/helpers');

const router = Router();

// ── Module Routes ──────────────────────────────────────────────────────────
router.use('/auth',       require('../modules/auth/auth.routes'));
router.use('/users',      require('../modules/user/user.routes'));
router.use('/workflows',  require('../modules/workflow/workflow.routes'));
router.use('/events',     require('../modules/event/event.routes'));
router.use('/executions', require('../modules/execution/execution.routes'));

// ── Health Check ──────────────────────────────────────────────────────────
router.get('/health', asyncHandler(async (req, res) => {
  const queue = await getQueueStats();
  return sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    queue,
  }, 'Service healthy');
}));

module.exports = router;
