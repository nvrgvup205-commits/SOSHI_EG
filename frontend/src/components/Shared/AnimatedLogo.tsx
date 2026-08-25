import { useEffect, useState } from 'react';

const CANVAS_H = 1536;

const SLICES = [
  { src: '/logo/slice-0.png', top: 200, height: 160 },
  { src: '/logo/slice-1.png', top: 360, height: 180 },
  { src: '/logo/slice-2.png', top: 540, height: 180 },
  { src: '/logo/slice-3.png', top: 720, height: 250 },
  { src: '/logo/slice-4.png', top: 1010, height: 140 },
  { src: '/logo/slice-5.png', top: 1150, height: 170 },
] as const;

const STAGGER_MS = 260;
const DROP_MS = 780;
const HOLD_MS = 3400;
const CYCLE_MS = (SLICES.length - 1) * STAGGER_MS + DROP_MS + HOLD_MS;

const sizes = {
  hero: 'w-64 sm:w-80 md:w-96 lg:w-[26rem]',
  md: 'w-36',
  sm: 'w-20',
};

interface Props {
  className?: string;
  size?: keyof typeof sizes;
  animate?: boolean;
}

export default function AnimatedLogo({ className = '', size = 'hero', animate = true }: Props) {
  const [cycle, setCycle] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!animate || reduceMotion) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [animate, reduceMotion]);

  if (!animate || reduceMotion) {
    return (
      <img
        src="/logo.png"
        alt="Sushi Shop Egypt"
        className={`${sizes[size]} h-auto object-contain ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative mx-auto overflow-hidden ${sizes[size]} ${className}`}
      style={{ aspectRatio: '1024 / 1536' }}
      aria-label="Sushi Shop Egypt"
      role="img"
    >
      {SLICES.map((slice, i) => {
        const fromY = `-${((slice.top / slice.height) * 100 + 40).toFixed(1)}%`;
        return (
          <img
            key={`${cycle}-${slice.src}`}
            src={slice.src}
            alt=""
            draggable={false}
            className="logo-drop-slice absolute left-0 w-full"
            style={{
              top: `${(slice.top / CANVAS_H) * 100}%`,
              height: `${(slice.height / CANVAS_H) * 100}%`,
              animationDuration: `${DROP_MS}ms`,
              animationDelay: `${i * STAGGER_MS}ms`,
              ['--from-y' as string]: fromY,
            }}
          />
        );
      })}
    </div>
  );
}
