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
    // 1. Gather all accessible files for this user: user-uploaded + workspace demo/shared files
    const userFiles = await db.files.find({ user_id: userId, processing_status: 'Processed' });
    const demoFiles = await db.files.find({ user_id: 'usr_demo_evaluator', processing_status: 'Processed' });
    const sharedFiles1 = await db.files.find({ user_id: '00000000-0000-4000-a000-000000000001', processing_status: 'Processed' });

    const allFilesMap = new Map<string, FileRecord>();
    userFiles.forEach((f) => allFilesMap.set(f.id, f));
    demoFiles.forEach((f) => {
      if (!allFilesMap.has(f.id)) allFilesMap.set(f.id, f);
    });
    sharedFiles1.forEach((f) => {
      if (!allFilesMap.has(f.id)) allFilesMap.set(f.id, f);
    });

    // Also if targetFileIds contains files not in the map, load them directly by id
    if (targetFileIds.length > 0) {
      for (const fId of targetFileIds) {
        if (!allFilesMap.has(fId)) {
          const directFile = await db.files.findById(fId);
          if (directFile) {
            allFilesMap.set(directFile.id, directFile);
          }
        }
      }
    }

    if (allFilesMap.size === 0) return [];

    // 2. Determine target files
    let targetFiles: FileRecord[] = [];
    if (targetFileIds.length > 0) {
      targetFiles = targetFileIds
        .map((id) => allFilesMap.get(id))
        .filter((f): f is FileRecord => f !== undefined);
    }
    if (targetFiles.length === 0) {
      // If user has uploaded files, prioritize them; else use all accessible files
      targetFiles = userFiles.length > 0 ? userFiles : Array.from(allFilesMap.values());
    }

    // 3. Gather extracted contents for all target files
    const allContents: ExtractedContent[] = [];
    for (const file of targetFiles) {
      const contents = await db.extractedContents.find({ file_id: file.id });
      allContents.push(...contents);
    }

    // Fallback: if no contents found for targetFiles, get all contents from accessible files
    if (allContents.length === 0) {
      for (const file of allFilesMap.values()) {
        const contents = await db.extractedContents.find({ file_id: file.id });
        allContents.push(...contents);
      }
    }

    if (allContents.length === 0) return [];

    // 4. Query terms for keyword matching & relevance scoring
    const terms = (query || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    const scored = allContents.map((content) => {
      const file = allFilesMap.get(content.file_id);
      const textLower = (content.extracted_text || '').toLowerCase();

      let matchCount = 0;
      for (const term of terms) {
        if (textLower.includes(term)) {
          matchCount += 1;
        }
      }

      // If specific target files were selected, give them a high baseline score (0.75+)
      // so their content is NEVER filtered out even if filename has no keyword overlap with content
      let score = targetFileIds.length > 0 ? 0.8 : 0.6;
      if (terms.length > 0 && matchCount > 0) {
        score = Math.min(1.0, 0.7 + 0.3 * (matchCount / terms.length));
      }

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
      } else {
        sourceLabel = `Uploaded Material — Section`;
      }

      return {
        file: file || ({ id: content.file_id, original_name: 'Uploaded Material', modality: 'document' } as FileRecord),
        content,
        sourceLabel,
        relevanceScore: parseFloat(score.toFixed(2)),
      };
    });

    // Sort by relevance score descending
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // If multiple target files specified, ensure balanced representation
    if (targetFileIds.length > 1) {
      const perFileTarget = Math.max(1, Math.floor(limit / targetFileIds.length));
      const balanced: RankedSource[] = [];
      const seenIds = new Set<string>();

      for (const fId of targetFileIds) {
        const fileChunks = scored.filter((s) => s.file.id === fId);
        for (const item of fileChunks.slice(0, perFileTarget)) {
          if (!seenIds.has(item.content.id)) {
            seenIds.add(item.content.id);
            balanced.push(item);
          }
        }
      }

      for (const item of scored) {
        if (!seenIds.has(item.content.id) && balanced.length < limit) {
          seenIds.add(item.content.id);
          balanced.push(item);
        }
      }

      return balanced.length > 0 ? balanced : scored.slice(0, limit);
    }

    return scored.slice(0, limit);
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

