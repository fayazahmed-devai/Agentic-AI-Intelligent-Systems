import { db } from '../../database/db.js';
import { ExtractedContent, FileRecord } from '../../types/index.js';

export interface RankedSource {
  file: FileRecord;
  content: ExtractedContent;
  sourceLabel: string;
  relevanceScore: number;
}

export const RetrievalService = {
  async searchRelevantEvidence(
    userId: string,
    query: string,
    targetFileIds: string[] = [],
    limit = 6
  ): Promise<RankedSource[]> {
    const userFiles = await db.files.find({ user_id: userId, processing_status: 'Processed' });
    if (userFiles.length === 0) return [];

    const fileMap = new Map<string, FileRecord>();
    userFiles.forEach((f) => fileMap.set(f.id, f));

    // Get all extracted contents for user
    let allContents = await db.extractedContents.find({ user_id: userId });

    // Filter by specific file IDs if supplied
    if (targetFileIds.length > 0) {
      allContents = allContents.filter((c) => targetFileIds.includes(c.file_id));
    }

    if (allContents.length === 0) return [];

    // Query terms for keyword matching & relevance scoring
    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    const scored = allContents.map((content) => {
      const file = fileMap.get(content.file_id);
      const textLower = (content.extracted_text || '').toLowerCase();

      let matchCount = 0;
      for (const term of terms) {
        if (textLower.includes(term)) {
          matchCount += 1;
        }
      }

      // Relevance score between 0.5 and 1.0
      const score = terms.length > 0 ? 0.5 + 0.5 * (matchCount / terms.length) : 0.7;

      let sourceLabel = '';
      if (file) {
        if (content.page_number) {
          sourceLabel = `${file.original_name} — Page ${content.page_number}`;
        } else if (content.start_timestamp) {
          sourceLabel = `${file.original_name} — Timestamp around ${content.start_timestamp}`;
        } else if (file.modality === 'image') {
          sourceLabel = `${file.original_name} — Image analysis`;
        } else if (file.modality === 'video') {
          sourceLabel = `${file.original_name} — Video frame`;
        } else {
          sourceLabel = `${file.original_name} — Extracted section`;
        }
      }

      return {
        file: file!,
        content,
        sourceLabel,
        relevanceScore: parseFloat(score.toFixed(2)),
      };
    });

    // Sort by relevance score descending
    const filtered = scored.filter((item) => item.file !== undefined);
    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // If multiple target files are specified, ensure balanced representation across all selected files
    if (targetFileIds.length > 1) {
      const perFileTarget = Math.max(2, Math.floor(limit / targetFileIds.length));
      const balanced: RankedSource[] = [];
      const seenIds = new Set<string>();

      for (const fId of targetFileIds) {
        const fileChunks = filtered.filter((s) => s.file.id === fId);
        for (const item of fileChunks.slice(0, perFileTarget)) {
          if (!seenIds.has(item.content.id)) {
            seenIds.add(item.content.id);
            balanced.push(item);
          }
        }
      }

      for (const item of filtered) {
        if (!seenIds.has(item.content.id) && balanced.length < limit) {
          seenIds.add(item.content.id);
          balanced.push(item);
        }
      }

      return balanced;
    }

    return filtered.slice(0, limit);
  },

  async globalSearch(userId: string, query: string, limit = 20) {
    const evidence = await this.searchRelevantEvidence(userId, query, [], limit);
    return evidence.map((e) => ({
      fileId: e.file.id,
      fileName: e.file.original_name,
      modality: e.file.modality,
      snippet:
        e.content.extracted_text.slice(0, 240) +
        (e.content.extracted_text.length > 240 ? '...' : ''),
      pageNumber: e.content.page_number || null,
      timestamp: e.content.start_timestamp || null,
      sourceLabel: e.sourceLabel,
      score: e.relevanceScore,
    }));
  },
};

