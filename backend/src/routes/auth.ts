import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import {
  errorResponse,
  generateToken,
  hashPassword,
  isValidEmail,
  isValidPhone,
  jsonResponse,
  normalizeEmail,
  normalizePhone,
  sessionExpiry,
  verifyPassword,
} from '../lib/auth';
import { readJsonBody } from '../lib/http';
import {
  DEMO_PIN,
  DEMO_STAFF_EMAIL,
  demoCustomerRecord,
  demoStaffRecord,
  isDemoCredentials,
} from '../lib/demo';

type AppEnv = { Bindings: Env };

const auth = new Hono<AppEnv>();

type Lang = 'ar' | 'en' | 'ru';

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
    demo: customer.phone === demoCustomerRecord().phone,
  };
}

async function upsertDemoCustomer(
  supabase: ReturnType<typeof createSupabase>,
  preferredLanguage: Lang,
) {
  const seed = demoCustomerRecord(preferredLanguage);
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', seed.phone)
    .maybeSingle();

  const now = new Date().toISOString();
  if (existing) {
    await supabase
      .from('customers')
      .update({
        preferred_language: preferredLanguage,
        last_login_at: now,
        updated_at: now,
        is_active: true,
      })
      .eq('id', existing.id);
    return existing;
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({ ...seed, last_login_at: now })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return customer;
}

async function upsertDemoStaff(supabase: ReturnType<typeof createSupabase>) {
  const seed = demoStaffRecord();
  const { data: existing } = await supabase
    .from('staff_users')
    .select('*')
    .or(`phone.eq.${seed.phone},email.eq.${seed.email}`)
    .maybeSingle();

  const passwordHash = await hashPassword(DEMO_PIN);
  if (existing) {
    await supabase
      .from('staff_users')
      .update({
        is_active: true,
        role: existing.role || 'admin',
        last_login_at: new Date().toISOString(),
        password_hash: passwordHash,
      })
      .eq('id', existing.id);
    return { ...existing, role: existing.role || 'admin', is_active: true };
  }

  const { data: created, error } = await supabase
    .from('staff_users')
    .insert({
      ...seed,
      password_hash: passwordHash,
      last_login_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return created;
}

function placeholderEmail(phone: string) {
  return `${phone.replace(/\D/g, '')}@guest.sushishop-egypt.local`;
}

auth.post('/customer/login', async (c) => {
  const parsed = await readJsonBody<{
    email?: string;
    phone?: string;
    identifier?: string;
    password?: string;
    preferred_language?: Lang;
  }>(c.req.raw);
  if (parsed.error) return errorResponse(parsed.error, 400);
  const body = parsed.data || {};

  const identifier = (body.identifier || body.email || body.phone || '').trim();
  const password = (body.password || '').trim();
  const lang = body.preferred_language || 'ar';
  const supabase = createSupabase(c.env);

  if (isDemoCredentials(identifier, password || DEMO_PIN) && (password === DEMO_PIN || !password)) {
    try {
      const customer = await upsertDemoCustomer(supabase, lang);
      return jsonResponse(await createCustomerSession(supabase, customer));
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Demo login failed', 500);
    }
  }

  const email = normalizeEmail(body.email || (identifier.includes('@') ? identifier : ''));
  const phone = normalizePhone(body.phone || (!identifier.includes('@') ? identifier : ''));

  if (email && isValidEmail(email) && phone && isValidPhone(phone)) {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .eq('phone', phone)
      .maybeSingle();

    if (!customer) return errorResponse('No account found. Please register first.', 404);

    const now = new Date().toISOString();
    await supabase
      .from('customers')
      .update({
        preferred_language: lang || customer.preferred_language,
        last_login_at: now,
        updated_at: now,
      })
      .eq('id', customer.id);

    try {
      return jsonResponse(await createCustomerSession(supabase, customer));
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Login failed', 500);
    }
  }

  if (phone && isValidPhone(phone)) {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    if (!customer) return errorResponse('No account found. Please register first.', 404);
    if (password && password !== DEMO_PIN) {
      return errorResponse('Invalid credentials', 401);
    }
    try {
      return jsonResponse(await createCustomerSession(supabase, customer));
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Login failed', 500);
    }
  }

  return errorResponse('Use 1111 / 1111 for demo, or your phone number', 400);
});

auth.post('/customer/register', async (c) => {
  const parsed = await readJsonBody<{
    email?: string;
    phone?: string;
    full_name?: string;
    preferred_language?: Lang;
    area?: string;
    address?: string;
    password?: string;
    identifier?: string;
  }>(c.req.raw);
  if (parsed.error) return errorResponse(parsed.error, 400);
  const body = parsed.data || {};

  const identifier = (body.identifier || '').trim();
  const password = (body.password || '').trim();
  if (isDemoCredentials(identifier || '1111', password || DEMO_PIN) && (identifier === DEMO_PIN || password === DEMO_PIN)) {
    try {
      const supabase = createSupabase(c.env);
      const customer = await upsertDemoCustomer(supabase, body.preferred_language || 'ar');
      return jsonResponse(await createCustomerSession(supabase, customer), 201);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Registration failed', 500);
    }
  }

  const phone = normalizePhone(body.phone || '');
  const fullName = (body.full_name || '').trim();
  const address = (body.address || '').trim();
  const rawEmail = (body.email || '').trim();
  const email = rawEmail ? normalizeEmail(rawEmail) : placeholderEmail(phone);

  if (!fullName) return errorResponse('Full name required', 400);
  if (!isValidPhone(phone)) return errorResponse('Invalid phone number', 400);
  if (rawEmail && !isValidEmail(email)) return errorResponse('Invalid Gmail / email address', 400);
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

auth.post('/staff/login', async (c) => {
  const parsed = await readJsonBody<{
    email?: string;
    phone?: string;
    identifier?: string;
    password?: string;
  }>(c.req.raw);
  if (parsed.error) return errorResponse(parsed.error, 400);
  const body = parsed.data || {};

  const password = body.password || '';
  const raw = (body.identifier || body.email || body.phone || '').trim();
  const supabase = createSupabase(c.env);

  if (isDemoCredentials(raw, password)) {
    try {
      const staff = await upsertDemoStaff(supabase);
      const token = generateToken();
      await supabase.from('staff_sessions').insert({
        staff_user_id: staff.id,
        session_token: token,
        expires_at: sessionExpiry(),
      });
      return jsonResponse({
        session_token: token,
        user: {
          id: staff.id,
          email: staff.email || DEMO_STAFF_EMAIL,
          phone: staff.phone,
          full_name: staff.full_name,
          role: staff.role || 'admin',
        },
        demo: true,
      });
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Demo admin login failed', 500);
    }
  }

  const looksLikeEmail = raw.includes('@');
  const email = looksLikeEmail || body.email ? normalizeEmail(body.email || raw) : '';
  const phone = !looksLikeEmail && (body.phone || raw) ? normalizePhone(body.phone || raw) : '';

  if ((!email && !phone) || !password) {
    return errorResponse('Phone/email and password required', 400);
  }

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

auth.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return jsonResponse({ success: true });

  const supabase = createSupabase(c.env);
  await supabase.from('customer_sessions').delete().eq('session_token', token);
  await supabase.from('staff_sessions').delete().eq('session_token', token);

  return jsonResponse({ success: true });
});

auth.post('/otp/request', async (c) => {
  const parsed = await readJsonBody<{ phone?: string; purpose?: string }>(c.req.raw);
  if (parsed.error) return errorResponse(parsed.error, 400);
  const phone = normalizePhone(parsed.data?.phone || '');
  if (!isValidPhone(phone)) return errorResponse('Invalid phone number', 400);

  return jsonResponse({
    message: 'WhatsApp OTP is not enabled yet. Use 1111 / 1111 demo login.',
    enabled: false,
    phone,
    purpose: parsed.data?.purpose || 'login',
  }, 501);
});

auth.post('/otp/verify', async (c) => jsonResponse({
  message: 'WhatsApp OTP verification is not enabled yet.',
  enabled: false,
}, 501));

auth.post('/google', async (c) => jsonResponse({
  message: 'Google login is not enabled yet. Use 1111 / 1111 demo login.',
  enabled: false,
}, 501));

export default auth;
