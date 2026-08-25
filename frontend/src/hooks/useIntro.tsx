import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const INTRO_KEY = 'soshi_intro_seen';

interface IntroState {
  introDismissed: boolean;
  isIntroActive: boolean;
  setIntroActive: (active: boolean) => void;
  dismissIntro: () => void;
}

const IntroContext = createContext<IntroState | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introDismissed, setIntroDismissed] = useState(
    () => sessionStorage.getItem(INTRO_KEY) === '1',
  );
  const [isIntroActive, setIntroActive] = useState(false);

  const dismissIntro = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, '1');
    setIntroDismissed(true);
    setIntroActive(false);
  }, []);

  return (
    <IntroContext.Provider value={{ introDismissed, isIntroActive, setIntroActive, dismissIntro }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error('useIntro must be used within IntroProvider');
  return ctx;
}

export { INTRO_KEY };
