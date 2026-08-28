import type { Category } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

function catName(c: Category, lang: string) {
  if (lang === 'ar') return c.name_ar;
  if (lang === 'ru') return c.name_ru;
  return c.name_en;
}

interface Props {
  categories: Category[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export default function CategoryNav({ categories, activeSlug, onSelect }: Props) {
  const { lang } = useLanguage();
  if (!categories.length) return null;

  return (
    <nav className="category-nav">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.slug)}
            className={`category-pill shrink-0 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider border transition-all ${
              activeSlug === cat.slug ? 'category-pill-active' : 'border-[var(--app-line)] text-muted hover:border-accent/50'
            }`}
          >
            {catName(cat, lang)}
          </button>
        ))}
      </div>
    </nav>
  );
}
