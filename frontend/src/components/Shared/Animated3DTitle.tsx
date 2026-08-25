import { motion } from 'framer-motion';

interface Props {
  text: string;
  className?: string;
  startDelay?: number;
}

export default function Animated3DTitle({ text, className = '', startDelay = 0 }: Props) {
  const letters = Array.from(text);

  return (
    <h1
      className={`font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 ${className}`}
      style={{ perspective: 1200 }}
    >
      <span
        className="inline-flex flex-wrap justify-center gap-[0.02em]"
        style={{ transformStyle: 'preserve-3d' }}
        aria-label={text}
      >
        {letters.map((char, i) => (
          <motion.span
            key={`${i}-${char}`}
            className="inline-block origin-bottom"
            style={{
              transformStyle: 'preserve-3d',
              textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 0 30px rgba(212,175,55,0.15)',
            }}
            initial={{
              opacity: 0,
              rotateX: -75,
              rotateY: i % 2 === 0 ? 35 : -35,
              z: -120,
              y: 50,
              scale: 0.6,
            }}
            animate={{
              opacity: 1,
              rotateX: 0,
              rotateY: 0,
              z: 0,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: startDelay + i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}
