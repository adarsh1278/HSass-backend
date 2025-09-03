import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpStatus from '../utils/httpStatus.js';

const prisma = new PrismaClient();

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Access token required');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  let user;
  if (decoded.role === 'SUPERADMIN') {
    user = await prisma.superAdmin.findUnique({
      where: { id: decoded.id }
    });
  } else {
    user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        hospital: true,
        department: true
      }
    });
  }

  if (!user || !user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token or user inactive');
  }

  req.user = user;
  req.userRole = decoded.role;
  next();
});

// Simplified authorization - just check if user is authenticated
// Actual permissions will be handled in controllers
const requireAuth = authenticate;

// Super Admin only routes
const requireSuperAdmin = asyncHandler(async (req, res, next) => {
  await authenticate(req, res, () => {
    if (req.userRole !== 'SUPERADMIN') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Super Admin access required');
    }
    next();
  });
});

export { authenticate, requireAuth, requireSuperAdmin };
