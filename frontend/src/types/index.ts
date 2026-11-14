export interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export type FileModality = 'document' | 'image' | 'audio' | 'video' | 'text';
export type ProcessingStatus = 'Uploaded' | 'Queued' | 'Processing' | 'Processed' | 'Failed';

export interface FileRecord {
  id: string;
  user_id: string;
  original_name: string;
  storage_path: string;
  mime_type: string;
  file_extension: string;
  file_size: number;
  modality: FileModality;
  processing_status: ProcessingStatus;
  processing_error?: string | null;
  created_at: string;
  updated_at: string;
  extracted_contents?: ExtractedContent[];
}

export type ContentType = 'text_chunk' | 'image_analysis' | 'audio_transcript' | 'video_frame';

export interface ExtractedContent {
  id: string;
  file_id: string;
  user_id: string;
  content_type: ContentType;
  extracted_text: string;
  page_number?: number | null;
  start_timestamp?: string | null;
  end_timestamp?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface MessageSource {
  id: string;
  message_id: string;
  file_id: string;
  source_type: string;
  source_label: string;
  page_number?: number | null;
  timestamp?: string | null;
  relevance_score?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: MessageSource[];
}

export interface DashboardStats {
  totalFiles: number;
  processedFiles: number;
  storageUsedBytes: number;
  questionsAsked: number;
  modalityCounts: Record<FileModality, number>;
}

export interface RecentActivity {
  id: string;
  type: 'file_upload' | 'ai_question' | 'content_generation';
  title: string;
  status: string;
  date: string;
}

export interface SearchResultItem {
  fileId: string;
  fileName: string;
  modality: FileModality;
  snippet: string;
  pageNumber?: number | null;
  timestamp?: string | null;
  sourceLabel: string;
  score: number;
}

export interface InvestigationFinding {
  modality: FileModality;
  fileId: string;
  fileName: string;
  finding: string;
  sourceLabel: string;
  timestampOrPage?: string;
  confidence: number;
}

export interface Investigation {
  id: string;
  user_id: string;
  query: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  modalities_searched: FileModality[];
  concepts_detected: string[];
  cross_modal_connections: string[];
  findings: InvestigationFinding[];
  contradictions_or_discrepancies?: string[];
  final_synthesis: string;
  created_at: string;
}

export interface KnowledgeNode {
  id: string;
  user_id: string;
  label: string;
  category: 'concept' | 'topic' | 'entity' | 'process' | 'formula';
  modality: FileModality;
  file_ids: string[];
  description: string;
  confidence: number;
  created_at: string;
  x?: number;
  y?: number;
}

export interface KnowledgeEdge {
  id: string;
  user_id: string;
  source_id: string;
  target_id: string;
  relation_type: 'relates_to' | 'derived_from' | 'contradicts' | 'exemplifies' | 'supports';
  weight: number;
  label?: string;
  created_at: string;
}

export interface ResearchPlanStep {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  findings?: string;
}

export interface ResearchTask {
  id: string;
  user_id: string;
  objective: string;
  status: 'planning' | 'searching' | 'analyzing' | 'synthesizing' | 'completed' | 'failed';
  plan_steps: ResearchPlanStep[];
  sources_analyzed: { file_id: string; file_name: string; modality: string }[];
  key_findings: string[];
  identified_gaps: string[];
  dossier_markdown: string;
  created_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  topic: string;
  mastery_score: number;
  quizzes_attempted: number;
  quizzes_passed: number;
  last_studied_at: string;
  recommended_next_step: string;
  weak_concepts: string[];
  strengths: string[];
}

export type ExplanationDepth = 'beginner' | 'simple' | 'university' | 'technical' | 'exam';

export interface UserPreferences {
  user_id: string;
  preferred_language: 'en' | 'hi' | 'kn' | 'ur' | 'ml';
  explanation_depth: ExplanationDepth;
  theme: 'light' | 'dark' | 'system';
  target_exam?: string;
  study_goals?: string[];
  favorite_file_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface ClaimVerification {
  claim: string;
  status: 'supported' | 'partially_supported' | 'conflicting' | 'insufficient';
  confidence_score: number;
  reasoning: string;
  citations: {
    file_id: string;
    file_name: string;
    modality: string;
    quote: string;
    location: string;
  }[];
  contradiction_note?: string;
}


