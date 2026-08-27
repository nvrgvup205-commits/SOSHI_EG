import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function ChatThread({
  messages,
  viewer,
  onSend,
}: {
  messages: ChatMessage[];
  viewer: 'customer' | 'staff';
  onSend: (text: string) => Promise<void>;
}) {
  const { lang } = useLanguage();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const display = (msg: ChatMessage) => {
    if (viewer === 'staff') {
      if (msg.sender_type === 'customer' && msg.translated_message) return msg.translated_message;
      return msg.message;
    }
    if (msg.sender_type === 'staff' && msg.translated_message) return msg.translated_message;
    return msg.message;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setSending(true);
    try {
      await onSend(value);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-muted text-center py-10">{t('chat.empty', lang)}</p>}
        {messages.map((msg) => {
          const mine = viewer === 'staff' ? msg.sender_type === 'staff' : msg.sender_type === 'customer';
          return (
            <div key={msg.id} className={`max-w-[85%] ${mine ? 'ms-auto' : 'me-auto'}`}>
              <div className={`px-4 py-2 ${mine ? 'bg-accent/20 text-fg' : 'bg-[color-mix(in_srgb,var(--app-fg)_8%,transparent)] text-fg'}`}>
                {display(msg)}
              </div>
              {msg.is_translated && (
                <p className="text-[10px] text-muted mt-1">{t('chat.translated', lang)}</p>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="flex gap-2 p-3 border-t border-[var(--app-line)]">
        <input
          className="input-field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('chat.placeholder', lang)}
        />
        <button type="submit" disabled={sending} className="btn-luxury-filled text-xs px-4">
          {t('btn.send', lang)}
        </button>
      </form>
    </div>
  );
}
