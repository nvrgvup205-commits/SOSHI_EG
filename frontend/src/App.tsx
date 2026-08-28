import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { ThemeProvider } from './hooks/useTheme';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CustomerLogin from './components/Customer/CustomerLogin';
import AdminLogin from './components/Admin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import CustomersPage from './components/Admin/CustomersPage';
import ProductsPage from './components/Admin/ProductsPage';
import StaffPage from './components/Admin/StaffPage';
import OrdersPage from './components/Admin/OrdersPage';
import SettingsPage from './components/Admin/SettingsPage';
import CategoriesPage from './components/Admin/CategoriesPage';
import BannersPage from './components/Admin/BannersPage';
import ZonesPage from './components/Admin/ZonesPage';
import CouponsPage from './components/Admin/CouponsPage';
import ReportsPage from './components/Admin/ReportsPage';
import ChatInbox from './components/Admin/ChatInbox';
import StaffPortal from './pages/StaffPortal';
import InstallPrompt from './components/Shared/InstallPrompt';
import LanguageGate from './components/Shared/LanguageGate';
import SplashScreen from './components/Shared/SplashScreen';
import BottomNav from './components/Shared/BottomNav';
import AIChatWidget from './components/Chat/AIChatWidget';
import FloatingCartBar from './components/Shared/FloatingCartBar';
import RequireCustomer from './components/Shared/RequireCustomer';
import { useScrollTop } from './hooks/useScrollTop';
import { isAdminRole, staffDashboardPath } from './utils/staffRoles';
import { t } from './utils/i18n';
import type { UserRole } from './types';

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { type, user, loading } = useAuth();
  const { lang } = useLanguage();
  if (loading) return <div className="min-h-screen flex items-center justify-center app-shell">{t('error.loading', lang)}</div>;
  if (type !== 'staff') return <Navigate to="/admin/login" />;
  const role = (user as { role?: UserRole }).role || 'order_handler';
  if (!isAdminRole(role)) return <Navigate to="/staff" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function StaffLoginRedirect() {
  const { type, user, loading } = useAuth();
  const { lang } = useLanguage();
  if (loading) return <div className="min-h-screen flex items-center justify-center app-shell">{t('error.loading', lang)}</div>;
  if (type === 'staff') {
    const role = (user as { role?: UserRole }).role || 'order_handler';
    return <Navigate to={staffDashboardPath(role)} replace />;
  }
  return <AdminLogin />;
}

function AppRoutes() {
  const { hasChosen } = useLanguage();
  const location = useLocation();
  const staffRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem('splash_seen') !== '1');
  useScrollTop();

  if (!hasChosen && !staffRoute) return <LanguageGate />;

  if (!staffRoute && showSplash) {
    return (
      <SplashScreen
        onDone={() => {
          sessionStorage.setItem('splash_seen', '1');
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<RequireCustomer><HomePage /></RequireCustomer>} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/cart" element={<RequireCustomer><CartPage /></RequireCustomer>} />
        <Route path="/checkout" element={<RequireCustomer><CheckoutPage /></RequireCustomer>} />
        <Route path="/orders" element={<RequireCustomer><CustomerOrdersPage /></RequireCustomer>} />
        <Route path="/orders/:id" element={<RequireCustomer><OrderTrackingPage /></RequireCustomer>} />
        <Route path="/chat" element={<RequireCustomer><ChatPage /></RequireCustomer>} />
        <Route path="/profile" element={<RequireCustomer><ProfilePage /></RequireCustomer>} />
        <Route path="/admin/login" element={<StaffLoginRedirect />} />
        <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/admin/customers" element={<ProtectedAdmin><CustomersPage /></ProtectedAdmin>} />
        <Route path="/admin/products" element={<ProtectedAdmin><ProductsPage /></ProtectedAdmin>} />
        <Route path="/admin/orders" element={<ProtectedAdmin><OrdersPage /></ProtectedAdmin>} />
        <Route path="/admin/categories" element={<ProtectedAdmin><CategoriesPage /></ProtectedAdmin>} />
        <Route path="/admin/banners" element={<ProtectedAdmin><BannersPage /></ProtectedAdmin>} />
        <Route path="/admin/zones" element={<ProtectedAdmin><ZonesPage /></ProtectedAdmin>} />
        <Route path="/admin/coupons" element={<ProtectedAdmin><CouponsPage /></ProtectedAdmin>} />
        <Route path="/admin/reports" element={<ProtectedAdmin><ReportsPage /></ProtectedAdmin>} />
        <Route path="/admin/chat" element={<ProtectedAdmin><ChatInbox /></ProtectedAdmin>} />
        <Route path="/admin/staff" element={<ProtectedAdmin><StaffPage /></ProtectedAdmin>} />
        <Route path="/admin/settings" element={<ProtectedAdmin><SettingsPage /></ProtectedAdmin>} />
        <Route path="/staff" element={<StaffPortal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
      <FloatingCartBar />
      <AIChatWidget />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
          <InstallPrompt />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
