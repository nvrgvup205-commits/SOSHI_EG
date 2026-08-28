import { useEffect, useState } from 'react';
import CustomerShell from '../components/Shared/CustomerShell';
import CategoryNav from '../components/Shared/CategoryNav';
import ProductCard from '../components/Products/ProductCard';
import ProductModal from '../components/Products/ProductModal';
import SushiStage from '../components/Shared/SushiStageLazy';
import BrandMark from '../components/Shared/BrandMark';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import type { Addon, Banner, Category, Product } from '../types';

function bannerTitle(b: Banner, lang: string) {
  if (lang === 'ar') return b.title_ar;
  if (lang === 'ru') return b.title_ru;
  return b.title_en;
}

function bannerSub(b: Banner, lang: string) {
  if (lang === 'ar') return b.subtitle_ar;
  if (lang === 'ru') return b.subtitle_ru;
  return b.subtitle_en;
}

function categoryName(c: Category, lang: string) {
  if (lang === 'ar') return c.name_ar;
  if (lang === 'ru') return c.name_ru;
  return c.name_en;
}

export default function HomePage() {
  const { lang } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    api.getHome()
      .then((r) => {
        setCategories(r.categories);
        setProducts(r.products);
        setBanners(r.banners);
        setAddons(r.addons);
        setOpen(r.restaurant_open);
      })
      .catch(() => {
        api.getProducts()
          .then((r) => setProducts(r.products))
          .catch(console.error);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % banners.length), 4500);
    return () => clearInterval(id);
  }, [banners.length]);

  const grouped = (categories.length
    ? categories.map((cat) => ({
        category: cat,
        items: products.filter((p) => p.category_id === cat.id || p.category === cat.slug),
      }))
    : [...new Set(products.map((p) => p.category))].map((slug) => ({
        category: {
          id: slug,
          slug,
          name_ar: slug,
          name_en: slug,
          name_ru: slug,
          image: null,
          sort_order: 0,
        },
        items: products.filter((p) => p.category === slug),
      }))
  ).filter((g) => g.items.length > 0);

  const leftover = products.filter(
    (p) => !categories.some((c) => p.category_id === c.id || p.category === c.slug),
  );

  return (
    <CustomerShell>
      <section className="relative min-h-[78vh] overflow-hidden pt-20">
        <SushiStage />
        <div className="splash-veil" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="logo-plate w-max mb-8">
              <BrandMark size="lg" />
            </div>
            <p className="label-luxury mb-3">{t('home.featured', lang)}</p>
            <h1 className="font-display text-5xl sm:text-7xl text-fg max-w-xl">{t('hero.title', lang)}</h1>
            <p className="text-muted text-lg mt-4 max-w-md">{t('hero.subtitle', lang)}</p>
            <a href="#menu" className="btn-luxury-filled mt-8 inline-flex">{t('btn.order_now', lang)}</a>
          </div>
        </div>
      </section>

      {!open && (
        <div className="px-6">
          <div className="max-w-3xl mx-auto card p-4 text-center text-warning">
            {t('checkout.closed', lang)}
          </div>
        </div>
      )}

      {banners.length > 0 && (
        <section className="px-4 pt-4">
          <div className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl">
            <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${slide * 100}%)` }} dir="ltr">
              {banners.map((b) => {
                const product = products.find((p) => p.id === b.product_id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    className="min-w-full relative aspect-[16/7] sm:aspect-[21/8] overflow-hidden border border-[var(--app-line)]"
                    onClick={() => product && setSelected(product)}
                  >
                    {b.image_url && (
                      <img src={b.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 start-0 p-6 text-start">
                      <p className="label-luxury mb-2">{t(`banner.${b.kind}`, lang)}</p>
                      <h2 className="font-display text-3xl sm:text-5xl text-white">{bannerTitle(b, lang)}</h2>
                      <p className="text-white/70 mt-2">{bannerSub(b, lang)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSlide(i)}
                  className={`h-1.5 rounded-full ${i === slide ? 'w-8 bg-accent' : 'w-3 bg-muted'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="menu" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="label-luxury mb-3">{t('home.menu_label', lang)}</p>
            <h2 className="text-4xl md:text-5xl text-fg">{t('nav.products', lang)}</h2>
            <div className="divider-gold mt-6" />
          </div>

          {!loading && categories.length > 0 && <CategoryNav categories={categories} />}

          {loading ? (
            <div className="text-center py-20 text-muted tracking-widest uppercase text-sm">{t('error.loading', lang)}</div>
          ) : (
            <div className="space-y-20">
              {grouped.map((group) => (
                <div key={group.category.id} id={group.category.slug}>
                  <div className="flex items-end justify-between mb-8">
                    <h3 className="font-display text-3xl text-fg">{categoryName(group.category, lang)}</h3>
                    <div className="divider-gold !mx-0 w-24" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {group.items.map((product, i) => (
                      <ProductCard key={product.id} product={product} lang={lang} delay={i * 0.05} onOpen={setSelected} />
                    ))}
                  </div>
                </div>
              ))}
              {leftover.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {leftover.map((product, i) => (
                    <ProductCard key={product.id} product={product} lang={lang} delay={i * 0.05} onOpen={setSelected} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {selected && <ProductModal product={selected} addons={addons} onClose={() => setSelected(null)} />}
    </CustomerShell>
  );
}
