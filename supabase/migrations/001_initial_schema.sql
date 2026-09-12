-- ==============================================================================
-- MIGRATION 001: Initial Core Schema for StudyAgent
-- Tables: profiles, subjects, exams, documents, topics, study_plans, 
--         study_plan_days, study_tasks, quiz_sets, quiz_questions,
--         quiz_attempts, quiz_answers, topic_progress, revision_history,
--         adaptive_plan_updates, ai_conversations, ai_messages, notifications
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper: Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
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

-- Trigger: Automatically create public.profiles row when auth.users is created
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

-- ------------------------------------------------------------------------------
-- 2. SUBJECTS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. EXAMS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 4. DOCUMENTS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 5. TOPICS (Self-referencing hierarchy: Unit -> Chapter -> Topic -> Subtopic)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. STUDY PLANS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 7. STUDY PLAN DAYS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 8. STUDY TASKS (Powers "Today's Tasks" card)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 9. QUIZ SETS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 10. QUIZ QUESTIONS
-- Note: correct_answer is stored here; protected via RLS / backend proxy
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 11. QUIZ ATTEMPTS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 12. QUIZ ANSWERS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 13. TOPIC PROGRESS (Mastery, weak-topic detection)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 14. REVISION HISTORY
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 15. ADAPTIVE PLAN UPDATES (Audit log of WHY agent restructured plan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.adaptive_plan_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    study_plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL,
    trigger_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. AI CONVERSATIONS & MESSAGES
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 17. NOTIFICATIONS
-- ------------------------------------------------------------------------------
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
