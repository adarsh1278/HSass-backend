import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Verify JWT Token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Hash Password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate Hospital-specific Patient ID
const generatePatientId = (hospitalId) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `PAT-${hospitalId.substr(-4).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
};

// Generate Invoice Number
const generateInvoiceNumber = (hospitalId) => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4);
  return `INV-${hospitalId.substr(-4).toUpperCase()}-${year}${month}${day}-${random}`.toUpperCase();
};

export {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generatePatientId,
  generateInvoiceNumber
};
