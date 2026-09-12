-- ==============================================================================
-- STUDYAGENT DEVELOPMENT SEED SCRIPT (seed.sql)
-- Development / Demo Data for Theory of Computation (TOC) & DBMS
--
-- Instructions:
-- Run this AFTER at least one user has signed up via Supabase Auth.
-- This script attaches realistic course notes, topics, study plans, today's tasks,
-- quizzes, and weak areas to the target user.
-- ==============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_toc_id UUID;
    v_dbms_id UUID;
    v_exam_id UUID;
    v_doc_fa_id UUID;
    v_doc_regex_id UUID;
    v_doc_cfg_id UUID;
    
    -- Topic IDs
    v_unit1_id UUID;
    v_unit2_id UUID;
    v_unit3_id UUID;
    v_unit4_id UUID;
    v_dfa_id UUID;
    v_nfa_id UUID;
    v_regex_id UUID;
    v_pumping_id UUID;
    v_cfg_id UUID;
    v_pda_id UUID;
    v_tm_id UUID;

    -- Plan IDs
    v_plan_id UUID;
    v_day_today_id UUID;

    -- Quiz IDs
    v_quiz_id UUID;
    v_attempt_id UUID;
    v_q1_id UUID;
    v_q2_id UUID;
    v_q3_id UUID;
