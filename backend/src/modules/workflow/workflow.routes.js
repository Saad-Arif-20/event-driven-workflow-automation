// src/modules/workflow/workflow.routes.js
const { Router } = require('express');
const controller = require('./workflow.controller');
const { authenticate } = require('../../middleware/authMiddleware');

const router = Router();

// All workflow routes require authentication
router.use(authenticate);

router.post('/', controller.createWorkflow);
router.get('/', controller.getWorkflows);
router.get('/:id', controller.getWorkflow);
router.put('/:id', controller.updateWorkflow);
router.delete('/:id', controller.deleteWorkflow);

module.exports = router;
