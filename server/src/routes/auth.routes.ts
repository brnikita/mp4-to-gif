import { Router } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { validateRequest } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

const router = Router();

router.post('/register', validateRequest, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.register(email, password);
    
    logger.info('User registered successfully', { email });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateRequest, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);
    
    logger.info('User logged in successfully', { email });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  // In a real application, you might want to invalidate the token
  // For now, we'll just send a success response
  res.json({ message: 'Logout successful' });
});

router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const { userId } = await AuthService.validateToken(token);
    const user = await AuthService.getUserById(userId);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

export const authRoutes = router; 