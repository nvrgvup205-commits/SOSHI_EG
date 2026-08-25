import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireStaff } from '../middleware/auth';

type AppEnv = { Bindings: Env; Variables: { staff: Record<string, unknown> } };

const admin = new Hono<AppEnv>();

admin.use('*', requireStaff);

admin.get('/analytics', async (c) => {
  const supabase = createSupabase(c.env);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ordersRes, customersRes, messagesRes, staffRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabase.from('staff_users').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  return jsonResponse({
    today_orders: ordersRes.count || 0,
    total_customers: customersRes.count || 0,
    today_messages: messagesRes.count || 0,
    active_staff: staffRes.count || 0,
  });
});

admin.get('/staff', async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('staff_users')
    .select('id, email, phone, full_name, role, is_active, last_login_at, created_at')
    .order('created_at', { ascending: false });

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ staff: data });
});

admin.post('/staff', async (c) => {
  const staff = c.get('staff');
  if (staff.role !== 'admin' && staff.role !== 'staff_supervisor') {
    return errorResponse('Insufficient permissions', 403);
  }

  const body = await c.req.json<{
    email: string;
    full_name: string;
    phone?: string;
    role: string;
    password: string;
  }>();

  const { hashPassword } = await import('../lib/auth');
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('staff_users')
    .insert({
      email: body.email.toLowerCase(),
      full_name: body.full_name,
      phone: body.phone || null,
      role: body.role,
      password_hash: await hashPassword(body.password),
      created_by: staff.id,
    })
    .select('id, email, phone, full_name, role, is_active')
    .single();

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ staff: data }, 201);
});

admin.patch('/settings', async (c) => {
  const staff = c.get('staff');
  if (staff.role !== 'admin') return errorResponse('Admin only', 403);

  const body = await c.req.json<Record<string, string>>();
  const supabase = createSupabase(c.env);

  for (const [key, value] of Object.entries(body)) {
    await supabase
      .from('site_settings')
      .upsert({ setting_key: key, setting_value: value, updated_at: new Date().toISOString() });
  }

  return jsonResponse({ success: true });
});

export default admin;
