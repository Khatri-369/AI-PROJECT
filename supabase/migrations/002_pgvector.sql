-- ==============================================================================
-- MIGRATION 002: Enable pgvector and Document Chunks Schema
-- ==============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ------------------------------------------------------------------------------
-- 2. DOCUMENT CHUNKS (Core RAG Table)
--
-- EMBEDDING DIMENSION NOTE:
-- Set to vector(768) to match:
--   1) Google Gemini text-embedding-004 (native 768-dim)
--   2) OpenAI text-embedding-3-small configured with { dimensions: 768 }
--   3) Frontend UI ingestion pipeline in UploadModal.jsx ("Generating 768-dim embeddings")
--
-- If you use OpenAI text-embedding-3-small at default full precision without reduction,
-- change to: embedding VECTOR(1536)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. MESSAGE SOURCES (Citations linking AI messages to document chunks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.ai_messages(id) ON DELETE CASCADE,
    document_chunk_id UUID NOT NULL REFERENCES public.document_chunks(id) ON DELETE CASCADE,
    similarity_score NUMERIC(5, 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. HNSW VECTOR INDEX
-- HNSW (Hierarchical Navigable Small World) provides superior query throughput
-- and high recall for cosine distance similarity searches.
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw
ON public.document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
