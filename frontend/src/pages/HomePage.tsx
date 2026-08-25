import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Animated3DTitle from '../components/Shared/Animated3DTitle';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import ProductCard from '../components/Products/ProductCard';
import { useLanguage } from '../hooks/useLanguage';
import { useProducts } from '../hooks/useProducts';
import { useIntro } from '../hooks/useIntro';
import { t } from '../utils/i18n';

const categories = ['all', 'nigiri', 'rolls', 'special'] as const;
const LOGO_SRC = '/logo.png';

export default function HomePage() {
  const { lang } = useLanguage();
  const { introDismissed } = useIntro();
  const [category, setCategory] = useState<string>('all');
  const { products, loading } = useProducts(category === 'all' ? undefined : category);

  return (
    <div className="min-h-screen bg-ink">
      <Header />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Blurred logo background */}
        <div className="absolute inset-0">
          <motion.img
            src={LOGO_SRC}
            alt=""
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(95vw,560px)] max-w-none pointer-events-none select-none"
            initial={{ opacity: 0, scale: 1.2, filter: 'blur(0px)' }}
            animate={{
              opacity: introDismissed ? 0.18 : 0,
              scale: introDismissed ? 1.4 : 1.2,
              filter: introDismissed ? 'blur(48px)' : 'blur(0px)',
            }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/88 to-ink" />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 50% 30%, rgba(15,59,79,0.35) 0%, transparent 55%), radial-gradient(ellipse at 50% 70%, rgba(224,120,86,0.08) 0%, transparent 50%)',
            }}
          />
        </div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: introDismissed ? 1 : 0, y: introDismissed ? 0 : 30 }}
          transition={{ duration: 0.9, delay: introDismissed ? 0.3 : 0, ease: 'easeOut' }}
        >
          <p className="label-luxury mb-6">North Coast · Egypt</p>
          {introDismissed && (
            <Animated3DTitle text={t('hero.title', lang)} startDelay={0.4} />
          )}
          <div className="divider-gold mb-8" />
          <p className="text-white/90 text-lg md:text-xl font-light tracking-wide max-w-xl mx-auto mb-12">
            {t('hero.subtitle', lang)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#menu" className="btn-luxury">{t('nav.products', lang)}</a>
            <Link to="/login" className="btn-luxury-filled">{t('btn.order_now', lang)}</Link>
          </div>
        </motion.div>

        {introDismissed && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.3em] uppercase animate-pulse z-10">
            Scroll
          </div>
        )}
      </section>

      <section className="relative py-24 border-y border-white/5 bg-ink">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="label-luxury mb-4">Sea &amp; Craft</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
            Where gathering comes naturally
          </h2>
          <p className="text-white/70 leading-relaxed max-w-2xl mx-auto font-light">
            An Asian kitchen rooted in the Mediterranean coast. Guided by time, light, and the finest ingredients — made to be shared.
          </p>
        </div>
      </section>

      <section id="menu" className="relative py-24 bg-ink">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="label-luxury mb-3">Menu</p>
            <h2 className="font-display text-4xl md:text-5xl text-white">{t('nav.products', lang)}</h2>
            <div className="divider-gold mt-6" />
          </div>

          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 text-xs uppercase tracking-[0.2em] transition-all duration-300 border ${
                  category === cat
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                }`}
              >
                {t(`category.${cat}`, lang)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-white/30 tracking-widest uppercase text-sm">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-white/30">No products available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} lang={lang} delay={i * 0.1} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
