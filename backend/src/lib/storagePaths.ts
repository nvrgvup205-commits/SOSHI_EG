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
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${safeImageFolder(folder)}/${variant}-${Date.now()}-${suffix}${ext}`;
}

export function extensionForType(type: string): string {
  if (type === 'image/png') return '.png';
  if (type === 'image/jpeg' || type === 'image/jpg') return '.jpg';
  if (type === 'image/gif') return '.gif';
  return '.webp';
}
