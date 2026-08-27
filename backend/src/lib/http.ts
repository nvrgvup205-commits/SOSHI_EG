export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message, status }, status);
}

export function isJsonSyntaxError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err instanceof SyntaxError || /JSON|Unexpected (token|non-whitespace)/i.test(err.message);
}

export async function readJsonBody<T>(request: Request): Promise<{ data?: T; error?: string }> {
  const text = await request.text();
  const trimmed = text.trim();
  if (!trimmed) return { data: {} as T };
  try {
    return { data: JSON.parse(trimmed) as T };
  } catch (err) {
    return {
      error: isJsonSyntaxError(err)
        ? 'Invalid JSON in request body'
        : err instanceof Error
          ? err.message
          : 'Invalid JSON in request body',
    };
  }
}

export function explainNonJson(status: number, body: string): string {
  const snippet = body.replace(/\s+/g, ' ').trim().slice(0, 160);
  if (/^404 Not Found/i.test(snippet) || status === 404) {
    return `API route not found (${status}). Redeploy the backend worker.`;
  }
  if (!snippet) return `Empty response (${status})`;
  return `Server returned non-JSON (${status}): ${snippet}`;
}

export const PRODUCT_COLUMNS = [
  'name_ar',
  'name_en',
  'name_ru',
  'description_ar',
  'description_en',
  'description_ru',
  'price',
  'category',
  'category_id',
  'is_available',
  'sort_order',
  'video_url',
  'is_new',
  'is_popular',
  'is_offer',
  'image_original_url',
  'image_compressed_url',
  'image_thumbnail_url',
] as const;

export function sanitizeProductPayload(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of PRODUCT_COLUMNS) {
    if (input[key] !== undefined) out[key] = input[key];
  }
  if (typeof out.price === 'string') out.price = Number(out.price);
  if (typeof out.sort_order === 'string') out.sort_order = Number(out.sort_order);
  if (Number.isNaN(out.price as number)) delete out.price;
  if (Number.isNaN(out.sort_order as number)) delete out.sort_order;
  return out;
}
