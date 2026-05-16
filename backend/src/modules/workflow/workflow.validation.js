// src/modules/workflow/workflow.validation.js
const { z } = require('zod');

const workflowStepSchema = z.object({
  stepOrder: z.number().int().positive(),
  actionType: z.enum(['email', 'webhook', 'delay'], {
    errorMap: () => ({ message: 'actionType must be email | webhook | delay' }),
  }),
  config: z.record(z.any()),
});

const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  triggerType: z.string().min(1, 'triggerType is required'),
  isActive: z.boolean().optional().default(true),
  steps: z.array(workflowStepSchema).min(1, 'At least one step is required'),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  triggerType: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  steps: z.array(workflowStepSchema).min(1).optional(),
});

module.exports = { createWorkflowSchema, updateWorkflowSchema };
