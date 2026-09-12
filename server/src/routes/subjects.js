import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

// GET /api/subjects
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;

    const { data: subjects, error } = await client
      .from('subjects')
      .select('id, name, description, color, created_at')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    res.json({ subjects: subjects || [] });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// POST /api/subjects
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;
    const { name, description, color } = req.body;

    if (!name) return res.status(400).json({ error: 'Subject name is required' });

    const { data: subject, error } = await client
      .from('subjects')
      .insert({
        user_id: userId,
        name,
        description: description || null,
        color: color || '#3b82f6'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ subject });
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// POST /api/subjects/exams
router.post('/exams', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;
    const { subjectId, name, examDate } = req.body;

    if (!subjectId || !name || !examDate) {
      return res.status(400).json({ error: 'subjectId, name, and examDate are required' });
    }

    const { data: exam, error } = await client
      .from('exams')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        name,
        exam_date: examDate
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ exam });
  } catch (err) {
    console.error('Error creating exam:', err);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

export default router;
