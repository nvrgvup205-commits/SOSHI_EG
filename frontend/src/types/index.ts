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

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  name_ru: string;
  image: string | null;
  sort_order: number;
}

export interface Addon {
  id: string;
  name_ar: string;
  name_en: string;
  name_ru: string;
  price: number;
  is_active?: boolean;
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
  video_url?: string | null;
  category: string;
  category_id?: string | null;
  is_available: boolean;
  is_new?: boolean;
  is_popular?: boolean;
  is_offer?: boolean;
  sort_order?: number;
  addons?: Addon[];
}

export interface Banner {
  id: string;
  kind: 'new_rolls' | 'offers' | 'popular';
  title_ar: string;
  title_en: string;
  title_ru: string;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  subtitle_ru: string | null;
  image_url: string | null;
  product_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Address {
  id: string;
  customer_id: string;
  area: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  delivery_fee: number;
  is_active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  expiry: string | null;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: OrderStatus;
  total_price: number;
  subtotal?: number;
  delivery_fee?: number;
  discount?: number;
  payment_method?: string;
  coupon_code?: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  delivery_address?: string | null;
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
  notes?: string | null;
  addons?: Array<{ id: string; name: string; price: number }>;
}

export interface CartAddon {
  id: string;
  name_ar: string;
  name_en: string;
  name_ru: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addons: CartAddon[];
  notes: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'staff' | 'ai';
  message: string;
  language: string | null;
  translated_message: string | null;
  is_translated: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string | null;
  order_id: string | null;
  kind: string;
  status: string;
  customer_language: string | null;
  last_message_at: string | null;
  customers?: Pick<Customer, 'full_name' | 'phone' | 'email' | 'preferred_language'>;
  orders?: { order_number: string; status: string };
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
  restaurant_open?: string;
}
