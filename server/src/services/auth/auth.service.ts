import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/user.model';
import { config } from '../../config';
import { ApiError } from '../../utils/ApiError';

/**
 * Service class handling user authentication and authorization
 * 
 * Provides methods for user registration, login, token validation,
 * and user retrieval. Uses JWT for authentication tokens and
 * MongoDB for user persistence.
 */
export class AuthService {
  /**
   * Registers a new user in the system
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password (will be hashed)
   * @returns {Promise<IUser>} The created user object
   * @throws {ApiError} If email is already registered
   */
  static async register(email: string, password: string): Promise<IUser> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    const user = new User({
      email,
      password
    });

    return user.save();
  }

  /**
   * Authenticates a user and generates a JWT token
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{user: IUser, token: string}>} Object containing user data and JWT token
   * @throws {ApiError} If credentials are invalid
   */
  static async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return { user, token };
  }

  /**
   * Validates a JWT token and returns the user ID
   * 
   * @param {string} token - JWT token to validate
   * @returns {Promise<{userId: string}>} Object containing the validated user ID
   * @throws {ApiError} If token is invalid or expired
   */
  static async validateToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      return decoded;
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired token');
    }
  }

  /**
   * Retrieves a user by their ID
   * 
   * @param {string} userId - ID of the user to retrieve
   * @returns {Promise<IUser>} The user object
   * @throws {ApiError} If user is not found
   */
  static async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
} 