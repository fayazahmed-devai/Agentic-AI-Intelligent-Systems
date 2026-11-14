import { Response } from 'express';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const ConversationController = {
  async listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const convs = await db.conversations.find({ user_id: userId });
      convs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      res.status(200).json({ success: true, data: convs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve conversations.' });
    }
  },

  async getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const conv = await db.conversations.findById(id);
      if (!conv || conv.user_id !== userId) {
        res.status(404).json({ success: false, message: 'Conversation not found.' });
        return;
      }

      const messages = await db.messages.find({ conversation_id: id });
      messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      // Attach message sources
      const enrichedMessages = await Promise.all(
        messages.map(async (m) => {
          const sources = await db.messageSources.find({ message_id: m.id });
          return {
            ...m,
            sources,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          ...conv,
          messages: enrichedMessages,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve conversation messages.' });
    }
  },

  async deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const conv = await db.conversations.findById(id);
      if (!conv || conv.user_id !== userId) {
        res.status(404).json({ success: false, message: 'Conversation not found.' });
        return;
      }

      await db.conversations.deleteById(id);
      await db.messages.deleteMany({ conversation_id: id });

      res.status(200).json({ success: true, message: 'Conversation deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete conversation.' });
    }
  },
};

