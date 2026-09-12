-- ==============================================================================
-- STUDYAGENT COMPLETE CONSOLIDATED MIGRATION
-- Run this in Supabase SQL Editor for complete one-click setup.
-- Includes:
--   1. Extensions (pgcrypto, pgvector)
--   2. Normalized tables with UUID PKs & constraints
--   3. Triggers (auto-create profile, auto-update timestamps)
--   4. RLS policies on all tables
--   5. Private Storage Bucket & Storage policies
--   6. Performance B-tree & HNSW Vector Indexes
--   7. match_document_chunks RAG similarity search function
--   8. get_student_dashboard_summary aggregator function
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- Helper: Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------------------------

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    available_hours_per_day NUMERIC(4, 2) DEFAULT 2.00 CHECK (available_hours_per_day > 0 AND available_hours_per_day <= 24),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Trigger: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, available_hours_per_day)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
        2.0
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_subjects_updated_at ON public.subjects;
CREATE TRIGGER trigger_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- EXAMS
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_exams_updated_at ON public.exams;
CREATE TRIGGER trigger_exams_updated_at
    BEFORE UPDATE ON public.exams
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT DEFAULT 'application/pdf',
    processing_status TEXT NOT NULL DEFAULT 'uploaded' 
        CHECK (processing_status IN ('uploaded', 'extracting', 'analyzing', 'ready', 'failed')),
    extracted_text TEXT,
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_documents_updated_at ON public.documents;
CREATE TRIGGER trigger_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- DOCUMENT CHUNKS (RAG Embedding Table - 768 Dimensions)
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

