import { useCallback, useEffect, useState } from 'react';
import { Bot, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { api } from '../../utils/api';
import { t } from '../../utils/i18n';

interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatWidget() {
  const { type } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const hidden =
    type !== 'customer'
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/staff')
    || location.pathname === '/login'
    || location.pathname === '/chat';

  const send = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const userMsg: AiMessage = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setText('');
    setSending(true);
    try {
      const res = await api.aiChat(trimmed, lang, next.slice(-8));
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('chat.error', lang) }]);
    } finally {
      setSending(false);
    }
  }, [messages, lang]);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = lang === 'ar'
        ? 'مرحباً. أنا خبير السوشي في سوشي شوب مصر. تفضّل ني أم مطبوخ؟ حار أم خفيف؟'
        : lang === 'ru'
          ? 'Здравствуйте. Я сомелье суши Sushi Shop Egypt. Предпочитаете сырое или горячее?'
          : 'Welcome. I am the sushi expert at Sushi Shop Egypt. Raw or cooked? Spicy or mild?';
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [open, messages.length, lang]);

  if (hidden) return null;

  return (
    <>
      {open && (
        <div className="ai-chat-drawer animate-slide-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(229,169,60,0.2)]">
            <span className="flex items-center gap-2 text-sm font-medium text-fg">
              <Bot className="w-5 h-5 text-accent" />
              {t('chat.ai_title', lang)}
            </span>
            <button type="button" onClick={() => setOpen(false)} className="p-1 text-muted hover:text-fg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[90%] text-sm px-3 py-2 rounded-xl ${
                m.role === 'user' ? 'ms-auto bg-accent/20 text-fg' : 'me-auto bg-white/5 text-fg'
              }`}>
                {m.content}
              </div>
            ))}
            {sending && <p className="text-muted text-xs animate-pulse">...</p>}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); void send(text); }}
            className="flex gap-2 p-3 border-t border-[var(--app-line)]"
          >
            <input
              className="input-field text-sm py-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('chat.placeholder', lang)}
            />
            <button type="submit" disabled={sending} className="btn-luxury-filled text-xs px-3 py-2">
              {t('btn.send', lang)}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`ai-peek-btn ${open ? 'ai-peek-open' : ''}`}
        aria-label={t('chat.widget_label', lang)}
      >
        <Bot className="w-6 h-6 text-accent" />
      </button>
    </>
  );
}
