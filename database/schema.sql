-- Sushi Shop Egypt - Database Schema (soshi)
-- Project: holol-gym (khzrapojrkhxjsjgnflr)
-- Schema: soshi

CREATE SCHEMA IF NOT EXISTS soshi;

-- See Supabase migrations:
-- create_soshi_core_schema
-- soshi_rls_and_seed
-- expose_soshi_schema

-- Core tables:
-- soshi.staff_users       - Admin & staff accounts
-- soshi.customers         - Customer database (admin portal)
-- soshi.customer_sessions - Current login sessions (email+phone)
-- soshi.otp_codes         - Future WhatsApp OTP
-- soshi.staff_sessions    - Staff login sessions
-- soshi.roles_permissions - RBAC permissions
-- soshi.products          - Menu items (ar/en/ru)
-- soshi.orders            - Customer orders
-- soshi.order_items       - Order line items
-- soshi.conversations     - Chat conversations
-- soshi.chat_messages     - Chat messages
-- soshi.site_settings     - Site configuration

-- Customer auth flow (current):
-- 1. Customer enters email + phone
-- 2. Backend upserts soshi.customers
-- 3. Creates soshi.customer_sessions with token
-- 4. Returns session_token to client

-- Future auth:
-- WhatsApp OTP: soshi.otp_codes (channel='whatsapp')
-- Google login: customers.auth_user_id + customers.google_id

-- Default admin:
-- Email: admin@sushishop-egypt.com
-- Phone: +201000000001 (01000000001)
-- Password: Admin@2026

-- Extra tables (customer app):
-- soshi.categories, soshi.addresses, soshi.addons, soshi.product_addons
-- soshi.banners, soshi.coupons, soshi.delivery_zones, soshi.notifications
