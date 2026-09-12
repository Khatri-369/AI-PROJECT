-- ==============================================================================
-- MIGRATION 003: Row Level Security (RLS) Policies
-- Enforces strict user isolation across all tables. No cross-tenant access.
-- ==============================================================================

-- 1. Enable RLS on all tables
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

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- SUBJECTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own subjects" 
    ON public.subjects FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subjects" 
    ON public.subjects FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects" 
    ON public.subjects FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects" 
    ON public.subjects FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- EXAMS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own exams" 
    ON public.exams FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exams" 
    ON public.exams FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams" 
    ON public.exams FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exams" 
    ON public.exams FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own documents" 
    ON public.documents FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" 
    ON public.documents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" 
    ON public.documents FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" 
    ON public.documents FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- DOCUMENT CHUNKS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own document chunks" 
    ON public.document_chunks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document chunks" 
    ON public.document_chunks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document chunks" 
    ON public.document_chunks FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own document chunks" 
    ON public.document_chunks FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- TOPICS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own topics" 
    ON public.topics FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own topics" 
    ON public.topics FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topics" 
    ON public.topics FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topics" 
    ON public.topics FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- STUDY PLANS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own study plans" 
    ON public.study_plans FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study plans" 
    ON public.study_plans FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study plans" 
    ON public.study_plans FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study plans" 
    ON public.study_plans FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- STUDY PLAN DAYS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own study plan days" 
    ON public.study_plan_days FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.study_plans sp 
            WHERE sp.id = study_plan_days.study_plan_id 
              AND sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own study plan days" 
    ON public.study_plan_days FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.study_plans sp 
            WHERE sp.id = study_plan_days.study_plan_id 
              AND sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own study plan days" 
    ON public.study_plan_days FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.study_plans sp 
            WHERE sp.id = study_plan_days.study_plan_id 
              AND sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own study plan days" 
    ON public.study_plan_days FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.study_plans sp 
            WHERE sp.id = study_plan_days.study_plan_id 
              AND sp.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- STUDY TASKS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own study tasks" 
    ON public.study_tasks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study tasks" 
    ON public.study_tasks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study tasks" 
    ON public.study_tasks FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study tasks" 
    ON public.study_tasks FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- QUIZ SETS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own quiz sets" 
    ON public.quiz_sets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz sets" 
    ON public.quiz_sets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz sets" 
    ON public.quiz_sets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz sets" 
    ON public.quiz_sets FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- QUIZ QUESTIONS POLICIES
-- Accessible to the owner through quiz_sets
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own quiz questions" 
    ON public.quiz_questions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_sets qs 
            WHERE qs.id = quiz_questions.quiz_set_id 
              AND qs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own quiz questions" 
    ON public.quiz_questions FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_sets qs 
            WHERE qs.id = quiz_questions.quiz_set_id 
              AND qs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own quiz questions" 
    ON public.quiz_questions FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_sets qs 
            WHERE qs.id = quiz_questions.quiz_set_id 
              AND qs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own quiz questions" 
    ON public.quiz_questions FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_sets qs 
            WHERE qs.id = quiz_questions.quiz_set_id 
              AND qs.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- QUIZ ATTEMPTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own quiz attempts" 
    ON public.quiz_attempts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz attempts" 
    ON public.quiz_attempts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts" 
    ON public.quiz_attempts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz attempts" 
    ON public.quiz_attempts FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- QUIZ ANSWERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own quiz answers" 
    ON public.quiz_answers FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa 
            WHERE qa.id = quiz_answers.attempt_id 
              AND qa.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own quiz answers" 
    ON public.quiz_answers FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa 
            WHERE qa.id = quiz_answers.attempt_id 
              AND qa.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- TOPIC PROGRESS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own topic progress" 
    ON public.topic_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own topic progress" 
    ON public.topic_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic progress" 
    ON public.topic_progress FOR UPDATE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- REVISION HISTORY POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own revision history" 
    ON public.revision_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own revision history" 
    ON public.revision_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- ADAPTIVE PLAN UPDATES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own adaptive plan updates" 
    ON public.adaptive_plan_updates FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own adaptive plan updates" 
    ON public.adaptive_plan_updates FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- AI CONVERSATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own ai conversations" 
    ON public.ai_conversations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ai conversations" 
    ON public.ai_conversations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai conversations" 
    ON public.ai_conversations FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai conversations" 
    ON public.ai_conversations FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- AI MESSAGES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own ai messages" 
    ON public.ai_messages FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai messages" 
    ON public.ai_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- MESSAGE SOURCES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own message sources" 
    ON public.message_sources FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_messages am 
            WHERE am.id = message_sources.message_id 
              AND am.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own message sources" 
    ON public.message_sources FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_messages am 
            WHERE am.id = message_sources.message_id 
              AND am.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
    ON public.notifications FOR DELETE 
    USING (auth.uid() = user_id);
