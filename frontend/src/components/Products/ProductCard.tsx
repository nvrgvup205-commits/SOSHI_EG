import type { Product, Language } from '../../types';
import { getProductName, getProductDescription, t } from '../../utils/i18n';

interface Props {
  product: Product;
  lang: Language;
  delay?: number;
  onOpen: (product: Product) => void;
}

export default function ProductCard({ product, lang, delay = 0, onOpen }: Props) {
  const name = getProductName(product, lang);
  const desc = getProductDescription(product, lang);
  const img = product.image_compressed_url || product.image_thumbnail_url || product.image_original_url;

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="group card overflow-hidden animate-fade-up text-start w-full"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary/30 to-primary/10 flex items-center justify-center overflow-hidden">
        {img ? (
          <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <span className="text-7xl opacity-60">🍣</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-60" />
        {product.is_new && (
          <span className="absolute top-3 start-3 text-[10px] uppercase tracking-wider bg-accent text-ink px-2 py-1">{t('banner.new_rolls', lang)}</span>
        )}
        {product.is_offer && !product.is_new && (
          <span className="absolute top-3 start-3 text-[10px] uppercase tracking-wider bg-primary text-white px-2 py-1">{t('banner.offers', lang)}</span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl text-white mb-2">{name}</h3>
        {desc && <p className="text-white/40 text-sm mb-4 line-clamp-2 font-light">{desc}</p>}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-accent font-display text-2xl">
            {product.price} <span className="text-sm">{t('currency', lang)}</span>
          </span>
          <span className="text-xs uppercase tracking-[0.15em] text-white/70 group-hover:text-accent">
            {t('btn.add_to_cart', lang)}
          </span>
        </div>
      </div>
    </button>
  );
}
