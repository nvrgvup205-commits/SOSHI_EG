import { useEffect, useState } from 'react';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import ChatThread from '../components/Chat/ChatThread';
import { api } from '../utils/api';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../utils/i18n';
import type { ChatMessage } from '../types';

export default function ChatPage() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    api.getChat().then((r) => setMessages(r.messages)).catch(console.error);
  }, []);

  const send = async (text: string) => {
    const res = await api.sendChat(text);
    setMessages((prev) => [...prev, res.message]);
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24">
        <h1 className="font-display text-4xl text-white mb-6">{t('chat.title', lang)}</h1>
        <ChatThread messages={messages} viewer="customer" onSend={send} />
      </div>
      <Footer />
    </div>
  );
}
