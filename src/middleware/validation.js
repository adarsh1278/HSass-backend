import Joi from 'joi';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../utils/httpStatus.js';

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details[0].message;
      throw new ApiError(httpStatus.BAD_REQUEST, message);
    }
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const subscriptionSchema = Joi.object({
  planId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

const hospitalSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  phone: Joi.string(),
  email: Joi.string().email()
});

export {
  validate,
  registerSchema,
  loginSchema,
  subscriptionSchema,
  hospitalSchema
};
