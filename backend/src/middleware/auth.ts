import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/authService.js';
import { db } from '../database/db.js';
import { User } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    // Check HttpOnly cookie first
    if (req.cookies && req.cookies.nexusmind_token) {
      token = req.cookies.nexusmind_token;
    }
    // Check Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No session or token found.',
      });
      return;
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        message: 'Invalid session token. Please sign in again.',
      });
      return;
    }

    const user = await db.users.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account associated with this session no longer exists.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid token.',
    });
  }
}

