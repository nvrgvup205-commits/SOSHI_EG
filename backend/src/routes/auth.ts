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

async function createCustomerSession(
  supabase: ReturnType<typeof createSupabase>,
  customer: Record<string, unknown>,
) {
  const token = generateToken();
  const { error: sessionError } = await supabase.from('customer_sessions').insert({
    customer_id: customer.id,
    session_token: token,
    auth_method: 'email_phone',
    expires_at: sessionExpiry(),
  });
  if (sessionError) throw new Error(sessionError.message);
  return {
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
  };
}

// Existing customer login: email + phone must match the same account
auth.post('/customer/login', async (c) => {
  const body = await c.req.json<{
    email?: string;
    phone?: string;
    preferred_language?: 'ar' | 'en' | 'ru';
  }>();

  const email = normalizeEmail(body.email || '');
  const phone = normalizePhone(body.phone || '');

  if (!isValidEmail(email)) return errorResponse('Invalid email address', 400);
  if (!isValidPhone(phone)) return errorResponse('Invalid phone number', 400);

  const supabase = createSupabase(c.env);
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .eq('phone', phone)
    .maybeSingle();

  if (!customer) {
    return errorResponse('No account found. Please register first.', 404);
  }

  const now = new Date().toISOString();
  await supabase
    .from('customers')
    .update({
      preferred_language: body.preferred_language || customer.preferred_language,
      last_login_at: now,
      updated_at: now,
    })
    .eq('id', customer.id);

  try {
    return jsonResponse(await createCustomerSession(supabase, customer));
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Login failed', 500);
  }
});

// New customer: phone + Gmail + address
auth.post('/customer/register', async (c) => {
  const body = await c.req.json<{
    email?: string;
    phone?: string;
    full_name?: string;
    preferred_language?: 'ar' | 'en' | 'ru';
    area?: string;
    address?: string;
  }>();

  const email = normalizeEmail(body.email || '');
  const phone = normalizePhone(body.phone || '');
  const fullName = (body.full_name || '').trim();
  const address = (body.address || '').trim();

  if (!fullName) return errorResponse('Full name required', 400);
  if (!isValidEmail(email)) return errorResponse('Invalid Gmail / email address', 400);
  if (!isValidPhone(phone)) return errorResponse('Invalid phone number', 400);
  if (!address) return errorResponse('Address required', 400);

  const supabase = createSupabase(c.env);
  const { data: existing } = await supabase
    .from('customers')
    .select('id, email, phone')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .maybeSingle();

  if (existing) {
    return errorResponse('An account with this phone or email already exists. Please login.', 409);
  }

  const now = new Date().toISOString();
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      email,
      phone,
      full_name: fullName,
      preferred_language: body.preferred_language || 'ar',
      primary_auth_method: 'email_phone',
      last_login_at: now,
    })
    .select()
    .single();
  if (error) return errorResponse(error.message, 500);

  await supabase.from('addresses').insert({
    customer_id: customer.id,
    area: body.area || null,
    address,
    is_default: true,
  });

  try {
    return jsonResponse(await createCustomerSession(supabase, customer), 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Registration failed', 500);
  }
});

// Staff/Admin login (email or phone + password)
auth.post('/staff/login', async (c) => {
  const body = await c.req.json<{
    email?: string;
    phone?: string;
    identifier?: string;
    password?: string;
  }>();
  const password = body.password || '';
  const raw = (body.identifier || body.email || body.phone || '').trim();
  const looksLikeEmail = raw.includes('@');
  const email = looksLikeEmail || body.email ? normalizeEmail(body.email || raw) : '';
  const phone = !looksLikeEmail && (body.phone || raw) ? normalizePhone(body.phone || raw) : '';

  if ((!email && !phone) || !password) {
    return errorResponse('Phone/email and password required', 400);
  }

  const supabase = createSupabase(c.env);
  let query = supabase.from('staff_users').select('*').eq('is_active', true);
  if (phone) query = query.eq('phone', phone);
  else query = query.eq('email', email);

  const { data: staff, error } = await query.maybeSingle();

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
      phone: staff.phone,
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
