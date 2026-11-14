import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env.js';

import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import detectiveRoutes from './routes/detectiveRoutes.js';
import knowledgeGraphRoutes from './routes/knowledgeGraphRoutes.js';
import researchAgentRoutes from './routes/researchAgentRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';

export const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or matching frontend origins
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(config.uploadDir));

// System Health Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'NexusMind AI — Production Multimodal Knowledge Assistant',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(config.geminiApiKey),
    geminiModel: config.geminiModel,
    supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
  });
});

// Mount Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/detective', detectiveRoutes);
app.use('/api/knowledge-graph', knowledgeGraphRoutes);
app.use('/api/research-agent', researchAgentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/preferences', preferencesRoutes);

// Global 404 Handler
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `API endpoint ${req.originalUrl} not found.` });
});

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
    },
  });
});

