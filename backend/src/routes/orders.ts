import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireStaff, requireCustomer } from '../middleware/auth';

type AppEnv = {
  Bindings: Env;
  Variables: {
    staff?: Record<string, unknown>;
    customer?: Record<string, unknown>;
  };
};

const orders = new Hono<AppEnv>();

orders.post('/', requireCustomer, async (c) => {
  const body = await c.req.json<{
    items: Array<{ product_id: string; quantity: number }>;
    notes?: string;
    delivery_address?: string;
  }>();
  const customer = c.get('customer')!;
  const supabase = createSupabase(c.env);

  if (!body.items?.length) return errorResponse('Order must have items', 400);

  const productIds = body.items.map((i) => i.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name_ar, price')
    .in('id', productIds)
    .eq('is_available', true);

  if (productsError || !products?.length) return errorResponse('Invalid products', 400);

  const productMap = new Map(products.map((p) => [p.id, p]));
  let total = 0;
  const orderItems = body.items.map((item) => {
    const product = productMap.get(item.product_id);
    if (!product) throw new Error('Product not found');
    const lineTotal = Number(product.price) * item.quantity;
    total += lineTotal;
    return {
      product_id: product.id,
      product_name: product.name_ar,
      quantity: item.quantity,
      price_at_order: product.price,
    };
  });

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      total_price: total,
      notes: body.notes || null,
      delivery_address: body.delivery_address || null,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) return errorResponse(orderError.message, 500);

  const itemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }));
  await supabase.from('order_items').insert(itemsWithOrderId);

  return jsonResponse({ order }, 201);
});

orders.get('/', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const status = c.req.query('status');

  let query = supabase
    .from('orders')
    .select('*, order_items(*), customers(full_name, email, phone)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ orders: data });
});

orders.patch('/:id/status', requireStaff, async (c) => {
  const body = await c.req.json<{ status: string }>();
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('orders')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', c.req.param('id'))
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ order: data });
});

export default orders;
