import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import CustomerShell from '../components/Shared/CustomerShell';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import { t, getProductName, localizedName } from '../utils/i18n';
import { pickProductThumbnail } from '../utils/productImage';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, lineTotal } = useCart();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <CustomerShell>
      <div className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full pt-24">
        <p className="label-luxury mb-2">Your Order</p>
        <h1 className="font-display text-4xl text-fg mb-2">{t('cart.title', lang)}</h1>
        <div className="divider-gold mb-10 !mx-0" />

        {items.length === 0 ? (
          <div className="card p-16 text-center">
            <span className="text-5xl block mb-4 opacity-40">🍣</span>
            <p className="text-muted">{t('cart.empty', lang)}</p>
            <Link to="/" className="btn-luxury mt-6 inline-flex">{t('nav.products', lang)}</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="card p-5 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {pickProductThumbnail(item.product) ? (
                      <img
                        src={pickProductThumbnail(item.product)!}
                        alt=""
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🍣</span>
                    )}
                    <div className="min-w-0">
                      <div className="font-display text-xl text-fg">{getProductName(item.product, lang)}</div>
                      <div className="text-accent font-display text-lg mt-1">
                        {lineTotal(item)} {t('currency', lang)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => updateQuantity(index, item.quantity - 1)} className="w-9 h-9 border border-[var(--app-line)] flex items-center justify-center text-muted">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-display text-xl text-fg w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, item.quantity + 1)} className="w-9 h-9 border border-[var(--app-line)] flex items-center justify-center text-muted">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeItem(index)} className="ms-2 text-muted hover:text-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.addons.length > 0 && (
                  <p className="text-muted text-sm">
                    {item.addons.map((a) => localizedName(a, lang)).join(' · ')}
                  </p>
                )}
                {item.notes && <p className="text-muted text-sm">{t('cart.notes', lang)}: {item.notes}</p>}
              </div>
            ))}

            <div className="card p-6 flex items-center justify-between mt-8">
              <span className="text-muted uppercase tracking-wider text-sm">{t('cart.total', lang)}</span>
              <span className="font-display text-3xl text-accent">
                {total.toFixed(0)} {t('currency', lang)}
              </span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-luxury-filled w-full text-sm mt-4">
              {t('cart.checkout', lang)}
            </button>
          </div>
        )}
      </div>
    </CustomerShell>
  );
}
