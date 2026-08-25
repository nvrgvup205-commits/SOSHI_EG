import { Plus } from 'lucide-react';
import type { Product } from '../../types';
import type { Language } from '../../types';
import { getProductName, getProductDescription, t } from '../../utils/i18n';
import { useCart } from '../../hooks/useCart';
import { pickProductImage } from '../../utils/productImage';

interface Props {
  product: Product;
  lang: Language;
  delay?: number;
}

export default function ProductCard({ product, lang, delay = 0 }: Props) {
  const { addItem } = useCart();
  const name = getProductName(product, lang);
  const desc = getProductDescription(product, lang);

  const photo = pickProductImage(product);

  return (
    <div
      className="group card overflow-hidden animate-fade-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary/30 to-primary/10 flex items-center justify-center overflow-hidden">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <span className="text-7xl opacity-60 group-hover:scale-110 transition-transform duration-700">🍣</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-60" />
      </div>
      <div className="p-6">
        <p className="label-luxury text-[10px] mb-2">{product.category}</p>
        <h3 className="font-display text-2xl text-white mb-2">{name}</h3>
        {desc && <p className="text-white/40 text-sm mb-4 line-clamp-2 font-light">{desc}</p>}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-accent font-display text-2xl">
            {product.price} <span className="text-sm">{t('currency', lang)}</span>
          </span>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/70 hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('btn.add_to_cart', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
