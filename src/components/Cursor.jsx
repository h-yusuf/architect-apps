import { useEffect, useRef } from 'react';

const TAIL_MS = 380; // umur tiap titik ekor
const rgb = (hex) => {
  const m = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  return m ? `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}` : '196,149,90';
};

// Cursor lingkar kecil + titik tengah, dengan ekor bintang jatuh saat digerakkan.
// Hanya untuk mouse (hover: hover, pointer: fine). Loop berhenti sendiri saat diam.
export default function Cursor() {
  const ref = useRef(null);
  const cv = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = ref.current, c = cv.current, ctx = c.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('has-cursor');
    let x = -100, y = -100, tx = -100, ty = -100, raf = 0, ink = '196,149,90', w = 0, h = 0;
    const pts = []; // {x, y, t}

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const loop = (now) => {
      x += (tx - x) * 0.28; y += (ty - y) * 0.28;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      if (!reduce) {
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(x - last.x, y - last.y) > 1.5) pts.push({ x, y, t: now });
        while (pts.length && now - pts[0].t > TAIL_MS) pts.shift();
        ctx.clearRect(0, 0, w, h);
        ctx.lineCap = 'round';
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i];
          const life = 1 - (now - b.t) / TAIL_MS;          // 1 di kepala, 0 di ujung ekor
          ctx.strokeStyle = `rgba(${ink},${0.75 * life * life})`;
          ctx.lineWidth = 0.5 + 3.2 * life;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const idle = Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1 && pts.length === 0;
      raf = idle ? 0 : requestAnimationFrame(loop);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };

    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (x < 0 && y < 0) { x = tx; y = ty; } // muncul di posisi mouse, bukan terbang dari pojok
      el.style.opacity = 1;
      if (reduce) { x = tx; y = ty; }
      if (!raf) ink = rgb(getComputedStyle(document.documentElement).getPropertyValue('--accent'));
      wake();
    };
    const over = (e) => {
      const t = e.target;
      el.classList.toggle('is-link', Boolean(t.closest?.('a, button, [role="button"], [role="switch"], summary, label, select')));
      el.classList.toggle('is-text', Boolean(t.closest?.('input:not([type="checkbox"]), textarea')));
    };
    const leave = () => { el.style.opacity = 0; };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    document.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <>
      <canvas ref={cv} className="cursor-tail" aria-hidden="true" />
      <div ref={ref} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
