'use client';
import { useEffect, useRef } from 'react';

/**
 * Cuadrícula cinética (port del canvas del sitio estático a React).
 * Se deforma hacia el cursor y genera ondas al hacer clic. Paleta cian de marca.
 * Debe usarse dentro de un contenedor con position: relative; overflow: hidden.
 */
export default function KineticGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.05 };
    const LINE_ACTIVE = { r: 44, g: 195, b: 239, a: 0.85 };
    const NODE_BASE = { r: 255, g: 255, b: 255, a: 0.14 };
    const NODE_ACTIVE = { r: 44, g: 195, b: 239, a: 1 };
    const GLOW = '44,195,239';
    const RIPPLE = '44,195,239';
    const CELL = 74, INF = 240, MAXW = 22, NBR = 1.6, NAR = 3.0, LERP = 0.09;

    const mouse = { x: -9999, y: -9999 };
    const target = { x: -9999, y: -9999 };
    const ripples: { x: number; y: number; radius: number; opacity: number; born: number }[] = [];
    let W = 0, H = 0, dpr = 1, raf = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lc = (ba: typeof LINE_BASE, ac: typeof LINE_BASE, t: number) =>
      `rgba(${Math.round(lerp(ba.r, ac.r, t))},${Math.round(lerp(ba.g, ac.g, t))},${Math.round(lerp(ba.b, ac.b, t))},${lerp(ba.a, ac.a, t).toFixed(3)})`;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = section.clientWidth; H = section.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const warp = (gx: number, gy: number, col: number, row: number, cols: number, rows: number) => {
      const e = 1.5;
      const cp = Math.min(col / e, (cols - 1 - col) / e, 1);
      const rp = Math.min(row / e, (rows - 1 - row) / e, 1);
      const pin = cp * cp * rp * rp;
      const dx = gx - mouse.x, dy = gy - mouse.y, d = Math.hypot(dx, dy);
      const prox = Math.max(0, 1 - d / INF) * pin;
      let rx = 0, ry = 0;
      for (const rpl of ripples) {
        const rdx = gx - rpl.x, rdy = gy - rpl.y, rdist = Math.hypot(rdx, rdy);
        const ww = 55, diff = rdist - rpl.radius;
        if (Math.abs(diff) < ww) {
          const strength = (1 - Math.abs(diff) / ww) * rpl.opacity * 16 * pin;
          const a = Math.atan2(rdy, rdx), sign = diff < 0 ? -1 : 1;
          rx += Math.cos(a) * strength * sign * -1;
          ry += Math.sin(a) * strength * sign * -1;
        }
      }
      if (d < INF && d > 0 && pin > 0) {
        const t = d / INF;
        const ea = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, d / 60);
        const amt = ea * MAXW * pin, a = Math.atan2(dy, dx);
        return { x: gx - Math.cos(a) * amt + rx, y: gy - Math.sin(a) * amt + ry, p: prox };
      }
      return { x: gx + rx, y: gy + ry, p: prox };
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]; const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 380); r.opacity = Math.max(0, 1 - age * 1.2);
        if (r.opacity <= 0) ripples.splice(i, 1);
      }
      const cols = Math.max(2, Math.ceil(W / CELL)) + 1;
      const rows = Math.max(2, Math.ceil(H / CELL)) + 1;
      const cw = W / (cols - 1), ch = H / (rows - 1);
      const pts: { x: number; y: number; p: number }[][] = [], prox: number[][] = [];
      for (let row = 0; row < rows; row++) {
        pts[row] = []; prox[row] = [];
        for (let col = 0; col < cols; col++) {
          const wp = warp(col * cw, row * ch, col, row, cols, rows);
          pts[row][col] = wp; prox[row][col] = wp.p;
        }
      }
      const seg = (p1: { x: number; y: number }, p2: { x: number; y: number }, a: number, b: number) => {
        const av = (a + b) / 2, t = av * av * (3 - 2 * av);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lc(LINE_BASE, LINE_ACTIVE, t); ctx.lineWidth = lerp(0.7, 1.4, t); ctx.stroke();
      };
      for (let row = 0; row < rows; row++) for (let col = 0; col < cols - 1; col++) seg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);
      for (let col = 0; col < cols; col++) for (let row = 0; row < rows - 1; row++) seg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);
      for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
        const p = pts[row][col]; const t = prox[row][col] * prox[row][col] * (3 - 2 * prox[row][col]);
        const r = lerp(NBR, NAR, t);
        if (t > 0.3) {
          const glowR = r + lerp(0, 6, (t - 0.3) / 0.7);
          const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
          grd.addColorStop(0, `rgba(${GLOW},${(t * 0.3).toFixed(3)})`); grd.addColorStop(1, `rgba(${GLOW},0)`);
          ctx.beginPath(); ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = lc(NODE_BASE, NODE_ACTIVE, t); ctx.fill();
      }
      for (const r of ripples) {
        ctx.beginPath(); ctx.arc(r.x, r.y, Math.max(0, r.radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${RIPPLE},${(r.opacity * 0.28).toFixed(3)})`; ctx.lineWidth = 1.4; ctx.stroke();
      }
    };

    const loop = (now: number) => {
      mouse.x = lerp(mouse.x, target.x, LERP); mouse.y = lerp(mouse.y, target.y, LERP);
      draw(now); raf = requestAnimationFrame(loop);
    };

    resize();
    const onResize = () => { resize(); if (reduce) draw(performance.now()); };
    window.addEventListener('resize', onResize);

    const onMove = (e: MouseEvent) => { const r = section.getBoundingClientRect(); target.x = e.clientX - r.left; target.y = e.clientY - r.top; };
    const onLeave = () => { target.x = -9999; target.y = -9999; };
    const onClick = (e: MouseEvent) => { const r = section.getBoundingClientRect(); ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, radius: 0, opacity: 1, born: performance.now() }); };

    let io: IntersectionObserver | null = null;
    if (reduce) {
      draw(performance.now());
    } else {
      section.addEventListener('mousemove', onMove);
      section.addEventListener('mouseleave', onLeave);
      section.addEventListener('click', onClick);
      io = new IntersectionObserver((ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting && !raf) raf = requestAnimationFrame(loop);
          else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
        });
      }, { threshold: 0 });
      io.observe(section);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      section.removeEventListener('click', onClick);
      if (io) io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
