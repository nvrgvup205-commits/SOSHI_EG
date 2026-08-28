import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/globals.css';

async function purgeStaleCaches() {
  if (!('caches' in window)) return;
  const keys = (await caches.keys()).filter((k) => k.startsWith('workbox-precache'));
  if (keys.length <= 1) return;
  keys.sort();
  await Promise.all(keys.slice(0, -1).map((k) => caches.delete(k)));
}

void purgeStaleCaches();

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    registration?.update();
    window.setInterval(() => registration?.update(), 60_000);
  },
  onNeedRefresh() {
    void updateSW(true);
  },
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
