import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { requireAuth } from './supabase.js';
import dashboardRoutes from './routes/dashboard.js';
import ragRoutes from './routes/rag.js';
import quizRoutes from './routes/quiz.js';
import studyPlanRoutes from './routes/studyPlan.js';
import subjectsRoutes from './routes/subjects.js';
import tutorRoutes from './routes/tutor.js';
import notificationsRoutes from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-user-id']
}));
app.use(express.json({ limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Welcome to StudyAgent API (Supabase PostgreSQL + pgvector Backend)',
    status: 'online',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      health: '/health',
      dashboard: '/api/dashboard',
      ragSearch: '/api/rag/search',
      tutorChat: '/api/tutor/chat',
      quiz: '/api/quiz',
      studyPlans: '/api/study-plans',
      subjects: '/api/subjects',
      notifications: '/api/notifications'
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StudyAgent API',
    timestamp: new Date().toISOString()
  });
});

// Protected API Routes
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/rag', requireAuth, ragRoutes);
app.use('/api/quiz', requireAuth, quizRoutes);
app.use('/api/study-plans', requireAuth, studyPlanRoutes);
app.use('/api/subjects', requireAuth, subjectsRoutes);
app.use('/api/tutor', requireAuth, tutorRoutes);
app.use('/api/notifications', requireAuth, notificationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 StudyAgent Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
