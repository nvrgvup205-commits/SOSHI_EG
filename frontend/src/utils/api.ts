const API_BASE = import.meta.env.VITE_API_URL || '';

import type { Customer, StaffUser } from '../types';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('session_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('session_token', token);
    else localStorage.removeItem('session_token');
  }

  getToken() {
    return this.token || localStorage.getItem('session_token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // Auth
  customerLogin(data: { email: string; phone: string; full_name?: string; preferred_language?: string }) {
    return this.request<{ session_token: string; customer: Record<string, unknown> }>(
      '/api/auth/customer/login',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  staffLogin(data: { phone?: string; email?: string; password: string }) {
    return this.request<{ session_token: string; user: Record<string, unknown> }>(
      '/api/auth/staff/login',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  getMe() {
    return this.request<{ type: 'customer' | 'staff'; user: Customer | StaffUser }>('/api/auth/me');
  }

  logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // Products
  getProducts(category?: string) {
    const q = category ? `?category=${category}` : '';
    return this.request<{ products: import('../types').Product[] }>(`/api/products${q}`);
  }

  getAllProducts() {
    return this.request<{ products: import('../types').Product[] }>('/api/products?all=true');
  }

  createProduct(data: Record<string, unknown>) {
    return this.request<{ product: import('../types').Product }>('/api/products', { method: 'POST', body: JSON.stringify(data) });
  }

  updateProduct(id: string, data: Record<string, unknown>) {
    return this.request<{ product: import('../types').Product }>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, { method: 'DELETE' });
  }

  async uploadProductImages(files: {
    original: File;
    compressed: File;
    thumbnail: File;
    folder?: string;
  }) {
    const form = new FormData();
    form.append('original', files.original);
    form.append('compressed', files.compressed);
    form.append('thumbnail', files.thumbnail);
    if (files.folder) form.append('folder', files.folder);

    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/products/images`, {
      method: 'POST',
      headers,
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image upload failed');
    return data as {
      image_original_url: string;
      image_compressed_url: string;
      image_thumbnail_url: string;
    };
  }

  // Customers (admin)
  getCustomers(params?: { search?: string; page?: number }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    return this.request<{ customers: import('../types').Customer[]; pagination: { total: number } }>(
      `/api/customers?${q}`,
    );
  }

  updateCustomer(id: string, data: Partial<import('../types').Customer>) {
    return this.request(`/api/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Orders
  createOrder(data: { items: Array<{ product_id: string; quantity: number }>; notes?: string }) {
    return this.request('/api/orders', { method: 'POST', body: JSON.stringify(data) });
  }

  getOrders(status?: string) {
    const q = status ? `?status=${status}` : '';
    return this.request<{ orders: import('../types').Order[] }>(`/api/orders${q}`);
  }

  updateOrderStatus(id: string, status: string) {
    return this.request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Admin
  getAnalytics() {
    return this.request<{
      today_orders: number;
      total_customers: number;
      today_messages: number;
      active_staff: number;
    }>('/api/admin/analytics');
  }

  getStaff() {
    return this.request<{ staff: import('../types').StaffUser[] }>('/api/admin/staff');
  }

  createStaff(data: { full_name: string; phone: string; role: string; password?: string; email?: string }) {
    return this.request<{ staff: import('../types').StaffUser; default_password?: string }>(
      '/api/admin/staff',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  updateStaff(id: string, data: { full_name?: string; phone?: string; role?: string; is_active?: boolean; password?: string }) {
    return this.request<{ staff: import('../types').StaffUser }>(
      `/api/admin/staff/${id}`,
      { method: 'PATCH', body: JSON.stringify(data) },
    );
  }

  updateSettings(settings: Record<string, string>) {
    return this.request('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(settings) });
  }

  // Settings
  getSettings() {
    return this.request<{ settings: import('../types').SiteSettings }>('/api/settings');
  }
}

export const api = new ApiClient();
