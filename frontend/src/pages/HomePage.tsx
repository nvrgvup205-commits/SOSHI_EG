import { useState } from 'react';
import { Search } from 'lucide-react';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import ProductCard from '../components/Products/ProductCard';
import { useLanguage } from '../hooks/useLanguage';
import { useProducts } from '../hooks/useProducts';
import { t } from '../utils/i18n';

const categories = ['all', 'nigiri', 'rolls', 'special'] as const;

export default function HomePage() {
  const { lang } = useLanguage();
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { products, loading } = useProducts(category === 'all' ? undefined : category);

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name_ar.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q) || p.name_ru.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative bg-secondary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-primary/30" />
        <div className="absolute top-10 end-10 text-8xl opacity-20 animate-pulse">✨</div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🍣</div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{t('hero.title', lang)}</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">{t('hero.subtitle', lang)}</p>
        </div>
      </section>

      <section id="products" className="max-w-7xl mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input-field ps-10"
              placeholder={t('search.placeholder', lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  category === cat ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-cream'
                }`}
              >
                {t(`category.${cat}`, lang)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
