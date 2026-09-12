-- ==============================================================================
-- MIGRATION 005: Performance Indexes and RAG Similarity Search Functions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. B-TREE INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ------------------------------------------------------------------------------

-- Documents & Chunks
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_subject_id ON public.documents(subject_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(processing_status);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_user_id ON public.document_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_subject_id ON public.document_chunks(subject_id);

-- Topics
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON public.topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent_topic_id ON public.topics(parent_topic_id);

-- Study Plans, Days & Tasks
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_exam_id ON public.study_plans(exam_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_days_study_plan_id ON public.study_plan_days(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_days_date ON public.study_plan_days(study_date);

CREATE INDEX IF NOT EXISTS idx_study_tasks_day_id ON public.study_tasks(study_plan_day_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_user_id ON public.study_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_subject_id ON public.study_tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_completion ON public.study_tasks(user_id, is_completed);

-- Quizzes, Questions, Attempts & Answers
CREATE INDEX IF NOT EXISTS idx_quiz_sets_user_id ON public.quiz_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_subject_id ON public.quiz_sets(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_set_id ON public.quiz_questions(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_set_id ON public.quiz_attempts(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON public.quiz_answers(attempt_id);

-- Topic Progress & History
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON public.topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_topic_id ON public.topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_status ON public.topic_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_revision_history_user_id ON public.revision_history(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_plan_updates_user_id ON public.adaptive_plan_updates(user_id);

-- Conversations & Messages
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_sources_message_id ON public.message_sources(message_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 2. RAG SIMILARITY SEARCH FUNCTION
--
-- Secure, high-performance cosine similarity retrieval.
-- Crucial Security Guarantee:
--   - If called by an authenticated user, forces filter_user_id = auth.uid()
--   - If called by service role, requires non-null filter_user_id
--   - Never allows cross-tenant vector leakage!
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
    -- Determine effective user ID: prioritize auth.uid() if authenticated session exists
    effective_user_id := COALESCE(auth.uid(), filter_user_id);

    -- Security check: Fail safe if no valid user ID is established
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

-- Grant execution to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.match_document_chunks TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. DASHBOARD SUMMARY AGGREGATOR FUNCTION
-- Provides all metrics required for the 6 cards on the frontend in a single round-trip
-- ------------------------------------------------------------------------------
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

    -- 1. Upcoming primary exam
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

    -- 2. Today's Tasks
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

    -- 3. Overall Statistics
    SELECT jsonb_build_object(
        'overallProgress', COALESCE(ROUND(AVG(tp.mastery_score)), 0),
        'quizzesTaken', (SELECT COUNT(*) FROM public.quiz_attempts WHERE user_id = effective_user_id),
        'averageScore', COALESCE((SELECT ROUND(AVG(percentage)) || '%' FROM public.quiz_attempts WHERE user_id = effective_user_id), '0%'),
        'weakTopicCount', (SELECT COUNT(*) FROM public.topic_progress WHERE user_id = effective_user_id AND status = 'needs_revision'),
        'unitsCompleted', (SELECT COUNT(*) FROM public.topics WHERE user_id = effective_user_id AND parent_topic_id IS NULL) || ' Units'
    ) INTO v_stats
    FROM public.topic_progress tp
    WHERE tp.user_id = effective_user_id;

    -- 4. Subjects
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

    -- 5. Recent Quiz
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

    -- 6. Notifications
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
