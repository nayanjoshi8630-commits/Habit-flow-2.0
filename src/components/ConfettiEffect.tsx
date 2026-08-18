import React, { useEffect, useRef } from 'react';

interface ConfettiPiece {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  angle: number;
  velocity: number;
}

export const playConfetti = () => {
  const event = new CustomEvent('playConfetti');
  window.dispatchEvent(event);
};

export default function ConfettiEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: ConfettiPiece[] = [];

    const createConfetti = () => {
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: 0,
          size: Math.random() * 8 + 4,
          duration: Math.random() * 2 + 2,
          delay: 0,
          angle: Math.random() * Math.PI * 2,
          velocity: Math.random() * 5 + 3,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.y += p.velocity;
        p.x += Math.cos(p.angle) * 2;

        ctx.fillStyle = `hsla(${Math.random() * 360}, 100%, 50%, 0.8)`;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.y > canvas.height) {
          particles.splice(idx, 1);
        }
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    const handlePlayConfetti = () => {
      createConfetti();
      animate();
    };

    window.addEventListener('playConfetti', handlePlayConfetti);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('playConfetti', handlePlayConfetti);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
