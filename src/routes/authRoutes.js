import express from 'express';
import {
  registerHospital,
  loginAdmin,
  getAvailablePlans,
  purchaseSubscription,
  getHospitalProfile,
  updateHospitalProfile,
  logout
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, loginSchema, hospitalSchema, subscriptionSchema } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Public routes (no authentication required)
router.get('/plans', getAvailablePlans);

const hospitalRegistrationSchema = Joi.object({
  // Hospital details
  hospitalName: Joi.string().required(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
  pincode: Joi.string(),
  phone: Joi.string(),
  email: Joi.string().email(),
  website: Joi.string().uri(),
  licenseNumber: Joi.string(),
  
  // Admin details
  adminName: Joi.string().required(),
  adminEmail: Joi.string().email().required(),
  adminPhone: Joi.string(),
  adminPassword: Joi.string().min(6).required(),
  
  // Subscription
  planId: Joi.string().required()
});

router.post('/register', validate(hospitalRegistrationSchema), registerHospital);
router.post('/login', validate(loginSchema), loginAdmin);

// Protected routes (authentication required)
router.use(requireAuth);

const purchaseSubscriptionSchema = Joi.object({
  planId: Joi.string().required(),
  duration: Joi.number().positive().default(30)
});

// Note: Permission checks are now handled in controllers
router.post('/subscription/purchase', 
  validate(purchaseSubscriptionSchema), 
  purchaseSubscription
);

router.get('/hospital/profile', getHospitalProfile);
router.put('/hospital/profile', 
  validate(hospitalSchema), 
  updateHospitalProfile
);

router.post('/logout', logout);

export default router;
