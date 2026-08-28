import { useCallback, useState } from 'react';
import { MessageSquare, X, Sparkles } from 'lucide-react';
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
        <div className="chat-widget-panel w-[min(100vw-2rem,22rem)] sm:w-96 overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(229,169,60,0.2)] bg-gradient-to-r from-accent/10 to-emerald/5">
            <span className="flex items-center gap-2 text-sm font-medium text-fg">
              <Sparkles className="w-4 h-4 text-accent" />
              {t('chat.widget_title', lang)}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full text-muted hover:text-fg hover:bg-white/5 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ChatThread messages={messages} viewer="customer" onSend={send} compact onDark />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="chat-widget-btn flex items-center gap-2 px-5 py-3.5 rounded-full text-accent transition-all hover:scale-105 active:scale-95"
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
