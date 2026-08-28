import { Plus, Play } from 'lucide-react';
import type { Product, Language } from '../../types';
import { getProductName, t } from '../../utils/i18n';
import { pickProductImage } from '../../utils/productImage';

interface Props {
  product: Product;
  lang: Language;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, lang, onOpen, onAdd }: Props) {
  const name = getProductName(product, lang);
  const photo = pickProductImage(product);

  return (
    <div className="product-card-compact group">
      <button type="button" onClick={() => onOpen(product)} className="relative w-full aspect-square rounded-xl overflow-hidden bg-[var(--app-card)]">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-3xl opacity-50">🍣</span>
        )}
        {product.video_url && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <Play className="w-5 h-5 text-accent fill-accent" />
          </span>
        )}
      </button>
      <div className="pt-2 px-0.5">
        <button type="button" onClick={() => onOpen(product)} className="text-[11px] leading-tight text-fg line-clamp-2 text-start w-full min-h-[2rem]">
          {name}
        </button>
        <div className="flex items-center justify-between mt-1 gap-1">
          <span className="text-accent font-display text-sm">{product.price}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            className="w-7 h-7 rounded-full bg-accent text-emerald-950 flex items-center justify-center shrink-0 hover:scale-110 transition-transform"
            aria-label={t('btn.add_to_cart', lang)}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
