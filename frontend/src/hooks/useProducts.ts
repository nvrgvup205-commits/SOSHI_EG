import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import type { Product } from '../types';

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getProducts(category)
      .then((res) => setProducts(res.products))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  return { products, loading, error };
}
