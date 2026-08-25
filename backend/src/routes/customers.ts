import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireStaff } from '../middleware/auth';

type AppEnv = { Bindings: Env; Variables: { staff: Record<string, unknown> } };

const customers = new Hono<AppEnv>();

customers.use('*', requireStaff);

// List all customers (admin portal)
customers.get('/', async (c) => {
  const supabase = createSupabase(c.env);
  const search = c.req.query('search') || '';
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
  const offset = (page - 1) * limit;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,phone.ilike.%${search}%,full_name.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) return errorResponse(error.message, 500);

  return jsonResponse({
    customers: data,
    pagination: { page, limit, total: count || 0 },
  });
});

// Get single customer
customers.get('/:id', async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();

  if (error) return errorResponse('Customer not found', 404);
  return jsonResponse({ customer: data });
});

// Update customer (admin)
customers.patch('/:id', async (c) => {
  const body = await c.req.json<{
    full_name?: string;
    email?: string;
    phone?: string;
    is_active?: boolean;
    notes?: string;
    preferred_language?: string;
  }>();

  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('customers')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', c.req.param('id'))
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ customer: data });
});

// Customer orders history
customers.get('/:id/orders', async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', c.req.param('id'))
    .order('created_at', { ascending: false });

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ orders: data });
});

export default customers;
