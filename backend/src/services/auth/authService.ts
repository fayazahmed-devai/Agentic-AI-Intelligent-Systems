import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../../config/env.js';
import { User } from '../../types/index.js';

export const AuthService = {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateToken(user: Pick<User, 'id' | 'email' | 'full_name'>): string {
    const options: SignOptions = {
      expiresIn: config.jwtExpiresIn as any,
    };
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      config.jwtSecret,
      options
    );
  },

  verifyToken(token: string): any {
    return jwt.verify(token, config.jwtSecret);
  },

  setAuthCookie(res: Response, token: string): void {
    res.cookie('nexusmind_token', token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  },

  clearAuthCookie(res: Response): void {
    res.cookie('nexusmind_token', '', {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite,
      expires: new Date(0),
      path: '/',
    });
  },
};
