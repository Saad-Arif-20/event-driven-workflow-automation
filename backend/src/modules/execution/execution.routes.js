// src/modules/execution/execution.routes.js
const { Router } = require('express');
const controller = require('./execution.controller');
const { authenticate } = require('../../middleware/authMiddleware');

const router = Router();
router.use(authenticate);

// GET /executions/workflow/:workflowId
router.get('/workflow/:workflowId', controller.getExecutions);

// GET /executions/:id
router.get('/:id', controller.getExecution);

module.exports = router;
