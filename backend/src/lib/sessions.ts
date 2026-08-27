import { createSupabase } from './supabase';
import type { Env } from '../types';
import { sessionExpiry } from './auth';

export async function touchCustomerSession(env: Env, token: string) {
  const supabase = createSupabase(env);
  await supabase
    .from('customer_sessions')
    .update({ expires_at: sessionExpiry() })
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString());
}

export async function touchStaffSession(env: Env, token: string) {
  const supabase = createSupabase(env);
  await supabase
    .from('staff_sessions')
    .update({ expires_at: sessionExpiry() })
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString());
}

export async function refreshSession(env: Env, token: string): Promise<'customer' | 'staff' | null> {
  const supabase = createSupabase(env);
  const expiry = sessionExpiry();

  const { data: customer } = await supabase
    .from('customer_sessions')
    .update({ expires_at: expiry })
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .select('id')
    .maybeSingle();
  if (customer) return 'customer';

  const { data: staff } = await supabase
    .from('staff_sessions')
    .update({ expires_at: expiry })
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .select('id')
    .maybeSingle();
  if (staff) return 'staff';

  return null;
}
