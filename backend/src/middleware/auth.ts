import { Context, Next } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse } from '../lib/auth';
import { touchCustomerSession, touchStaffSession } from '../lib/sessions';

type AppEnv = {
  Bindings: Env;
  Variables: {
    staff?: Record<string, unknown>;
    customer?: Record<string, unknown>;
  };
};

function getToken(c: Context<AppEnv>): string | null {
  return c.req.header('Authorization')?.replace('Bearer ', '') || null;
}

export async function requireStaff(c: Context<AppEnv>, next: Next) {
  const token = getToken(c);
  if (!token) return errorResponse('Unauthorized', 401);

  const supabase = createSupabase(c.env);
  const { data } = await supabase
    .from('staff_sessions')
    .select('*, staff_users(*)')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!data?.staff_users) return errorResponse('Unauthorized', 401);
  c.set('staff', data.staff_users);
  await touchStaffSession(c.env, token);
  await next();
}

export async function requireCustomer(c: Context<AppEnv>, next: Next) {
  const token = getToken(c);
  if (!token) return errorResponse('Unauthorized', 401);

  const supabase = createSupabase(c.env);
  const { data } = await supabase
    .from('customer_sessions')
    .select('*, customers(*)')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!data?.customers) return errorResponse('Please login first', 401);
  c.set('customer', data.customers);
  await touchCustomerSession(c.env, token);
  await next();
}

export async function optionalAuth(c: Context<AppEnv>, next: Next) {
  const token = getToken(c);
  if (token) {
    const supabase = createSupabase(c.env);
    const { data: staffData } = await supabase
      .from('staff_sessions')
      .select('*, staff_users(*)')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (staffData?.staff_users) c.set('staff', staffData.staff_users);
  }
  await next();
}
