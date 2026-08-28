import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { Addon, CartAddon, Product } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { useCart } from '../../hooks/useCart';
import { getProductDescription, getProductName, localizedName, t } from '../../utils/i18n';
import { api } from '../../utils/api';
import { pickProductImage } from '../../utils/productImage';

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
  return m?.[1] || null;
}

export default function ProductModal({
  product,
  addons,
  onClose,
}: {
  product: Product;
  addons: Addon[];
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const [full, setFull] = useState<Product>(product);
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.getProduct(product.id).then((r) => setFull(r.product)).catch(() => {});
  }, [product.id]);

  const availableAddons = full.addons?.length ? full.addons : addons;
  const name = getProductName(full, lang);
  const desc = getProductDescription(full, lang);
  const img = pickProductImage(full);
  const extras = useMemo(
    () => availableAddons.filter((a) => selected.includes(a.id)).reduce((s, a) => s + Number(a.price), 0),
    [availableAddons, selected],
  );

  const video = full.video_url || '';
  const yt = video ? youtubeId(video) : null;

  const addToCart = () => {
    const chosen: CartAddon[] = availableAddons.filter((a) => selected.includes(a.id));
    addItem(full, 1, chosen, notes);
    setAdded(true);
    setTimeout(onClose, 600);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="glass-card w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {video ? (
            yt ? (
              <iframe
                title={t('product.video', lang)}
                src={`https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`}
                className="w-full aspect-video"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video src={video} controls autoPlay className="w-full aspect-video bg-black" playsInline />
            )
          ) : img ? (
            <img src={img} alt={name} className="w-full aspect-[4/3] object-cover" />
          ) : (
            <div className="aspect-[4/3] flex items-center justify-center text-7xl">🍣</div>
          )}
          <button type="button" onClick={onClose} className="absolute top-3 end-3 bg-black/70 p-2 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <h2 className="font-display text-3xl text-fg">{name}</h2>
            {desc && <p className="text-muted mt-2">{desc}</p>}
            <p className="text-accent font-display text-2xl mt-3">
              {Number(full.price) + extras} {t('currency', lang)}
            </p>
          </div>

          {availableAddons.length > 0 && (
            <div>
              <p className="label-luxury mb-3">{t('product.addons', lang)}</p>
              <div className="space-y-2">
                {availableAddons.map((addon) => (
                  <label key={addon.id} className="flex items-center justify-between gap-3 card p-3 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(addon.id)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id],
                          )
                        }
                      />
                      <span className="text-fg">{localizedName(addon, lang)}</span>
                    </span>
                    <span className="text-accent">+{addon.price} {t('currency', lang)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label-luxury mb-2 block">{t('product.notes', lang)}</label>
            <textarea
              className="input-field min-h-24"
              placeholder={t('product.notes_placeholder', lang)}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="button" onClick={addToCart} className="btn-luxury-filled w-full">
            {added ? '✓' : t('btn.add_to_cart', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
