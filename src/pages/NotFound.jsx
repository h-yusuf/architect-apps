import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="uppercase tracking-[0.16em] font-semibold transition-colors duration-200"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', color: 'var(--text-2)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            ← Beranda
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p
          className="anim-fade-in uppercase tracking-[0.3em] font-semibold mb-6"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', color: 'var(--accent)' }}
        >
          404
        </p>
        <h1
          className="anim-fade-up font-light leading-[1.05] mb-8"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            letterSpacing: '-0.02em',
            color: 'var(--text-1)',
          }}
        >
          Halaman tidak<br />ditemukan
        </h1>
        <Link
          to="/"
          className="anim-fade-up uppercase tracking-[0.2em] font-semibold transition-colors duration-200"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.6rem', color: 'var(--text-2)', animationDelay: '80ms' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
        >
          Kembali ke Beranda →
        </Link>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-8 flex items-center justify-between">
          <span
            className="tracking-[0.2em] font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: 'var(--text-3)' }}
          >
            H. YUSUF
          </span>
          <span
            className="uppercase tracking-[0.2em]"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.52rem', color: 'var(--text-3)' }}
          >
            Arsitek
          </span>
        </div>
      </footer>
    </div>
  );
}
