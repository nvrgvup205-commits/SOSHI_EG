import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireStaff } from '../middleware/auth';

type AppEnv = { Bindings: Env; Variables: { staff?: Record<string, unknown> } };

const catalog = new Hono<AppEnv>();

catalog.get('/home', async (c) => {
  const supabase = createSupabase(c.env);
  const [categories, products, banners, settings, addons] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('products').select('*').eq('is_available', true).order('sort_order', { ascending: true }),
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('site_settings').select('setting_key, setting_value'),
    supabase.from('addons').select('*').eq('is_active', true),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings.data || []) settingsMap[s.setting_key] = s.setting_value;

  return jsonResponse({
    categories: categories.data || [],
    products: products.data || [],
    banners: banners.data || [],
    addons: addons.data || [],
    restaurant_open: settingsMap.restaurant_open !== 'false',
    settings: settingsMap,
  });
});

catalog.get('/categories', async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ categories: data });
});

catalog.post('/categories', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('categories').insert(body).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ category: data }, 201);
});

catalog.patch('/categories/:id', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('categories').update(body).eq('id', c.req.param('id')).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ category: data });
});

catalog.delete('/categories/:id', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const { error } = await supabase.from('categories').delete().eq('id', c.req.param('id'));
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ success: true });
});

catalog.get('/banners', async (c) => {
  const supabase = createSupabase(c.env);
  const all = c.req.query('all') === 'true';
  let query = supabase.from('banners').select('*').order('sort_order');
  if (!all) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ banners: data });
});

catalog.post('/banners', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('banners').insert(body).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ banner: data }, 201);
});

catalog.patch('/banners/:id', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('banners').update(body).eq('id', c.req.param('id')).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ banner: data });
});

catalog.delete('/banners/:id', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const { error } = await supabase.from('banners').delete().eq('id', c.req.param('id'));
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ success: true });
});

catalog.get('/addons', async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('addons').select('*').order('created_at');
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ addons: data });
});

catalog.post('/addons', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('addons').insert(body).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ addon: data }, 201);
});

catalog.patch('/addons/:id', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('addons').update(body).eq('id', c.req.param('id')).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ addon: data });
});

catalog.delete('/addons/:id', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const { error } = await supabase.from('addons').delete().eq('id', c.req.param('id'));
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ success: true });
});

catalog.get('/zones', async (c) => {
  const supabase = createSupabase(c.env);
  const all = c.req.query('all') === 'true';
  let query = supabase.from('delivery_zones').select('*').order('name');
  if (!all) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ zones: data });
});

catalog.post('/zones', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('delivery_zones').insert(body).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ zone: data }, 201);
});

catalog.patch('/zones/:id', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('delivery_zones').update(body).eq('id', c.req.param('id')).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ zone: data });
});

catalog.delete('/zones/:id', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const { error } = await supabase.from('delivery_zones').delete().eq('id', c.req.param('id'));
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ success: true });
});

catalog.get('/coupons', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ coupons: data });
});

catalog.post('/coupons', requireStaff, async (c) => {
  const body = await c.req.json();
  if (body.code) body.code = String(body.code).trim().toUpperCase();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('coupons').insert(body).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ coupon: data }, 201);
});

catalog.patch('/coupons/:id', requireStaff, async (c) => {
  const body = await c.req.json();
  if (body.code) body.code = String(body.code).trim().toUpperCase();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('coupons').update(body).eq('id', c.req.param('id')).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ coupon: data });
});

catalog.delete('/coupons/:id', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const { error } = await supabase.from('coupons').delete().eq('id', c.req.param('id'));
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ success: true });
});

catalog.post('/coupons/validate', async (c) => {
  const body = await c.req.json<{ code?: string }>();
  const code = (body.code || '').trim().toUpperCase();
  if (!code) return errorResponse('Coupon code required', 400);
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();
  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse('Invalid coupon', 404);
  if (data.expiry && new Date(data.expiry) < new Date()) return errorResponse('Coupon expired', 400);
  return jsonResponse({ coupon: data });
});

export default catalog;
