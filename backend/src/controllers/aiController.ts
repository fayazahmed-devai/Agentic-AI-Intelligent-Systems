import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { RetrievalService } from '../services/retrieval/retrievalService.js';
import { GeminiService } from '../services/ai/geminiService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const AIController = {
  async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { message, conversationId, targetFileIds = [] } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ success: false, message: 'Message is required.' });
        return;
      }

      // 1. Ensure or find conversation
      let convId = conversationId;
      if (!convId) {
        const newConv = await db.conversations.create({
          id: uuidv4(),
          user_id: userId,
          title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        });
        convId = newConv.id;
      }

      // 2. Save user message
      await db.messages.create({
        id: uuidv4(),
        conversation_id: convId,
        user_id: userId,
        role: 'user',
        content: message.trim(),
      });

      // 3. Retrieve relevant grounded evidence across modalities
      const sources = await RetrievalService.searchRelevantEvidence(
        userId,
        message,
        targetFileIds,
        6
      );

      // 4. Generate grounded answer
      const aiResponse = await GeminiService.chatWithWorkspace({
        question: message,
        sources,
      });

      // 5. Save assistant message and message sources
      const assistantMessage = await db.messages.create({
        id: uuidv4(),
        conversation_id: convId,
        user_id: userId,
        role: 'assistant',
        content: aiResponse.answer,
      });

      for (const s of aiResponse.sources) {
        await db.messageSources.create({
          id: uuidv4(),
          message_id: assistantMessage.id,
          file_id: s.fileId,
          source_type: 'evidence',
          source_label: s.sourceLabel,
          page_number: s.pageNumber,
          timestamp: s.timestamp,
          relevance_score: s.relevanceScore,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          conversationId: convId,
          message: assistantMessage,
          sources: aiResponse.sources,
        },
      });
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ success: false, message: 'Failed to process AI chat query.' });
    }
  },

  async connectedIntelligence(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { topic, fileIds = [] } = req.body;

      const userFiles = await db.files.find({ user_id: userId, processing_status: 'Processed' });
      const targetFiles = fileIds.length > 0 ? userFiles.filter((f) => fileIds.includes(f.id)) : userFiles;

      if (targetFiles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No processed files found in your workspace to run Connected Intelligence.',
        });
        return;
      }

      let cleanTopic = (topic || '').trim();
      const targetNames = targetFiles.map((f) => f.original_name).join(' ');

      // If topic is empty or still mentions Newtonian but the selected files are different (e.g. BEE), auto-generate topic from files
      if (!cleanTopic || (cleanTopic.toLowerCase().includes('newtonian') && !targetNames.toLowerCase().includes('newtonian'))) {
        cleanTopic = targetFiles.map((f) => f.original_name.replace(/\.[^/.]+$/, '')).join(' & ') + ' Synthesis';
      }

      const sources = await RetrievalService.searchRelevantEvidence(
        userId,
        cleanTopic,
        targetFiles.map((f) => f.id),
        12
      );

      const result = await GeminiService.runConnectedIntelligence({
        topic: cleanTopic,
        sources,
        files: targetFiles,
      });

      // Save to generated content
      const saved = await db.generatedContent.create({
        id: uuidv4(),
        user_id: userId,
        content_type: 'connected_intelligence',
        title: `Connected Intelligence: ${cleanTopic}`,
        content: result.content,
        metadata: {
          sourceCount: result.sources.length,
          modalities: Array.from(new Set(targetFiles.map((f) => f.modality))),
        },
      });

      res.status(200).json({
        success: true,
        data: {
          id: saved.id,
          title: saved.title,
          content: result.content,
          sources: result.sources,
        },
      });
    } catch (error: any) {
      console.error('Connected intelligence error:', error);
      res.status(500).json({ success: false, message: 'Failed to execute Connected Intelligence.' });
    }
  },

  async generateContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { type, topic = 'Workspace Content', fileIds = [] } = req.body;

      const sources = await RetrievalService.searchRelevantEvidence(
        userId,
        topic,
        fileIds,
        8
      );

      if (sources.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No relevant processed content found to generate this material.',
        });
        return;
      }

      const content = await GeminiService.generateContentStudio({
        type: type || 'summary',
        topic,
        sources,
      });

      const record = await db.generatedContent.create({
        id: uuidv4(),
        user_id: userId,
        content_type: type || 'summary',
        title: `${type.toUpperCase()}: ${topic}`,
        content,
        metadata: {
          sourcesCount: sources.length,
        },
      });

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      console.error('Content studio generation error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate studio content.' });
    }
  },
};

