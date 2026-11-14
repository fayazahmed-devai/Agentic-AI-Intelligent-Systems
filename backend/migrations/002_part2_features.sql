-- ========================================================
-- NexusMind AI — Part 2 Advanced Intelligence Schema
-- Migration 002: Detective, Knowledge Graph, Research Agent,
-- Learning Mentor, Evidence Center & Preferences
-- ========================================================

-- 1. Investigations Table (AI Knowledge Detective)
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  target_files JSONB DEFAULT '[]'::jsonb,
  detected_concepts JSONB DEFAULT '[]'::jsonb,
  modality_findings JSONB DEFAULT '{}'::jsonb,
  contradictions JSONB DEFAULT '[]'::jsonb,
  final_report TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Knowledge Graph Nodes & Edges
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'concept', -- 'concept', 'topic', 'document', 'formula'
  modality VARCHAR(50) DEFAULT 'document',
  file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  details TEXT,
  importance NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relationship VARCHAR(100) NOT NULL DEFAULT 'relates_to',
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Autonomous Research Agent Tasks
CREATE TABLE IF NOT EXISTS research_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  plan_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_step INTEGER DEFAULT 0,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'planning', -- 'planning', 'in_progress', 'completed', 'cancelled'
  final_dossier TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Learning Mentor Progress
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  mastery_percentage NUMERIC(5,2) DEFAULT 0.0,
  quizzes_attempted INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  topics_revised JSONB DEFAULT '[]'::jsonb,
  recommended_next JSONB DEFAULT '[]'::jsonb,
  last_studied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Preferences & Multilingual Settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(20) NOT NULL DEFAULT 'en', -- 'en', 'hi', 'kn', 'ur', 'ml'
  theme VARCHAR(20) NOT NULL DEFAULT 'light',
  speech_rate NUMERIC(3,2) DEFAULT 1.0,
  auto_speak BOOLEAN DEFAULT false,
  study_goal VARCHAR(255) DEFAULT 'Master uploaded concepts',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

