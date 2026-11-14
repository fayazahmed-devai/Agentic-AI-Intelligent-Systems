import { Response } from 'express';
import { RetrievalService } from '../services/retrieval/retrievalService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const SearchController = {
  async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = (req.query.q as string) || '';

      if (!query.trim()) {
        res.status(200).json({ success: true, count: 0, data: [] });
        return;
      }

      const results = await RetrievalService.globalSearch(userId, query.trim(), 20);

      res.status(200).json({
        success: true,
        count: results.length,
        query: query.trim(),
        data: results,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      res.status(500).json({ success: false, message: 'Search execution failed.' });
    }
  },
};

