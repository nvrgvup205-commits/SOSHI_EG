export type Language = 'ar' | 'en' | 'ru';

export type UserRole =
  | 'admin'
  | 'staff_supervisor'
  | 'order_handler'
  | 'chat_handler'
  | 'product_viewer';

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';

export interface Customer {
  id: string;
  email: string;
  phone: string;
  full_name: string | null;
  preferred_language: Language;
  email_verified: boolean;
  phone_verified: boolean;
  primary_auth_method: string;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  notes?: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffUser {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  name_ru: string;
  description_ar: string | null;
  description_en: string | null;
  description_ru: string | null;
  price: number;
  image_original_url: string | null;
  image_compressed_url: string | null;
  image_thumbnail_url: string | null;
  category: string;
  is_available: boolean;
  sort_order?: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: OrderStatus;
  total_price: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SiteSettings {
  whatsapp_number?: string;
  telegram_username?: string;
  ai_chat_enabled?: string;
  site_name_ar?: string;
  site_name_en?: string;
  site_name_ru?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  currency?: string;
  customer_auth_mode?: string;
  whatsapp_otp_enabled?: string;
  google_login_enabled?: string;
}
