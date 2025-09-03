import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpStatus from '../utils/httpStatus.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';

const prisma = new PrismaClient();

// Register Hospital & Admin
const registerHospital = asyncHandler(async (req, res) => {
  const {
    // Hospital details
    hospitalName,
    address,
    city,
    state,
    country,
    pincode,
    phone,
    email: hospitalEmail,
    website,
    licenseNumber,
    
    // Admin details
    adminName,
    adminEmail,
    adminPhone,
    adminPassword,
    
    // Subscription details
    planId
  } = req.body;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already registered');
  }

  // Check if plan exists
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId }
  });

  if (!plan || plan.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid subscription plan');
  }

  // Hash password
  const hashedPassword = await hashPassword(adminPassword);

  // Create hospital, admin, and subscription in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create hospital
    const hospital = await tx.hospital.create({
      data: {
        name: hospitalName,
        address,
        city,
        state,
        country,
        pincode,
        phone,
        email: hospitalEmail,
        website,
        licenseNumber
      }
    });

    // Create subscription
    const subscription = await tx.subscription.create({
      data: {
        hospitalId: hospital.id,
        planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Create admin user
    const admin = await tx.user.create({
      data: {
        hospitalId: hospital.id,
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    return { hospital, subscription, admin };
  });

  // Generate token
  const token = generateToken({
    id: result.admin.id,
    email: result.admin.email,
    role: result.admin.role,
    hospitalId: result.hospital.id
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, options);

  const { password: _, ...adminData } = result.admin;

  res.status(httpStatus.CREATED).json(
    new ApiResponse(httpStatus.CREATED, {
      hospital: result.hospital,
      subscription: result.subscription,
      admin: adminData,
      token
    }, 'Hospital registered successfully')
  );
});

// Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      hospital: {
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        }
      },
      department: true
    }
  });

  if (!user || !user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  if (!user.hospital.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Hospital account is inactive');
  }

  // Check subscription status
  if (user.hospital.subscription?.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Hospital subscription is not active');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    hospitalId: user.hospitalId
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, options);

  const { password: _, ...userData } = user;

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, {
      user: userData,
      token
    }, 'Login successful')
  );
});

// Get Available Subscription Plans
const getAvailablePlans = asyncHandler(async (req, res) => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { price: 'asc' }
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, plans, 'Subscription plans fetched successfully')
  );
});

// Purchase Subscription
const purchaseSubscription = asyncHandler(async (req, res) => {
  // Permission check: Only ADMIN can purchase subscriptions
  if (req.userRole !== 'ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can purchase subscriptions');
  }

  const { planId, duration = 30 } = req.body; // duration in days
  const hospitalId = req.user.hospitalId;

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId }
  });

  if (!plan || plan.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid subscription plan');
  }

  const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.upsert({
    where: { hospitalId },
    update: {
      planId,
      endDate,
      status: 'ACTIVE'
    },
    create: {
      hospitalId,
      planId,
      startDate: new Date(),
      endDate,
      status: 'ACTIVE'
    },
    include: {
      plan: true
    }
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, subscription, 'Subscription updated successfully')
  );
});

// Get Hospital Profile
const getHospitalProfile = asyncHandler(async (req, res) => {
  const hospitalId = req.user.hospitalId;

  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
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
    }
  });

  if (!hospital) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Hospital not found');
  }

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, hospital, 'Hospital profile fetched successfully')
  );
});

// Update Hospital Profile
const updateHospitalProfile = asyncHandler(async (req, res) => {
  // Permission check: Only ADMIN can update hospital profile
  if (req.userRole !== 'ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can update hospital profile');
  }

  const hospitalId = req.user.hospitalId;
  const updateData = req.body;

  const hospital = await prisma.hospital.update({
    where: { id: hospitalId },
    data: updateData
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, hospital, 'Hospital profile updated successfully')
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
  registerHospital,
  loginAdmin,
  getAvailablePlans,
  purchaseSubscription,
  getHospitalProfile,
  updateHospitalProfile,
  logout
};
