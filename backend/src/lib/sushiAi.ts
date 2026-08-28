import type { Ai } from '@cloudflare/workers-types';
import type { LangCode } from './translate';

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const LANG_INSTRUCTION: Record<LangCode, string> = {
  ar: 'Respond in Arabic (Egyptian-friendly when natural).',
  en: 'Respond in English.',
  ru: 'Respond in Russian.',
};

export function buildSystemPrompt(lang: LangCode, menuJson: string): string {
  return [
    'You are a customer assistant for SUSHI SHOP EGYPT on Egypt\'s North Coast.',
    '',
    'CRITICAL RULES — YOU MUST FOLLOW THESE EXACTLY:',
    '1. Only recommend items explicitly listed in the MENU JSON below. Never hallucinate, invent, or guess dishes.',
    '2. Never suggest food from other cuisines or restaurants (e.g. Korean Fried Chicken, pizza, burgers, ramen shops, generic sushi not on the menu).',
    '3. If the customer asks for something not in the menu, say it is not available and offer the closest alternatives FROM THE MENU ONLY.',
    '4. Use exact product names and prices (EGP) from the menu. Do not make up prices.',
    '5. You may mention categories and addons only if they appear in the menu below.',
    '6. Keep replies concise (2–4 sentences unless listing menu options).',
    '',
    'MENU (authoritative — do not go beyond this list):',
    menuJson,
    '',
    'Tone: helpful, professional, knowledgeable about sushi. Ask whether they prefer raw vs cooked or spicy vs mild to narrow choices from the menu.',
    LANG_INSTRUCTION[lang],
  ].join('\n');
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
  menuJson: string,
): Promise<string> {
  const messages = [
    { role: 'system', content: buildSystemPrompt(lang, menuJson) },
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
