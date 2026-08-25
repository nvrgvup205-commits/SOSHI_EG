import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntro } from '../../hooks/useIntro';
import GoldParticles from './GoldParticles';

const SLICES = 4;
const LOGO_SRC = '/logo.png';
const LOGO_ASPECT = 1024 / 1536;

const scatter = [
  { x: -500, y: -320, rotate: -32, scale: 0.45 },
  { x: 520, y: -260, rotate: 26, scale: 0.55 },
  { x: -460, y: 380, rotate: 22, scale: 0.4 },
  { x: 500, y: 320, rotate: -28, scale: 0.5 },
];

function LogoSlices({ onLocked }: { onLocked: () => void }) {
  const [unified, setUnified] = useState(false);
  const sliceW = 100 / SLICES;

  const handleLocked = useCallback(() => {
    setUnified(true);
    onLocked();
  }, [onLocked]);

  useEffect(() => {
    const t = setTimeout(handleLocked, 3200);
    return () => clearTimeout(t);
  }, [handleLocked]);

  return (
    <div
      className="relative mx-auto"
      style={{ width: 'min(80vw, 340px)', aspectRatio: String(LOGO_ASPECT) }}
    >
      {!unified && Array.from({ length: SLICES }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 h-full overflow-hidden"
          style={{ left: `${i * sliceW}%`, width: `${sliceW}%` }}
          initial={{
            x: scatter[i].x,
            y: scatter[i].y,
            rotate: scatter[i].rotate,
            scale: scatter[i].scale,
            opacity: 0,
            filter: 'blur(12px)',
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
            duration: 2.8,
            delay: 0.2 + i * 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <img
            src={LOGO_SRC}
            alt=""
            draggable={false}
            className="absolute top-0 h-full max-w-none select-none pointer-events-none"
            style={{ width: `${SLICES * 100}%`, left: `-${i * 100}%` }}
          />
        </motion.div>
      ))}

      <motion.img
        src={LOGO_SRC}
        alt="Sushi Shop Egypt"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: unified ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

type Phase = 'idle' | 'playing' | 'ready' | 'exit' | 'done';

export default function CinematicIntro() {
  const { pathname } = useLocation();
  const { introDismissed, dismissIntro, setIntroActive } = useIntro();
  const [phase, setPhase] = useState<Phase>('idle');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (pathname !== '/' || introDismissed) {
      setPhase('done');
      setIntroActive(false);
      return;
    }
    setPhase('playing');
    setIntroActive(true);
  }, [pathname, introDismissed, setIntroActive]);

  useEffect(() => {
    if (phase === 'playing' || phase === 'ready') {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [phase]);

  useEffect(() => {
    if (locked && phase === 'playing') {
      const t = setTimeout(() => setPhase('ready'), 600);
      return () => clearTimeout(t);
    }
  }, [locked, phase]);

  const handleDismiss = () => {
    if (phase !== 'ready') return;
    setPhase('exit');
    setTimeout(() => {
      dismissIntro();
      setPhase('done');
    }, 1400);
  };

  return (
    <AnimatePresence>
      {(phase === 'playing' || phase === 'ready' || phase === 'exit') && (
        <motion.div
          key="cinematic-intro"
          className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black ${
            phase === 'exit' ? 'pointer-events-none' : ''
          }`}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'exit' ? 0 : 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          {/* Base gradients */}
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/25 via-black to-black" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 50% 35%, rgba(224,120,86,0.12) 0%, transparent 55%), radial-gradient(ellipse at 50% 65%, rgba(15,59,79,0.2) 0%, transparent 50%)',
            }}
          />

          <GoldParticles />

          {/* Breathing ambient glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-[2]"
            animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.08, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(212,175,55,0.18) 0%, rgba(15,59,79,0.08) 35%, transparent 65%)',
            }}
          />

          <motion.button
            type="button"
            onClick={handleDismiss}
            disabled={phase !== 'ready'}
            className={`relative z-10 flex flex-col items-center bg-transparent border-0 p-0 ${
              phase === 'ready' ? 'cursor-pointer' : 'cursor-default'
            }`}
            animate={
              phase === 'exit'
                ? { scale: 2.2, filter: 'blur(40px)', opacity: 0 }
                : { scale: 1, filter: 'blur(0px)', opacity: 1 }
            }
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={
                locked
                  ? {
                      filter: [
                        'drop-shadow(0 0 0px rgba(212,175,55,0))',
                        'drop-shadow(0 0 60px rgba(212,175,55,0.75))',
                        'drop-shadow(0 0 30px rgba(212,175,55,0.4))',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <LogoSlices onLocked={() => setLocked(true)} />
            </motion.div>

            {phase === 'ready' && (
              <motion.span
                className="label-luxury mt-10 block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
                transition={{ opacity: { duration: 2.5, repeat: Infinity }, y: { duration: 0.6 } }}
              >
                اضغط للدخول
              </motion.span>
            )}
          </motion.button>

          {locked && phase !== 'exit' && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-[3]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0] }}
              transition={{ duration: 0.9 }}
              style={{
                background: 'radial-gradient(circle at center, rgba(212,175,55,0.3) 0%, transparent 45%)',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
