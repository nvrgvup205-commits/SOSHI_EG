import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import PwaInstallButton, { isStandalone } from './PwaInstallButton';

function isStaffPath(path: string) {
  return path.startsWith('/admin') || path.startsWith('/staff');
}

export default function InstallPrompt() {
  const { hasChosen } = useLanguage();
  const { type, loading } = useAuth();
  const location = useLocation();

  const onLanguageGate = !hasChosen && !isStaffPath(location.pathname);
  const onLogin = location.pathname === '/login';
  const showPortal = onLanguageGate || onLogin;

  if (isStandalone() || type || loading || isStaffPath(location.pathname)) return null;
  if (!showPortal) return null;

  return <PwaInstallButton />;
}
