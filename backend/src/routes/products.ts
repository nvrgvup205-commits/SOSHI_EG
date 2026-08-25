import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireStaff, optionalAuth } from '../middleware/auth';

type AppEnv = { Bindings: Env; Variables: { staff?: Record<string, unknown> } };

const products = new Hono<AppEnv>();

products.get('/', async (c) => {
  const supabase = createSupabase(c.env);
  const category = c.req.query('category');

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('sort_order', { ascending: true });

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
  return jsonResponse({ product: data });
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
