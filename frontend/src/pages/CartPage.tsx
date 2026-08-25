import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { t, getProductName } from '../utils/i18n';
import { api } from '../utils/api';

function QuantityControl({ productId, quantity }: { productId: string; quantity: number }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => updateQuantity(productId, quantity - 1)}
        className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/50 transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-display text-xl text-white w-8 text-center">{quantity}</span>
      <button
        onClick={() => updateQuantity(productId, quantity + 1)}
        className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/50 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => removeItem(productId)}
        className="ms-2 text-white/30 hover:text-danger transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, total, clearCart } = useCart();
  const { lang } = useLanguage();
  const { type } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (type !== 'customer') {
      navigate('/login');
      return;
    }
    try {
      await api.createOrder({
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      clearCart();
      alert('Order placed successfully!');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Order failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full">
        <p className="label-luxury mb-2">Your Order</p>
        <h1 className="font-display text-4xl text-white mb-2">{t('cart.title', lang)}</h1>
        <div className="divider-gold mb-10 !mx-0" />

        {items.length === 0 ? (
          <div className="card p-16 text-center">
            <span className="text-5xl block mb-4 opacity-40">🍣</span>
            <p className="text-white/40">{t('cart.empty', lang)}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <span className="text-4xl">🍣</span>
                  <div>
                    <div className="font-display text-xl text-white">{getProductName(item.product, lang)}</div>
                    <div className="text-accent font-display text-lg mt-1">
                      {item.product.price} {t('currency', lang)}
                    </div>
                  </div>
                </div>
                <QuantityControl productId={item.product.id} quantity={item.quantity} />
              </div>
            ))}

            <div className="card p-6 flex items-center justify-between mt-8">
              <span className="text-white/50 uppercase tracking-wider text-sm">{t('cart.total', lang)}</span>
              <span className="font-display text-3xl text-accent">
                {total.toFixed(0)} {t('currency', lang)}
              </span>
            </div>

            <button onClick={handleCheckout} className="btn-luxury-filled w-full text-sm mt-4">
              {t('cart.checkout', lang)}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
