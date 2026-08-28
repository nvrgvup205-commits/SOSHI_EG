import { useEffect, useState } from 'react';
import { Download, MoreVertical, Share, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import {
  getDeferredPrompt,
  subscribePwaInstall,
  triggerPwaInstall,
} from '../../lib/pwaInstall';
import { t } from '../../utils/i18n';

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

function useDeferredPromptReady() {
  const [ready, setReady] = useState(() => Boolean(getDeferredPrompt()));

  useEffect(() => {
    setReady(Boolean(getDeferredPrompt()));
    return subscribePwaInstall(() => setReady(Boolean(getDeferredPrompt())));
  }, []);

  return ready;
}

interface Props {
  onIosOpen?: () => void;
}

function IosInstallSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage();

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 bg-black/55" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-[#0d2b22] border border-amber-500/35 p-5 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t('pwa.install', lang)}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-fg">{t('pwa.install', lang)}</span>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-white/10" aria-label={t('pwa.close', lang)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <ol className="space-y-3 text-sm text-fg/90">
          <li className="flex items-start gap-2">
            <Share className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>{t('pwa.ios_step1', lang)}</span>
          </li>
          <li className="flex items-start gap-2">
            <Download className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>{t('pwa.ios_step2', lang)}</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

function AndroidFallbackSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage();

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 bg-black/55" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-[#0d2b22] border border-amber-500/35 p-5 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t('pwa.android_fallback_title', lang)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-fg">{t('pwa.android_fallback_title', lang)}</span>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-white/10" aria-label={t('pwa.close', lang)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-fg/90 leading-relaxed flex items-start gap-2">
          <MoreVertical className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden />
          <span>{t('pwa.android_fallback_body', lang)}</span>
        </p>
      </div>
    </div>
  );
}

export default function PwaInstallButton({ onIosOpen }: Props) {
  const { lang } = useLanguage();
  const ios = isIOS();
  const promptReady = useDeferredPromptReady();
  const [iosSheet, setIosSheet] = useState(false);
  const [androidFallback, setAndroidFallback] = useState(false);

  const handleInstallClick = async () => {
    if (ios) {
      setIosSheet(true);
      onIosOpen?.();
      return;
    }

    const outcome = await triggerPwaInstall();
    if (outcome === 'unavailable') {
      setAndroidFallback(true);
    }
  };

  return (
    <>
      {iosSheet && <IosInstallSheet onClose={() => setIosSheet(false)} />}
      {androidFallback && <AndroidFallbackSheet onClose={() => setAndroidFallback(false)} />}
      <div className="fixed bottom-4 inset-x-4 z-50 max-w-md mx-auto safe-area-bottom pointer-events-none">
        <button
          type="button"
          onClick={() => void handleInstallClick()}
          className="pwa-install-btn w-full pointer-events-auto"
          aria-describedby={!ios && !promptReady ? 'pwa-install-hint' : undefined}
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden />
          <span>{t('pwa.install_cta', lang)}</span>
        </button>
        {!ios && !promptReady && (
          <p id="pwa-install-hint" className="sr-only">{t('pwa.android_fallback_body', lang)}</p>
        )}
      </div>
    </>
  );
}
