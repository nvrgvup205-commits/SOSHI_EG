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
      .filter((item) => Math.abs(item.offset) <= 2);
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
    const swipe = info.offset.x + info.velocity.x * 0.18;
    if (swipe < -42) go(active + 1);
    else if (swipe > 42) go(active - 1);
    window.setTimeout(() => {
      dragging.current = false;
    }, 80);
  };

  return (
    <section className="hero-carousel relative px-2 pt-3 pb-5 overflow-hidden" style={{ touchAction: 'pan-y' }}>
      <div className="ambient-glow" />
      <div className="relative h-[220px] w-full select-none" dir="ltr">
        {visible.map(({ product, index, offset }) => {
          const isCenter = offset === 0;
          const name = getProductName(product, lang);
          const img = pickProductImage(product);
          return (
            <motion.button
              key={`${product.id}-${index}`}
              type="button"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.22}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={() => {
                if (dragging.current) return;
                if (isCenter) onOpen(product);
                else go(index);
              }}
              className="featured-slide absolute left-1/2 top-1/2 cursor-grab active:cursor-grabbing"
              style={{ zIndex: isCenter ? 3 : 2 - Math.abs(offset), touchAction: 'pan-y' }}
              animate={{
                x: `calc(-50% + ${offset * 118}px)`,
                scale: isCenter ? 1 : 0.8,
                opacity: isCenter ? 1 : 0.5,
                y: isCenter && !reduceMotion
                  ? ['calc(-50% - 4px)', 'calc(-50% + 4px)', 'calc(-50% - 4px)']
                  : '-50%',
              }}
              transition={{
                x: { type: 'spring', stiffness: 260, damping: 28 },
                scale: { type: 'spring', stiffness: 260, damping: 28 },
                opacity: { duration: 0.25 },
                y: isCenter && !reduceMotion
                  ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.25 },
              }}
            >
              <span className={`featured-glow ${isCenter ? 'opacity-100' : 'opacity-0'}`} />
              {img ? (
                <img src={img} alt={name} className="w-full h-full object-cover rounded-2xl pointer-events-none" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl rounded-2xl bg-[var(--app-card)]">🍣</div>
              )}
              {isCenter && (
                <div className="absolute bottom-0 inset-x-0 p-3 text-center bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                  <p className="text-sm font-medium text-white truncate">{name}</p>
                  <p className="text-accent text-lg font-display">{product.price}</p>
                </div>
              )}
            </motion.button>
          );
        })}
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
