const LANG: Record<string, string> = { ar: 'ar', en: 'en', ru: 'ru' };

export async function translateText(
  text: string,
  from: string,
  to: string,
): Promise<string | null> {
  const src = LANG[from] || from;
  const dst = LANG[to] || to;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (src === dst) return trimmed;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed.slice(0, 500))}&langpair=${src}|${dst}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const translated = data.responseData?.translatedText?.trim();
    if (!translated || translated.toLowerCase() === trimmed.toLowerCase()) return null;
    return translated;
  } catch {
    return null;
  }
}

export function otherLanguage(senderLang: string, customerLang: string, senderType: string): string {
  if (senderType === 'staff') return customerLang || 'ar';
  return 'ar';
}
