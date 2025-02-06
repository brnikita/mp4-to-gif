import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { ApiError } from '../utils/ApiError';

/**
 * Extended Express Request interface that includes authenticated user information
 * 
 * @interface AuthRequest
 * @extends {Request}
 * @property {Object} [user] - The authenticated user's information
 * @property {string} user.userId - Unique identifier of the authenticated user
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

/**
 * Express middleware to authenticate requests using JWT tokens
 * 
 * Validates the Bearer token from the Authorization header and attaches
 * the decoded user information to the request object.
 * 
 * @param {AuthRequest} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {ApiError} 401 error if no token is provided or token is invalid
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await AuthService.validateToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Express middleware to validate request body for authentication endpoints
 * 
 * Checks for required fields in the request body and validates their format.
 * Currently validates:
 * - Email presence and format
 * - Password presence and minimum length
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {ApiError} 400 error if validation fails
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = [];

  if (!req.body.email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    errors.push('Invalid email format');
  }

  if (!req.body.password) {
    errors.push('Password is required');
  } else if (req.body.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join(', '));
  }

  next();
}; 