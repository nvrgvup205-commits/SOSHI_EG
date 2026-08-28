import { useEffect, useRef } from 'react';
import type { Category } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

function catName(c: Category, lang: string) {
  if (lang === 'ar') return c.name_ar;
  if (lang === 'ru') return c.name_ru;
  return c.name_en;
}

export default function CategoryNav({ categories }: { categories: Category[] }) {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY + 120;
      let active = categories[0]?.slug;
      for (const cat of categories) {
        const section = document.getElementById(cat.slug);
        if (section && section.offsetTop <= y) active = cat.slug;
      }
      el.querySelectorAll('[data-cat]').forEach((btn) => {
        btn.classList.toggle('category-pill-active', btn.getAttribute('data-cat') === active);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [categories]);

  if (!categories.length) return null;

  return (
    <nav className="category-nav sticky top-[4.5rem] z-30 -mx-6 px-6 py-3 backdrop-blur-xl border-b border-[var(--app-line)] bg-[var(--app-header)]">
      <div ref={ref} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.slug}`}
            data-cat={cat.slug}
            className="category-pill shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider border border-[var(--app-line)] text-muted hover:border-accent/50 hover:text-accent transition-all"
          >
            {catName(cat, lang)}
          </a>
        ))}
      </div>
    </nav>
  );
}
