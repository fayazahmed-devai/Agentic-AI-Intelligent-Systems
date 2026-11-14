import { Response } from 'express';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FileModality } from '../types/index.js';

export const DashboardController = {
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const userFiles = await db.files.find({ user_id: userId });
      const totalFiles = userFiles.length;
      const processedFiles = userFiles.filter((f) => f.processing_status === 'Processed').length;
      const storageUsedBytes = userFiles.reduce((acc, f) => acc + (f.file_size || 0), 0);

      const userMessages = await db.messages.find({ user_id: userId, role: 'user' });
      const questionsAsked = userMessages.length;

      const modalityCounts: Record<FileModality, number> = {
        document: 0,
        image: 0,
        audio: 0,
        video: 0,
        text: 0,
      };

      userFiles.forEach((f) => {
        if (modalityCounts[f.modality] !== undefined) {
          modalityCounts[f.modality] += 1;
        }
      });

      res.status(200).json({
        success: true,
        data: {
          totalFiles,
          processedFiles,
          storageUsedBytes,
          questionsAsked,
          modalityCounts,
        },
      });
    } catch (error: any) {
      console.error('Stats error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
    }
  },

  async getActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const userFiles = await db.files.find({ user_id: userId });
      const userMessages = await db.messages.find({ user_id: userId, role: 'user' });
      const userGenerated = await db.generatedContent.find({ user_id: userId });

      const activities = [
        ...userFiles.map((f) => ({
          id: f.id,
          type: 'file_upload',
          title: `Uploaded ${f.modality.toUpperCase()}: ${f.original_name}`,
          status: f.processing_status,
          date: f.created_at,
        })),
        ...userMessages.map((m) => ({
          id: m.id,
          type: 'ai_question',
          title: `Asked: "${m.content.slice(0, 60)}${m.content.length > 60 ? '...' : ''}"`,
          status: 'Answered',
          date: m.created_at,
        })),
        ...userGenerated.map((g) => ({
          id: g.id,
          type: 'content_generation',
          title: `Generated: ${g.title}`,
          status: 'Completed',
          date: g.created_at,
        })),
      ];

      // Sort newest first
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.status(200).json({
        success: true,
        data: activities.slice(0, 10),
      });
    } catch (error: any) {
      console.error('Activity error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve recent activity.' });
    }
  },
};

