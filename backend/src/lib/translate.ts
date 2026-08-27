import type { Ai } from '@cloudflare/workers-types';

export const LANG_CODES = ['ar', 'en', 'ru'] as const;
export type LangCode = (typeof LANG_CODES)[number];

const M2M100: Record<LangCode, string> = {
  ar: 'arabic',
  en: 'english',
  ru: 'russian',
};

const LANG_NAMES: Record<LangCode, string> = {
  ar: 'Arabic',
  en: 'English',
  ru: 'Russian',
};

/** Best quality on Workers AI free tier — 70B instruct, excellent multilingual + dialect. */
const PRIMARY_LLM = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const FALLBACK_LLM = '@cf/openai/gpt-oss-120b';
const M2M_MODEL = '@cf/meta/m2m100-1.2b';

type TranslationCache = { target: LangCode; text: string };

export function normalizeLang(code: string | null | undefined): LangCode {
  const c = (code || 'ar').toLowerCase().slice(0, 2);
  if (c === 'en' || c === 'ru') return c;
  return 'ar';
}

export function detectMessageLanguage(text: string): LangCode {
  const trimmed = text.trim();
  if (!trimmed) return 'ar';
  const arabic = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
  const cyrillic = (trimmed.match(/[\u0400-\u04FF]/g) || []).length;
  const latin = (trimmed.match(/[A-Za-z]/g) || []).length;
  if (arabic >= cyrillic && arabic >= latin && arabic > 0) return 'ar';
  if (cyrillic > latin && cyrillic > 0) return 'ru';
  if (latin > 0) return 'en';
  return 'ar';
}

function extractTranslation(result: unknown): string | null {
  if (!result) return null;
  if (typeof result === 'string') {
    const trimmed = result.trim();
    return trimmed || null;
  }
  if (typeof result === 'object') {
    const record = result as Record<string, unknown>;
    const candidate = record.translated_text ?? record.translation ?? record.response ?? record.text;
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      return trimmed || null;
    }
  }
  return null;
}

function isUsefulTranslation(source: string, translated: string | null): translated is string {
  if (!translated) return false;
  const a = source.trim().toLowerCase();
  const b = translated.trim().toLowerCase();
  return Boolean(b) && a !== b;
}

function buildSystemPrompt(from: LangCode, to: LangCode): string {
  const dialectNote = from === 'ar'
    ? 'The source may be Egyptian Arabic dialect (عامية مصرية). Translate the MEANING accurately, not word-by-word. '
    : '';
  return (
    `You are an expert human translator for a sushi restaurant customer-support chat. ` +
    `Translate from ${LANG_NAMES[from]} to ${LANG_NAMES[to]}. ` +
    dialectNote +
    'Rules: preserve intent; use natural native phrasing; do NOT invent names or facts; ' +
    'do NOT add greetings or explanations; output ONLY the translated message text.'
  );
}

async function runLlm(ai: Ai, model: string, from: LangCode, to: LangCode, text: string): Promise<string | null> {
  try {
    const result = await ai.run(model, {
      messages: [
        { role: 'system', content: buildSystemPrompt(from, to) },
        { role: 'user', content: text.slice(0, 2000) },
      ],
      max_tokens: 400,
      temperature: 0.1,
    });
    const translated = extractTranslation(result);
    return isUsefulTranslation(text, translated) ? translated : null;
  } catch {
    return null;
  }
}

async function translateWithLLM(
  ai: Ai,
  text: string,
  from: LangCode,
  to: LangCode,
): Promise<string | null> {
  const primary = await runLlm(ai, PRIMARY_LLM, from, to, text);
  if (primary) return primary;
  const fallback = await runLlm(ai, FALLBACK_LLM, from, to, text);
  if (fallback) return fallback;
  return null;
}

async function translateWithM2M100(
  ai: Ai,
  text: string,
  from: LangCode,
  to: LangCode,
): Promise<string | null> {
  try {
    const result = await ai.run(M2M_MODEL, {
      text: text.slice(0, 2000),
      source_lang: M2M100[from],
      target_lang: M2M100[to],
    });
    const translated = extractTranslation(result);
    return isUsefulTranslation(text, translated) ? translated : null;
  } catch {
    return null;
  }
}

export function readTranslationCache(raw: string | null | undefined, target: LangCode): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TranslationCache;
    if (parsed?.target === target && typeof parsed.text === 'string' && parsed.text.trim()) {
      return parsed.text.trim();
    }
  } catch {
    // legacy plain-text cache
    if (raw.trim()) return raw.trim();
  }
  return null;
}

export function writeTranslationCache(target: LangCode, text: string): string {
  return JSON.stringify({ target, text });
}

export async function translateText(
  ai: Ai | undefined,
  text: string,
  from: string,
  to: string,
): Promise<string | null> {
  const src = normalizeLang(from);
  const dst = normalizeLang(to);
  const trimmed = text.trim();
  if (!trimmed || src === dst) return null;
  if (!ai) return null;

  const llm = await translateWithLLM(ai, trimmed, src, dst);
  if (llm) return llm;
  return translateWithM2M100(ai, trimmed, src, dst);
}

export type ChatMessageRow = {
  id: string;
  sender_type: string;
  message: string;
  language?: string | null;
  translated_message?: string | null;
  is_translated?: boolean;
  [key: string]: unknown;
};

export async function localizeMessages(
  ai: Ai | undefined,
  messages: ChatMessageRow[],
  viewer: 'customer' | 'staff',
  viewerLang: LangCode,
): Promise<ChatMessageRow[]> {
  return Promise.all(
    messages.map(async (msg) => {
      const isOwn = viewer === 'staff' ? msg.sender_type === 'staff' : msg.sender_type === 'customer';
      if (isOwn) {
        return { ...msg, translated_message: null, is_translated: false };
      }

      const messageLang = normalizeLang(msg.language || detectMessageLanguage(msg.message));
      if (messageLang === viewerLang) {
        return { ...msg, translated_message: null, is_translated: false };
      }

      const cached = readTranslationCache(msg.translated_message, viewerLang);
      if (cached) {
        return { ...msg, translated_message: cached, is_translated: true };
      }

      const translated = await translateText(ai, msg.message, messageLang, viewerLang);
      return {
        ...msg,
        translated_message: translated,
        is_translated: Boolean(translated),
      };
    }),
  );
}
