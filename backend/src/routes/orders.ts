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

type AddonSnap = { id: string; name: string; price: number };

orders.post('/', requireCustomer, async (c) => {
  const body = await c.req.json<{
    items: Array<{
      product_id: string;
      quantity: number;
      notes?: string;
      addon_ids?: string[];
    }>;
    notes?: string;
    address_id?: string;
    delivery_zone_id?: string;
    coupon_code?: string;
    payment_method?: string;
    delivery_address?: string;
  }>();
  const customer = c.get('customer')!;
  const supabase = createSupabase(c.env);

  if (!body.items?.length) return errorResponse('Order must have items', 400);

  const { data: openRow } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'restaurant_open')
    .maybeSingle();
  if (openRow && openRow.setting_value === 'false') {
    return errorResponse('Restaurant is currently closed', 403);
  }

  const productIds = body.items.map((i) => i.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name_ar, name_en, price')
    .in('id', productIds)
    .eq('is_available', true);

  if (productsError || !products?.length) return errorResponse('Invalid products', 400);

  const addonIds = [...new Set(body.items.flatMap((i) => i.addon_ids || []))];
  let addonMap = new Map<string, { id: string; name_ar: string; price: number }>();
  if (addonIds.length) {
    const { data: addons } = await supabase.from('addons').select('id, name_ar, price').in('id', addonIds);
    addonMap = new Map((addons || []).map((a) => [a.id, a]));
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  const orderItems = body.items.map((item) => {
    const product = productMap.get(item.product_id);
    if (!product) throw new Error('Product not found');
    const snaps: AddonSnap[] = (item.addon_ids || [])
      .map((id) => addonMap.get(id))
      .filter(Boolean)
      .map((a) => ({ id: a!.id, name: a!.name_ar, price: Number(a!.price) }));
    const addonsTotal = snaps.reduce((sum, a) => sum + a.price, 0);
    const lineTotal = (Number(product.price) + addonsTotal) * item.quantity;
    subtotal += lineTotal;
    return {
      product_id: product.id,
      product_name: product.name_ar,
      quantity: item.quantity,
      price_at_order: Number(product.price) + addonsTotal,
      notes: item.notes || null,
      addons: snaps,
    };
  });

  let deliveryFee = 0;
  if (body.delivery_zone_id) {
    const { data: zone } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('id', body.delivery_zone_id)
      .eq('is_active', true)
      .maybeSingle();
    if (!zone) return errorResponse('Invalid delivery zone', 400);
    deliveryFee = Number(zone.delivery_fee);
  }

  let discount = 0;
  const couponCode = body.coupon_code?.trim().toUpperCase() || null;
  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .maybeSingle();
    if (!coupon) return errorResponse('Invalid coupon', 400);
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) return errorResponse('Coupon expired', 400);
    discount = coupon.type === 'percent'
      ? Math.round((subtotal * Number(coupon.discount)) / 100)
      : Number(coupon.discount);
  }

  let deliveryAddress = body.delivery_address || null;
  if (body.address_id) {
    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', body.address_id)
      .eq('customer_id', customer.id)
      .maybeSingle();
    if (!address) return errorResponse('Invalid address', 400);
    deliveryAddress = [address.area, address.address].filter(Boolean).join(' — ');
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      total_price: total,
      subtotal,
      delivery_fee: deliveryFee,
      discount,
      payment_method: body.payment_method || 'cash',
      coupon_code: couponCode,
      address_id: body.address_id || null,
      delivery_zone_id: body.delivery_zone_id || null,
      notes: body.notes || null,
      delivery_address: deliveryAddress,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) return errorResponse(orderError.message, 500);

  const itemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }));
  await supabase.from('order_items').insert(itemsWithOrderId);

  await supabase.from('conversations').insert({
    customer_id: customer.id,
    order_id: order.id,
    kind: 'order',
    customer_language: customer.preferred_language || 'ar',
    status: 'open',
  });

  await supabase.from('notifications').insert({
    customer_id: customer.id,
    title: 'Order placed',
    body: `Order ${order.order_number} received. Pay cash on delivery.`,
  });

  return jsonResponse({ order }, 201);
});

orders.get('/mine', requireCustomer, async (c) => {
  const customer = c.get('customer')!;
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ orders: data });
});

orders.get('/:id', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return errorResponse('Unauthorized', 401);
  const supabase = createSupabase(c.env);

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*), addresses(*), delivery_zones(name, delivery_fee)')
    .eq('id', c.req.param('id'))
    .single();
  if (error || !order) return errorResponse('Order not found', 404);

  const { data: staffSession } = await supabase
    .from('staff_sessions')
    .select('id')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!staffSession) {
    const { data: customerSession } = await supabase
      .from('customer_sessions')
      .select('customer_id')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (!customerSession || customerSession.customer_id !== order.customer_id) {
      return errorResponse('Unauthorized', 401);
    }
  }

  return jsonResponse({ order });
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

  if (data?.customer_id) {
    await supabase.from('notifications').insert({
      customer_id: data.customer_id,
      title: 'Order update',
      body: `Order ${data.order_number} is now ${body.status}`,
    });
  }

  return jsonResponse({ order: data });
});

export default orders;
