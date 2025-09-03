import express from 'express';
import {
  login,
  createSubscriptionPlan,
  getSubscriptionPlans,
  getHospitals,
  updateSubscriptionPlan,
  deactivateSubscriptionPlan,
  getDashboardStats,
  logout
} from '../controllers/superAdminController.js';
import { requireSuperAdmin } from '../middleware/auth.js';
import { validate, loginSchema } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// SuperAdmin login (no auth required)
router.post('/login', validate(loginSchema), login);

// All routes below require SuperAdmin authentication
router.use(requireSuperAdmin);

// Subscription Plans Management
const subscriptionPlanSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().positive().required(),
  currency: Joi.string().default('USD'),
  billingCycle: Joi.string().valid('monthly', 'yearly').default('monthly'),
  maxUsers: Joi.number().positive().default(10),
  maxPatients: Joi.number().positive().default(1000),
  features: Joi.object().required()
});

router.post('/subscription-plans', validate(subscriptionPlanSchema), createSubscriptionPlan);
router.get('/subscription-plans', getSubscriptionPlans);
router.put('/subscription-plans/:id', updateSubscriptionPlan);
router.delete('/subscription-plans/:id', deactivateSubscriptionPlan);

// Hospital Management
router.get('/hospitals', getHospitals);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Logout
router.post('/logout', logout);

export default router;
