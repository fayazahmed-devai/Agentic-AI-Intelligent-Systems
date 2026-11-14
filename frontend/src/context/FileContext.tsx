import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { FileRecord, DashboardStats, RecentActivity } from '../types';

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

export function FileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async (filters: { modality?: string; status?: string; search?: string } = {}) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.modality) params.append('modality', filters.modality);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res: any = await api.get(`/files?${params.toString()}`);
      if (res.success && res.data) {
        setFiles(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch files:', err.message);
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
