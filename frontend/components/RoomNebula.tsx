"use client";
import { useEffect, useRef } from "react";
import { nebulaPos } from "@/lib/color";
import type { Member } from "@/lib/types";

/**
 * 成员情绪星云：每个在线成员 = 一颗其情绪色的漂浮光点，位置由成员 id 哈希稳定。
 * 纯 Canvas，pointer-events:none，叠在全局星云背景之上。复用 floatSlow 节奏。
 */
export function RoomNebula({ members }: { members: Member[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const membersRef = useRef(members);
  membersRef.current = members;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = () => {
      t += reduced ? 0 : 0.015;
      ctx.clearRect(0, 0, w, h);
      for (const m of membersRef.current) {
        const p = nebulaPos(m.id);
        const baseX = (p.x / 100) * w;
        const baseY = (p.y / 100) * h;
        const x = baseX + (reduced ? 0 : Math.sin(t + baseX * 0.01) * 14);
        const y = baseY + (reduced ? 0 : Math.cos(t * 0.8 + baseY * 0.01) * 10);
        const tw = reduced ? 0.7 : (Math.sin(t * 1.5 + baseX) + 1) / 2;
        const r = 2.6 + tw * 1.6;
        // 光晕
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        g.addColorStop(0, m.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = 0.3 + tw * 0.4;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 5, 0, Math.PI * 2);
        ctx.fill();
        // 核心
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-[1]" aria-hidden />;
}
