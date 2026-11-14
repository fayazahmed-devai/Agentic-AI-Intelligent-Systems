import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { RetrievalService } from '../services/retrieval/retrievalService.js';
import { GeminiService, cleanLatexAndFormatting } from '../services/ai/geminiService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const MentorController = {
  async explainConcept(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const concept = req.body.concept || req.body.topic;
      const level = req.body.level || req.body.depth || 'university';
      const fileIds = req.body.fileIds || [];

      if (!concept || typeof concept !== 'string' || !concept.trim()) {
        res.status(400).json({ success: false, message: 'Concept or topic is required.' });
        return;
      }

      const sources = await RetrievalService.searchRelevantEvidence(
        userId,
        concept,
        fileIds,
        8
      );

      const levelDescriptions: Record<string, string> = {
        beginner: 'Explain like I am a beginner. Use everyday intuitive metaphors, zero jargon, and simple language.',
        simple: 'Provide a clear, simple explanation with illustrative examples and real-world intuition.',
        university: 'Provide a rigorous university-level academic explanation. Include formal principles, derivations, and theoretical bounds.',
        technical: 'Provide a deep technical and mathematical breakdown. Include exact equations, vector relationships, and boundary conditions.',
        exam: 'Provide high-yield exam preparation notes. Highlight common exam pitfalls, key formulas to memorize, and typical questions.',
      };

      const instruction = levelDescriptions[level] || levelDescriptions.university;

      const prompt = `You are a world-class Personal AI Learning Mentor.
The student asks for an explanation of: "${concept.trim()}"
PEDAGOGICAL LEVEL: ${level.toUpperCase()} (${instruction})

MANDATE:
- Ground your explanation strictly on the student's uploaded materials.
- Structure with clear headings:
  1. Core Concept Overview
  2. Detailed Explanation (${level} level)
  3. Key Equations or Principles
  4. Practical Example
  5. Exam Pitfall or Pro-Tip
- Use clean readable Unicode (Ω, A, V, W, ≈, etc.). DO NOT output raw LaTeX or dollar signs ($).

EVIDENCE FROM STUDENT'S WORKSPACE:
${sources.map((s) => `[${s.sourceLabel}]: ${s.content.extracted_text}`).join('\n\n')}`;

      const aiResponse = await GeminiService.chatWithWorkspace({
        question: prompt,
        sources,
      });

      // Update or record learning progress
      const existingProgress = await db.learningProgress.findOne({ user_id: userId, topic: concept.trim() });
      if (existingProgress) {
        await db.learningProgress.updateById(existingProgress.id, {
          last_studied_at: new Date().toISOString(),
          topics_revised: Array.from(new Set([...(existingProgress.topics_revised || []), level])),
        });
      } else {
        await db.learningProgress.create({
          id: uuidv4(),
          user_id: userId,
          topic: concept.trim(),
          mastery_percentage: 65.0,
          quizzes_attempted: 0,
          correct_answers: 0,
          topics_revised: [level],
          recommended_next: ['Attempt interactive quiz', 'Review practice problems'],
          last_studied_at: new Date().toISOString(),
        });
      }

      res.status(200).json({
        success: true,
        data: {
          concept: concept.trim(),
          level,
          explanation: cleanLatexAndFormatting(aiResponse.answer),
          sources: aiResponse.sources,
        },
      });
    } catch (error: any) {
      console.error('Mentor explanation error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate mentor explanation.' });
    }
  },

  async getProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const progressRecords = await db.learningProgress.find({ user_id: userId });
      const userFiles = await db.files.find({ user_id: userId });

      const totalAttempted = progressRecords.reduce((acc, p) => acc + (p.quizzes_attempted || 0), 0);
      const totalCorrect = progressRecords.reduce((acc, p) => acc + (p.correct_answers || 0), 0);
      const avgScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 85;

      res.status(200).json({
        success: true,
        data: {
          totalTopicsStudied: progressRecords.length,
          quizzesAttempted: totalAttempted,
          averageAccuracy: avgScore,
          activeMaterialsCount: userFiles.length,
          records: progressRecords,
          personalizedRecommendations: [
            'Review Mesh & Loop Analysis matrix derivations in BEE assignment',
            'Practice 5 MCQs on Superposition Theorem power non-linearity',
            'Inspect handwritten circuit diagram for polarity orientation',
          ],
        },
      });
    } catch (error: any) {
      console.error('Mentor progress retrieval error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve learning progress.' });
    }
  },

  async recordQuizAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { topic, score, totalQuestions } = req.body;

      const record = await db.learningProgress.create({
        id: uuidv4(),
        user_id: userId,
        topic: topic || 'General Quiz',
        mastery_percentage: Math.round((score / totalQuestions) * 100),
        quizzes_attempted: totalQuestions,
        correct_answers: score,
        topics_revised: ['Quiz Attempt'],
        recommended_next: score === totalQuestions ? ['Advanced problems'] : ['Review missed question explanations'],
        last_studied_at: new Date().toISOString(),
      });

      res.status(200).json({ success: true, data: record });
    } catch (error: any) {
      console.error('Record quiz error:', error);
      res.status(500).json({ success: false, message: 'Failed to record quiz attempt.' });
    }
  },
};
