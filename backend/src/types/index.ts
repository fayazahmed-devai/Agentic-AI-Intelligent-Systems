export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
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

export interface MessageSource {
  id: string;
  message_id: string;
  file_id: string;
  extracted_content_id?: string | null;
  source_type: string;
  source_label: string;
  page_number?: number | null;
  timestamp?: string | null;
  relevance_score?: number;
}

export interface GeneratedContent {
  id: string;
  user_id: string;
  file_id?: string | null;
  conversation_id?: string | null;
  content_type: 'summary' | 'study_notes' | 'questions' | 'action_items' | 'comparison' | 'connected_intelligence';
  title: string;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  totalFiles: number;
  processedFiles: number;
  storageUsedBytes: number;
  questionsAsked: number;
  modalityCounts: Record<FileModality, number>;
}

