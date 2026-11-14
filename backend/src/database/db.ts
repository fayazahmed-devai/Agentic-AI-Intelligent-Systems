import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import {
  User,
  FileRecord,
  ExtractedContent,
  Conversation,
  Message,
  MessageSource,
  GeneratedContent,
} from '../types/index.js';

// Regex to validate UUID format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ensureUUID(id?: string): string {
  if (id && UUID_REGEX.test(id)) {
    return id;
  }
  // Deterministic mapping for sample demo keys
  if (id === 'usr_demo_evaluator') return '00000000-0000-4000-a000-000000000001';
  if (id === 'file_demo_doc') return '00000000-0000-4000-a000-000000000002';
  if (id === 'file_demo_img') return '00000000-0000-4000-a000-000000000003';
  if (id === 'file_demo_audio') return '00000000-0000-4000-a000-000000000004';
  if (id === 'file_demo_video') return '00000000-0000-4000-a000-000000000005';
  if (id === 'chunk_demo_1') return '00000000-0000-4000-a000-000000000011';
  if (id === 'chunk_demo_2') return '00000000-0000-4000-a000-000000000012';
  if (id === 'chunk_demo_3') return '00000000-0000-4000-a000-000000000013';
  if (id === 'chunk_demo_4') return '00000000-0000-4000-a000-000000000014';
  return uuidv4();
}

// Local Persistent Store as high-reliability cache and offline fallback
class PersistentStore<T extends { id: string; user_id?: string; created_at?: string; updated_at?: string }> {
  private name: string;
  private filePath: string;

  constructor(name: string, filePath: string) {
    this.name = name;
    this.filePath = filePath;
  }

