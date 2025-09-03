import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import prisma from '../config/database.js';

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total hospitals
  const totalHospitals = await prisma.hospital.count();

  // Get active hospitals
  const activeHospitals = await prisma.hospital.count({
    where: {
      status: 'ACTIVE'
    }
  });

  // Get total subscriptions
  const totalSubscriptions = await prisma.subscription.count();

  // Get active subscriptions
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      status: 'ACTIVE'
    }
  });

  // Get total subscription plans
  const totalPlans = await prisma.subscriptionPlan.count({
    where: {
      status: 'ACTIVE'
    }
  });

  const stats = {
    totalHospitals,
    activeHospitals,
    totalSubscriptions,
    activeSubscriptions,
    totalPlans,
  };

  return res.status(200).json(
    new ApiResponse(200, stats, 'Dashboard stats fetched successfully')
  );
});
