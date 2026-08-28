import type { createSupabase } from './supabase';

export interface MenuCategory {
  slug: string;
  name_ar: string;
  name_en: string;
  name_ru: string;
}

export interface MenuProduct {
  id: string;
  name_ar: string;
  name_en: string;
  name_ru: string;
  price: number;
  category: string;
  description_ar: string | null;
  description_en: string | null;
  description_ru: string | null;
  is_new: boolean | null;
  is_popular: boolean | null;
  is_offer: boolean | null;
}

export interface MenuAddon {
  name_ar: string;
  name_en: string;
  name_ru: string;
  price: number;
}

export interface MenuSnapshot {
  categories: MenuCategory[];
  products: MenuProduct[];
  addons: MenuAddon[];
}

type SupabaseClient = ReturnType<typeof createSupabase>;

let cachedMenu: { json: string; expires: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchMenuSnapshot(supabase: SupabaseClient): Promise<MenuSnapshot> {
  const [categoriesRes, productsRes, addonsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('slug, name_ar, name_en, name_ru')
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select(
        'id, name_ar, name_en, name_ru, price, category, description_ar, description_en, description_ru, is_new, is_popular, is_offer',
      )
      .eq('is_available', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('addons')
      .select('name_ar, name_en, name_ru, price')
      .eq('is_active', true),
  ]);

  if (categoriesRes.error) throw new Error(categoriesRes.error.message);
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (addonsRes.error) throw new Error(addonsRes.error.message);

  return {
    categories: (categoriesRes.data || []) as MenuCategory[],
    products: (productsRes.data || []) as MenuProduct[],
    addons: (addonsRes.data || []) as MenuAddon[],
  };
}

/** Compact JSON grouped by category for the AI system prompt. */
export function serializeMenuForPrompt(menu: MenuSnapshot): string {
  const byCategory = new Map<string, MenuProduct[]>();
  for (const product of menu.products) {
    const list = byCategory.get(product.category) || [];
    list.push(product);
    byCategory.set(product.category, list);
  }

  const categoryMeta = menu.categories.map((cat) => ({
    slug: cat.slug,
    name_ar: cat.name_ar,
    name_en: cat.name_en,
    name_ru: cat.name_ru,
    items: (byCategory.get(cat.slug) || []).map((p) => ({
      id: p.id,
      name_ar: p.name_ar,
      name_en: p.name_en,
      name_ru: p.name_ru,
      price_egp: p.price,
      ...(p.description_ar || p.description_en || p.description_ru
        ? {
            description_ar: p.description_ar,
            description_en: p.description_en,
            description_ru: p.description_ru,
          }
        : {}),
      ...(p.is_new ? { is_new: true } : {}),
      ...(p.is_popular ? { is_popular: true } : {}),
      ...(p.is_offer ? { is_offer: true } : {}),
    })),
  }));

  const uncategorized = menu.products.filter(
    (p) => !menu.categories.some((c) => c.slug === p.category),
  );
  if (uncategorized.length > 0) {
    categoryMeta.push({
      slug: 'other',
      name_ar: 'أخرى',
      name_en: 'Other',
      name_ru: 'Другое',
      items: uncategorized.map((p) => ({
        id: p.id,
        name_ar: p.name_ar,
        name_en: p.name_en,
        name_ru: p.name_ru,
        price_egp: p.price,
      })),
    });
  }

  return JSON.stringify(
    {
      restaurant: 'SUSHI SHOP EGYPT',
      currency: 'EGP',
      categories: categoryMeta,
      addons: menu.addons.map((a) => ({
        name_ar: a.name_ar,
        name_en: a.name_en,
        name_ru: a.name_ru,
        price_egp: a.price,
      })),
    },
    null,
    0,
  );
}

export async function getMenuContextJson(supabase: SupabaseClient): Promise<string> {
  const now = Date.now();
  if (cachedMenu && cachedMenu.expires > now) return cachedMenu.json;

  const snapshot = await fetchMenuSnapshot(supabase);
  const json = serializeMenuForPrompt(snapshot);
  cachedMenu = { json, expires: now + CACHE_TTL_MS };
  return json;
}

/** Test helper — clears isolate cache between tests. */
export function clearMenuContextCache() {
  cachedMenu = null;
}