-- TOPICS (Self-referencing hierarchy)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    parent_topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit_name TEXT,
    description TEXT,
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_topics_updated_at ON public.topics;
CREATE TRIGGER trigger_topics_updated_at
    BEFORE UPDATE ON public.topics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- STUDY PLANS
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_available_hours NUMERIC(6, 2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'adapted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_study_plans_updated_at ON public.study_plans;
CREATE TRIGGER trigger_study_plans_updated_at
    BEFORE UPDATE ON public.study_plans
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- STUDY PLAN DAYS
CREATE TABLE IF NOT EXISTS public.study_plan_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    study_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    total_estimated_minutes INTEGER NOT NULL DEFAULT 120,
    completed_minutes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming' 
        CHECK (status IN ('upcoming', 'in-progress', 'completed', 'adaptive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_study_plan_days_updated_at ON public.study_plan_days;
CREATE TRIGGER trigger_study_plan_days_updated_at
    BEFORE UPDATE ON public.study_plan_days
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- STUDY TASKS
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_plan_day_id UUID NOT NULL REFERENCES public.study_plan_days(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL DEFAULT 'reading' 
        CHECK (task_type IN ('reading', 'tutor_session', 'practice_questions', 'quiz', 'revision')),
    estimated_minutes INTEGER NOT NULL DEFAULT 30,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    priority TEXT NOT NULL DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_study_tasks_updated_at ON public.study_tasks;
CREATE TRIGGER trigger_study_tasks_updated_at
    BEFORE UPDATE ON public.study_tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- QUIZ SETS
CREATE TABLE IF NOT EXISTS public.quiz_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Medium' 
        CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    question_count INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_set_id UUID NOT NULL REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'mcq' 
        CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_set_id UUID NOT NULL REFERENCES public.quiz_sets(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QUIZ ANSWERS
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    evaluation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TOPIC PROGRESS
CREATE TABLE IF NOT EXISTS public.topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    mastery_score INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 100),
    quiz_attempt_count INTEGER NOT NULL DEFAULT 0,
    average_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'not_started' 
        CHECK (status IN ('not_started', 'learning', 'needs_revision', 'mastered')),
    last_studied_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_topic UNIQUE (user_id, topic_id)
);

DROP TRIGGER IF EXISTS trigger_topic_progress_updated_at ON public.topic_progress;
CREATE TRIGGER trigger_topic_progress_updated_at
    BEFORE UPDATE ON public.topic_progress
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- REVISION HISTORY
CREATE TABLE IF NOT EXISTS public.revision_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    revision_type TEXT NOT NULL,
    previous_mastery INTEGER,
    new_mastery INTEGER,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADAPTIVE PLAN UPDATES
CREATE TABLE IF NOT EXISTS public.adaptive_plan_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    study_plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL,
    trigger_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER trigger_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MESSAGE SOURCES
CREATE TABLE IF NOT EXISTS public.message_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.ai_messages(id) ON DELETE CASCADE,
    document_chunk_id UUID NOT NULL REFERENCES public.document_chunks(id) ON DELETE CASCADE,
    similarity_score NUMERIC(5, 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'alert', 'adaptation', 'milestone', 'quiz')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES (B-TREE & HNSW)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_subject_id ON public.documents(subject_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_user_id ON public.document_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_subject_id ON public.document_chunks(subject_id);

CREATE INDEX IF NOT EXISTS idx_topics_user_id ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON public.topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent_topic_id ON public.topics(parent_topic_id);

CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_days_study_plan_id ON public.study_plan_days(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_day_id ON public.study_tasks(study_plan_day_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_user_id ON public.study_tasks(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_sets_user_id ON public.quiz_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_set_id ON public.quiz_questions(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON public.quiz_answers(attempt_id);

CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON public.topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_topic_id ON public.topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- HNSW Vector index
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw
ON public.document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_plan_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_user_policy" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Direct User Tables
CREATE POLICY "subjects_user_policy" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "exams_user_policy" ON public.exams FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "documents_user_policy" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "document_chunks_user_policy" ON public.document_chunks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "topics_user_policy" ON public.topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "study_plans_user_policy" ON public.study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "study_tasks_user_policy" ON public.study_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "quiz_sets_user_policy" ON public.quiz_sets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_user_policy" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "topic_progress_user_policy" ON public.topic_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "revision_history_user_policy" ON public.revision_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "adaptive_plan_updates_user_policy" ON public.adaptive_plan_updates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ai_conversations_user_policy" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ai_messages_user_policy" ON public.ai_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_user_policy" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Child Tables with Parent-Scoped RLS
CREATE POLICY "study_plan_days_user_policy" ON public.study_plan_days FOR ALL
USING (EXISTS (SELECT 1 FROM public.study_plans sp WHERE sp.id = study_plan_days.study_plan_id AND sp.user_id = auth.uid()));

CREATE POLICY "quiz_questions_user_policy" ON public.quiz_questions FOR ALL
USING (EXISTS (SELECT 1 FROM public.quiz_sets qs WHERE qs.id = quiz_questions.quiz_set_id AND qs.user_id = auth.uid()));

CREATE POLICY "quiz_answers_user_policy" ON public.quiz_answers FOR ALL
USING (EXISTS (SELECT 1 FROM public.quiz_attempts qa WHERE qa.id = quiz_answers.attempt_id AND qa.user_id = auth.uid()));

CREATE POLICY "message_sources_user_policy" ON public.message_sources FOR ALL
USING (EXISTS (SELECT 1 FROM public.ai_messages am WHERE am.id = message_sources.message_id AND am.user_id = auth.uid()));

-- ------------------------------------------------------------------------------
-- 5. STORAGE CONFIGURATION
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'study-materials',
    'study-materials',
    FALSE,
    52428800,
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO UPDATE SET public = FALSE;

DROP POLICY IF EXISTS "storage_user_policy_insert" ON storage.objects;
CREATE POLICY "storage_user_policy_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "storage_user_policy_select" ON storage.objects;
CREATE POLICY "storage_user_policy_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "storage_user_policy_update" ON storage.objects;
CREATE POLICY "storage_user_policy_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "storage_user_policy_delete" ON storage.objects;
CREATE POLICY "storage_user_policy_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ------------------------------------------------------------------------------
-- 6. FUNCTIONS (RAG Vector Search & Dashboard Aggregator)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_document_chunks(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5,
    filter_user_id uuid DEFAULT NULL,
    filter_subject_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    chunk_index INTEGER,
    content TEXT,
    page_number INTEGER,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    effective_user_id UUID;
BEGIN
    effective_user_id := COALESCE(auth.uid(), filter_user_id);
    IF effective_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User identification required for vector search.';
    END IF;

    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        dc.page_number,
        dc.metadata,
        (1 - (dc.embedding <=> query_embedding))::FLOAT AS similarity
    FROM public.document_chunks dc
    WHERE dc.user_id = effective_user_id
      AND (filter_subject_id IS NULL OR dc.subject_id = filter_subject_id)
      AND (1 - (dc.embedding <=> query_embedding)) >= match_threshold
    ORDER BY dc.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_document_chunks TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_student_dashboard_summary(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    effective_user_id UUID;
    v_exam JSONB;
    v_stats JSONB;
    v_tasks JSONB;
    v_subjects JSONB;
    v_recent_quiz JSONB;
    v_notifications JSONB;
BEGIN
    effective_user_id := COALESCE(auth.uid(), p_user_id);
    IF effective_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User ID required.';
    END IF;

    SELECT jsonb_build_object(
        'id', e.id,
        'subject', s.name,
        'name', e.name,
        'date', to_char(e.exam_date, 'DD Mon YYYY'),
        'daysLeft', GREATEST(0, (e.exam_date - CURRENT_DATE)),
        'status', CASE WHEN (e.exam_date - CURRENT_DATE) < 7 THEN 'Urgent' ELSE 'On Track' END
    ) INTO v_exam
    FROM public.exams e
    JOIN public.subjects s ON s.id = e.subject_id
    WHERE e.user_id = effective_user_id AND e.exam_date >= CURRENT_DATE
    ORDER BY e.exam_date ASC
    LIMIT 1;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', st.id,
            'text', st.title,
            'completed', st.is_completed,
            'subject', s.name,
            'estMinutes', st.estimated_minutes,
            'priority', st.priority,
            'taskType', st.task_type
        ) ORDER BY st.is_completed ASC, st.created_at ASC
    ), '[]'::jsonb) INTO v_tasks
    FROM public.study_tasks st
    JOIN public.subjects s ON s.id = st.subject_id
    JOIN public.study_plan_days spd ON spd.id = st.study_plan_day_id
    WHERE st.user_id = effective_user_id
      AND spd.study_date = CURRENT_DATE;

    SELECT jsonb_build_object(
        'overallProgress', COALESCE(ROUND(AVG(tp.mastery_score)), 0),
        'quizzesTaken', (SELECT COUNT(*) FROM public.quiz_attempts WHERE user_id = effective_user_id),
        'averageScore', COALESCE((SELECT ROUND(AVG(percentage)) || '%' FROM public.quiz_attempts WHERE user_id = effective_user_id), '0%'),
        'weakTopicCount', (SELECT COUNT(*) FROM public.topic_progress WHERE user_id = effective_user_id AND status = 'needs_revision'),
        'unitsCompleted', (SELECT COUNT(*) FROM public.topics WHERE user_id = effective_user_id AND parent_topic_id IS NULL) || ' Units'
    ) INTO v_stats
    FROM public.topic_progress tp
    WHERE tp.user_id = effective_user_id;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'color', s.color,
            'progress', COALESCE(
                (SELECT ROUND(AVG(tp.mastery_score)) 
                 FROM public.topics t 
                 JOIN public.topic_progress tp ON tp.topic_id = t.id 
                 WHERE t.subject_id = s.id AND tp.user_id = effective_user_id), 
                0
            )
        )
    ), '[]'::jsonb) INTO v_subjects
    FROM public.subjects s
    WHERE s.user_id = effective_user_id;

    SELECT jsonb_build_object(
        'id', qa.id,
        'title', qs.title,
        'date', to_char(qa.completed_at, 'DD Mon YYYY, HH12:MI AM'),
        'score', qa.percentage,
        'totalQuestions', qa.total_questions,
        'correctQuestions', qa.correct_answers,
        'weakAreas', (
            SELECT COALESCE(jsonb_agg(t.name), '[]'::jsonb)
            FROM public.quiz_answers ans
            JOIN public.topics t ON t.id = ans.topic_id
            WHERE ans.attempt_id = qa.id AND ans.is_correct = FALSE
        )
    ) INTO v_recent_quiz
    FROM public.quiz_attempts qa
    JOIN public.quiz_sets qs ON qs.id = qa.quiz_set_id
    WHERE qa.user_id = effective_user_id
    ORDER BY qa.completed_at DESC
    LIMIT 1;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', n.id,
            'type', n.type,
            'title', n.title,
            'message', n.message,
            'isRead', n.is_read,
            'createdAt', to_char(n.created_at, 'DD Mon, HH12:MI AM')
        ) ORDER BY n.created_at DESC
    ), '[]'::jsonb) INTO v_notifications
    FROM public.notifications n
    WHERE n.user_id = effective_user_id
    LIMIT 10;

    RETURN jsonb_build_object(
        'exam', COALESCE(v_exam, '{}'::jsonb),
        'stats', COALESCE(v_stats, '{}'::jsonb),
        'tasks', COALESCE(v_tasks, '[]'::jsonb),
        'subjects', COALESCE(v_subjects, '[]'::jsonb),
        'recentQuiz', COALESCE(v_recent_quiz, '{}'::jsonb),
        'notifications', COALESCE(v_notifications, '[]'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_dashboard_summary TO authenticated, service_role;
