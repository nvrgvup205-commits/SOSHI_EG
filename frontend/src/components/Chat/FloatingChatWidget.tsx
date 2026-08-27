import { useCallback, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useChatPolling } from '../../hooks/useChatPolling';
import { api } from '../../utils/api';
import { t } from '../../utils/i18n';
import type { ChatMessage } from '../../types';
import ChatThread from './ChatThread';

export default function FloatingChatWidget() {
  const { type } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const hidden =
    type !== 'customer'
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/staff')
    || location.pathname === '/login'
    || location.pathname === '/chat';

  const load = useCallback(
    () => api.getChat(undefined, lang).then((r) => r.messages),
    [lang],
  );

  useChatPolling(!hidden && open, load, setMessages);

  const send = async (text: string) => {
    const res = await api.sendChat(text, undefined, lang);
    setMessages((prev) => [...prev, res.message]);
  };

  if (hidden) return null;

  return (
    <div
      className="fixed z-[60] flex flex-col items-end gap-3"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
        insetInlineEnd: 'max(1rem, env(safe-area-inset-end))',
      }}
    >
      {open && (
        <div className="w-[min(100vw-2rem,22rem)] sm:w-96 shadow-2xl border border-[var(--app-line)] bg-[var(--app-card)] overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--app-line)] bg-accent/10">
            <span className="text-sm font-medium text-fg">{t('chat.widget_title', lang)}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 text-muted hover:text-fg"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ChatThread messages={messages} viewer="customer" onSend={send} compact />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors"
        aria-expanded={open}
      >
        <MessageSquare className="w-5 h-5 shrink-0" />
        <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
          {t('chat.widget_label', lang)}
        </span>
      </button>
    </div>
  );
}
