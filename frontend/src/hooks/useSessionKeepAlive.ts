import { useEffect } from 'react';
import { api } from '../utils/api';

/** Keep session alive — extends 30-day TTL on the server. */
export function useSessionKeepAlive(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !api.getToken()) return;

    const refresh = () => {
      api.refreshSession().catch(() => {});
    };

    refresh();
    const timer = window.setInterval(refresh, 15 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled]);
}
