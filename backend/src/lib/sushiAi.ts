import type { Ai } from '@cloudflare/workers-types';
import type { LangCode } from './translate';

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const LANG_INSTRUCTION: Record<LangCode, string> = {
  ar: 'Respond in Arabic (Egyptian-friendly when natural).',
  en: 'Respond in English.',
  ru: 'Respond in Russian.',
};

function buildSystemPrompt(lang: LangCode): string {
  return (
    'You are the Senior Sushi Expert & Sales Consultant for "SUSHI SHOP EGYPT" on Egypt\'s North Coast. ' +
    'Tone: authoritative, direct, analytical, professional. No filler phrases. ' +
    'Welcome guests in their language. Ask whether they prefer RAW vs COOKED, SPICY vs MILD. ' +
    'Recommend specific rolls, combos, appetizers, and sauces with precise flavor pairing logic. ' +
    'Articulate dish value clearly. Keep replies concise (2-4 sentences unless listing options). ' +
    LANG_INSTRUCTION[lang]
  );
}

function extractReply(result: unknown): string {
  if (!result) return '';
  if (typeof result === 'string') return result.trim();
  if (typeof result === 'object') {
    const r = result as Record<string, unknown>;
    const text = r.response ?? r.text ?? r.answer;
    if (typeof text === 'string') return text.trim();
  }
  return '';
}

export async function runSushiAi(
  ai: Ai,
  message: string,
  lang: LangCode,
  history: Array<{ role: string; content: string }>,
): Promise<string> {
  const messages = [
    { role: 'system', content: buildSystemPrompt(lang) },
    ...history.slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const result = await ai.run(MODEL, { messages, max_tokens: 512 });
  const reply = extractReply(result);
  if (!reply) throw new Error('Empty AI response');
  return reply;
}
