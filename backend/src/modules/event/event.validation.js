// src/modules/event/event.validation.js
const { z } = require('zod');

const createEventSchema = z.object({
  type: z.string().min(1, 'Event type is required'),
  payload: z.record(z.any()).default({}),
});

module.exports = { createEventSchema };
