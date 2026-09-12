import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root or server dir
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('⚠️ SUPABASE_URL is not set in environment variables. Database operations will fail.');
}

/**
 * Admin Supabase Client (Service Role)
 * Used ONLY on the server for privileged tasks:
 *   - Batch storing embeddings
 *   - Background chunking pipeline
 *   - System-level adaptive plan trigger evaluations
 * NEVER expose service role key to frontend!
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Creates a scoped Supabase client preserving the caller's JWT.
 * Ensures that RLS policies are applied to this specific user.
 */
export const createScopedClient = (token) => {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false
      }
    }
  );
};

/**
 * Express Authentication Middleware
 * Validates Supabase Auth Bearer token and attaches user & scoped client to req
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Support development fallback if x-dev-user-id is passed during local testing
    if (!authHeader && req.headers['x-dev-user-id'] && process.env.NODE_ENV !== 'production') {
      req.user = { id: req.headers['x-dev-user-id'] };
      req.client = supabaseAdmin;
      return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid Authorization Bearer header' 
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired authentication token' 
      });
    }

    req.user = user;
    req.client = createScopedClient(token);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
