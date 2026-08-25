import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireCustomer } from '../middleware/auth';

type AppEnv = { Bindings: Env; Variables: { customer: Record<string, unknown> } };

const addresses = new Hono<AppEnv>();

addresses.use('*', requireCustomer);

addresses.get('/', async (c) => {
  const customer = c.get('customer');
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ addresses: data });
});

addresses.post('/', async (c) => {
  const customer = c.get('customer');
  const body = await c.req.json<{
    area?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    is_default?: boolean;
  }>();
  if (!body.address?.trim()) return errorResponse('Address required', 400);

  const supabase = createSupabase(c.env);
  if (body.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('customer_id', customer.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      customer_id: customer.id,
      area: body.area || null,
      address: body.address.trim(),
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      is_default: body.is_default ?? false,
    })
    .select()
    .single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ address: data }, 201);
});

addresses.patch('/:id', async (c) => {
  const customer = c.get('customer');
  const body = await c.req.json();
  const supabase = createSupabase(c.env);
  if (body.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('customer_id', customer.id);
  }
  const { data, error } = await supabase
    .from('addresses')
    .update(body)
    .eq('id', c.req.param('id'))
    .eq('customer_id', customer.id)
    .select()
    .single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ address: data });
});

addresses.delete('/:id', async (c) => {
  const customer = c.get('customer');
  const supabase = createSupabase(c.env);
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', c.req.param('id'))
    .eq('customer_id', customer.id);
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ success: true });
});

export default addresses;
