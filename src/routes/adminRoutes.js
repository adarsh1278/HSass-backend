import express from 'express';
import {
  adminSignup,
  adminLogin,
  purchasePlan,
  createHospital,
  getAvailablePlans,
  getAdminProfile,
  logout
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Public routes
router.get('/plans', getAvailablePlans);

// Admin Signup
const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string(),
  password: Joi.string().min(6).required()
});

router.post('/signup', validate(signupSchema), adminSignup);

// Admin Login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/login', validate(loginSchema), adminLogin);

// Protected routes (require authentication)
router.use(requireAuth);

// Purchase Plan
const purchasePlanSchema = Joi.object({
  planId: Joi.string().required()
});

router.post('/purchase-plan', validate(purchasePlanSchema), purchasePlan);

// Create Hospital
const hospitalSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
  pincode: Joi.string(),
  phone: Joi.string(),
  email: Joi.string().email(),
  website: Joi.string().uri(),
  licenseNumber: Joi.string()
});

router.post('/create-hospital', validate(hospitalSchema), createHospital);

// Admin Profile
router.get('/profile', getAdminProfile);

// Logout
router.post('/logout', logout);

export default router;
