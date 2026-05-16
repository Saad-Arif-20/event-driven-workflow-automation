// src/modules/user/user.controller.js
const userService = require('./user.service');
const { asyncHandler, sendSuccess } = require('../../utils/helpers');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return sendSuccess(res, user, 'Profile retrieved');
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await userService.getDashboardStats(req.user.id);
  return sendSuccess(res, stats, 'Dashboard stats retrieved');
});

module.exports = { getProfile, getDashboardStats };
