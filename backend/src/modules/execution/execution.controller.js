// src/modules/execution/execution.controller.js
const executionService = require('./execution.service');
const { asyncHandler, sendSuccess } = require('../../utils/helpers');

const getExecutions = asyncHandler(async (req, res) => {
  const result = await executionService.getExecutionsByWorkflow(
    req.user.id,
    req.params.workflowId,
    req.query
  );
  return sendSuccess(res, result, 'Executions retrieved');
});

const getExecution = asyncHandler(async (req, res) => {
  const execution = await executionService.getExecutionById(req.user.id, req.params.id);
  return sendSuccess(res, execution, 'Execution retrieved');
});

module.exports = { getExecutions, getExecution };
