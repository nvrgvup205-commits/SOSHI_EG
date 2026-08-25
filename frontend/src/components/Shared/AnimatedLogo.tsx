import { useEffect, useState } from 'react';

const ROWS = 5;
const COLS = 5;
const SRC = '/logo.png';

interface PieceProps {
  row: number;
  col: number;
  delay: number;
}

function LogoPiece({ row, col, delay }: PieceProps) {
  const xPct = COLS > 1 ? (col / (COLS - 1)) * 100 : 0;
  const yPct = ROWS > 1 ? (row / (ROWS - 1)) * 100 : 0;
  const seed = row * COLS + col;
  const tx = ((seed % 7) - 3) * 90;
  const ty = (((seed * 3) % 7) - 3) * 90;
  const rot = ((seed % 5) - 2) * 30;

  return (
    <div
      className="logo-piece"
      style={{
        backgroundImage: `url(${SRC})`,
        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
        backgroundPosition: `${xPct}% ${yPct}%`,
        animationDelay: `${delay}ms`,
        ['--tx' as string]: `${tx}px`,
        ['--ty' as string]: `${ty}px`,
        ['--rot' as string]: `${rot}deg`,
      }}
    />
  );
}

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
  const [assembled, setAssembled] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setAssembled(true), 2200);
    return () => clearTimeout(t);
  }, [animate]);

  if (!animate) {
    return (
      <img
        src={SRC}
        alt="Sushi Shop Egypt"
        className={`${sizes[size]} h-auto object-contain ${className}`}
      />
    );
  }

  return (
    <div className={`relative mx-auto ${sizes[size]} ${className}`} style={{ aspectRatio: '3/4' }}>
      <div
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          const centerDist = Math.hypot(row - (ROWS - 1) / 2, col - (COLS - 1) / 2);
          return <LogoPiece key={i} row={row} col={col} delay={centerDist * 55 + 200} />;
        })}
      </div>
      {assembled && <div className="absolute inset-0 pointer-events-none logo-shine" aria-hidden />}
    </div>
  );
}
