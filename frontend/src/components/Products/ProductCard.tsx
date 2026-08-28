import { Play } from 'lucide-react';
import type { Product, Language } from '../../types';
import { getProductName, getProductDescription, t } from '../../utils/i18n';
import { pickProductImage } from '../../utils/productImage';

interface Props {
  product: Product;
  lang: Language;
  delay?: number;
  onOpen: (product: Product) => void;
}

export default function ProductCard({ product, lang, delay = 0, onOpen }: Props) {
  const name = getProductName(product, lang);
  const desc = getProductDescription(product, lang);
  const photo = pickProductImage(product);

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="group glass-card overflow-hidden animate-fade-up text-start w-full"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary/30 to-primary/10 flex items-center justify-center overflow-hidden">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <span className="text-7xl opacity-60">🍣</span>
        )}
        {product.video_url && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <span className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-emerald-950 fill-emerald-950 ms-0.5" />
            </span>
          </span>
        )}
        {!product.video_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-60" />
        )}
        {product.is_new && (
          <span className="absolute top-3 start-3 text-[10px] uppercase tracking-wider bg-accent text-ink px-2 py-1">{t('banner.new_rolls', lang)}</span>
        )}
        {product.is_offer && !product.is_new && (
          <span className="absolute top-3 start-3 text-[10px] uppercase tracking-wider bg-primary text-white px-2 py-1">{t('banner.offers', lang)}</span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl text-fg mb-2">{name}</h3>
        {desc && <p className="text-muted text-sm mb-4 line-clamp-2 font-light">{desc}</p>}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--app-line)]">
          <span className="text-accent font-display text-2xl">
            {product.price} <span className="text-sm">{t('currency', lang)}</span>
          </span>
          <span className="text-xs uppercase tracking-[0.15em] text-muted group-hover:text-accent">
            {t('btn.add_to_cart', lang)}
          </span>
        </div>
      </div>
    </button>
  );
}
