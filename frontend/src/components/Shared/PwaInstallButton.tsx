import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const ios = isIOS();

  useEffect(() => {
    if (isStandalone()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setDeferred(null));

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return { deferred, ios, install, canPrompt: Boolean(deferred) || ios };
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

export default function PwaInstallButton({ onIosOpen }: Props) {
  const { lang } = useLanguage();
  const { deferred, ios, install } = usePwaInstall();
  const [iosSheet, setIosSheet] = useState(false);

  const handleClick = () => {
    if (ios) {
      setIosSheet(true);
      onIosOpen?.();
      return;
    }
    if (deferred) void install();
  };

  return (
    <>
      {iosSheet && <IosInstallSheet onClose={() => setIosSheet(false)} />}
      <div className="fixed bottom-4 inset-x-4 z-50 max-w-md mx-auto safe-area-bottom pointer-events-none">
        <button
          type="button"
          onClick={handleClick}
          className="pwa-install-btn w-full pointer-events-auto"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden />
          <span>{t('pwa.install_cta', lang)}</span>
        </button>
      </div>
    </>
  );
}
