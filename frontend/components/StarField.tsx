"use client";
import { useEffect, useRef } from "react";

/**
 * 星尘背景：缓慢下落、微微闪烁的情绪色光点。纯 Canvas，轻量。
 */
export function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const palette = ["201,168,106", "109,91,255", "91,207,168", "236,233,226", "155,123,224"];
    const N = Math.min(70, Math.floor((w * h) / 22000));
    const stars = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      c: palette[Math.floor(Math.random() * palette.length)],
      a: Math.random() * 0.5 + 0.2,
      vy: Math.random() * 0.12 + 0.02,
      tw: Math.random() * Math.PI * 2,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;
    const draw = () => {
      t += 0.02;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y += s.vy;
        if (s.y > h + 5) s.y = -5;
        const tw = (Math.sin(t + s.tw) + 1) / 2;
        const alpha = s.a * (0.45 + tw * 0.55);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.c},${alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${s.c},0.8)`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-[1]" aria-hidden />;
}
