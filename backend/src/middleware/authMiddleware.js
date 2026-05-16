// src/middleware/authMiddleware.js
// Verifies JWT token on protected routes

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/db');
const { sendError } = require('../utils/helpers');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token has expired', 401);
      }
      return sendError(res, 'Invalid token', 401);
    }

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return sendError(res, 'User no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };
