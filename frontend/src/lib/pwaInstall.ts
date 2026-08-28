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

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return window.deferredPrompt ?? null;
}

export function clearDeferredPrompt() {
  window.deferredPrompt = null;
  notify();
}

/** Attach as early as possible — also backed by inline script in index.html. */
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

export async function triggerPwaInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const promptEvent = getDeferredPrompt();
  if (!promptEvent) return 'unavailable';

  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;
  clearDeferredPrompt();
  return outcome;
}
