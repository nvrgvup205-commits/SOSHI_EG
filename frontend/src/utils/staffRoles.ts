import type { UserRole } from '../types';

export const STAFF_ROLES: UserRole[] = [
  'order_handler',
  'chat_handler',
  'product_viewer',
  'staff_supervisor',
];

export const ROLE_LABELS: Record<UserRole, { ar: string; en: string }> = {
  admin: { ar: 'مدير', en: 'Admin' },
  staff_supervisor: { ar: 'مشرف', en: 'Supervisor' },
  order_handler: { ar: 'معالج طلبات', en: 'Order Handler' },
  chat_handler: { ar: 'محادثات', en: 'Chat Handler' },
  product_viewer: { ar: 'عرض منتجات', en: 'Product Viewer' },
};

export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'staff_supervisor';
}

export function staffDashboardPath(role: UserRole): string {
  return isAdminRole(role) ? '/admin' : '/staff';
}

export function staffCanAccessOrders(role: UserRole): boolean {
  return ['admin', 'staff_supervisor', 'order_handler'].includes(role);
}

export function staffCanAccessProducts(role: UserRole): boolean {
  return ['admin', 'staff_supervisor', 'product_viewer'].includes(role);
}

export function staffCanAccessChat(role: UserRole): boolean {
  return ['admin', 'staff_supervisor', 'chat_handler'].includes(role);
}

export function staffCanManageStaff(role: UserRole): boolean {
  return role === 'admin';
}
