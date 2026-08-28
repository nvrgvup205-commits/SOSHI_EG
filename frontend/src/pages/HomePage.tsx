import { useEffect, useState } from 'react';
import CustomerShell from '../components/Shared/CustomerShell';
import CategoryNav from '../components/Shared/CategoryNav';
import FeaturedCarousel from '../components/Shared/FeaturedCarousel';
import ProductCard from '../components/Products/ProductCard';
import ProductModal from '../components/Products/ProductModal';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import { scrollToTop } from '../hooks/useScrollTop';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import type { Addon, Category, Product } from '../types';

export default function HomePage() {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    api.getHome()
      .then((r) => {
        setCategories(r.categories);
        setProducts(r.products);
        setAddons(r.addons);
        setOpen(r.restaurant_open);
        if (r.categories[0]) setActiveCategory(r.categories[0].slug);
      })
      .catch(() => api.getProducts().then((r) => setProducts(r.products)).catch(console.error))
      .finally(() => setLoading(false));
  }, []);

  const handleCategory = (slug: string) => {
    setActiveCategory(slug);
    scrollToTop();
  };

  const filtered = products.filter(
    (p) => p.category === activeCategory || p.category_id === categories.find((c) => c.slug === activeCategory)?.id,
  );

  const handleAdd = (product: Product) => {
    addItem(product, 1, [], '');
  };

  return (
    <CustomerShell
      showFooter
      subHeader={
        !loading && categories.length > 0 ? (
          <CategoryNav categories={categories} activeSlug={activeCategory} onSelect={handleCategory} />
        ) : null
      }
    >
      {!open && (
        <div className="px-4 pt-2">
          <div className="card p-3 text-center text-warning text-sm rounded-xl">{t('checkout.closed', lang)}</div>
        </div>
      )}

      {!loading && products.length > 0 && (
        <FeaturedCarousel products={products} lang={lang} onOpen={setSelected} />
      )}

      <section id="menu" className="px-3 py-4">
        {loading ? (
          <div className="text-center py-16 text-muted text-sm">{t('error.loading', lang)}</div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onOpen={setSelected}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted py-12 text-sm">{t('cart.empty', lang)}</p>
        )}
      </section>

      {selected && <ProductModal product={selected} addons={addons} onClose={() => setSelected(null)} />}
    </CustomerShell>
  );
}
