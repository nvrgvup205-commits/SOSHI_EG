import { Plus, Minus } from 'lucide-react';
import type { Product } from '../../types';
import type { Language } from '../../types';
import { getProductName } from '../../utils/i18n';
import { t } from '../../utils/i18n';
import { useCart } from '../../hooks/useCart';

interface Props {
  product: Product;
  lang: Language;
}

export default function ProductCard({ product, lang }: Props) {
  const { addItem } = useCart();
  const name = getProductName(product, lang);

  return (
    <div className="card overflow-hidden animate-slide-up group">
      <div className="relative h-48 bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center overflow-hidden">
        {product.image_thumbnail_url ? (
          <img src={product.image_thumbnail_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🍣</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-secondary text-lg">{name}</h3>
        <p className="text-primary font-bold text-xl mt-1">
          {product.price} {t('currency', lang)}
        </p>
        <button
          onClick={() => addItem(product)}
          className="btn-primary w-full mt-3 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('btn.add_to_cart', lang)}
        </button>
      </div>
    </div>
  );
}

export function CartQuantityControl({ productId, quantity }: { productId: string; quantity: number }) {
  const { updateQuantity } = useCart();
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => updateQuantity(productId, quantity - 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200">
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-bold w-8 text-center">{quantity}</span>
      <button onClick={() => updateQuantity(productId, quantity + 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
