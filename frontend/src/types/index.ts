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

