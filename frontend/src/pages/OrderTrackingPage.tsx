import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomerShell from '../components/Shared/CustomerShell';
import ChatThread from '../components/Chat/ChatThread';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../hooks/useLanguage';
import { useChatPolling } from '../hooks/useChatPolling';
import { t } from '../utils/i18n';
import { formatDate } from '../utils/validators';
import type { ChatMessage, Order, OrderStatus } from '../types';

const steps: OrderStatus[] = ['pending', 'processing', 'ready', 'delivered'];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');

  const loadOrder = useCallback(() => {
    if (!id) return;
    api.getOrder(id).then((r) => setOrder(r.order)).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  useEffect(() => {
    if (!id || !supabase) return;
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'soshi', table: 'orders', filter: `id=eq.${id}` },
        (payload) => {
          const row = payload.new as Order;
          setOrder((prev) => (prev ? { ...prev, status: row.status } : prev));
        },
      )
      .subscribe();
    return () => { void supabase?.removeChannel(channel); };
  }, [id]);

  const loadChat = useCallback(
    () => (id ? api.getChat(id, lang).then((r) => r.messages) : Promise.resolve([])),
    [id, lang],
  );
  useChatPolling(Boolean(id), loadChat, setMessages);

  const send = async (text: string) => {
    const res = await api.sendChat(text, id, lang);
    setMessages((prev) => [...prev, res.message]);
  };

  if (error) {
    return (
      <div className="min-h-screen app-shell pt-24 px-6 text-danger">{error}</div>
    );
  }

  if (!order) {
    return <div className="min-h-screen app-shell pt-24 text-muted text-center">{t('error.loading', lang)}</div>;
  }

  const idx = Math.max(0, steps.indexOf(order.status));

  return (
    <CustomerShell>
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24 space-y-8">
        <div>
          <p className="label-luxury mb-2">{t('track.title', lang)}</p>
          <h1 className="font-display text-4xl text-fg">#{order.order_number}</h1>
          <p className="text-muted mt-2">{formatDate(order.created_at, lang)}</p>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 inset-x-0 h-0.5 bg-[var(--app-line)] -translate-y-1/2" />
          <div
            className="absolute top-1/2 start-0 h-0.5 bg-accent -translate-y-1/2 transition-all duration-700"
            style={{ width: `${(idx / (steps.length - 1)) * 100}%` }}
          />
          <div className="relative grid grid-cols-4 gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                  i <= idx
                    ? 'border-accent bg-accent text-emerald-950'
                    : 'border-[var(--app-line)] bg-[var(--app-card)] text-muted'
                }`}>
                  {i + 1}
                </span>
                <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider text-center ${
                  i <= idx ? 'text-accent' : 'text-muted'
                }`}>
                  {t(`status.${s}`, lang)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-2 rounded-2xl">
          {(order.order_items || []).map((item) => (
            <div key={item.id} className="flex justify-between text-muted">
              <span>{item.quantity}× {item.product_name}{item.notes ? ` (${item.notes})` : ''}</span>
              <span className="text-accent">{item.price_at_order}</span>
            </div>
          ))}
          <div className="flex justify-between text-fg font-display text-xl pt-3 border-t border-[var(--app-line)]">
            <span>{t('cart.total', lang)}</span>
            <span className="text-accent">{order.total_price} {t('currency', lang)}</span>
          </div>
          <p className="text-muted text-sm">{t('checkout.cash', lang)}</p>
          {order.delivery_address && <p className="text-muted text-sm">{order.delivery_address}</p>}
        </div>

        <div>
          <h2 className="font-display text-2xl text-fg mb-4">{t('orders.chat', lang)}</h2>
          <ChatThread messages={messages} viewer="customer" onSend={send} />
        </div>
      </div>
    </CustomerShell>
  );
}
