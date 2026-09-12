import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;

    const { data: notifications, error } = await client
      .from('notifications')
      .select('id, type, title, message, is_read, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ notifications: notifications || [] });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const client = req.client || supabaseAdmin;

    const { data: notification, error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ notification });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;
