import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import type { Product, Language } from '../../types';
import { getProductName } from '../../utils/i18n';
import { pickProductImage } from '../../utils/productImage';

interface Props {
  products: Product[];
  lang: Language;
  onOpen: (p: Product) => void;
}

function wrapOffset(index: number, active: number, total: number) {
  let delta = index - active;
  const half = Math.floor(total / 2);
  if (delta > half) delta -= total;
  if (delta < -half) delta += total;
  return delta;
}


export default function FeaturedCarousel({ products, lang, onOpen }: Props) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const dragging = useRef(false);
  const featured = products.filter((p) => p.is_new || p.is_popular).slice(0, 8);
  const items = featured.length >= 3 ? featured : products.slice(0, 6);
  const count = items.length;

  const visible = useMemo(() => {
    if (!count) return [];
    return items
      .map((product, index) => ({ product, index, offset: wrapOffset(index, active, count) }))
      .filter((item) => Math.abs(item.offset) <= 2)
      .sort((a, b) => a.offset - b.offset);
  }, [items, active, count]);

  useEffect(() => {
    if (count < 2 || reduceMotion) return;
    const id = window.setInterval(() => {
      if (dragging.current) return;
      setActive((i) => (i + 1) % count);
    }, 4200);
    return () => window.clearInterval(id);
  }, [count, reduceMotion]);

  if (!count) return null;

  const go = (next: number) => {
    setActive(((next % count) + count) % count);
  };

  const onDragStart = () => {
    dragging.current = true;
  };

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -40) go(active + 1);
    else if (swipe > 40) go(active - 1);
    window.setTimeout(() => {
      dragging.current = false;
    }, 60);
  };

  return (
    <section className="hero-carousel relative px-2 pt-3 pb-5 overflow-hidden" style={{ touchAction: 'pan-y' }}>
      <div className="ambient-glow" />
      <div
        className="flex flex-row items-center justify-center overflow-x-hidden w-full relative h-[220px] select-none"
        dir="ltr"
        style={{ touchAction: 'pan-y' }}
      >
        <motion.div
          className="flex flex-row items-center justify-center relative"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {visible.map(({ product, index, offset }) => {
            const isCenter = offset === 0;
            const name = getProductName(product, lang);
            const img = pickProductImage(product);
            return (
              <motion.button
                key={`${product.id}-${index}`}
                type="button"
                onClick={() => {
                  if (dragging.current) return;
                  if (isCenter) onOpen(product);
                  else go(index);
                }}
                className={`featured-slide shrink-0 ${isCenter ? 'featured-slide-active' : ''}`}
                style={{
                  zIndex: isCenter ? 3 : 2 - Math.abs(offset),
                  touchAction: 'pan-y',
                }}
                animate={{
                  scale: isCenter ? 1 : 0.75,
                  opacity: isCenter ? 1 : 0.5,
                  marginInline: isCenter ? '0.25rem' : '-2.75rem',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 320,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                <span className={`featured-glow ${isCenter ? 'opacity-100' : 'opacity-0'}`} />
                {img ? (
                  <img src={img} alt={name} className="w-full h-full object-cover rounded-2xl pointer-events-none" draggable={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl rounded-2xl bg-[var(--app-card)]">🍣</div>
                )}
                {isCenter && (
                  <div className="absolute bottom-0 inset-x-0 p-3 text-center bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl pointer-events-none">
                    <p className="text-sm font-medium text-white truncate">{name}</p>
                    <p className="text-accent text-lg font-display">{product.price}</p>
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            className={`h-1 rounded-full transition-all ${i === active ? 'w-6 bg-accent' : 'w-2 bg-muted/50'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
