import { useCallback, useState } from 'react';
import CustomerShell from '../components/Shared/CustomerShell';
import ChatThread from '../components/Chat/ChatThread';
import { api } from '../utils/api';
import { useLanguage } from '../hooks/useLanguage';
import { useChatPolling } from '../hooks/useChatPolling';
import { t } from '../utils/i18n';
import type { ChatMessage } from '../types';

export default function ChatPage() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const load = useCallback(
    () => api.getChat(undefined, lang).then((r) => r.messages),
    [lang],
  );
  useChatPolling(true, load, setMessages);

  const send = async (text: string) => {
    const res = await api.sendChat(text, undefined, lang);
    setMessages((prev) => [...prev, res.message]);
  };

  return (
    <CustomerShell>
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24">
        <h1 className="font-display text-4xl text-fg mb-6">{t('chat.title', lang)}</h1>
        <ChatThread messages={messages} viewer="customer" onSend={send} />
      </div>
    </CustomerShell>
  );
}
