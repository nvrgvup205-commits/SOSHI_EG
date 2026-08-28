import { useEffect, useState } from 'react';
import type { Product, Language } from '../../types';
import { getProductName } from '../../utils/i18n';
import { pickProductImage } from '../../utils/productImage';

interface Props {
  products: Product[];
  lang: Language;
  onOpen: (p: Product) => void;
}

export default function FeaturedCarousel({ products, lang, onOpen }: Props) {
  const [active, setActive] = useState(0);
  const featured = products.filter((p) => p.is_new || p.is_popular).slice(0, 8);
  const items = featured.length >= 3 ? featured : products.slice(0, 6);
  if (!items.length) return null;

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  const prev = (active - 1 + items.length) % items.length;
  const next = (active + 1) % items.length;

  return (
    <section className="hero-carousel relative px-4 pt-3 pb-6 overflow-hidden">
      <div className="ambient-glow" />
      <div className="relative flex items-center justify-center gap-2 min-h-[200px]" dir="ltr">
        {[prev, active, next].map((idx, i) => {
          const p = items[idx];
          const isCenter = i === 1;
          const name = getProductName(p, lang);
          const img = pickProductImage(p);
          return (
            <button
              key={`${p.id}-${i}`}
              type="button"
              onClick={() => onOpen(p)}
              className={`featured-slide transition-all duration-500 ${isCenter ? 'featured-slide-active' : 'featured-slide-side'}`}
            >
              <div className={`featured-glow ${isCenter ? 'opacity-100' : 'opacity-0'}`} />
              {img ? (
                <img src={img} alt={name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl rounded-2xl bg-[var(--app-card)]">🍣</div>
              )}
              {isCenter && (
                <div className="absolute bottom-0 inset-x-0 p-3 text-center bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                  <p className="text-sm font-medium text-white truncate">{name}</p>
                  <p className="text-accent text-lg font-display">{p.price}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`h-1 rounded-full transition-all ${i === active ? 'w-6 bg-accent' : 'w-2 bg-muted/50'}`}
          />
        ))}
      </div>
    </section>
  );
}