BEGIN
    -- 1. Grab the first user in auth.users, or exit gracefully if no user exists yet
    SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Please sign up or create a test user first before running seed.sql.';
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding development data for user: %', v_user_id;

    -- 2. Update Profile
    UPDATE public.profiles
    SET full_name = 'Om Khatri',
        available_hours_per_day = 2.5
    WHERE id = v_user_id;

    -- 3. Insert Subjects
    INSERT INTO public.subjects (id, user_id, name, description, color)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Theory of Computation', 'Formal languages, automata theory, computability and complexity', '#3b82f6')
    RETURNING id INTO v_toc_id;

    INSERT INTO public.subjects (id, user_id, name, description, color)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Database Management Systems', 'Relational algebra, SQL, normalization, concurrency control', '#10b981')
    RETURNING id INTO v_dbms_id;

    INSERT INTO public.subjects (user_id, name, description, color)
    VALUES 
        (v_user_id, 'Operating Systems', 'Processes, threads, CPU scheduling, deadlocks, memory management', '#f97316'),
        (v_user_id, 'Computer Networks', 'OSI model, TCP/IP, routing protocols, application protocols', '#8b5cf6'),
        (v_user_id, 'Data Structures & Algorithms', 'Trees, graphs, dynamic programming, asymptotic analysis', '#ec4899');

    -- 4. Insert Primary Exam (Targeting upcoming TOC exam)
    INSERT INTO public.exams (id, user_id, subject_id, name, exam_date)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, 'Theory of Computation End-Sem', CURRENT_DATE + INTERVAL '10 days')
    RETURNING id INTO v_exam_id;

    -- 5. Insert Uploaded Documents
    INSERT INTO public.documents (id, user_id, subject_id, file_name, file_path, file_size, mime_type, processing_status)
    VALUES 
        (gen_random_uuid(), v_user_id, v_toc_id, 'TOC_Unit_1_Finite_Automata.pdf', v_user_id || '/docs/TOC_Unit_1_Finite_Automata.pdf', 2516582, 'application/pdf', 'ready')
    RETURNING id INTO v_doc_fa_id;

    INSERT INTO public.documents (id, user_id, subject_id, file_name, file_path, file_size, mime_type, processing_status)
    VALUES 
        (gen_random_uuid(), v_user_id, v_toc_id, 'TOC_Unit_2_Regular_Expressions.pdf', v_user_id || '/docs/TOC_Unit_2_Regular_Expressions.pdf', 3250585, 'application/pdf', 'ready')
    RETURNING id INTO v_doc_regex_id;

    INSERT INTO public.documents (id, user_id, subject_id, file_name, file_path, file_size, mime_type, processing_status)
    VALUES 
        (gen_random_uuid(), v_user_id, v_toc_id, 'TOC_Unit_3_Context_Free_Grammar.pdf', v_user_id || '/docs/TOC_Unit_3_Context_Free_Grammar.pdf', 4194304, 'application/pdf', 'ready')
    RETURNING id INTO v_doc_cfg_id;

    -- 6. Insert Topics Hierarchy (Unit -> Chapter -> Topic -> Subtopic)
    -- Unit 1
    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_fa_id, NULL, 'Finite Automata', 'Unit 1', 'Foundations of deterministic and non-deterministic machines', 'Medium', 1)
    RETURNING id INTO v_unit1_id;

    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_fa_id, v_unit1_id, 'Deterministic Finite Automata (DFA)', 'Unit 1', 'Transition tables, formal 5-tuple, state minimization', 'Easy', 1)
    RETURNING id INTO v_dfa_id;

    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_fa_id, v_unit1_id, 'Non-Deterministic Finite Automata (NFA)', 'Unit 1', 'Epsilon closures and subset construction algorithm', 'Medium', 2)
    RETURNING id INTO v_nfa_id;

    -- Unit 2
    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_regex_id, NULL, 'Regular Expressions & Languages', 'Unit 2', 'Algebra of regular expressions and non-regularity proofs', 'Hard', 2)
    RETURNING id INTO v_unit2_id;

    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_regex_id, v_unit2_id, 'Regular Expressions & Arden Theorem', 'Unit 2', 'Equivalence between regular expressions and finite automata', 'Medium', 1)
    RETURNING id INTO v_regex_id;

    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_regex_id, v_unit2_id, 'Pumping Lemma for Regular Languages', 'Unit 2', 'Contradiction technique to prove non-regularity of languages', 'Hard', 2)
    RETURNING id INTO v_pumping_id;

    -- Unit 3
    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_cfg_id, NULL, 'Context-Free Grammars & Pushdown Automata', 'Unit 3', 'Grammars, derivation trees, and stack-based automata', 'Hard', 3)
    RETURNING id INTO v_unit3_id;

    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_cfg_id, v_unit3_id, 'Context-Free Grammars (CFG)', 'Unit 3', 'Chomsky Normal Form and Greibach Normal Form', 'Medium', 1)
    RETURNING id INTO v_cfg_id;

    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_doc_cfg_id, v_unit3_id, 'Pushdown Automata (PDA)', 'Unit 3', 'Acceptance by final state vs empty store', 'Hard', 2)
    RETURNING id INTO v_pda_id;

    -- Unit 4
    INSERT INTO public.topics (id, user_id, subject_id, document_id, parent_topic_id, name, unit_name, description, difficulty, order_index)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, NULL, NULL, 'Turing Machines & Computability', 'Unit 4', 'Standard TM model, decidability, Halting problem', 'Hard', 4)
    RETURNING id INTO v_unit4_id;

    -- 7. Insert Study Plan (10-Day Exam Sprint)
    INSERT INTO public.study_plans (id, user_id, exam_id, start_date, end_date, total_available_hours, status)
    VALUES (gen_random_uuid(), v_user_id, v_exam_id, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '6 days', 22.5, 'active')
    RETURNING id INTO v_plan_id;

    -- Study Plan Days
    INSERT INTO public.study_plan_days (study_plan_id, day_number, study_date, title, description, total_estimated_minutes, completed_minutes, status)
    VALUES 
        (v_plan_id, 1, CURRENT_DATE - INTERVAL '3 days', 'Day 1: Unit 1 Foundations', 'DFA, state transition diagrams, alphabet and language definitions', 120, 120, 'completed'),
        (v_plan_id, 2, CURRENT_DATE - INTERVAL '2 days', 'Day 2: NFA & Equivalence', 'NFA design, epsilon-closures, subset construction algorithm', 120, 120, 'completed'),
        (v_plan_id, 3, CURRENT_DATE - INTERVAL '1 days', 'Day 3: Regular Expressions', 'Arden Theorem, converting regex to finite automata', 120, 120, 'completed');

    -- Today (Day 4)
    INSERT INTO public.study_plan_days (id, study_plan_id, day_number, study_date, title, description, total_estimated_minutes, completed_minutes, status)
    VALUES (gen_random_uuid(), v_plan_id, 4, CURRENT_DATE, 'Day 4: Pumping Lemma (Today)', 'Proof of non-regularity, pumping length, game of adversary', 150, 90, 'in-progress')
    RETURNING id INTO v_day_today_id;

    -- Future Days
    INSERT INTO public.study_plan_days (study_plan_id, day_number, study_date, title, description, total_estimated_minutes, completed_minutes, status)
    VALUES 
        (v_plan_id, 5, CURRENT_DATE + INTERVAL '1 days', 'Day 5: Context-Free Grammars', 'Derivation trees, ambiguity in grammars, Chomsky hierarchy', 120, 0, 'upcoming'),
        (v_plan_id, 6, CURRENT_DATE + INTERVAL '2 days', 'Day 6: Pushdown Automata', 'PDA transitions, acceptance by final state vs empty store', 120, 0, 'upcoming'),
        (v_plan_id, 7, CURRENT_DATE + INTERVAL '3 days', 'Day 7: Normal Forms & Parsing', 'Chomsky Normal Form (CNF) & Greibach Normal Form (GNF)', 120, 0, 'upcoming'),
        (v_plan_id, 8, CURRENT_DATE + INTERVAL '4 days', 'Day 8: Turing Machines', 'Standard TM model, tape movements, recursively enumerable languages', 120, 0, 'upcoming'),
        (v_plan_id, 9, CURRENT_DATE + INTERVAL '5 days', 'Day 9: Adaptive Remedial Revision', 'Auto-scheduled by Agent: Heavy revision of Unit 2 weak areas (NFA to DFA, Pumping Lemma)', 150, 0, 'adaptive'),
        (v_plan_id, 10, CURRENT_DATE + INTERVAL '6 days', 'Day 10: Mock Exam & Summary', 'Full-length 50-mark mock exam + formula recap session', 120, 0, 'upcoming');

    -- 8. Insert Today's Tasks
    INSERT INTO public.study_tasks (study_plan_day_id, user_id, subject_id, topic_id, title, description, task_type, estimated_minutes, is_completed, completed_at, priority)
    VALUES 
        (v_day_today_id, v_user_id, v_toc_id, v_regex_id, 'Read Unit 2: Regular Expressions', 'Review algebraic laws & identity expressions', 'reading', 30, TRUE, NOW() - INTERVAL '3 hours', 'high'),
        (v_day_today_id, v_user_id, v_toc_id, v_pumping_id, 'Watch AI Tutor explanation on Pumping Lemma', 'Ask tutor about 3 pumping conditions', 'tutor_session', 20, TRUE, NOW() - INTERVAL '2 hours', 'high'),
        (v_day_today_id, v_user_id, v_toc_id, v_nfa_id, 'Solve 10 practice questions on NFA to DFA', 'Practice subset construction table method', 'practice_questions', 40, TRUE, NOW() - INTERVAL '1 hours', 'medium'),
        (v_day_today_id, v_user_id, v_toc_id, v_pumping_id, 'Take Unit 2 diagnostic quiz', '10-question MCQ quiz on non-regularity', 'quiz', 15, FALSE, NULL, 'high'),
        (v_day_today_id, v_user_id, v_toc_id, v_pumping_id, 'Revise mistakes & Pumping Lemma', 'Address weak areas flagged by quiz evaluator', 'revision', 25, FALSE, NULL, 'urgent');

    -- 9. Insert Topic Progress (Reflecting Weak Areas)
    INSERT INTO public.topic_progress (user_id, topic_id, mastery_score, quiz_attempt_count, average_score, status, last_studied_at)
    VALUES 
        (v_user_id, v_dfa_id, 90, 4, 90.0, 'mastered', NOW() - INTERVAL '2 days'),
        (v_user_id, v_nfa_id, 40, 2, 45.0, 'needs_revision', NOW() - INTERVAL '1 days'),
        (v_user_id, v_regex_id, 55, 3, 58.0, 'learning', NOW() - INTERVAL '5 hours'),
        (v_user_id, v_pumping_id, 35, 2, 35.0, 'needs_revision', NOW() - INTERVAL '2 hours'),
        (v_user_id, v_cfg_id, 75, 1, 75.0, 'learning', NOW() - INTERVAL '4 days'),
        (v_user_id, v_pda_id, 65, 1, 65.0, 'learning', NOW() - INTERVAL '4 days')
    ON CONFLICT (user_id, topic_id) DO UPDATE SET
        mastery_score = EXCLUDED.mastery_score,
        status = EXCLUDED.status;

    -- 10. Insert Quiz Set & Questions
    INSERT INTO public.quiz_sets (id, user_id, subject_id, topic_id, title, difficulty, question_count)
    VALUES (gen_random_uuid(), v_user_id, v_toc_id, v_unit2_id, 'Unit 2: Regular Expressions Diagnostic Quiz', 'Medium', 3)
    RETURNING id INTO v_quiz_id;

    INSERT INTO public.quiz_questions (id, quiz_set_id, topic_id, question_text, question_type, options, correct_answer, explanation)
    VALUES 
        (gen_random_uuid(), v_quiz_id, v_nfa_id, 
         'Can an NFA with epsilon transitions recognize languages not recognized by a DFA?', 
         'mcq', 
         '["Yes, epsilon transitions add computational power", "No, DFA and NFA have equal expressive power (Regular languages)", "Only if the number of states is infinite", "Depends on the alphabet"]'::jsonb, 
         'No, DFA and NFA have equal expressive power (Regular languages)', 
         'By subset construction theorem, any NFA (with or without ε-transitions) can be converted to an equivalent DFA.')
    RETURNING id INTO v_q1_id;

    INSERT INTO public.quiz_questions (id, quiz_set_id, topic_id, question_text, question_type, options, correct_answer, explanation)
    VALUES 
        (gen_random_uuid(), v_quiz_id, v_pumping_id, 
         'What is the Pumping Lemma for regular languages primarily used to prove?', 
         'mcq', 
         '["That a language is regular", "That a language is NOT regular", "That an automaton is minimal", "That a grammar is unambiguous"]'::jsonb, 
         'That a language is NOT regular', 
         'Pumping Lemma is a necessary condition used by contradiction to prove a language is non-regular.')
    RETURNING id INTO v_q2_id;

    INSERT INTO public.quiz_questions (id, quiz_set_id, topic_id, question_text, question_type, options, correct_answer, explanation)
    VALUES 
        (gen_random_uuid(), v_quiz_id, v_regex_id, 
         'Which regular expression represents strings ending with "01" over alphabet {0, 1}?', 
         'mcq', 
         '["(0+1)*01", "0*1*", "(01)*", "01(0+1)*"]'::jsonb, 
         '(0+1)*01', 
         'Any sequence of 0s and 1s followed by the substring 01.')
    RETURNING id INTO v_q3_id;

    -- 11. Insert Quiz Attempt (Score: 45% -> Triggered Adaptive Re-planning)
    INSERT INTO public.quiz_attempts (id, user_id, quiz_set_id, score, total_questions, correct_answers, percentage, started_at, completed_at)
    VALUES (gen_random_uuid(), v_user_id, v_quiz_id, 45, 3, 1, 45.0, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '15 minutes')
    RETURNING id INTO v_attempt_id;

    INSERT INTO public.quiz_answers (attempt_id, question_id, topic_id, selected_answer, is_correct, evaluation)
    VALUES 
        (v_attempt_id, v_q1_id, v_nfa_id, 'Yes, epsilon transitions add computational power', FALSE, 'Incorrect. DFA and NFA accept the exact same family of regular languages.'),
        (v_attempt_id, v_q2_id, v_pumping_id, 'That a language is regular', FALSE, 'Incorrect. Pumping lemma is used by contradiction to show non-regularity.'),
        (v_attempt_id, v_q3_id, v_regex_id, '(0+1)*01', TRUE, 'Correct answer.');

    -- 12. Insert Revision History Record
    INSERT INTO public.revision_history (user_id, topic_id, revision_type, previous_mastery, new_mastery, reason)
    VALUES 
        (v_user_id, v_pumping_id, 'quiz_evaluation_downgrade', 50, 35, 'Missed contradiction reasoning question in Unit 2 Quiz'),
        (v_user_id, v_nfa_id, 'quiz_evaluation_downgrade', 60, 40, 'Incorrect equivalence theorem answer in Unit 2 Quiz');

    -- 13. Insert Adaptive Plan Update (Audit log of agent's intervention)
    INSERT INTO public.adaptive_plan_updates (user_id, study_plan_id, trigger_type, trigger_data, changes)
    VALUES (
        v_user_id, 
        v_plan_id, 
        'quiz_performance', 
        jsonb_build_object('quiz_title', 'Unit 2: Regular Expressions Diagnostic Quiz', 'score', 45, 'weak_areas', jsonb_build_array('Pumping Lemma', 'NFA to DFA')), 
        jsonb_build_object('rescheduled_day', 9, 'added_minutes', 30, 'action', 'Converted Day 9 mock test into targeted remedial revision for Unit 2')
    );

    -- 14. Insert Notifications
    INSERT INTO public.notifications (user_id, type, title, message, is_read, metadata)
    VALUES 
        (v_user_id, 'alert', 'Unit 2 Quiz Evaluated: 45%', 'Agent detected conceptual gaps in NFA to DFA & Pumping Lemma proofs.', FALSE, jsonb_build_object('score', 45)),
        (v_user_id, 'adaptation', 'Study Plan Adapted by AI', 'Extra remedial revision slot allocated for Day 9 based on your quiz performance.', FALSE, jsonb_build_object('day', 9));

    RAISE NOTICE 'StudyAgent development seed completed successfully for user: %', v_user_id;
END $$;
