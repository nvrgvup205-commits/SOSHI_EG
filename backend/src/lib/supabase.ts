import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types';

export function createSupabase(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: env.SUPABASE_SCHEMA || 'soshi' },
  });
}
