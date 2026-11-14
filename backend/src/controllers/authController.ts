import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../services/auth/authService.js';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { full_name, email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existing = await db.users.findOne({ email: normalizedEmail });
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
        return;
      }

      const password_hash = await AuthService.hashPassword(password);
      const newUser = await db.users.create({
        id: uuidv4(),
        full_name: full_name.trim(),
        email: normalizedEmail,
        password_hash,
      });

      const token = AuthService.generateToken(newUser);
      AuthService.setAuthCookie(res, token);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        data: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await db.users.findOne({ email: normalizedEmail });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email address or password.',
        });
        return;
      }

      const isMatch = await AuthService.comparePassword(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email address or password.',
        });
        return;
      }

      const token = AuthService.generateToken(user);
      AuthService.setAuthCookie(res, token);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully',
        token,
        data: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during sign in.' });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    AuthService.clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: 'Signed out successfully',
    });
  },

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        full_name: req.user.full_name,
        email: req.user.email,
        created_at: req.user.created_at,
      },
    });
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    // Section 5E: If email delivery is not configured, display a clear setup requirement. Do not pretend an email was sent.
    res.status(200).json({
      success: true,
      message:
        'Password reset requested. Note: SMTP email dispatch credentials are not configured in this environment. In production, configure SMTP credentials to dispatch reset emails.',
      requires_smtp_setup: true,
    });
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    res.status(400).json({
      success: false,
      message: 'Password reset token expired or invalid.',
    });
  },
};

