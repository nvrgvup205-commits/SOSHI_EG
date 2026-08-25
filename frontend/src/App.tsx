import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CustomerLogin from './components/Customer/CustomerLogin';
import AdminLogin from './components/Admin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import CustomersPage from './components/Admin/CustomersPage';
import ProductsPage from './components/Admin/ProductsPage';
import StaffPage from './components/Admin/StaffPage';
import OrdersPage from './components/Admin/OrdersPage';
import SettingsPage from './components/Admin/SettingsPage';
import StaffPortal from './pages/StaffPortal';
import InstallPrompt from './components/Shared/InstallPrompt';
import CinematicIntro from './components/Shared/CinematicIntro';
import { IntroProvider } from './hooks/useIntro';

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { type, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-ink text-white">Loading...</div>;
  if (type !== 'staff') return <Navigate to="/admin/login" />;
  return <AdminLayout>{children}</AdminLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      <Route path="/admin/customers" element={<ProtectedAdmin><CustomersPage /></ProtectedAdmin>} />
      <Route path="/admin/products" element={<ProtectedAdmin><ProductsPage /></ProtectedAdmin>} />
      <Route path="/admin/orders" element={<ProtectedAdmin><OrdersPage /></ProtectedAdmin>} />
      <Route path="/admin/staff" element={<ProtectedAdmin><StaffPage /></ProtectedAdmin>} />
      <Route path="/admin/settings" element={<ProtectedAdmin><SettingsPage /></ProtectedAdmin>} />
      <Route path="/staff" element={<StaffPortal />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <IntroProvider>
        <AuthProvider>
          <CinematicIntro />
          <AppRoutes />
          <InstallPrompt />
        </AuthProvider>
      </IntroProvider>
    </LanguageProvider>
  );
}
