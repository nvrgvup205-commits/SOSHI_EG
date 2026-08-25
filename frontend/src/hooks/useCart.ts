import { useState, useEffect } from 'react';
import type { CartAddon, CartItem, Product } from '../types';

const CART_KEY = 'soshi_cart';

function lineKey(productId: string, addons: CartAddon[], notes: string) {
  return `${productId}|${addons.map((a) => a.id).sort().join(',')}|${notes.trim()}`;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
      return parsed.map((i) => ({
        ...i,
        addons: i.addons || [],
        notes: i.notes || '',
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity = 1, addons: CartAddon[] = [], notes = '') => {
    const key = lineKey(product.id, addons, notes);
    setItems((prev) => {
      const existing = prev.find((i) => lineKey(i.product.id, i.addons, i.notes) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i.product.id, i.addons, i.notes) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity, addons, notes }];
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return removeItem(index);
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  };

  const clearCart = () => setItems([]);

  const lineTotal = (item: CartItem) => {
    const extras = item.addons.reduce((sum, a) => sum + Number(a.price), 0);
    return (Number(item.product.price) + extras) * item.quantity;
  };

  const total = items.reduce((sum, i) => sum + lineTotal(i), 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, count, lineTotal };
}
