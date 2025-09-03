import express from 'express';
import superAdminRoutes from './superAdminRoutes.js';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

// API Routes
router.use('/super-admin', superAdminRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hospital SaaS API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
