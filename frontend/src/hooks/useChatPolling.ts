import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

function mergeMessages(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const msg of prev) map.set(msg.id, msg);
  for (const msg of incoming) map.set(msg.id, msg);
  return [...map.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function useChatPolling(
  enabled: boolean,
  load: () => Promise<ChatMessage[]>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  intervalMs = 3000,
) {
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const incoming = await loadRef.current();
        if (!cancelled) setMessages((prev) => mergeMessages(prev, incoming));
      } catch {
        // ignore transient poll errors
      }
    };

    tick();
    const timer = window.setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs, setMessages]);
}
