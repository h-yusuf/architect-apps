import { useEffect, useRef } from 'react';

// Bintang galaksi: 4 lengan spiral logaritmik + inti padat + hamburan acak.
// ponytail: acak tiap load; seed tetap kalau mau bentuk yang selalu sama.
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
const stars = [
  ...Array.from({ length: 3200 }, (_, i) => {
    const r = Math.pow(Math.random(), 0.7);
    return { r, th: (i % 4) * (Math.PI / 2) - r * 3.4 + gauss() * (0.1 + (1 - r) * 0.5), a: 0.15 + (1 - r) * 0.5, s: Math.random() < 0.06 ? 1.8 : 1, ph: Math.random() * 6.283 };
  }),
  ...Array.from({ length: 700 }, () => {
    const r = Math.abs(gauss()) * 0.22;
    return { r, th: Math.random() * 6.283, a: 0.55, s: 1.1, ph: Math.random() * 6.283 };
  }),
];

// Bintang latar: posisi relatif (0-1), tersebar di seluruh layar.
const bg = Array.from({ length: 750 }, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() < 0.05 ? 1.7 : Math.random() < 0.35 ? 1.1 : 0.7,
  a: 0.35 + Math.random() * 0.6, ph: Math.random() * 6.283, sp: 0.5 + Math.random() * 1.5,
}));
const hexRgb = (hex) => {
  const m = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  return m ? `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}` : null;
};

// Latar tetap: galaksi + cincin orbit Bima Sakti berputar pelan.
export default function Backdrop() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, dpr, raf, rot = 0.6, frame = 0, ink = '196,149,90', star = '237,228,212';

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (frame++ % 60 === 0) {
        const cs = getComputedStyle(document.documentElement);
        ink = hexRgb(cs.getPropertyValue('--accent').trim()) || ink;
        star = hexRgb(cs.getPropertyValue('--text-1').trim()) || star;
      }
      ctx.clearRect(0, 0, w, h);
      const tt = frame * 0.016;
      for (const b of bg) {
        const a = b.a * (0.55 + 0.45 * Math.sin(tt * b.sp + b.ph));
        ctx.fillStyle = `rgba(${star},${a})`;
        ctx.beginPath();
        ctx.arc(b.x * w, b.y * h, b.r, 0, 6.283);
        ctx.fill();
        if (b.r > 1.5) { // bintang terang: kilau silang
          ctx.strokeStyle = `rgba(${star},${a * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(b.x * w - 5, b.y * h); ctx.lineTo(b.x * w + 5, b.y * h);
          ctx.moveTo(b.x * w, b.y * h - 5); ctx.lineTo(b.x * w, b.y * h + 5);
          ctx.stroke();
        }
      }
      const R = Math.min(w * 0.62, h * 0.9);
      const cx = w < 768 ? w * 0.5 : w * 0.64, cy = h * 0.5;
      const tilt = -0.42, ct = Math.cos(tilt), st = Math.sin(tilt);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.35);
      g.addColorStop(0, `rgba(${ink},0.18)`);
      g.addColorStop(1, `rgba(${ink},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      // cincin orbit tipis, sejajar bidang galaksi
      ctx.lineWidth = 1;
      [0.5, 0.78, 1.06].forEach((k, i) => {
        ctx.strokeStyle = `rgba(${ink},${0.1 - i * 0.025})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * k, R * k * 0.42, tilt, 0, 6.283);
        ctx.stroke();
      });
      const t = frame * 0.02;
      for (const p of stars) {
        const th = p.th + rot; // seluruh galaksi berputar bersama; lengan melengkung ke belakang arah putar
        const x = Math.cos(th) * p.r * R, y = Math.sin(th) * p.r * R * 0.42;
        ctx.fillStyle = `rgba(${ink},${p.a * (0.75 + 0.25 * Math.sin(t + p.ph))})`;
        ctx.beginPath();
        ctx.arc(cx + x * ct - y * st, cy + x * st + y * ct, p.s, 0, 6.283);
        ctx.fill();
      }
      if (!still) { rot += 0.0006; raf = requestAnimationFrame(draw); }
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="backdrop" />;
}
