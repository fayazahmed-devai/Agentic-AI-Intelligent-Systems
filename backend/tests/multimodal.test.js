import test from 'node:test';
import assert from 'node:assert';
import { RetrievalService } from '../dist/services/retrieval/retrievalService.js';
import { GeminiService } from '../dist/services/ai/geminiService.js';
import { db } from '../dist/database/db.js';

test('Retrieval & Grounding: Keyword Search and Source Citation Formatter', async () => {
  // Test search over seeded evaluator demo user
  const demoUser = await db.users.findOne({ email: 'demo@nexusmind.ai' });
  assert.ok(demoUser, 'Demo evaluator user should be seeded in database');

  const evidence = await RetrievalService.searchRelevantEvidence(
    demoUser.id,
    'Newton laws inertia momentum'
  );

  assert.ok(Array.isArray(evidence));
  assert.ok(evidence.length > 0, 'Should find matching evidence chunks for physics keywords');

  // Verify citation formatting
  const first = evidence[0];
  assert.ok(first.sourceLabel.length > 0, 'Source label must not be empty');
  assert.ok(first.relevanceScore >= 0.5, 'Relevance score should be calculated');
});

test('Connected Intelligence Engine: Grounded Response Structure', async () => {
  const demoUser = await db.users.findOne({ email: 'demo@nexusmind.ai' });
  const demoFiles = await db.files.find({ user_id: demoUser.id });

  const sources = await RetrievalService.searchRelevantEvidence(demoUser.id, 'Newtonian dynamics');
  const result = await GeminiService.runConnectedIntelligence({
    topic: 'Newtonian Dynamics',
    sources,
    files: demoFiles,
  });

  assert.ok(result.content.includes('## 1. Overall Explanation'));
  assert.ok(result.content.includes('## 6. Common Concepts Across Modalities'));
  assert.ok(result.content.includes('## 7. Differences or Contradictions Detected'));
  assert.ok(Array.isArray(result.sources));
});

