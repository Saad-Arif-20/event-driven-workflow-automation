// src/modules/auth/auth.controller.js
const authService = require('./auth.service');
const { registerSchema, loginSchema } = require('./auth.validation');
const { asyncHandler, sendSuccess } = require('../../utils/helpers');

const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.register(data);
  return sendSuccess(res, result, 'User registered successfully', 201);
});

const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const result = await authService.login(data);
  return sendSuccess(res, result, 'Login successful');
});

module.exports = { register, login };
