const PASSWORD_SALT = 'soshi-admin-salt-v1';
const SESSION_TTL_HOURS = 72;

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(PASSWORD_SALT + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const hash = await hashPassword(password);
  return hash === stored;
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function sessionExpiry(): string {
  const date = new Date();
  date.setHours(date.getHours() + SESSION_TTL_HOURS);
  return date.toISOString();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('0')) return '+20' + cleaned.slice(1);
  if (cleaned.startsWith('20') && !cleaned.startsWith('+')) return '+' + cleaned;
  if (!cleaned.startsWith('+')) return '+' + cleaned;
  return cleaned;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\+[1-9]\d{7,14}$/.test(normalized);
}

export { errorResponse, jsonResponse } from './http';
