export const DEMO_PIN = '1111';
export const DEMO_CUSTOMER_EMAIL = 'demo@sushishop-egypt.com';
export const DEMO_CUSTOMER_PHONE = '+201111111111';
export const DEMO_STAFF_EMAIL = 'demo-admin@sushishop-egypt.com';
export const DEMO_STAFF_PHONE = '+201111111111';

const DEMO_IDS = new Set(['1111', 'admin', DEMO_CUSTOMER_PHONE, DEMO_STAFF_PHONE, DEMO_CUSTOMER_EMAIL, DEMO_STAFF_EMAIL]);

export function isDemoCredentials(identifier: string, password = ''): boolean {
  const id = identifier.trim().toLowerCase();
  const pass = password.trim();
  if (pass && pass !== DEMO_PIN) return false;
  return DEMO_IDS.has(id) && (pass === DEMO_PIN || pass === '');
}

export function demoCustomerRecord(preferredLanguage: 'ar' | 'en' | 'ru' = 'ar') {
  return {
    email: DEMO_CUSTOMER_EMAIL,
    phone: DEMO_CUSTOMER_PHONE,
    full_name: 'Demo Guest',
    preferred_language: preferredLanguage,
    primary_auth_method: 'email_phone',
    is_active: true,
  };
}

export function demoStaffRecord() {
  return {
    email: DEMO_STAFF_EMAIL,
    phone: DEMO_STAFF_PHONE,
    full_name: 'Demo Admin',
    role: 'admin' as const,
    is_active: true,
  };
}
