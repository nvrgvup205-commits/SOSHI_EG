import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import ChatThread from '../components/Chat/ChatThread';
import { api } from '../utils/api';
import { useLanguage } from '../hooks/useLanguage';
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

  useEffect(() => {
    if (!id) return;
    api.getOrder(id).then((r) => setOrder(r.order)).catch((e) => setError(e.message));
    api.getChat(id).then((r) => setMessages(r.messages)).catch(console.error);
  }, [id]);

  const send = async (text: string) => {
    const res = await api.sendChat(text, id);
    setMessages((prev) => [...prev, res.message]);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 text-danger">{error}</div>
    );
  }

  if (!order) {
    return <div className="min-h-screen bg-black pt-24 text-white/40 text-center">Loading...</div>;
  }

  const idx = Math.max(0, steps.indexOf(order.status));

  return (
    <div className="min-h-screen bg-black pb-24">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24 space-y-8">
        <div>
          <p className="label-luxury mb-2">{t('track.title', lang)}</p>
          <h1 className="font-display text-4xl text-white">#{order.order_number}</h1>
          <p className="text-white/40 mt-2">{formatDate(order.created_at, lang)}</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <div key={s} className={`text-center py-3 border text-[10px] uppercase tracking-wider ${
              i <= idx ? 'border-accent text-accent bg-accent/10' : 'border-white/10 text-white/30'
            }`}>
              {t(`status.${s}`, lang)}
            </div>
          ))}
        </div>

        <div className="card p-5 space-y-2">
          {(order.order_items || []).map((item) => (
            <div key={item.id} className="flex justify-between text-white/80">
              <span>{item.quantity}× {item.product_name}{item.notes ? ` (${item.notes})` : ''}</span>
              <span className="text-accent">{item.price_at_order}</span>
            </div>
          ))}
          <div className="flex justify-between text-white font-display text-xl pt-3 border-t border-white/10">
            <span>{t('cart.total', lang)}</span>
            <span className="text-accent">{order.total_price} {t('currency', lang)}</span>
          </div>
          <p className="text-white/50 text-sm">{t('checkout.cash', lang)}</p>
          {order.delivery_address && <p className="text-white/50 text-sm">{order.delivery_address}</p>}
        </div>

        <div>
          <h2 className="font-display text-2xl text-white mb-4">{t('orders.chat', lang)}</h2>
          <ChatThread messages={messages} viewer="customer" onSend={send} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
