import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

/**
 * GET /api/study-plans/current
 * Returns active study plan, its days, and tasks
 */
router.get('/current', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;

    const { data: plans, error: planErr } = await client
      .from('study_plans')
      .select('id, start_date, end_date, total_available_hours, status, exams(name, exam_date, subjects(name))')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (planErr) throw planErr;

    if (!plans || plans.length === 0) {
      return res.json({ plan: null, days: [] });
    }

    const currentPlan = plans[0];

    const { data: days, error: daysErr } = await client
      .from('study_plan_days')
      .select('id, day_number, study_date, title, description, total_estimated_minutes, completed_minutes, status')
      .eq('study_plan_id', currentPlan.id)
      .order('day_number', { ascending: true });

    if (daysErr) throw daysErr;

    res.json({
      plan: currentPlan,
      days: days || []
    });
  } catch (err) {
    console.error('Error fetching current study plan:', err);
    res.status(500).json({ error: 'Failed to retrieve study plan' });
  }
});

/**
 * PATCH /api/study-tasks/:id/toggle
 * Toggles task completion status and updates completed_minutes on the plan day
 */
router.patch('/tasks/:id/toggle', async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;

    // Fetch current state
    const { data: task, error: fetchErr } = await client
      .from('study_tasks')
      .select('id, is_completed, estimated_minutes, study_plan_day_id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const nextState = !task.is_completed;
    const completedAt = nextState ? new Date().toISOString() : null;

    const { data: updatedTask, error: updateErr } = await client
      .from('study_tasks')
      .update({
        is_completed: nextState,
        completed_at: completedAt
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Adjust study_plan_days completed_minutes
    if (task.study_plan_day_id) {
      const minutesDelta = nextState ? task.estimated_minutes : -task.estimated_minutes;
      const { data: day } = await client
        .from('study_plan_days')
        .select('completed_minutes')
        .eq('id', task.study_plan_day_id)
        .single();

      if (day) {
        await client
          .from('study_plan_days')
          .update({
            completed_minutes: Math.max(0, (day.completed_minutes || 0) + minutesDelta)
          })
          .eq('id', task.study_plan_day_id);
      }
    }

    res.json({ task: updatedTask });
  } catch (err) {
    console.error('Error toggling study task:', err);
    res.status(500).json({ error: 'Failed to update task state' });
  }
});

/**
 * POST /api/study-plans/adapt
 * Autonomous Agent Re-planner:
 * Inspects weak topics and restructures upcoming study days
 */
router.post('/adapt', async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch weak topics
    const { data: weakTopics } = await supabaseAdmin
      .from('topic_progress')
      .select('topic_id, topics(name, unit_name)')
      .eq('user_id', userId)
      .eq('status', 'needs_revision');

    if (!weakTopics || weakTopics.length === 0) {
      return res.json({ message: 'No weak topics detected. Plan is optimal.' });
    }

    const weakNames = weakTopics.map(wt => wt.topics?.name).filter(Boolean);

    // 2. Fetch upcoming days in active plan
    const { data: plans } = await supabaseAdmin
      .from('study_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    if (!plans || plans.length === 0) {
      return res.status(404).json({ error: 'No active study plan found to adapt' });
    }

    const planId = plans[0].id;

    // Convert an upcoming day to 'adaptive'
    const { data: upcomingDays } = await supabaseAdmin
      .from('study_plan_days')
      .select('id, day_number')
      .eq('study_plan_id', planId)
      .eq('status', 'upcoming')
      .order('day_number', { ascending: false })
      .limit(1);

    if (upcomingDays && upcomingDays.length > 0) {
      const targetDay = upcomingDays[0];
      
      await supabaseAdmin
        .from('study_plan_days')
        .update({
          status: 'adaptive',
          title: `Day ${targetDay.day_number}: Adaptive Remedial Revision`,
          description: `Auto-scheduled by Agent: Heavy revision of weak areas (${weakNames.slice(0, 2).join(', ')})`,
          total_estimated_minutes: 150
        })
        .eq('id', targetDay.id);

      // Audit log
      await supabaseAdmin.from('adaptive_plan_updates').insert({
        user_id: userId,
        study_plan_id: planId,
        trigger_type: 'manual_replan_request',
        trigger_data: { weak_topics: weakNames },
        changes: {
          adapted_day: targetDay.day_number,
          allocated_topics: weakNames
        }
      });
    }

    res.json({
      message: 'Plan successfully adapted to target weak conceptual areas',
      weakAreasTargeted: weakNames
    });
  } catch (err) {
    console.error('Error adapting study plan:', err);
    res.status(500).json({ error: 'Failed to adapt study plan' });
  }
});

export default router;
