const API_BASE = import.meta.env.VITE_API_URL || '';

import type {
  Addon, Address, Banner, Category, Conversation, Coupon, Customer, DeliveryZone,
  Order, Product, StaffUser, ChatMessage,
} from '../types';

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

  customerLogin(data: { email: string; phone: string; preferred_language?: string }) {
    return this.request<{ session_token: string; customer: Record<string, unknown> }>(
      '/api/auth/customer/login',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  customerRegister(data: {
    email: string;
    phone: string;
    full_name: string;
    address: string;
    area?: string;
    preferred_language?: string;
  }) {
    return this.request<{ session_token: string; customer: Record<string, unknown> }>(
      '/api/auth/customer/register',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  staffLogin(data: { phone?: string; email?: string; identifier?: string; password: string }) {
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

  getHome() {
    return this.request<{
      categories: Category[];
      products: Product[];
      banners: Banner[];
      addons: Addon[];
      restaurant_open: boolean;
      settings: Record<string, string>;
    }>('/api/catalog/home');
  }

  getProducts(category?: string) {
    const q = category ? `?category=${category}` : '';
    return this.request<{ products: Product[] }>(`/api/products${q}`);
  }

  getProduct(id: string) {
    return this.request<{ product: Product }>(`/api/products/${id}`);
  }

  getAllProducts() {
    return this.request<{ products: Product[] }>('/api/products?all=true');
  }

  createProduct(data: Record<string, unknown>) {
    return this.request<{ product: Product }>('/api/products', { method: 'POST', body: JSON.stringify(data) });
  }

  updateProduct(id: string, data: Record<string, unknown>) {
    return this.request<{ product: Product }>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
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

  getCustomers(params?: { search?: string; page?: number }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    return this.request<{ customers: Customer[]; pagination: { total: number } }>(`/api/customers?${q}`);
  }

  updateCustomer(id: string, data: Partial<Customer>) {
    return this.request(`/api/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  createOrder(data: {
    items: Array<{ product_id: string; quantity: number; notes?: string; addon_ids?: string[] }>;
    notes?: string;
    address_id?: string;
    delivery_zone_id?: string;
    coupon_code?: string;
    payment_method?: string;
    delivery_address?: string;
  }) {
    return this.request<{ order: Order }>('/api/orders', { method: 'POST', body: JSON.stringify(data) });
  }

  getMyOrders() {
    return this.request<{ orders: Order[] }>('/api/orders/mine');
  }

  getOrder(id: string) {
    return this.request<{ order: Order }>(`/api/orders/${id}`);
  }

  getOrders(status?: string) {
    const q = status ? `?status=${status}` : '';
    return this.request<{ orders: Order[] }>(`/api/orders${q}`);
  }

  updateOrderStatus(id: string, status: string) {
    return this.request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  getAddresses() {
    return this.request<{ addresses: Address[] }>('/api/addresses');
  }

  createAddress(data: { area?: string; address: string; is_default?: boolean }) {
    return this.request<{ address: Address }>('/api/addresses', { method: 'POST', body: JSON.stringify(data) });
  }

  getZones(all = false) {
    return this.request<{ zones: DeliveryZone[] }>(`/api/catalog/zones${all ? '?all=true' : ''}`);
  }

  validateCoupon(code: string) {
    return this.request<{ coupon: Coupon }>('/api/catalog/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  getChat(orderId?: string) {
    const q = orderId ? `?order_id=${orderId}` : '';
    return this.request<{ conversation: Conversation; messages: ChatMessage[] }>(`/api/chat${q}`);
  }

  sendChat(message: string, orderId?: string) {
    return this.request<{ message: ChatMessage }>('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ message, order_id: orderId }),
    });
  }

  getInbox() {
    return this.request<{ conversations: Conversation[] }>('/api/chat/inbox');
  }

  getInboxThread(id: string) {
    return this.request<{ conversation: Conversation; messages: ChatMessage[] }>(`/api/chat/inbox/${id}`);
  }

  sendStaffChat(id: string, message: string) {
    return this.request<{ message: ChatMessage }>(`/api/chat/inbox/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  getAnalytics() {
    return this.request<{
      today_orders: number;
      total_customers: number;
      today_messages: number;
      active_staff: number;
      today_revenue?: number;
      restaurant_open?: boolean;
    }>('/api/admin/analytics');
  }

  getReports() {
    return this.request<{
      period_days: number;
      orders_count: number;
      revenue: number;
      by_status: Record<string, number>;
      cash_orders: number;
    }>('/api/admin/reports');
  }

  getStaff() {
    return this.request<{ staff: StaffUser[] }>('/api/admin/staff');
  }

  createStaff(data: { full_name: string; phone: string; role: string; password?: string; email?: string }) {
    return this.request<{ staff: StaffUser; default_password?: string }>(
      '/api/admin/staff',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  updateStaff(id: string, data: { full_name?: string; phone?: string; role?: string; is_active?: boolean; password?: string }) {
    return this.request<{ staff: StaffUser }>(`/api/admin/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  updateSettings(settings: Record<string, string>) {
    return this.request('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(settings) });
  }

  getSettings() {
    return this.request<{ settings: Record<string, string> }>('/api/settings');
  }

  getCategories() {
    return this.request<{ categories: Category[] }>('/api/catalog/categories');
  }

  createCategory(data: Record<string, unknown>) {
    return this.request('/api/catalog/categories', { method: 'POST', body: JSON.stringify(data) });
  }

  updateCategory(id: string, data: Record<string, unknown>) {
    return this.request(`/api/catalog/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  deleteCategory(id: string) {
    return this.request(`/api/catalog/categories/${id}`, { method: 'DELETE' });
  }

  getBanners(all = false) {
    return this.request<{ banners: Banner[] }>(`/api/catalog/banners${all ? '?all=true' : ''}`);
  }

  createBanner(data: Record<string, unknown>) {
    return this.request('/api/catalog/banners', { method: 'POST', body: JSON.stringify(data) });
  }

  updateBanner(id: string, data: Record<string, unknown>) {
    return this.request(`/api/catalog/banners/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  deleteBanner(id: string) {
    return this.request(`/api/catalog/banners/${id}`, { method: 'DELETE' });
  }

  getAddons() {
    return this.request<{ addons: Addon[] }>('/api/catalog/addons');
  }

  createAddon(data: Record<string, unknown>) {
    return this.request('/api/catalog/addons', { method: 'POST', body: JSON.stringify(data) });
  }

  updateAddon(id: string, data: Record<string, unknown>) {
    return this.request(`/api/catalog/addons/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  createZone(data: Record<string, unknown>) {
    return this.request('/api/catalog/zones', { method: 'POST', body: JSON.stringify(data) });
  }

  updateZone(id: string, data: Record<string, unknown>) {
    return this.request(`/api/catalog/zones/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  deleteZone(id: string) {
    return this.request(`/api/catalog/zones/${id}`, { method: 'DELETE' });
  }

  getCoupons() {
    return this.request<{ coupons: Coupon[] }>('/api/catalog/coupons');
  }

  createCoupon(data: Record<string, unknown>) {
    return this.request('/api/catalog/coupons', { method: 'POST', body: JSON.stringify(data) });
  }

  updateCoupon(id: string, data: Record<string, unknown>) {
    return this.request(`/api/catalog/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  deleteCoupon(id: string) {
    return this.request(`/api/catalog/coupons/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
