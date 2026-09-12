import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

/**
 * POST /api/documents
 * Create document record after uploading file to Supabase Storage
 */
router.post('/documents', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;
    const { subjectId, fileName, filePath, fileSize, mimeType } = req.body;

    if (!subjectId || !fileName || !filePath) {
      return res.status(400).json({ error: 'Missing required document fields (subjectId, fileName, filePath)' });
    }

    const { data: document, error } = await client
      .from('documents')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize || 0,
        mime_type: mimeType || 'application/pdf',
        processing_status: 'uploaded'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ document });
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).json({ error: 'Failed to create document record' });
  }
});

/**
 * POST /api/documents/:id/chunk-and-embed
 * Simulates / triggers the text chunking and vector embedding pipeline.
 * Inserts rows into document_chunks with 768-dimension vectors.
 */
router.post('/documents/:id/chunk-and-embed', async (req, res) => {
  try {
    const { id: documentId } = req.params;
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;
    const { chunks = [] } = req.body; // Array of { content, pageNumber, embedding }

    // Update document status to extracting -> analyzing
    await client
      .from('documents')
      .update({ processing_status: 'analyzing' })
      .eq('id', documentId);

    // Fetch document to ensure subject_id is known
    const { data: doc, error: docError } = await client
      .from('documents')
      .select('subject_id')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Default sample chunks if not provided in payload
    const finalChunks = chunks.length > 0 ? chunks : [
      {
        content: "A Deterministic Finite Automaton (DFA) is formally defined by a 5-tuple (Q, Sigma, delta, q0, F). For every state and symbol there is exactly one transition.",
        pageNumber: 1,
        embedding: new Array(768).fill(0).map((_, i) => Math.sin(i + 1) * 0.05)
      },
      {
        content: "Pumping Lemma for Regular Languages: Let L be a regular language. Then there exists a constant p such that any string w in L with length >= p can be split into w = xyz.",
        pageNumber: 14,
        embedding: new Array(768).fill(0).map((_, i) => Math.cos(i + 1) * 0.05)
      }
    ];

    const rowsToInsert = finalChunks.map((chunk, idx) => ({
      document_id: documentId,
      user_id: userId,
      subject_id: doc.subject_id,
      chunk_index: idx + 1,
      content: chunk.content,
      page_number: chunk.pageNumber || 1,
      metadata: { source: 'StudyAgent Parser', generated_at: new Date().toISOString() },
      embedding: chunk.embedding // VECTOR(768)
    }));

    const { error: insertError } = await supabaseAdmin
      .from('document_chunks')
      .insert(rowsToInsert);

    if (insertError) throw insertError;

    // Mark document as ready
    await client
      .from('documents')
      .update({ processing_status: 'ready' })
      .eq('id', documentId);

    res.json({
      message: 'Document successfully chunked and embeddings indexed',
      chunksIndexed: rowsToInsert.length
    });
  } catch (err) {
    console.error('Error chunking document:', err);
    res.status(500).json({ error: 'Failed to index document chunks' });
  }
});

/**
 * POST /api/rag/search
 * Vector similarity search using pgvector match_document_chunks RPC.
 * Strict user isolation enforced.
 */
router.post('/search', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;
    const { queryEmbedding, matchThreshold = 0.3, matchCount = 5, subjectId } = req.body;

    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      return res.status(400).json({ error: 'Query embedding array (768 dimensions) is required' });
    }

    const { data: chunks, error } = await client.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_user_id: userId,
      filter_subject_id: subjectId || null
    });

    if (error) throw error;
    res.json({ results: chunks || [] });
  } catch (err) {
    console.error('Error in vector similarity search:', err);
    res.status(500).json({ error: 'Vector search failed' });
  }
});

export default router;
