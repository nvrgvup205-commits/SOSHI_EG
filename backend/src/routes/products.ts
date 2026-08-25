import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireStaff } from '../middleware/auth';

type AppEnv = { Bindings: Env; Variables: { staff?: Record<string, unknown> } };

const products = new Hono<AppEnv>();

products.get('/', async (c) => {
  const supabase = createSupabase(c.env);
  const category = c.req.query('category');
  const all = c.req.query('all') === 'true';

  if (all) {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return errorResponse('Unauthorized', 401);
    const { data } = await supabase
      .from('staff_sessions')
      .select('id')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (!data) return errorResponse('Unauthorized', 401);
  }

  let query = supabase.from('products').select('*').order('sort_order', { ascending: true });
  if (!all) query = query.eq('is_available', true);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ products: data });
});

products.get('/:id', async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();

  if (error) return errorResponse('Product not found', 404);

  const { data: links } = await supabase
    .from('product_addons')
    .select('addon_id, addons(*)')
    .eq('product_id', data.id);

  return jsonResponse({
    product: {
      ...data,
      addons: (links || []).map((l) => l.addons).filter(Boolean),
    },
  });
});

products.post('/', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase.from('products').insert(body).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ product: data }, 201);
});

products.patch('/:id', requireStaff, async (c) => {
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('products')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', c.req.param('id'))
    .select()
    .single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ product: data });
});

products.delete('/:id', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const { error } = await supabase.from('products').delete().eq('id', c.req.param('id'));
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ success: true });
});

export default products;
