import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const PreferencesController = {
  async getPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      let prefs = await db.userPreferences.findOne({ user_id: userId });

      if (!prefs) {
        prefs = await db.userPreferences.create({
          id: uuidv4(),
          user_id: userId,
          language: 'en',
          theme: 'light',
          speech_rate: 1.0,
          auto_speak: false,
          study_goal: 'Master uploaded concepts and cross-modal insights',
        });
      }

      res.status(200).json({ success: true, data: prefs });
    } catch (error: any) {
      console.error('Failed to get preferences:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve preferences.' });
    }
  },

  async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { language, theme, speech_rate, auto_speak, study_goal } = req.body;

      let prefs = await db.userPreferences.findOne({ user_id: userId });

      if (!prefs) {
        prefs = await db.userPreferences.create({
          id: uuidv4(),
          user_id: userId,
          language: language || 'en',
          theme: theme || 'light',
          speech_rate: speech_rate ?? 1.0,
          auto_speak: auto_speak ?? false,
          study_goal: study_goal || 'Master uploaded concepts',
        });
      } else {
        prefs = await db.userPreferences.updateById(prefs.id, {
          ...(language && { language }),
          ...(theme && { theme }),
          ...(speech_rate !== undefined && { speech_rate }),
          ...(auto_speak !== undefined && { auto_speak }),
          ...(study_goal && { study_goal }),
        });
      }

      res.status(200).json({ success: true, data: prefs });
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      res.status(500).json({ success: false, message: 'Failed to update preferences.' });
    }
  },
};

