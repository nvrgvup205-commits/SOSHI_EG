import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

export default function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(55, Math.floor((window.innerWidth * window.innerHeight) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.2 + 0.4,
        speedY: Math.random() * 0.35 + 0.08,
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.45 + 0.15,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < -4) {
          p.y = window.innerHeight + 4;
          p.x = Math.random() * window.innerWidth;
        }
        if (p.x < -4) p.x = window.innerWidth + 4;
        if (p.x > window.innerWidth + 4) p.x = -4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" aria-hidden />;
}
