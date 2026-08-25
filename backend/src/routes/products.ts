import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireStaff } from '../middleware/auth';
import { buildProductImagePath, extensionForType } from '../lib/storagePaths';

type AppEnv = { Bindings: Env; Variables: { staff?: Record<string, unknown> } };

const products = new Hono<AppEnv>();
const IMAGE_BUCKET = 'soshi-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function asFile(value: unknown): File | null {
  if (value instanceof File) return value;
  if (
    value &&
    typeof value === 'object' &&
    'arrayBuffer' in value &&
    'type' in value &&
    'name' in value
  ) {
    return value as File;
  }
  return null;
}

async function uploadProductFile(
  supabase: ReturnType<typeof createSupabase>,
  folder: string,
  variant: 'original' | 'compressed' | 'thumb',
  file: File
) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${variant} image is too large`);
  }
  if (!file.type.startsWith('image/')) {
    throw new Error(`${variant} is not an image`);
  }
  const path = buildProductImagePath(folder, variant, extensionForType(file.type));
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'image/webp',
    cacheControl: '31536000, public',
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

products.post('/images', requireStaff, async (c) => {
  const body = await c.req.parseBody();
  const original = asFile(body.original);
  const compressed = asFile(body.compressed);
  const thumbnail = asFile(body.thumbnail) || asFile(body.thumb);
  const folder =
    typeof body.folder === 'string' && body.folder.trim()
      ? body.folder.trim()
      : crypto.randomUUID();

  const primary = compressed || original || thumbnail;
  if (!primary) return errorResponse('No image uploaded', 400);

  const supabase = createSupabase(c.env);
  try {
    const [image_original_url, image_compressed_url, image_thumbnail_url] = await Promise.all([
      uploadProductFile(supabase, folder, 'original', original || primary),
      uploadProductFile(supabase, folder, 'compressed', compressed || primary),
      uploadProductFile(supabase, folder, 'thumb', thumbnail || compressed || primary),
    ]);
    return jsonResponse({
      image_original_url,
      image_compressed_url,
      image_thumbnail_url,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Upload failed', 500);
  }
});

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
