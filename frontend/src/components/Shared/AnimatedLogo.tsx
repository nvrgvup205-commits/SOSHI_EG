import { motion } from 'framer-motion';

const LOGO_SRC = '/logo.png';
const LOGO_ASPECT = 1024 / 1536;
const SLICES = 4;

const scatter = [
  { x: -12, y: -10, rotate: -6 },
  { x: 14, y: -8, rotate: 5 },
  { x: -10, y: 12, rotate: 4 },
  { x: 12, y: 10, rotate: -5 },
];

const sizes = {
  hero: 'w-64 sm:w-80 md:w-96 lg:w-[26rem]',
  md: 'w-36',
  sm: 'w-[4.5rem]',
};

interface Props {
  className?: string;
  size?: keyof typeof sizes;
  loop?: boolean;
}

export default function AnimatedLogo({ className = '', size = 'hero', loop = false }: Props) {
  if (!loop) {
    return (
      <img
        src={LOGO_SRC}
        alt="Sushi Shop Egypt"
        className={`${sizes[size]} h-auto object-contain ${className}`}
        style={{ aspectRatio: String(LOGO_ASPECT) }}
        draggable={false}
      />
    );
  }

  const sliceW = 100 / SLICES;

  return (
    <div
      className={`relative ${sizes[size]} ${className}`}
      style={{ aspectRatio: String(LOGO_ASPECT) }}
    >
      {Array.from({ length: SLICES }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 h-full overflow-hidden"
          style={{ left: `${i * sliceW}%`, width: `${sliceW}%` }}
          animate={{
            x: [0, scatter[i].x, scatter[i].x, 0],
            y: [0, scatter[i].y, scatter[i].y, 0],
            rotate: [0, scatter[i].rotate, scatter[i].rotate, 0],
            opacity: [1, 0.9, 0.9, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.38, 0.62, 1],
            delay: i * 0.12,
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
    </div>
  );
}
