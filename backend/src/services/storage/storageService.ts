import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config/env.js';

let supabase: SupabaseClient | null = null;

if (config.supabaseUrl && config.supabaseServiceRoleKey) {
  try {
    supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
    console.log('Supabase Storage client initialized.');
  } catch (err: any) {
    console.warn('Could not initialize Supabase client:', err.message);
  }
}

export const StorageService = {
  async saveLocalOrRemote(
    filePath: string,
    originalName: string,
    mimeType: string
  ): Promise<string> {
    // If Supabase is configured and storage bucket is ready
    if (supabase) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const remotePath = `${Date.now()}_${path.basename(filePath)}`;
        const { data, error } = await supabase.storage
          .from(config.supabaseStorageBucket)
          .upload(remotePath, fileBuffer, { contentType: mimeType });

        if (!error && data?.path) {
          return `supabase://${config.supabaseStorageBucket}/${data.path}`;
        }
      } catch (err: any) {
        console.warn('Supabase upload fallback to local storage:', err.message);
      }
    }

    // Default secure local storage path
    return filePath;
  },

  async getFileBuffer(storagePath: string): Promise<Buffer> {
    if (storagePath.startsWith('supabase://') && supabase) {
      const parts = storagePath.replace('supabase://', '').split('/');
      const bucket = parts[0];
      const filePath = parts.slice(1).join('/');
      const { data, error } = await supabase.storage.from(bucket).download(filePath);
      if (error || !data) {
        throw new Error(`Failed to download file from Supabase Storage: ${error?.message}`);
      }
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    if (!fs.existsSync(storagePath)) {
      throw new Error(`File not found at storage path: ${storagePath}`);
    }
    return fs.readFileSync(storagePath);
  },

  async deleteFile(storagePath: string): Promise<void> {
    if (storagePath.startsWith('supabase://') && supabase) {
      const parts = storagePath.replace('supabase://', '').split('/');
      const bucket = parts[0];
      const filePath = parts.slice(1).join('/');
      await supabase.storage.from(bucket).remove([filePath]);
      return;
    }

    if (fs.existsSync(storagePath)) {
      try {
        fs.unlinkSync(storagePath);
      } catch (err: any) {
        console.warn('Error deleting local file:', err.message);
      }
    }
  },
};

