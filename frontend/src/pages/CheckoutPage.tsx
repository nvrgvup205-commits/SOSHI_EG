import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import type { Address, Coupon, DeliveryZone } from '../types';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { lang } = useLanguage();
  const { type } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [addressId, setAddressId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (type !== 'customer') return;
    api.getAddresses().then((r) => {
      setAddresses(r.addresses);
      const def = r.addresses.find((a) => a.is_default) || r.addresses[0];
      if (def) setAddressId(def.id);
    }).catch(console.error);
    api.getZones().then((r) => {
      setZones(r.zones);
      if (r.zones[0]) setZoneId(r.zones[0].id);
    }).catch(console.error);
    api.getHome().then((r) => setOpen(r.restaurant_open)).catch(() => {});
  }, [type]);

  const zone = zones.find((z) => z.id === zoneId);
  const deliveryFee = Number(zone?.delivery_fee || 0);
  const discount = coupon
    ? coupon.type === 'percent'
      ? Math.round((total * Number(coupon.discount)) / 100)
      : Number(coupon.discount)
    : 0;
  const grand = Math.max(0, total + deliveryFee - discount);

  const applyCoupon = async () => {
    setError('');
    try {
      const res = await api.validateCoupon(couponCode);
      setCoupon(res.coupon);
    } catch (err) {
      setCoupon(null);
      setError(err instanceof Error ? err.message : 'Coupon failed');
    }
  };

  const placeOrder = async () => {
    setError('');
    if (!open) return setError(t('checkout.closed', lang));
    if (items.length === 0) return navigate('/cart');
    setLoading(true);
    try {
      let finalAddressId = addressId;
      if (!finalAddressId && newAddress.trim()) {
        const created = await api.createAddress({
          area: newArea.trim() || undefined,
          address: newAddress.trim(),
          is_default: true,
        });
        finalAddressId = created.address.id;
      }
      if (!finalAddressId) {
        setLoading(false);
        return setError('Address required');
      }
      const res = await api.createOrder({
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          notes: i.notes || undefined,
          addon_ids: i.addons.map((a) => a.id),
        })),
        address_id: finalAddressId,
        delivery_zone_id: zoneId || undefined,
        coupon_code: coupon?.code,
        payment_method: 'cash',
        notes: notes || undefined,
      });
      clearCart();
      navigate(`/orders/${res.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24 space-y-6">
        <p className="label-luxury">{t('checkout.payment', lang)}</p>
        <h1 className="font-display text-4xl text-white">{t('checkout.title', lang)}</h1>
        <div className="divider-gold !mx-0" />

        {!open && <div className="card p-4 text-warning">{t('checkout.closed', lang)}</div>}

        <section className="card p-5 space-y-3">
          <h2 className="font-display text-xl text-white">{t('checkout.address', lang)}</h2>
          {addresses.map((a) => (
            <label key={a.id} className="flex items-start gap-3 text-white/80">
              <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
              <span>{a.area ? `${a.area} — ` : ''}{a.address}</span>
            </label>
          ))}
          <p className="text-white/40 text-xs uppercase tracking-wider pt-2">{t('checkout.new_address', lang)}</p>
          <input className="input-field" placeholder={t('login.area', lang)} value={newArea} onChange={(e) => setNewArea(e.target.value)} />
          <textarea className="input-field min-h-20" placeholder={t('login.address', lang)} value={newAddress} onChange={(e) => { setNewAddress(e.target.value); setAddressId(''); }} />
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-display text-xl text-white">{t('checkout.zone', lang)}</h2>
          <select className="input-field" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name} — {z.delivery_fee} {t('currency', lang)}</option>
            ))}
          </select>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-display text-xl text-white">{t('checkout.coupon', lang)}</h2>
          <div className="flex gap-2">
            <input className="input-field" dir="ltr" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <button type="button" onClick={applyCoupon} className="btn-luxury text-xs">{t('checkout.apply', lang)}</button>
          </div>
        </section>

        <section className="card p-5 space-y-3">
          <label className="label-luxury">{t('product.notes', lang)}</label>
          <textarea className="input-field min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </section>

        <section className="card p-5 space-y-2 text-white/70">
          <div className="flex justify-between"><span>{t('checkout.subtotal', lang)}</span><span>{total} {t('currency', lang)}</span></div>
          <div className="flex justify-between"><span>{t('checkout.delivery_fee', lang)}</span><span>{deliveryFee} {t('currency', lang)}</span></div>
          <div className="flex justify-between"><span>{t('checkout.discount', lang)}</span><span>-{discount} {t('currency', lang)}</span></div>
          <div className="flex justify-between text-white font-display text-2xl pt-2">
            <span>{t('cart.total', lang)}</span>
            <span className="text-accent">{grand} {t('currency', lang)}</span>
          </div>
          <p className="text-accent pt-2">{t('checkout.cash', lang)}</p>
        </section>

        {error && <p className="text-danger">{error}</p>}
        <button type="button" disabled={loading || !open} onClick={placeOrder} className="btn-luxury-filled w-full">
          {loading ? '...' : t('checkout.place', lang)}
        </button>
      </div>
      <Footer />
    </div>
  );
}
