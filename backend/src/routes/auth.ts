import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import {
  errorResponse,
  generateToken,
  isValidEmail,
  isValidPhone,
  jsonResponse,
  normalizeEmail,
  normalizePhone,
  sessionExpiry,
  verifyPassword,
} from '../lib/auth';

type AppEnv = { Bindings: Env };

const auth = new Hono<AppEnv>();

// Customer login: email + phone only (no OTP yet)
auth.post('/customer/login', async (c) => {
  const body = await c.req.json<{
    email?: string;
    phone?: string;
    full_name?: string;
    preferred_language?: 'ar' | 'en' | 'ru';
  }>();

  const email = normalizeEmail(body.email || '');
  const phone = normalizePhone(body.phone || '');

  if (!isValidEmail(email)) return errorResponse('Invalid email address', 400);
  if (!isValidPhone(phone)) return errorResponse('Invalid phone number', 400);

  const supabase = createSupabase(c.env);
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .maybeSingle();

  let customer = existing;

  if (customer) {
    if (customer.email !== email && customer.phone !== phone) {
      return errorResponse('Email and phone belong to different accounts', 409);
    }
    const { data: updated, error } = await supabase
      .from('customers')
      .update({
        email,
        phone,
        full_name: body.full_name || customer.full_name,
        preferred_language: body.preferred_language || customer.preferred_language,
        last_login_at: now,
        updated_at: now,
      })
      .eq('id', customer.id)
      .select()
      .single();
    if (error) return errorResponse(error.message, 500);
    customer = updated;
  } else {
    const { data: created, error } = await supabase
      .from('customers')
      .insert({
        email,
        phone,
        full_name: body.full_name || null,
        preferred_language: body.preferred_language || 'ar',
        primary_auth_method: 'email_phone',
        last_login_at: now,
      })
      .select()
      .single();
    if (error) return errorResponse(error.message, 500);
    customer = created;
  }

  const token = generateToken();
  const { error: sessionError } = await supabase.from('customer_sessions').insert({
    customer_id: customer.id,
    session_token: token,
    auth_method: 'email_phone',
    expires_at: sessionExpiry(),
  });
  if (sessionError) return errorResponse(sessionError.message, 500);

  return jsonResponse({
    session_token: token,
    customer: {
      id: customer.id,
      email: customer.email,
      phone: customer.phone,
      full_name: customer.full_name,
      preferred_language: customer.preferred_language,
    },
    auth_method: 'email_phone',
    otp_required: false,
  });
});

// Staff/Admin login
auth.post('/staff/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = normalizeEmail(body.email || '');
  const password = body.password || '';

  if (!email || !password) return errorResponse('Email and password required', 400);

  const supabase = createSupabase(c.env);
  const { data: staff, error } = await supabase
    .from('staff_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !staff) return errorResponse('Invalid credentials', 401);

  const valid = await verifyPassword(password, staff.password_hash);
  if (!valid) return errorResponse('Invalid credentials', 401);

  const token = generateToken();
  await supabase.from('staff_sessions').insert({
    staff_user_id: staff.id,
    session_token: token,
    expires_at: sessionExpiry(),
  });
  await supabase
    .from('staff_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', staff.id);

  return jsonResponse({
    session_token: token,
    user: {
      id: staff.id,
      email: staff.email,
      full_name: staff.full_name,
      role: staff.role,
    },
  });
});

// Get current user (customer or staff)
auth.get('/me', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return errorResponse('Unauthorized', 401);

  const supabase = createSupabase(c.env);

  const { data: customerSession } = await supabase
    .from('customer_sessions')
    .select('*, customers(*)')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (customerSession?.customers) {
    return jsonResponse({
      type: 'customer',
      user: customerSession.customers,
    });
  }

  const { data: staffSession } = await supabase
    .from('staff_sessions')
    .select('*, staff_users(*)')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (staffSession?.staff_users) {
    return jsonResponse({
      type: 'staff',
      user: staffSession.staff_users,
    });
  }

  return errorResponse('Session expired or invalid', 401);
});

// Logout
auth.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return jsonResponse({ success: true });

  const supabase = createSupabase(c.env);
  await supabase.from('customer_sessions').delete().eq('session_token', token);
  await supabase.from('staff_sessions').delete().eq('session_token', token);

  return jsonResponse({ success: true });
});

// Future: WhatsApp OTP endpoints (prepared)
auth.post('/otp/request', async (c) => {
  const body = await c.req.json<{ phone?: string; purpose?: string }>();
  const phone = normalizePhone(body.phone || '');
  if (!isValidPhone(phone)) return errorResponse('Invalid phone number', 400);

  return jsonResponse({
    message: 'WhatsApp OTP is not enabled yet. Use email + phone login.',
    enabled: false,
    phone,
    purpose: body.purpose || 'login',
  }, 501);
});

auth.post('/otp/verify', async (c) => {
  return jsonResponse({
    message: 'WhatsApp OTP verification is not enabled yet.',
    enabled: false,
  }, 501);
});

// Future: Google login (prepared)
auth.post('/google', async (c) => {
  return jsonResponse({
    message: 'Google login is not enabled yet. Use email + phone login.',
    enabled: false,
  }, 501);
});

export default auth;
