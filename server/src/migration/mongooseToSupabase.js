/**
 * ==============================================================================
 * MONGOOSE TO SUPABASE POSTGRESQL MIGRATION GUIDE & REPLACEMENT LAYER
 * ==============================================================================
 *
 * This guide and code adapter shows how legacy MongoDB/Mongoose document patterns
 * (such as those in Desktop/RELATIONSHIP: Customer, Order, Post, User)
 * are mapped directly into Supabase PostgreSQL tables and @supabase/supabase-js queries.
 *
 * KEY PARADIGM SHIFTS:
 * 1. IDs:
 *    - MongoDB: _id: mongoose.Schema.Types.ObjectId
 *    - Supabase: id UUID DEFAULT gen_random_uuid() PRIMARY KEY
 *
 * 2. Relationships:
 *    - MongoDB "One to Few": Embedded subdocuments (e.g. user.orders = [{ item, price }])
 *    - MongoDB "One to Many (Reference)": Ref ObjectId + .populate()
 *    - Supabase: Foreign Keys (REFERENCES table(id) ON DELETE CASCADE)
 *      Queried using Supabase relational select syntax: .select('*, parent(*)')
 *
 * 3. Security:
 *    - MongoDB: Custom application-level authorization checks in Express controllers
 *    - Supabase: Native Row Level Security (RLS) at the database kernel level (auth.uid() = user_id)
 *
 * 4. Vector Search:
 *    - MongoDB Atlas: Atlas Vector Search (proprietary search index)
 *    - Supabase: Open-source pgvector (vector(768) + HNSW cosine index)
 */

import { supabaseAdmin } from '../supabase.js';

