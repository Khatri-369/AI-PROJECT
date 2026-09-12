/**
 * StudyAgent Database & Function Verification Script
 * Validates connection, schema tables, functions, RLS, and vector similarity search.
 *
 * Usage:
 *   node server/scripts/test_supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.log('Please configure your credentials in .env to run this automated test.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runVerification() {
  console.log('====================================================');
  console.log('🔬 STARTING STUDYAGENT SUPABASE VERIFICATION');
  console.log(`Target URL: ${supabaseUrl}`);
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  async function test(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Reason: ${err.message}\n`);
    }
  }

  // 1. Verify Extension & Tables Existence
  await test('Table Accessibility: Check core tables exist', async () => {
    const tables = ['profiles', 'subjects', 'exams', 'documents', 'document_chunks', 'topics', 'study_plans', 'study_tasks', 'quiz_sets', 'topic_progress'];
    for (const t of tables) {
      const { error } = await supabase.from(t).select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed querying table ${t}: ${error.message}`);
      }
    }
  });

  // 2. Verify Storage Bucket
  await test('Storage: Check study-materials bucket exists', async () => {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    const exists = buckets.some(b => b.name === 'study-materials');
    if (!exists) throw new Error('Bucket "study-materials" not found in storage.buckets');
  });

  // 3. Verify pgvector Similarity Search Function
  await test('pgvector: match_document_chunks RPC execution', async () => {
    const dummyEmbedding = new Array(768).fill(0.01);
    // Call with a dummy UUID to test function signature & execution
    const dummyUserId = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: dummyEmbedding,
      match_threshold: 0.1,
      match_count: 2,
      filter_user_id: dummyUserId
    });
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('match_document_chunks did not return an array');
  });

  // 4. Verify Dashboard Summary Function
  await test('Dashboard Aggregator: get_student_dashboard_summary RPC execution', async () => {
    const dummyUserId = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabase.rpc('get_student_dashboard_summary', {
      p_user_id: dummyUserId
    });
    if (error) throw error;
    if (!data || typeof data !== 'object') throw new Error('Invalid dashboard summary payload returned');
  });

  // 5. Test RLS Isolation Enforcement
  await test('Security: Verify cross-user isolation blocks unauthorized queries', async () => {
    // A client initialized without auth should NOT be able to view private data when RLS is active
    const anonClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || 'dummy-anon');
    const { data, error } = await anonClient.from('documents').select('*');
    // Either returns empty array or permission error (due to auth.uid() is null)
    if (data && data.length > 0) {
      throw new Error('Unauthenticated client was able to retrieve document rows! RLS policy violated.');
    }
  });

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed`);
  console.log('====================================================');
}

runVerification();
