import { useNavigate } from 'react-router-dom';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import { CartQuantityControl } from '../components/Products/ProductCard';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { t, getProductName } from '../utils/i18n';
import { api } from '../utils/api';

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-6">{t('cart.title', lang)}</h1>

        {items.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">{t('cart.empty', lang)}</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🍣</span>
                  <div>
                    <div className="font-semibold">{getProductName(item.product, lang)}</div>
                    <div className="text-primary font-bold">{item.product.price} {t('currency', lang)}</div>
                  </div>
                </div>
                <CartQuantityControl productId={item.product.id} quantity={item.quantity} />
              </div>
            ))}

            <div className="card p-6 flex items-center justify-between">
              <span className="text-lg font-semibold">{t('cart.total', lang)}</span>
              <span className="text-2xl font-bold text-primary">{total.toFixed(0)} {t('currency', lang)}</span>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full text-lg">
              {t('cart.checkout', lang)}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