  readAll(): T[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        if (!fs.existsSync(path.dirname(this.filePath))) {
          fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
        }
        fs.writeFileSync(this.filePath, JSON.stringify({}), 'utf-8');
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const data = JSON.parse(raw || '{}');
      return data[this.name] || [];
    } catch (err) {
      console.error(`Error reading ${this.name} from store:`, err);
      return [];
    }
  }

  writeAll(items: T[]): void {
    try {
      if (!fs.existsSync(path.dirname(this.filePath))) {
        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      }
      let current: Record<string, any> = {};
      if (fs.existsSync(this.filePath)) {
        try {
          current = JSON.parse(fs.readFileSync(this.filePath, 'utf-8') || '{}');
        } catch {
          current = {};
        }
      }
      current[this.name] = items;
      fs.writeFileSync(this.filePath, JSON.stringify(current, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error writing ${this.name} to store:`, err);
    }
  }

  async find(query: Partial<T> = {}): Promise<T[]> {
    const all = this.readAll();
    return all.filter((item) => {
      for (const key in query) {
        if ((item as any)[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async findOne(query: Partial<T> = {}): Promise<T | null> {
    const all = this.readAll();
    return (
      all.find((item) => {
        for (const key in query) {
          if ((item as any)[key] !== query[key]) return false;
        }
        return true;
      }) || null
    );
  }

  async findById(id: string): Promise<T | null> {
    return this.findOne({ id } as any);
  }

  async create(
    data: Omit<T, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    }
  ): Promise<T> {
    const all = this.readAll();
    const item: T = {
      id: ensureUUID(data.id),
      ...data,
      created_at: (data as any).created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as T;
    all.push(item);
    this.writeAll(all);
    return item;
  }

  async updateById(id: string, updates: Partial<T>): Promise<T | null> {
    const all = this.readAll();
    const idx = all.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    all[idx] = {
      ...all[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.writeAll(all);
    return all[idx];
  }

  async deleteById(id: string): Promise<boolean> {
    const all = this.readAll();
    const filtered = all.filter((i) => i.id !== id);
    if (filtered.length !== all.length) {
      this.writeAll(filtered);
      return true;
    }
    return false;
  }

  async deleteMany(query: Partial<T> = {}): Promise<number> {
    const all = this.readAll();
    const remaining = all.filter((item) => {
      for (const key in query) {
        if ((item as any)[key] === query[key]) return false;
      }
      return true;
    });
    const count = all.length - remaining.length;
    this.writeAll(remaining);
    return count;
  }

  async count(query: Partial<T> = {}): Promise<number> {
    const matches = await this.find(query);
    return matches.length;
  }
}

// SQL Table Adapter with Supabase PostgreSQL and local sync
export class SqlTable<T extends { id: string; user_id?: string; created_at?: string; updated_at?: string }> {
  public tableName: string;
  private localStore: PersistentStore<T>;
  private supabase: SupabaseClient | null;

  constructor(tableName: string, localStore: PersistentStore<T>, supabase: SupabaseClient | null) {
    this.tableName = tableName;
    this.localStore = localStore;
    this.supabase = supabase;
  }

  async find(query: Partial<T> = {}): Promise<T[]> {
    if (this.supabase) {
      try {
        let builder = this.supabase.from(this.tableName).select('*');
        for (const [k, v] of Object.entries(query)) {
          if (v !== undefined) {
            builder = builder.eq(k, v);
          }
        }
        const { data, error } = await builder;
        if (!error && Array.isArray(data)) {
          return data as T[];
        }
      } catch (err: any) {
        // Fallback to local store
      }
    }
    return this.localStore.find(query);
  }

  async findOne(query: Partial<T> = {}): Promise<T | null> {
    if (this.supabase) {
      try {
        let builder = this.supabase.from(this.tableName).select('*');
        for (const [k, v] of Object.entries(query)) {
          if (v !== undefined) {
            builder = builder.eq(k, v);
          }
        }
        const { data, error } = await builder.limit(1);
        if (!error && data && data.length > 0) {
          return data[0] as T;
        }
      } catch (err: any) {
        // Fallback to local store
      }
    }
    return this.localStore.findOne(query);
  }

  async findById(id: string): Promise<T | null> {
    if (this.supabase) {
      try {
        const uuid = ensureUUID(id);
        const { data, error } = await this.supabase
          .from(this.tableName)
          .select('*')
          .eq('id', uuid)
          .maybeSingle();
        if (!error && data) {
          return data as T;
        }
      } catch (err: any) {
        // Fallback to local store
      }
    }
    return this.localStore.findById(id);
  }

  async create(
    data: Omit<T, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    }
  ): Promise<T> {
    const validId = ensureUUID(data.id);
    const normalized: Record<string, any> = {
      ...data,
      id: validId,
      created_at: (data as any).created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (normalized.user_id) {
      normalized.user_id = ensureUUID(normalized.user_id);
    }
    if (normalized.file_id) {
      normalized.file_id = ensureUUID(normalized.file_id);
    }
    if (normalized.conversation_id) {
      normalized.conversation_id = ensureUUID(normalized.conversation_id);
    }
    if (normalized.message_id) {
      normalized.message_id = ensureUUID(normalized.message_id);
    }

    // Insert into Supabase SQL
    if (this.supabase) {
      try {
        const { data: inserted, error } = await this.supabase
          .from(this.tableName)
          .insert(normalized)
          .select()
          .single();
        if (!error && inserted) {
          await this.localStore.create(inserted as any);
          return inserted as T;
        }
      } catch (err: any) {
        // Fallback to local store write
      }
    }

    return this.localStore.create(normalized as any);
  }

  async updateById(id: string, updates: Partial<T>): Promise<T | null> {
    const validId = ensureUUID(id);
    if (this.supabase) {
      try {
        const payload: Record<string, any> = {
          ...updates,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase
          .from(this.tableName)
          .update(payload)
          .eq('id', validId)
          .select()
          .maybeSingle();
        if (!error && data) {
          await this.localStore.updateById(validId, updates);
          return data as T;
        }
      } catch (err: any) {
        // Fallback to local store update
      }
    }
    return this.localStore.updateById(validId, updates);
  }

  async deleteById(id: string): Promise<boolean> {
    const validId = ensureUUID(id);
    if (this.supabase) {
      try {
        await this.supabase.from(this.tableName).delete().eq('id', validId);
      } catch (err: any) {}
    }
    return this.localStore.deleteById(validId);
  }

  async deleteMany(query: Partial<T> = {}): Promise<number> {
    if (this.supabase) {
      try {
        let builder = this.supabase.from(this.tableName).delete();
        for (const [k, v] of Object.entries(query)) {
          if (v !== undefined) {
            builder = builder.eq(k, v);
          }
        }
        await builder;
      } catch (err: any) {}
    }
    return this.localStore.deleteMany(query);
  }

  async count(query: Partial<T> = {}): Promise<number> {
    if (this.supabase) {
      try {
        let builder = this.supabase.from(this.tableName).select('*', { count: 'exact', head: true });
        for (const [k, v] of Object.entries(query)) {
          if (v !== undefined) {
            builder = builder.eq(k, v);
          }
        }
        const { count, error } = await builder;
        if (!error && typeof count === 'number') {
          return count;
        }
      } catch (err: any) {}
    }
    return this.localStore.count(query);
  }
}

// Initialize Supabase Client for SQL backend
let supabaseClient: SupabaseClient | null = null;
if (config.supabaseUrl && config.supabaseServiceRoleKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err: any) {
    console.warn('Supabase initialization warning:', err.message);
  }
}

const dataStorePath = path.join(config.dataDir, 'nexusmind.json');

const localUsers = new PersistentStore<User>('users', dataStorePath);
const localFiles = new PersistentStore<FileRecord>('files', dataStorePath);
const localExtractedContents = new PersistentStore<ExtractedContent>('extractedContents', dataStorePath);
const localConversations = new PersistentStore<Conversation>('conversations', dataStorePath);
const localMessages = new PersistentStore<Message>('messages', dataStorePath);
const localMessageSources = new PersistentStore<MessageSource>('messageSources', dataStorePath);
const localGeneratedContent = new PersistentStore<GeneratedContent>('generatedContent', dataStorePath);

export const db = {
  users: new SqlTable<User>('users', localUsers, supabaseClient),
  files: new SqlTable<FileRecord>('files', localFiles, supabaseClient),
  extractedContents: new SqlTable<ExtractedContent>('extracted_contents', localExtractedContents, supabaseClient),
  conversations: new SqlTable<Conversation>('conversations', localConversations, supabaseClient),
  messages: new SqlTable<Message>('messages', localMessages, supabaseClient),
  messageSources: new SqlTable<MessageSource>('message_sources', localMessageSources, supabaseClient),
  generatedContent: new SqlTable<GeneratedContent>('generated_content', localGeneratedContent, supabaseClient),
};

export async function initDatabase(): Promise<void> {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }

  console.log('Database and storage directories initialized.');

  // Verify and sync with Supabase PostgreSQL SQL database
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('users').select('id').limit(1);
      if (!error) {
        console.log('✅ Connected to Supabase PostgreSQL SQL database successfully.');

        // Synchronize local files and extracted contents to Supabase if not already present
        const localAllUsers = localUsers.readAll();
        if (localAllUsers.length > 0) {
          const userPayload = localAllUsers.map((u) => ({
            id: ensureUUID(u.id),
            full_name: u.full_name,
            email: u.email,
            password_hash: u.password_hash,
            created_at: u.created_at,
            updated_at: u.updated_at,
          }));
          await supabaseClient.from('users').upsert(userPayload);
        }

        const localAllFiles = localFiles.readAll();
        if (localAllFiles.length > 0) {
          const filePayload = localAllFiles.map((f) => ({
            id: ensureUUID(f.id),
            user_id: ensureUUID(f.user_id),
            original_name: f.original_name,
            storage_path: f.storage_path,
            mime_type: f.mime_type,
            file_extension: f.file_extension,
            file_size: f.file_size,
            modality: f.modality,
            processing_status: f.processing_status,
            processing_error: f.processing_error || null,
            created_at: f.created_at,
            updated_at: f.updated_at,
          }));
          await supabaseClient.from('files').upsert(filePayload);
        }

        const localAllChunks = localExtractedContents.readAll();
        if (localAllChunks.length > 0) {
          const chunkPayload = localAllChunks.map((c) => ({
            id: ensureUUID(c.id),
            file_id: ensureUUID(c.file_id),
            user_id: ensureUUID(c.user_id),
            content_type: c.content_type,
            extracted_text: c.extracted_text,
            page_number: c.page_number || null,
            start_timestamp: c.start_timestamp || null,
            end_timestamp: c.end_timestamp || null,
            metadata: c.metadata || {},
            created_at: c.created_at,
          }));
          // Batch in groups of 50
          for (let i = 0; i < chunkPayload.length; i += 50) {
            await supabaseClient.from('extracted_contents').upsert(chunkPayload.slice(i, i + 50));
          }
        }

        console.log(`✅ Synchronized ${localAllFiles.length} files & ${localAllChunks.length} content chunks to Supabase SQL.`);
      } else {
        console.warn('Supabase SQL check notice:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase SQL connection notice:', err.message);
    }
  }
}
