export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_SCHEMA: string;
  CORS_ORIGIN: string;
}

export type UserRole =
  | 'admin'
  | 'staff_supervisor'
  | 'order_handler'
  | 'chat_handler'
  | 'product_viewer';

export type AuthMethod = 'email_phone' | 'whatsapp_otp' | 'google';

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';

export interface Customer {
  id: string;
  email: string;
  phone: string;
  full_name: string | null;
  preferred_language: 'ar' | 'en' | 'ru';
  email_verified: boolean;
  phone_verified: boolean;
  primary_auth_method: AuthMethod;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
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
}
