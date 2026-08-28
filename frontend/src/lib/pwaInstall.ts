export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export const PWA_INSTALL_READY_EVENT = 'pwa-install-ready';

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent | null;
    __pwaCaptureInit?: boolean;
  }
}

const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((cb) => cb());
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function isMobileInstallTarget() {
  return isIOS() || isAndroid();
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  const prompt = window.deferredPrompt;
  if (!prompt || typeof prompt.prompt !== 'function') return null;
  return prompt;
}

export function clearDeferredPrompt() {
  window.deferredPrompt = null;
  notify();
}

/** Attach as early as possible — also backed by inline script in index.html <head>. */
export function initPwaInstallCapture() {
  if (typeof window === 'undefined' || window.__pwaCaptureInit) return;
  window.__pwaCaptureInit = true;

  if (window.deferredPrompt === undefined) {
    window.deferredPrompt = null;
  }

  const onBeforeInstall = (e: Event) => {
    e.preventDefault();
    window.deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
    window.dispatchEvent(new Event(PWA_INSTALL_READY_EVENT));
  };

  const onInstalled = () => {
    clearDeferredPrompt();
  };

  window.addEventListener('beforeinstallprompt', onBeforeInstall);
  window.addEventListener('appinstalled', onInstalled);
}

export function subscribePwaInstall(listener: () => void) {
  subscribers.add(listener);
  const onReady = () => listener();
  window.addEventListener(PWA_INSTALL_READY_EVENT, onReady);
  return () => {
    subscribers.delete(listener);
    window.removeEventListener(PWA_INSTALL_READY_EVENT, onReady);
  };
}

/**
 * Must run synchronously inside the click handler (user-gesture) — do not await before prompt().
 */
export function invokePwaInstallSync(): 'prompted' | 'unavailable' {
  const promptEvent = getDeferredPrompt();
  if (!promptEvent) return 'unavailable';

  try {
    void promptEvent.prompt();
    void promptEvent.userChoice.then(() => clearDeferredPrompt()).catch(() => clearDeferredPrompt());
    return 'prompted';
  } catch {
    clearDeferredPrompt();
    return 'unavailable';
  }
}
