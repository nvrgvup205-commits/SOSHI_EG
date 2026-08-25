import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';

type AppEnv = { Bindings: Env };

const settings = new Hono<AppEnv>();

settings.get('/', async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) return errorResponse(error.message, 500);

  const settingsMap: Record<string, string> = {};
  for (const s of data || []) {
    settingsMap[s.setting_key] = s.setting_value;
  }
  return jsonResponse({ settings: settingsMap });
});

export default settings;
