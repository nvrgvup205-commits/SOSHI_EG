import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, X, Share, PlusSquare } from 'lucide-react';
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
  const { lang, hasChosen } = useLanguage();
  const { type, loading } = useAuth();
  const location = useLocation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (type) return;
    if (loading) return;
    if (isStaffPath(location.pathname)) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      window.setTimeout(() => setVisible(true), 600);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, '1');
    });

    const timer = window.setTimeout(() => {
      if (isIOS()) setIos(true);
      else setVisible(true);
    }, 800);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.clearTimeout(timer);
    };
  }, [type, loading, location.pathname]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    setIos(false);
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

  if (isStandalone() || type || loading || isStaffPath(location.pathname)) return null;
  if (hasChosen && location.pathname !== '/login') return null;
  if (!visible && !ios) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-[100] md:inset-x-auto md:end-6 md:bottom-6 md:max-w-sm animate-fade-up">
      <div className="card p-5 border border-accent/30 shadow-2xl shadow-accent/10 relative overflow-hidden">
        <span className="logo-halo-glow !inset-auto !-top-8 !-start-8 !w-28 !h-28" aria-hidden />
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 end-3 z-10 p-1.5 rounded-full text-fg/70 hover:text-fg hover:bg-black/10"
          aria-label={t('pwa.close', lang)}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 relative z-10">
          <BrandMark size="sm" />
          <div className="flex-1 pe-6">
            <p className="text-fg font-medium text-sm mb-1">{t('pwa.title', lang)}</p>
            <p className="text-muted text-xs leading-relaxed">
              {ios ? t('pwa.ios', lang) : t('pwa.body', lang)}
            </p>
            {ios && (
              <p className="text-accent text-xs mt-2 flex items-center gap-1.5">
                <Share className="w-3.5 h-3.5" />
                <PlusSquare className="w-3.5 h-3.5" />
                {t('pwa.ios', lang)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4 relative z-10">
          {!ios && deferred && (
            <button type="button" onClick={() => void install()} className="btn-luxury-filled text-xs flex-1 py-2.5">
              <Download className="w-3.5 h-3.5" />
              {t('pwa.install', lang)}
            </button>
          )}
          {ios && (
            <button type="button" onClick={dismiss} className="btn-luxury-filled text-xs flex-1 py-2.5">
              <Share className="w-3.5 h-3.5" />
              {t('pwa.install', lang)}
            </button>
          )}
          <button type="button" onClick={dismiss} className="btn-luxury text-xs py-2.5 px-4">
            {t('pwa.dismiss', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
