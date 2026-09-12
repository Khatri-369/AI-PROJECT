import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

/**
 * GET /api/dashboard
 * Returns consolidated dashboard payload for the current authenticated user.
 * Invokes get_student_dashboard_summary RPC or falls back to direct queries.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;

    // Try executing consolidated database aggregator RPC
    const { data: summaryRpc, error: rpcError } = await client.rpc(
      'get_student_dashboard_summary',
      { p_user_id: userId }
    );

    if (!rpcError && summaryRpc) {
      return res.json(summaryRpc);
    }

    // Fallback: Direct Supabase queries if RPC is not yet compiled
    // 1. Upcoming exam
    const { data: exams } = await client
      .from('exams')
      .select('id, name, exam_date, subjects(name)')
      .eq('user_id', userId)
      .gte('exam_date', new Date().toISOString().split('T')[0])
      .order('exam_date', { ascending: true })
      .limit(1);

    const examData = exams && exams.length > 0 ? {
      id: exams[0].id,
      subject: exams[0].subjects?.name || 'Theory of Computation',
      name: exams[0].name,
      date: exams[0].exam_date,
      daysLeft: Math.max(0, Math.ceil((new Date(exams[0].exam_date) - new Date()) / (1000 * 60 * 60 * 24))),
      status: 'On Track',
      dailyStudyHours: 2,
      totalUnits: 5
    } : null;

    // 2. Today's Tasks
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: planDays } = await client
      .from('study_plan_days')
      .select('id')
      .eq('study_date', todayStr)
      .limit(1);

    let tasks = [];
    if (planDays && planDays.length > 0) {
      const { data: dbTasks } = await client
        .from('study_tasks')
        .select('id, title, is_completed, estimated_minutes, priority, subjects(name)')
        .eq('study_plan_day_id', planDays[0].id)
        .order('is_completed', { ascending: true });

      tasks = (dbTasks || []).map(t => ({
        id: t.id,
        text: t.title,
        completed: t.is_completed,
        subject: t.subjects?.name || 'TOC',
        estMinutes: t.estimated_minutes
      }));
    }

    // 3. Overall Stats
    const { data: topicProgress } = await client
      .from('topic_progress')
      .select('mastery_score, status')
      .eq('user_id', userId);

    const { data: quizAttempts } = await client
      .from('quiz_attempts')
      .select('percentage')
      .eq('user_id', userId);

    const avgMastery = topicProgress && topicProgress.length > 0
      ? Math.round(topicProgress.reduce((acc, curr) => acc + curr.mastery_score, 0) / topicProgress.length)
      : 65;

    const weakCount = topicProgress
      ? topicProgress.filter(tp => tp.status === 'needs_revision').length
      : 2;

    const avgQuizScore = quizAttempts && quizAttempts.length > 0
      ? `${Math.round(quizAttempts.reduce((acc, curr) => acc + Number(curr.percentage), 0) / quizAttempts.length)}%`
      : '78%';

    // 4. Subjects
    const { data: dbSubjects } = await client
      .from('subjects')
      .select('id, name, color')
      .eq('user_id', userId);

    const subjects = (dbSubjects || []).map(s => ({
      id: s.id,
      name: s.name,
      color: s.color || '#3b82f6',
      progress: 60,
      units: 5
    }));

    // 5. Recent Quiz
    const { data: recentAttempts } = await client
      .from('quiz_attempts')
      .select('id, score, percentage, completed_at, quiz_sets(title)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1);

    const recentQuiz = recentAttempts && recentAttempts.length > 0 ? {
      title: recentAttempts[0].quiz_sets?.title || 'Unit 2 Quiz',
      date: new Date(recentAttempts[0].completed_at).toLocaleString(),
      score: Number(recentAttempts[0].percentage),
      weakAreas: ['NFA to DFA', 'Regular Expressions', 'Pumping Lemma'],
      totalQuestions: 10,
      correctQuestions: 4
    } : null;

    res.json({
      exam: examData,
      tasks,
      stats: {
        overallProgress: avgMastery,
        unitsCompleted: '3/5',
        quizzesTaken: quizAttempts ? quizAttempts.length : 12,
        averageScore: avgQuizScore,
        weakTopicCount: weakCount
      },
      subjects,
      recentQuiz
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard metrics' });
  }
});

export default router;
