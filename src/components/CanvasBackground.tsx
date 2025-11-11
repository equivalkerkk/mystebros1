import React, { useEffect, useRef } from 'react';

export const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let point = { x: width / 2, y: height / 2 };
    let hue = 0;
    const particles: any[] = [];
    const max = 200;

    const createParticle = () => {
      const particle = {
        hue: 0,
        alpha: 0,
        size: Math.random() * 4 + 1,
        x: Math.random() * width,
        y: Math.random() * height,
        velocity: 0,
        changed: null as boolean | null,
        changedFrame: 0,
        maxChangedFrames: 50,

        draw: function(ctx: CanvasRenderingContext2D, point: { x: number; y: number }, hue: number) {
          this.hue = hue;
          ctx.strokeStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
          ctx.stroke();
          this.update(point);
        },

        update: function(point: { x: number; y: number }) {
          if (this.changed) {
            this.alpha *= 0.92;
            this.size += 2;
            this.changedFrame++;
            if (this.changedFrame > this.maxChangedFrames) {
              this.reset();
            }
          } else if (this.distance(point.x, point.y) < 50) {
            this.changed = true;
          } else {
            const dx = point.x - this.x;
            const dy = point.y - this.y;
            const angle = Math.atan2(dy, dx);

            this.alpha += 0.01;
            this.x += this.velocity * Math.cos(angle);
            this.y += this.velocity * Math.sin(angle);
            this.velocity += 0.02;
          }
        },

        reset: function() {
          this.hue = 0;
          this.alpha = 0;
          this.size = Math.random() * 4 + 1;
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.velocity = this.size * 0.5;
          this.changed = null;
          this.changedFrame = 0;
        },

        distance: function(x: number, y: number) {
          return Math.hypot(x - this.x, y - this.y);
        }
      };

      particle.velocity = particle.size * 0.5;
      return particle;
    };

    // Initialize particles
    for (let i = 0; i < max; i++) {
      setTimeout(() => {
        particles.push(createParticle());
      }, i * 10);
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0,0,0, .2)';
      ctx.fillRect(0, 0, width, height);
      particles.forEach(p => p.draw(ctx, point, hue));
      hue += 0.3;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse/touch handlers
    const handleMouseMove = (e: MouseEvent) => {
      point.x = e.clientX;
      point.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      point.x = e.touches[0].clientX;
      point.y = e.touches[0].clientY;
    };

    const handleMouseLeave = () => {
      point = { x: width / 2, y: height / 2 };
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      point = { x: width / 2, y: height / 2 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'all'
      }}
    />
  );
};
