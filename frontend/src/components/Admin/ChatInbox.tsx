import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import ChatThread from '../Chat/ChatThread';
import type { ChatMessage, Conversation } from '../../types';

export default function ChatInbox() {
  const { lang } = useLanguage();
  const [list, setList] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const loadList = () => api.getInbox().then((r) => setList(r.conversations)).catch(console.error);
  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    if (!active) return;
    api.getInboxThread(active, lang).then((r) => setMessages(r.messages)).catch(console.error);
  }, [active, lang]);

  const open = (id: string) => {
    setActive(id);
  };

  const send = async (text: string) => {
    if (!active) return;
    const res = await api.sendStaffChat(active, text, lang);
    setMessages((prev) => [...prev, res.message]);
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-fg mb-6">{t('admin.chat', lang)}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => open(c.id)}
              className={`w-full card p-4 text-start ${active === c.id ? 'border-accent' : ''}`}
            >
              <div className="text-fg">{c.customers?.full_name || 'Customer'}</div>
              <div className="text-muted text-xs">{c.kind}{c.orders?.order_number ? ` #${c.orders.order_number}` : ''}</div>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2">
          {active ? (
            <ChatThread messages={messages} viewer="staff" onSend={send} />
          ) : (
            <div className="card p-12 text-center text-muted">{t('staff.chat', lang)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
