// src/services/actionHandlers.js
// Concrete implementations of each supported action type.
// Each handler receives the step config + event payload and executes the action.

const nodemailer = require('nodemailer');
const axios = require('axios');
const { sleep } = require('../utils/helpers');
const env = require('../config/env');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────
// EMAIL ACTION
// Sends an email via SMTP using nodemailer
// config: { to, subject, body }
// ─────────────────────────────────────────────────────────────
const handleEmail = async (config, eventPayload) => {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  // Support simple template interpolation from event payload
  // e.g., config.body = "Hello {{email}}" → resolved from eventPayload
  const interpolate = (str) =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key) => eventPayload?.[key] ?? '');

  const mailOptions = {
    from: env.SMTP_FROM || env.SMTP_USER,
    to: interpolate(config.to || ''),
    subject: interpolate(config.subject || 'Workflow Notification'),
    text: interpolate(config.body || ''),
    html: config.html ? interpolate(config.html) : undefined,
  };

  logger.info(`Sending email to: ${mailOptions.to}`);
  const info = await transporter.sendMail(mailOptions);
  return { messageId: info.messageId, accepted: info.accepted };
};

// ─────────────────────────────────────────────────────────────
// WEBHOOK ACTION
// Makes an HTTP POST request to an external URL
// config: { url, headers, method }
// ─────────────────────────────────────────────────────────────
const handleWebhook = async (config, eventPayload) => {
  if (!config.url) {
    throw new Error('Webhook config missing required field: url');
  }

  const method = (config.method || 'POST').toLowerCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  };

  logger.info(`Calling webhook: ${method.toUpperCase()} ${config.url}`);

  const response = await axios({
    method,
    url: config.url,
    data: { event: eventPayload, config },
    headers,
    timeout: 10000, // 10 second timeout
  });

  return {
    status: response.status,
    statusText: response.statusText,
    data: response.data,
  };
};

// ─────────────────────────────────────────────────────────────
// DELAY ACTION
// Pauses execution for a specified number of seconds
// config: { seconds }
// ─────────────────────────────────────────────────────────────
const handleDelay = async (config) => {
  const seconds = Math.min(config.seconds || 1, 300); // max 5 minutes
  logger.info(`Delay action: waiting ${seconds} second(s)`);
  await sleep(seconds * 1000);
  return { waited: seconds };
};

// ─────────────────────────────────────────────────────────────
// ACTION DISPATCHER
// Routes to the correct handler based on actionType
// ─────────────────────────────────────────────────────────────
const executeAction = async (actionType, config, eventPayload) => {
  switch (actionType) {
    case 'email':
      return handleEmail(config, eventPayload);
    case 'webhook':
      return handleWebhook(config, eventPayload);
    case 'delay':
      return handleDelay(config);
    default:
      throw new Error(`Unknown action type: "${actionType}"`);
  }
};

module.exports = { executeAction };
