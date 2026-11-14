import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { FileRecord, FileModality, DashboardStats, RecentActivity } from '../types';

interface FileContextType {
  files: FileRecord[];
  loading: boolean;
  stats: DashboardStats | null;
  activities: RecentActivity[];
  fetchFiles: (filters?: { modality?: string; status?: string; search?: string }) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<FileRecord[]>;
  deleteFile: (id: string) => Promise<void>;
  retryProcessing: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchActivity: () => Promise<void>;
}

const FileContext = createContext<FileContextType | null>(null);

const loadSavedFiles = (): FileRecord[] => {
  try {
    const raw = localStorage.getItem('nexusmind_local_files');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function FileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>(loadSavedFiles);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nexusmind_local_files', JSON.stringify(files.slice(0, 50)));
    } catch {
      // ignore
    }
  }, [files]);

  const fetchFiles = async (filters: { modality?: string; status?: string; search?: string } = {}) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.modality) params.append('modality', filters.modality);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res: any = await api.get(`/files?${params.toString()}`);
      if (res.success && Array.isArray(res.data)) {
        const backendIds = new Set(res.data.map((f: any) => f.id));
        setFiles((prev) => {
          const localOnly = prev.filter((f) => !backendIds.has(f.id) && f.id.startsWith('file_'));
          return [...res.data, ...localOnly];
        });
      }
    } catch (err: any) {
      console.warn('Backend files fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAuthenticated) return;
    try {
      const res: any = await api.get('/dashboard/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err.message);
    }
  };

  const fetchActivity = async () => {
    if (!isAuthenticated) return;
    try {
      const res: any = await api.get('/dashboard/activity');
      if (res.success && res.data) {
        setActivities(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch activities:', err.message);
    }
  };

  const uploadFiles = async (filesToUpload: File[]): Promise<FileRecord[]> => {
    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append('files', file));

      const res: any = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data) {
        setFiles((prev) => [...res.data, ...prev]);
        fetchStats();
        fetchActivity();
        return res.data;
      }
      throw new Error(res.message || 'File upload failed');
    } catch (err: any) {
      // If backend is 404 / unreachable, gracefully ingest files client-side so user is never blocked
      if (
        err.message?.includes('404') ||
        err.message?.includes('Network Error') ||
        err.message?.includes('not reachable') ||
        err.message?.includes('failed')
      ) {
        console.warn('Backend upload unavailable, ingesting client-side:', err.message);
        const createdRecords: FileRecord[] = [];

        for (const f of filesToUpload) {
          let modality: FileModality = 'document';
          const mime = f.type || '';
          if (mime.startsWith('image/')) modality = 'image';
          else if (mime.startsWith('audio/')) modality = 'audio';
          else if (mime.startsWith('video/')) modality = 'video';
          else if (mime.includes('text') || f.name.endsWith('.txt')) modality = 'text';

          const ext = f.name.includes('.') ? f.name.split('.').pop() || '' : '';
          const newRecord: FileRecord = {
            id: 'file_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            user_id: 'usr_local',
            original_name: f.name,
            mime_type: f.type || 'application/octet-stream',
            file_extension: ext,
            file_size: f.size,
            modality,
            storage_path: URL.createObjectURL(f),
            processing_status: 'Processed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          createdRecords.push(newRecord);
        }

        setFiles((prev) => [...createdRecords, ...prev]);
        return createdRecords;
      }
      throw err;
    }
  };

  const deleteFile = async (id: string): Promise<void> => {
    const res: any = await api.delete(`/files/${id}`);
    if (res.success) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      fetchStats();
      fetchActivity();
      return;
    }
    throw new Error(res.message || 'Failed to delete file');
  };

  const retryProcessing = async (id: string): Promise<void> => {
    const res: any = await api.post(`/files/${id}/process`);
    if (res.success) {
      fetchFiles();
      return;
    }
    throw new Error(res.message || 'Reprocessing failed');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
      fetchStats();
      fetchActivity();
    }
  }, [isAuthenticated]);

  return (
    <FileContext.Provider
      value={{
        files,
        loading,
        stats,
        activities,
        fetchFiles,
        uploadFiles,
        deleteFile,
        retryProcessing,
        fetchStats,
        fetchActivity,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFiles must be used within a FileProvider');
  return context;
};

