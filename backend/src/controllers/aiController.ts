import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { RetrievalService } from '../services/retrieval/retrievalService.js';
import { GeminiService } from '../services/ai/geminiService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FileRecord } from '../types/index.js';

async function getAccessibleUserFiles(userId: string): Promise<FileRecord[]> {
  let files = await db.files.find({ user_id: userId, processing_status: 'Processed' });
  if (files.length === 0) {
    files = await db.files.find({ user_id: '00000000-0000-4000-a000-000000000001', processing_status: 'Processed' });
    if (files.length === 0) {
      files = await db.files.find({ user_id: 'usr_demo_evaluator', processing_status: 'Processed' });
    }
  }
  return files;
}

async function resolveTargetFiles(userId: string, fileIds?: string[]): Promise<FileRecord[]> {
  const accessible = await getAccessibleUserFiles(userId);
  if (!fileIds || fileIds.length === 0) {
    return accessible;
  }
  const matched: FileRecord[] = [];
  for (const id of fileIds) {
    const found = accessible.find((f) => f.id === id);
    if (found) {
      matched.push(found);
    } else {
      const dbFile = await db.files.findById(id);
      if (dbFile && dbFile.processing_status === 'Processed') {
        matched.push(dbFile);
      }
    }
  }
  return matched.length > 0 ? matched : accessible;
}

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

      const normalizedSources = aiResponse.sources.map((s) => ({
        id: uuidv4(),
        message_id: assistantMessage.id,
        file_id: s.fileId,
        fileId: s.fileId,
        file_name: s.fileName,
        fileName: s.fileName,
        source_type: 'evidence',
        sourceType: 'evidence',
        source_label: s.sourceLabel,
        sourceLabel: s.sourceLabel,
        page_number: s.pageNumber,
        pageNumber: s.pageNumber,
        timestamp: s.timestamp,
        relevance_score: s.relevanceScore,
        relevanceScore: s.relevanceScore,
      }));

      for (const s of normalizedSources) {
        await db.messageSources.create({
          id: s.id,
          message_id: assistantMessage.id,
          file_id: s.file_id,
          source_type: 'evidence',
          source_label: s.source_label,
          page_number: s.page_number,
          timestamp: s.timestamp,
          relevance_score: s.relevance_score,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          conversationId: convId,
          message: assistantMessage,
          sources: normalizedSources,
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

      const targetFiles = await resolveTargetFiles(userId, fileIds);

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

      const targetFiles = await resolveTargetFiles(userId, fileIds);

      const sources = await RetrievalService.searchRelevantEvidence(
        userId,
        topic,
        targetFiles.map((f) => f.id),
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

  async generateQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { topic = '', fileIds = [], count = 5, difficulty = 'medium' } = req.body;

      const targetFiles = await resolveTargetFiles(userId, fileIds);

      if (targetFiles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No processed files found in your workspace to generate a quiz from.',
        });
        return;
      }

      let cleanTopic = topic.trim();
      if (!cleanTopic) {
        cleanTopic = targetFiles.map((f) => f.original_name.replace(/\.[^/.]+$/, '')).join(' & ') + ' Quiz';
      }

      const sources = await RetrievalService.searchRelevantEvidence(
        userId,
        cleanTopic,
        targetFiles.map((f) => f.id),
        12
      );

      const questions = await GeminiService.generateQuizQuestions({
        topic: cleanTopic,
        sources,
        count: Number(count) || 5,
        difficulty,
      });

      res.status(200).json({
        success: true,
        data: {
          title: cleanTopic,
          files: targetFiles.map((f) => ({ id: f.id, name: f.original_name })),
          questionCount: questions.length,
          questions,
        },
      });
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate quiz questions.' });
    }
  },

  async generateFlashcards(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { topic = '', fileIds = [], count = 6 } = req.body;

      const targetFiles = await resolveTargetFiles(userId, fileIds);

      if (targetFiles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No processed files found to generate flashcards from.',
        });
        return;
      }

      let cleanTopic = topic.trim();
      if (!cleanTopic) {
        cleanTopic = targetFiles.map((f) => f.original_name.replace(/\.[^/.]+$/, '')).join(' & ') + ' Flashcards';
      }

      const sources = await RetrievalService.searchRelevantEvidence(
        userId,
        cleanTopic,
        targetFiles.map((f) => f.id),
        12
      );

      const flashcards = await GeminiService.generateFlashcards({
        topic: cleanTopic,
        sources,
        count: Number(count) || 6,
      });

      res.status(200).json({
        success: true,
        data: {
          title: cleanTopic,
          files: targetFiles.map((f) => ({ id: f.id, name: f.original_name })),
          cardCount: flashcards.length,
          flashcards,
        },
      });
    } catch (error: any) {
      console.error('Flashcard generation error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate flashcards.' });
    }
  },
};

