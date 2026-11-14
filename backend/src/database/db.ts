import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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

class PersistentStore<T extends { id: string; user_id?: string; created_at?: string; updated_at?: string }> {
  private name: string;
  private filePath: string;

  constructor(name: string, filePath: string) {
    this.name = name;
    this.filePath = filePath;
  }

  private readAll(): T[] {
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

  private writeAll(items: T[]): void {
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
      id: data.id || uuidv4(),
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

const dataStorePath = path.join(config.dataDir, 'nexusmind.json');

export const db = {
  users: new PersistentStore<User>('users', dataStorePath),
  files: new PersistentStore<FileRecord>('files', dataStorePath),
  extractedContents: new PersistentStore<ExtractedContent>('extractedContents', dataStorePath),
  conversations: new PersistentStore<Conversation>('conversations', dataStorePath),
  messages: new PersistentStore<Message>('messages', dataStorePath),
  messageSources: new PersistentStore<MessageSource>('messageSources', dataStorePath),
  generatedContent: new PersistentStore<GeneratedContent>('generatedContent', dataStorePath),
};

export async function initDatabase(): Promise<void> {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }
  console.log('Database and storage directories initialized.');
}
