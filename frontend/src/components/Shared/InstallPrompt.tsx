import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../utils/i18n';
import BrandMark from './BrandMark';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-dismissed';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

function isStaffPath(path: string) {
  return path.startsWith('/admin') || path.startsWith('/staff');
}

export default function InstallPrompt() {
  const { lang } = useLanguage();
  const { type, loading } = useAuth();
  const location = useLocation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    if (isStandalone()) return;
    if (type) return;
    if (loading) return;
    if (isStaffPath(location.pathname)) return;
    if (location.pathname !== '/login') return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, '1');
    });

    const timer = window.setTimeout(() => setVisible(true), 800);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.clearTimeout(timer);
    };
  }, [type, loading, location.pathname]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    setIosHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISS_KEY, '1');
      setVisible(false);
    }
    setDeferred(null);
  };

  const handleBarClick = () => {
    if (ios) {
      setIosHint((v) => !v);
      return;
    }
    if (deferred) void install();
  };

  if (isStandalone() || type || loading || isStaffPath(location.pathname)) return null;
  if (location.pathname !== '/login') return null;
  if (!visible) return null;

  return (
    <>
      {iosHint && (
        <div
          className="fixed bottom-12 inset-x-4 z-[60] max-w-sm mx-auto p-3 rounded-xl bg-[#0d2b22]/98 border border-amber-500/30 text-xs text-fg/90 leading-relaxed shadow-xl animate-fade-up"
          role="tooltip"
        >
          <Share className="w-3.5 h-3.5 inline me-1 text-accent" />
          {t('pwa.ios', lang)}
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#04120e]/95 backdrop-blur-md border-t border-amber-500/20 py-2.5 px-4 flex items-center justify-between gap-3 safe-area-bottom">
        <button
          type="button"
          onClick={handleBarClick}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-start"
        >
          <BrandMark size="sm" className="shrink-0 scale-75 origin-center" />
          <span className="text-xs text-fg/90 truncate">{t('pwa.body', lang)}</span>
          {!ios && deferred && <Download className="w-4 h-4 text-accent shrink-0" aria-hidden />}
          {ios && <Share className="w-4 h-4 text-accent shrink-0" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="p-1.5 rounded-full text-fg/60 hover:text-fg hover:bg-white/10 shrink-0"
          aria-label={t('pwa.close', lang)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