export const StudyAgentDatabaseService = {
  // 1. Create Subject
  // Mongoose: await Subject.create({ userId, name, description, color })
  // Supabase:
  async createSubject(userId, { name, description, color }) {
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .insert({ user_id: userId, name, description, color })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 2. Create Exam
  // Mongoose: await Exam.create({ userId, subjectId, name, examDate })
  // Supabase:
  async createExam(userId, { subjectId, name, examDate }) {
    const { data, error } = await supabaseAdmin
      .from('exams')
      .insert({ user_id: userId, subject_id: subjectId, name, exam_date: examDate })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 3. Upload Document Metadata
  // Mongoose: await Document.create({ userId, subjectId, fileName, filePath, status: 'uploaded' })
  // Supabase:
  async uploadDocumentMetadata(userId, { subjectId, fileName, filePath, fileSize, mimeType }) {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType || 'application/pdf',
        processing_status: 'uploaded'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 4. Store Extracted Text
  async storeExtractedDocument(documentId, extractedText) {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({
        extracted_text: extractedText,
        processing_status: 'analyzing'
      })
      .eq('id', documentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 5. Store Document Chunks & Embeddings
  // Mongoose: await Chunk.insertMany(chunks.map(...))
  // Supabase: pgvector column accepts float array directly into vector(768)
  async storeDocumentChunksWithEmbeddings(documentId, userId, subjectId, chunks) {
    const rows = chunks.map((chunk, index) => ({
      document_id: documentId,
      user_id: userId,
      subject_id: subjectId,
      chunk_index: index + 1,
      content: chunk.content,
      page_number: chunk.pageNumber || 1,
      metadata: chunk.metadata || {},
      embedding: chunk.embedding // array of 768 floats
    }));

    const { data, error } = await supabaseAdmin
      .from('document_chunks')
      .insert(rows)
      .select('id, chunk_index, page_number');
    if (error) throw error;
    return data;
  },

  // 6. Vector Similarity Search
  // Mongoose: Requires Atlas aggregation pipeline with $vectorSearch
  // Supabase: Native PostgreSQL RPC function with HNSW index
  async similaritySearch(userId, queryEmbedding, { matchThreshold = 0.5, matchCount = 5, subjectId = null } = {}) {
    const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_user_id: userId,
      filter_subject_id: subjectId
    });
    if (error) throw error;
    return data;
  },

  // 7. Create Topics (Unit -> Chapter -> Topic -> Subtopic)
  async createTopic(userId, { subjectId, documentId, parentTopicId, name, unitName, description, difficulty, orderIndex }) {
    const { data, error } = await supabaseAdmin
      .from('topics')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        document_id: documentId || null,
        parent_topic_id: parentTopicId || null,
        name,
        unit_name: unitName,
        description,
        difficulty: difficulty || 'Medium',
        order_index: orderIndex || 0
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 8. Create Study Plan & Days
  async createStudyPlan(userId, { examId, startDate, endDate, totalAvailableHours, days = [] }) {
    const { data: plan, error: planError } = await supabaseAdmin
      .from('study_plans')
      .insert({
        user_id: userId,
        exam_id: examId,
        start_date: startDate,
        end_date: endDate,
        total_available_hours: totalAvailableHours,
        status: 'active'
      })
      .select()
      .single();
    if (planError) throw planError;

    if (days.length > 0) {
      const dayRows = days.map((d, idx) => ({
        study_plan_id: plan.id,
        day_number: d.dayNumber || idx + 1,
        study_date: d.studyDate,
        title: d.title,
        description: d.description,
        total_estimated_minutes: d.totalEstimatedMinutes || 120,
        status: d.status || 'upcoming'
      }));
      await supabaseAdmin.from('study_plan_days').insert(dayRows);
    }
    return plan;
  },

  // 9. Create Study Task
  async createStudyTask(userId, { studyPlanDayId, subjectId, topicId, title, description, taskType, estimatedMinutes, priority }) {
    const { data, error } = await supabaseAdmin
      .from('study_tasks')
      .insert({
        study_plan_day_id: studyPlanDayId,
        user_id: userId,
        subject_id: subjectId,
        topic_id: topicId || null,
        title,
        description,
        task_type: taskType || 'reading',
        estimated_minutes: estimatedMinutes || 30,
        priority: priority || 'medium',
        is_completed: false
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 10. Mark Task Complete / Toggle
  async toggleTaskCompletion(userId, taskId, isCompleted) {
    const { data, error } = await supabaseAdmin
      .from('study_tasks')
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 11. Create Quiz Set & Questions
  async createQuiz(userId, { subjectId, topicId, title, difficulty, questions }) {
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quiz_sets')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        topic_id: topicId || null,
        title,
        difficulty: difficulty || 'Medium',
        question_count: questions.length
      })
      .select()
      .single();
    if (quizError) throw quizError;

    const questionRows = questions.map(q => ({
      quiz_set_id: quiz.id,
      topic_id: q.topicId || topicId || null,
      question_text: q.questionText,
      question_type: q.questionType || 'mcq',
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation
    }));

    await supabaseAdmin.from('quiz_questions').insert(questionRows);
    return quiz;
  },

  // 12. Store Quiz Attempt & Answers
  async storeQuizAttempt(userId, quizSetId, { score, totalQuestions, correctAnswers, answers = [] }) {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_set_id: quizSetId,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        percentage
      })
      .select()
      .single();
    if (attemptError) throw attemptError;

    if (answers.length > 0) {
      await supabaseAdmin.from('quiz_answers').insert(
        answers.map(a => ({
          attempt_id: attempt.id,
          question_id: a.questionId,
          topic_id: a.topicId || null,
          selected_answer: a.selectedAnswer,
          is_correct: a.isCorrect,
          evaluation: a.evaluation || (a.isCorrect ? 'Correct' : 'Incorrect')
        }))
      );
    }
    return attempt;
  },

  // 13. Update Topic Mastery & Detect Weak Topics
  async updateTopicMastery(userId, topicId, score) {
    const status = score < 60 ? 'needs_revision' : score >= 85 ? 'mastered' : 'learning';
    const { data, error } = await supabaseAdmin
      .from('topic_progress')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        mastery_score: score,
        status,
        last_studied_at: new Date().toISOString()
      }, { onConflict: 'user_id,topic_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 14. Detect Weak Topics
  async detectWeakTopics(userId) {
    const { data, error } = await supabaseAdmin
      .from('topic_progress')
      .select('mastery_score, status, topics(id, name, unit_name)')
      .eq('user_id', userId)
      .eq('status', 'needs_revision');
    if (error) throw error;
    return data;
  },

  // 15. Store Adaptive Plan Update
  async storeAdaptivePlanUpdate(userId, studyPlanId, { triggerType, triggerData, changes }) {
    const { data, error } = await supabaseAdmin
      .from('adaptive_plan_updates')
      .insert({
        user_id: userId,
        study_plan_id: studyPlanId,
        trigger_type: triggerType,
        trigger_data: triggerData,
        changes
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 16. Fetch Dashboard Statistics
  async fetchDashboardStatistics(userId) {
    const { data, error } = await supabaseAdmin.rpc('get_student_dashboard_summary', {
      p_user_id: userId
    });
    if (error) throw error;
    return data;
  }
};
