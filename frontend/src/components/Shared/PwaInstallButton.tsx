import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import {
  getDeferredPrompt,
  invokePwaInstallSync,
  isAndroid,
  isIOS,
  isStandalone,
  subscribePwaInstall,
} from '../../lib/pwaInstall';
import { t } from '../../utils/i18n';

function useDeferredPromptReady() {
  const [ready, setReady] = useState(() => Boolean(getDeferredPrompt()));

  useEffect(() => {
    setReady(Boolean(getDeferredPrompt()));
    return subscribePwaInstall(() => setReady(Boolean(getDeferredPrompt())));
  }, []);

  return ready;
}

interface Props {
  variant?: 'fixed' | 'inline';
}

function IosInstallSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage();

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-amber-500/40 p-5 shadow-2xl animate-fade-up"
        style={{ background: '#0d2b22', color: '#f8f4ec' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t('pwa.install', lang)}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ color: '#f8f4ec' }}>{t('pwa.install', lang)}</span>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-white/10" aria-label={t('pwa.close', lang)}>
            <X className="w-4 h-4" style={{ color: '#f8f4ec' }} />
          </button>
        </div>
        <ol className="space-y-3 text-sm leading-relaxed" style={{ color: '#f8f4ec' }}>
          <li className="flex items-start gap-2">
            <Share className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#e5a93c' }} />
            <span>{t('pwa.ios_step1', lang)}</span>
          </li>
          <li className="flex items-start gap-2">
            <Download className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#e5a93c' }} />
            <span>{t('pwa.ios_step2', lang)}</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default function PwaInstallButton({ variant = 'inline' }: Props) {
  const { lang } = useLanguage();
  const { type, loading } = useAuth();
  const ios = isIOS();
  const android = isAndroid();
  const promptReady = useDeferredPromptReady();
  const [iosSheet, setIosSheet] = useState(false);

  if (isStandalone() || type || loading) return null;

  // Android: show only when native install prompt is captured (direct install on tap)
  if (android && !promptReady) return null;
  // Desktop: hide unless native prompt exists
  if (!ios && !android && !promptReady) return null;

  const handleInstallClick = () => {
    if (ios) {
      setIosSheet(true);
      return;
    }
    invokePwaInstallSync();
  };

  const wrapClass = variant === 'fixed'
    ? 'fixed bottom-4 inset-x-4 z-50 max-w-md mx-auto safe-area-bottom'
    : 'w-full shrink-0 pt-2';

  return (
    <>
      {iosSheet && <IosInstallSheet onClose={() => setIosSheet(false)} />}
      <div className={wrapClass}>
        <button type="button" onClick={handleInstallClick} className="pwa-install-btn w-full">
          <img src="/pwa-192.png" alt="" className="w-7 h-7 rounded-lg shrink-0 object-cover" width={28} height={28} />
          <span className="pwa-install-label">{t('pwa.install_cta', lang)}</span>
          <Download className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
        </button>
      </div>
    </>
  );
}
