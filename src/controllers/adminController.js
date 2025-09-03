import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpStatus from '../utils/httpStatus.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';

const prisma = new PrismaClient();

// Admin Signup
const adminSignup = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create admin user (without hospital initially)
  const admin = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'ADMIN'
      // hospitalId will be null initially
    }
  });

  const token = generateToken({
    id: admin.id,
    email: admin.email,
    role: admin.role
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, options);

  const { password: _, ...adminData } = admin;

  res.status(httpStatus.CREATED).json(
    new ApiResponse(httpStatus.CREATED, {
      admin: adminData,
      token
    }, 'Admin registered successfully')
  );
});

// Admin Login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.user.findUnique({
    where: { email, role: 'ADMIN' },
    include: {
      hospital: {
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        }
      }
    }
  });

  if (!admin || !admin.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, admin.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  // Update last login
  await prisma.user.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  });

  const token = generateToken({
    id: admin.id,
    email: admin.email,
    role: admin.role,
    hospitalId: admin.hospitalId
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, options);

  const { password: _, ...adminData } = admin;

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, {
      admin: adminData,
      token
    }, 'Login successful')
  );
});

// Purchase Plan
const purchasePlan = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const adminId = req.user.id;

  // Check if admin already has a subscription
  if (req.user.hospitalId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You already have an active subscription. Please create your hospital first.');
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId }
  });

  if (!plan || plan.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid subscription plan');
  }

  // Store the purchased plan info temporarily
  await prisma.adminPlanPurchase.upsert({
    where: { adminId },
    update: { planId },
    create: {
      adminId,
      planId
    }
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, {
      plan,
      message: 'Plan purchased successfully! Please create your hospital now.'
    }, 'Plan purchased successfully')
  );
});

// Create Hospital
const createHospital = asyncHandler(async (req, res) => {
  const {
    name,
    address,
    city,
    state,
    country,
    pincode,
    phone,
    email,
    website,
    licenseNumber
  } = req.body;
  
  const adminId = req.user.id;

  // Get the purchased plan
  const adminPlanPurchase = await prisma.adminPlanPurchase.findUnique({
    where: { adminId },
    include: { plan: true }
  });

  if (!adminPlanPurchase) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please purchase a plan first');
  }

  if (req.user.hospitalId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Hospital already created for this admin');
  }

  // Check if hospital email already exists
  if (email) {
    const existingHospital = await prisma.hospital.findUnique({
      where: { email }
    });
    if (existingHospital) {
      throw new ApiError(httpStatus.CONFLICT, 'Hospital email already exists');
    }
  }

  // Create hospital and subscription in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create hospital
    const hospital = await tx.hospital.create({
      data: {
        name,
        address,
        city,
        state,
        country,
        pincode,
        phone,
        email,
        website,
        licenseNumber
      }
    });

    // Create subscription
    const subscription = await tx.subscription.create({
      data: {
        hospitalId: hospital.id,
        planId: adminPlanPurchase.planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Update admin with hospital ID
    await tx.user.update({
      where: { id: adminId },
      data: {
        hospitalId: hospital.id
      }
    });

    // Delete the temporary plan purchase record
    await tx.adminPlanPurchase.delete({
      where: { adminId }
    });

    return { hospital, subscription };
  });

  res.status(httpStatus.CREATED).json(
    new ApiResponse(httpStatus.CREATED, {
      hospital: result.hospital,
      subscription: result.subscription
    }, 'Hospital created successfully')
  );
});

// Get Available Plans
const getAvailablePlans = asyncHandler(async (req, res) => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { price: 'asc' }
  });

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, plans, 'Plans retrieved successfully')
  );
});

// Get Admin Profile
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await prisma.user.findUnique({
    where: { id: req.user.id },
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
      adminPlanPurchase: {
        include: {
          plan: true
        }
      }
    }
  });

  const { password: _, ...adminData } = admin;

  res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, adminData, 'Profile retrieved successfully')
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
  adminSignup,
  adminLogin,
  purchasePlan,
  createHospital,
  getAvailablePlans,
  getAdminProfile,
  logout
};
