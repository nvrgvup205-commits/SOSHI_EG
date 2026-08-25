import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const texts: Record<Language, { title: string; body: string; install: string; dismiss: string; ios: string }> = {
  ar: {
    title: 'ثبّت التطبيق على جوالك',
    body: 'حمّل سوشي شوب للوصول السريع والإشعارات',
    install: 'تحميل الآن',
    dismiss: 'لاحقاً',
    ios: 'اضغط مشاركة ثم "إضافة إلى الشاشة الرئيسية"',
  },
  en: {
    title: 'Install on your phone',
    body: 'Add Sushi Shop for quick access and updates',
    install: 'Install Now',
    dismiss: 'Later',
    ios: 'Tap Share, then "Add to Home Screen"',
  },
  ru: {
    title: 'Установить на телефон',
    body: 'Добавьте Sushi Shop для быстрого доступа',
    install: 'Установить',
    dismiss: 'Позже',
    ios: 'Нажмите «Поделиться», затем «На экран Домой»',
  },
};

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export default function InstallPrompt() {
  const { lang } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const t = texts[lang];

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem('pwa-dismissed')) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setVisible(false));

    if (isIOS()) {
      setTimeout(() => setShowIOS(true), 4000);
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem('pwa-dismissed', '1');
    setVisible(false);
    setShowIOS(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferred(null);
  };

  if (isStandalone()) return null;

  const show = visible || showIOS;
  if (!show) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-[100] md:inset-x-auto md:end-6 md:bottom-6 md:max-w-sm animate-fade-up">
      <div className="card p-5 border border-accent/30 shadow-2xl shadow-accent/10">
        <button
          onClick={dismiss}
          className="absolute top-3 end-3 text-white/30 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <img src="/pwa-192.png" alt="" className="w-14 h-14 rounded-lg shrink-0" />
          <div className="flex-1 pe-6">
            <p className="text-white font-medium text-sm mb-1">{t.title}</p>
            <p className="text-white/50 text-xs leading-relaxed">
              {showIOS ? t.ios : t.body}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {!showIOS && deferred && (
            <button onClick={install} className="btn-luxury-filled text-xs flex-1 py-2.5">
              <Download className="w-3.5 h-3.5" />
              {t.install}
            </button>
          )}
          {showIOS && (
            <button onClick={dismiss} className="btn-luxury-filled text-xs flex-1 py-2.5">
              <Share className="w-3.5 h-3.5" />
              {t.install}
            </button>
          )}
          <button onClick={dismiss} className="btn-luxury text-xs py-2.5 px-4">
            {t.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
