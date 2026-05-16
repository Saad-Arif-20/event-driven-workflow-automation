// src/modules/event/event.controller.js
const eventService = require('./event.service');
const { createEventSchema } = require('./event.validation');
const { asyncHandler, sendSuccess } = require('../../utils/helpers');

// POST /events — Receive an incoming trigger event
const receiveEvent = asyncHandler(async (req, res) => {
  const data = createEventSchema.parse(req.body);
  const result = await eventService.processEvent(data);
  return sendSuccess(res, result, 'Event received and queued', 202);
});

// GET /events — List all received events (admin/debug use)
const listEvents = asyncHandler(async (req, res) => {
  const result = await eventService.getEvents(req.query);
  return sendSuccess(res, result, 'Events retrieved');
});

module.exports = { receiveEvent, listEvents };
