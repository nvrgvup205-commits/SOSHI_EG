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
  if (staff.role !== 'admin') {
    return errorResponse('Admin only', 403);
  }

  const body = await c.req.json<{
    email?: string;
    full_name: string;
    phone: string;
    role: string;
    password?: string;
  }>();

  const { hashPassword, normalizePhone, isValidPhone } = await import('../lib/auth');
  const phone = normalizePhone(body.phone || '');
  if (!body.full_name?.trim()) return errorResponse('Full name required', 400);
  if (!isValidPhone(phone)) return errorResponse('Invalid phone number', 400);

  const email = body.email?.trim()
    ? body.email.trim().toLowerCase()
    : `${phone.replace(/\D/g, '')}@staff.soshi-eg.local`;
  const password = body.password?.trim() || '1234';

  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('staff_users')
    .insert({
      email,
      full_name: body.full_name.trim(),
      phone,
      role: body.role || 'order_handler',
      password_hash: await hashPassword(password),
      created_by: staff.id,
    })
    .select('id, email, phone, full_name, role, is_active')
    .single();

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ staff: data, default_password: password }, 201);
});

admin.patch('/staff/:id', async (c) => {
  const staff = c.get('staff');
  if (staff.role !== 'admin') return errorResponse('Admin only', 403);

  const id = c.req.param('id');
  const body = await c.req.json<{
    full_name?: string;
    phone?: string;
    role?: string;
    is_active?: boolean;
    password?: string;
  }>();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.full_name !== undefined) updates.full_name = body.full_name;
  if (body.role !== undefined) updates.role = body.role;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.phone !== undefined) {
    const { normalizePhone, isValidPhone } = await import('../lib/auth');
    const phone = normalizePhone(body.phone);
    if (!isValidPhone(phone)) return errorResponse('Invalid phone number', 400);
    updates.phone = phone;
  }
  if (body.password) {
    const { hashPassword } = await import('../lib/auth');
    updates.password_hash = await hashPassword(body.password);
  }

  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('staff_users')
    .update(updates)
    .eq('id', id)
    .select('id, email, phone, full_name, role, is_active')
    .single();

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ staff: data });
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
