// src/modules/workflow/workflow.controller.js
const workflowService = require('./workflow.service');
const { createWorkflowSchema, updateWorkflowSchema } = require('./workflow.validation');
const { asyncHandler, sendSuccess } = require('../../utils/helpers');

const createWorkflow = asyncHandler(async (req, res) => {
  const data = createWorkflowSchema.parse(req.body);
  const workflow = await workflowService.createWorkflow(req.user.id, data);
  return sendSuccess(res, workflow, 'Workflow created', 201);
});

const getWorkflows = asyncHandler(async (req, res) => {
  const result = await workflowService.getWorkflows(req.user.id, req.query);
  return sendSuccess(res, result, 'Workflows retrieved');
});

const getWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.getWorkflowById(req.user.id, req.params.id);
  return sendSuccess(res, workflow, 'Workflow retrieved');
});

const updateWorkflow = asyncHandler(async (req, res) => {
  const data = updateWorkflowSchema.parse(req.body);
  const workflow = await workflowService.updateWorkflow(req.user.id, req.params.id, data);
  return sendSuccess(res, workflow, 'Workflow updated');
});

const deleteWorkflow = asyncHandler(async (req, res) => {
  await workflowService.deleteWorkflow(req.user.id, req.params.id);
  return sendSuccess(res, null, 'Workflow deleted');
});

module.exports = { createWorkflow, getWorkflows, getWorkflow, updateWorkflow, deleteWorkflow };
