export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+?[1-9]\d{7,14}|0\d{9,10})$/.test(cleaned);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('0')) return '+20' + cleaned.slice(1);
  if (cleaned.startsWith('20') && !cleaned.startsWith('+')) return '+' + cleaned;
  if (!cleaned.startsWith('+')) return '+' + cleaned;
  return cleaned;
}

export function formatCurrency(amount: number, currency = 'EGP'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatDate(date: string | null, lang: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
