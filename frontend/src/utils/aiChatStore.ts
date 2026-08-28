export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

const KEY = 'soshi_ai_chat';

export function loadAiChat(): AiMessage[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AiMessage => (
      Boolean(item)
      && (item.role === 'user' || item.role === 'assistant')
      && typeof item.content === 'string'
      && item.content.trim().length > 0
    ));
  } catch {
    return [];
  }
}

export function saveAiChat(messages: AiMessage[]) {
  localStorage.setItem(KEY, JSON.stringify(messages.slice(-40)));
}

export function clearAiChat() {
  localStorage.removeItem(KEY);
}
