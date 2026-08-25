import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_KEY = 'soshi_intro_seen';
const SLICES = 4;
const LOGO_SRC = '/logo.png';

const scatter = [
  { x: -420, y: -280, rotate: -28, scale: 0.55 },
  { x: 480, y: -220, rotate: 22, scale: 0.65 },
  { x: -380, y: 320, rotate: 18, scale: 0.5 },
  { x: 440, y: 280, rotate: -24, scale: 0.6 },
];

function LogoSlices({ onLocked }: { onLocked: () => void }) {
  useEffect(() => {
    const t = setTimeout(onLocked, 1700);
    return () => clearTimeout(t);
  }, [onLocked]);

  return (
    <div className="flex h-[min(70vh,520px)] w-[min(85vw,340px)] sm:w-[min(70vw,380px)]">
      {Array.from({ length: SLICES }).map((_, i) => (
        <motion.div
          key={i}
          className="relative h-full overflow-hidden"
          style={{ width: `${100 / SLICES}%` }}
          initial={{
            x: scatter[i].x,
            y: scatter[i].y,
            rotate: scatter[i].rotate,
            scale: scatter[i].scale,
            opacity: 0,
            filter: 'blur(8px)',
          }}
          animate={{
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
          }}
          transition={{
            duration: 1.7,
            delay: 0.1 + i * 0.14,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <img
            src={LOGO_SRC}
            alt=""
            draggable={false}
            className="absolute top-0 h-full max-w-none select-none pointer-events-none"
            style={{
              width: `${SLICES * 100}%`,
              left: `-${i * (100 / SLICES)}%`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function CinematicIntro() {
  const { pathname } = useLocation();
  const [phase, setPhase] = useState<'idle' | 'playing' | 'glow' | 'exit' | 'done'>('idle');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (pathname !== '/') {
      setPhase('done');
      return;
    }
    if (sessionStorage.getItem(INTRO_KEY)) {
      setPhase('done');
      return;
    }
    setPhase('playing');
  }, [pathname]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const glow = setTimeout(() => setPhase('glow'), 1900);
    const exit = setTimeout(() => setPhase('exit'), 2600);
    const done = setTimeout(() => {
      sessionStorage.setItem(INTRO_KEY, '1');
      setPhase('done');
    }, 3400);
    return () => {
      clearTimeout(glow);
      clearTimeout(exit);
      clearTimeout(done);
    };
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== 'done' && phase !== 'idle' && (
        <motion.div
          key="cinematic-intro"
          className={`fixed inset-0 z-[200] flex items-center justify-center bg-black ${
            phase === 'exit' ? 'pointer-events-none' : ''
          }`}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'exit' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-black to-black" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 40%, #E07856 0%, transparent 45%), radial-gradient(circle at 50% 60%, #D4AF37 0%, transparent 40%)',
            }}
          />

          <motion.div
            className="relative z-10"
            animate={
              locked || phase === 'glow' || phase === 'exit'
                ? {
                    filter: [
                      'drop-shadow(0 0 0px rgba(212,175,55,0))',
                      'drop-shadow(0 0 50px rgba(212,175,55,0.7))',
                      'drop-shadow(0 0 25px rgba(212,175,55,0.35))',
                    ],
                  }
                : {}
            }
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {(phase === 'playing' || phase === 'glow' || phase === 'exit') && (
              <LogoSlices onLocked={() => setLocked(true)} />
            )}
          </motion.div>

          {phase === 'glow' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.6 }}
              style={{
                background: 'radial-gradient(circle at center, rgba(212,175,55,0.25) 0%, transparent 50%)',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
