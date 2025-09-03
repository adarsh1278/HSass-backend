import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpStatus from '../utils/httpStatus.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';

const prisma = new PrismaClient();

// SuperAdmin Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const superAdmin = await prisma.superAdmin.findUnique({
    where: { email }
  });

  if (!superAdmin || !superAdmin.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, superAdmin.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const token = generateToken({ 
    id: superAdmin.id, 
    email: superAdmin.email, 
    role: 'SUPERADMIN' 
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, options);

  const { password: _, ...superAdminData } = superAdmin;

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, {
      superAdmin: superAdminData,
      token
    }, 'Login successful')
  );
});

// Create Subscription Plan
const createSubscriptionPlan = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    currency,
    billingCycle,
    maxUsers,
    maxPatients,
    features
  } = req.body;

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name,
      description,
      price,
      currency,
      billingCycle,
      maxUsers,
      maxPatients,
      features
    }
  });

  res.status(httpStatus.CREATED).json(
    new ApiResponse(httpStatus.CREATED, plan, 'Subscription plan created successfully')
  );
});

// Get All Subscription Plans
const getSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' }
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, plans, 'Subscription plans fetched successfully')
  );
});

// Get All Hospitals
const getHospitals = asyncHandler(async (req, res) => {
  const hospitals = await prisma.hospital.findMany({
    include: {
      subscription: {
        include: {
          plan: true
        }
      },
      _count: {
        select: {
          users: true,
          patients: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, hospitals, 'Hospitals fetched successfully')
  );
});

// Update Subscription Plan
const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data: updateData
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, plan, 'Subscription plan updated successfully')
  );
});

// Deactivate Subscription Plan
const deactivateSubscriptionPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data: { status: 'INACTIVE' }
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, plan, 'Subscription plan deactivated successfully')
  );
});

// Get Dashboard Stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalHospitals,
    activeHospitals,
    totalSubscriptions,
    activeSubscriptions,
    totalPlans
  ] = await Promise.all([
    prisma.hospital.count(),
    prisma.hospital.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscriptionPlan.count({ where: { status: 'ACTIVE' } })
  ]);

  const stats = {
    totalHospitals,
    activeHospitals,
    totalSubscriptions,
    activeSubscriptions,
    totalPlans
  };

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, stats, 'Dashboard stats fetched successfully')
  );
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  
  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, null, 'Logged out successfully')
  );
});

export {
  login,
  createSubscriptionPlan,
  getSubscriptionPlans,
  getHospitals,
  updateSubscriptionPlan,
  deactivateSubscriptionPlan,
  getDashboardStats,
  logout
};
