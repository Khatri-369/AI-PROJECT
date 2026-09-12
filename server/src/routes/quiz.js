import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

/**
 * POST /api/quiz/generate
 * Generates a new quiz set and questions for a subject / topic
 */
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;
    const { subjectId, topicId, title, difficulty = 'Medium', questions = [] } = req.body;

    if (!subjectId || !title) {
      return res.status(400).json({ error: 'subjectId and title are required' });
    }

    // 1. Insert quiz set
    const { data: quizSet, error: setErr } = await client
      .from('quiz_sets')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        topic_id: topicId || null,
        title,
        difficulty,
        question_count: questions.length || 3
      })
      .select()
      .single();

    if (setErr) throw setErr;

    // 2. Insert questions
    const questionRows = (questions.length > 0 ? questions : [
      {
        question_text: "Can an NFA with epsilon transitions recognize languages not recognized by a DFA?",
        question_type: "mcq",
        options: ["Yes, epsilon transitions add computational power", "No, DFA and NFA have equal expressive power (Regular languages)"],
        correct_answer: "No, DFA and NFA have equal expressive power (Regular languages)",
        explanation: "By subset construction theorem, any NFA can be converted to an equivalent DFA.",
        topic_id: topicId || null
      }
    ]).map(q => ({
      quiz_set_id: quizSet.id,
      topic_id: q.topic_id || topicId || null,
      question_text: q.question_text,
      question_type: q.question_type || 'mcq',
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation || ''
    }));

    const { data: createdQuestions, error: qErr } = await client
      .from('quiz_questions')
      .insert(questionRows)
      .select('id, question_text, question_type, options, topic_id');

    if (qErr) throw qErr;

    res.status(201).json({
      quizSet,
      questions: createdQuestions
    });
  } catch (err) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

/**
 * GET /api/quiz/:id/take
 * Returns quiz questions for taking the test.
 * SECURITY: Omits correct_answer and explanation to prevent student cheating!
 */
router.get('/:id/take', async (req, res) => {
  try {
    const { id: quizSetId } = req.params;
    const client = req.client || supabaseAdmin;

    const { data: quizSet, error: setErr } = await client
      .from('quiz_sets')
      .select('id, title, difficulty, question_count')
      .eq('id', quizSetId)
      .single();

    if (setErr || !quizSet) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Exclude correct_answer from client response
    const { data: questions, error: qErr } = await client
      .from('quiz_questions')
      .select('id, question_text, question_type, options, topic_id')
      .eq('quiz_set_id', quizSetId);

    if (qErr) throw qErr;

    res.json({
      quiz: quizSet,
      questions
    });
  } catch (err) {
    console.error('Error fetching quiz for student:', err);
    res.status(500).json({ error: 'Failed to retrieve quiz questions' });
  }
});

/**
 * POST /api/quiz/:id/submit
 * Evaluates student answers, updates topic progress, and triggers adaptive re-planning if score < 60%
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const { id: quizSetId } = req.params;
    const userId = req.user.id;
    const { answers = [] } = req.body; // Array of { questionId, selectedAnswer }

    // 1. Fetch questions with correct answers from DB (using server admin)
    const { data: dbQuestions, error: qErr } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, correct_answer, explanation, topic_id')
      .eq('quiz_set_id', quizSetId);

    if (qErr || !dbQuestions) {
      return res.status(404).json({ error: 'Quiz questions not found' });
    }

    const questionMap = new Map(dbQuestions.map(q => [q.id, q]));
    let correctCount = 0;
    const evaluatedAnswers = [];
    const weakTopicIds = new Set();

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      const isCorrect = String(ans.selectedAnswer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
      if (isCorrect) {
        correctCount++;
      } else if (q.topic_id) {
        weakTopicIds.add(q.topic_id);
      }

      evaluatedAnswers.push({
        question_id: q.id,
        topic_id: q.topic_id,
        selected_answer: ans.selectedAnswer,
        is_correct: isCorrect,
        evaluation: isCorrect ? 'Correct' : `Incorrect. ${q.explanation || ''}`
      });
    }

    const total = dbQuestions.length || 1;
    const percentage = Math.round((correctCount / total) * 100);

    // 2. Insert quiz attempt
    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_set_id: quizSetId,
        score: percentage,
        total_questions: total,
        correct_answers: correctCount,
        percentage
      })
      .select()
      .single();

    if (attemptErr) throw attemptErr;

    // 3. Insert individual evaluated answers
    if (evaluatedAnswers.length > 0) {
      await supabaseAdmin.from('quiz_answers').insert(
        evaluatedAnswers.map(a => ({
          ...a,
          attempt_id: attempt.id
        }))
      );
    }

    // 4. Update Topic Mastery & Detect Weak Areas
    const weakTopicNames = [];
    for (const topicId of weakTopicIds) {
      // Fetch topic info
      const { data: topic } = await supabaseAdmin
        .from('topics')
        .select('name')
        .eq('id', topicId)
        .single();

      if (topic) weakTopicNames.push(topic.name);

      // Downgrade status if score is low
      const newStatus = percentage < 60 ? 'needs_revision' : 'learning';
      
      await supabaseAdmin
        .from('topic_progress')
        .upsert({
          user_id: userId,
          topic_id: topicId,
          mastery_score: Math.max(20, percentage),
          status: newStatus,
          last_studied_at: new Date().toISOString()
        }, { onConflict: 'user_id,topic_id' });

      // Log to revision history
      await supabaseAdmin.from('revision_history').insert({
        user_id: userId,
        topic_id: topicId,
        revision_type: 'quiz_evaluation',
        new_mastery: Math.max(20, percentage),
        reason: `Quiz performance: ${percentage}%. Flagged for remedial study.`
      });
    }

    // 5. Adaptive Re-planning Trigger (if score < 60%)
    let planAdapted = false;
    if (percentage < 60) {
      // Find active study plan
      const { data: activePlans } = await supabaseAdmin
        .from('study_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1);

      if (activePlans && activePlans.length > 0) {
        const planId = activePlans[0].id;
        
        // Record adaptive intervention
        await supabaseAdmin.from('adaptive_plan_updates').insert({
          user_id: userId,
          study_plan_id: planId,
          trigger_type: 'quiz_performance',
          trigger_data: { score: percentage, weak_topics: weakTopicNames },
          changes: {
            intervention: 'Added remedial revision slots for weak areas',
            weak_topics: weakTopicNames
          }
        });

        // Insert notification
        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          type: 'alert',
          title: `Quiz Evaluated: ${percentage}%`,
          message: `Agent detected conceptual gaps in ${weakTopicNames.join(', ') || 'Unit concepts'}. Adaptive plan updated.`
        });

        planAdapted = true;
      }
    }

    res.json({
      attemptId: attempt.id,
      score: percentage,
      correctCount,
      total,
      weakTopics: weakTopicNames,
      adaptivePlanUpdated: planAdapted
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ error: 'Failed to process quiz submission' });
  }
});

export default router;
