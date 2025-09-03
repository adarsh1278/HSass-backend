import ApiError from '../utils/ApiError.js';
import httpStatus from '../utils/httpStatus.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = new ApiError(httpStatus.BAD_REQUEST, message);
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = new ApiError(httpStatus.NOT_FOUND, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ApiError(httpStatus.UNAUTHORIZED, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ApiError(httpStatus.UNAUTHORIZED, message);
  }

  res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
