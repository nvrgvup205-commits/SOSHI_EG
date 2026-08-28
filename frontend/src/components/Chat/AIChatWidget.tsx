import { useCallback, useEffect, useState } from 'react';
import { Bot, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { api } from '../../utils/api';
import { t } from '../../utils/i18n';
import { loadAiChat, saveAiChat, type AiMessage } from '../../utils/aiChatStore';

function greetingFor(lang: string) {
  if (lang === 'ar') return 'مرحباً. أنا خبير السوشي في سوشي شوب مصر. تفضّل ني أم مطبوخ؟ حار أم خفيف؟';
  if (lang === 'ru') return 'Здравствуйте. Я сомелье суши Sushi Shop Egypt. Предпочитаете сырое или горячее?';
  return 'Welcome. I am the sushi expert at Sushi Shop Egypt. Raw or cooked? Spicy or mild?';
}

export default function AIChatWidget() {
  const { type } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>(() => loadAiChat());
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const hidden =
    type !== 'customer'
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/staff')
    || location.pathname === '/login'
    || location.pathname === '/chat';

  useEffect(() => {
    saveAiChat(messages);
  }, [messages]);

  const close = useCallback(() => setOpen(false), []);

  const openChat = () => {
    setOpen(true);
    setMessages((prev) => (
      prev.length === 0
        ? [{ role: 'assistant', content: greetingFor(lang) }]
        : prev
    ));
  };

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
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (hidden) return null;

  return (
    <>
      {open && (
        <button
          type="button"
          className="ai-chat-backdrop"
          aria-label={t('chat.close', lang)}
          onClick={close}
        />
      )}

      {open && (
        <div className="ai-chat-drawer animate-slide-in" role="dialog" aria-label={t('chat.ai_title', lang)}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(229,169,60,0.25)]">
            <span className="flex items-center gap-2 text-sm font-medium text-[#f8fafc]">
              <Bot className="w-5 h-5 text-accent" />
              {t('chat.ai_title', lang)}
            </span>
            <button
              type="button"
              onClick={close}
              className="ai-chat-close"
              aria-label={t('chat.close', lang)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`max-w-[90%] text-sm px-3 py-2 rounded-xl leading-relaxed ${
                  m.role === 'user' ? 'ms-auto ai-bubble-user' : 'me-auto ai-bubble-bot'
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && <p className="text-[#f8fafc]/70 text-xs animate-pulse">...</p>}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); void send(text); }}
            className="flex gap-2 p-3 border-t border-[rgba(229,169,60,0.2)]"
          >
            <input
              className="ai-chat-input"
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
        onClick={() => (open ? close() : openChat())}
        className={`ai-peek-btn ${open ? 'ai-peek-open' : ''}`}
        aria-label={t('chat.widget_label', lang)}
        aria-expanded={open}
      >
        {open ? <X className="w-6 h-6 text-accent" /> : <Bot className="w-6 h-6 text-accent" />}
      </button>
    </>
  );
}
