/** Pure helpers for Soshi product images — no DOM. */

export type ProductImageUrls = {
  image_original_url: string | null;
  image_compressed_url: string | null;
  image_thumbnail_url: string | null;
};

export function scaledDimensions(
  width: number,
  height: number,
  maxSize: number
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (!width || !height || longest <= maxSize) {
    return { width: Math.max(1, width || 1), height: Math.max(1, height || 1) };
  }
  const ratio = maxSize / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export function replaceExtension(name: string, extension: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'image';
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return `${base}${ext}`;
}

export function safeImageFolder(folder: string): string {
  const cleaned = folder
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '');
  return cleaned.slice(0, 80) || crypto.randomUUID();
}

export function buildProductImagePath(
  folder: string,
  variant: 'original' | 'compressed' | 'thumb',
  extension = '.webp'
): string {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  const suffix = Math.random().toString(16).slice(2, 10);
  return `${safeImageFolder(folder)}/${variant}-${Date.now()}-${suffix}${ext}`;
}

export function pickProductImage(
  product: Partial<ProductImageUrls> | null | undefined
): string | null {
  if (!product) return null;
  return (
    product.image_compressed_url ||
    product.image_original_url ||
    product.image_thumbnail_url ||
    null
  );
}

export function pickProductThumbnail(
  product: Partial<ProductImageUrls> | null | undefined
): string | null {
  if (!product) return null;
  return (
    product.image_thumbnail_url ||
    product.image_compressed_url ||
    product.image_original_url ||
    null
  );
}
