import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

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