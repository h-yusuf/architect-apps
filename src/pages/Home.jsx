import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDocs } from '../hooks/useDocs';
import ThemeToggle from '../components/ThemeToggle';

function CardVisual({ number, size = 'sm' }) {
  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        minHeight: size === 'lg' ? '260px' : '156px',
        height: size === 'lg' ? '100%' : undefined,
        background: 'var(--surface-card)',
        backgroundImage: `
          linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
        `,
        backgroundSize: '38px 38px',
      }}
    >
      <div className="absolute top-4 left-4 w-[18px] h-[18px] border-t border-l" style={{ borderColor: 'var(--corner-mark)' }} />
      <div className="absolute top-4 right-4 w-[18px] h-[18px] border-t border-r" style={{ borderColor: 'var(--corner-mark)' }} />
      <div className="absolute bottom-4 left-4 w-[18px] h-[18px] border-b border-l" style={{ borderColor: 'var(--corner-mark)' }} />
      <div className="absolute bottom-4 right-4 w-[18px] h-[18px] border-b border-r" style={{ borderColor: 'var(--corner-mark)' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: size === 'lg' ? '9rem' : '5.5rem',
            fontWeight: 300,
            color: 'var(--accent-ghost)',
            lineHeight: 1,
            userSelect: 'none',
            letterSpacing: '-0.02em',
          }}
          aria-hidden="true"
        >
          {String(number).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function FeaturedCard({ doc, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left rounded-2xl overflow-hidden transition-colors duration-300"
      style={{ border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}` }}
    >
      <div className="grid md:grid-cols-[1fr_1fr] min-h-[300px] md:min-h-0">
        <div className="min-h-[240px] md:min-h-[340px]">
          <CardVisual number={1} size="lg" />
        </div>
        <div
          className="p-8 md:p-12 lg:p-16 flex flex-col justify-center gap-5"
          style={{ background: 'var(--surface-card)' }}
        >
          <span
            className="uppercase tracking-[0.25em] font-semibold"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.56rem', color: 'var(--accent)' }}
          >
            Unggulan
          </span>
          <h2
            className="font-light leading-[1.1] transition-colors duration-200"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.9rem, 3.5vw, 2.9rem)',
              letterSpacing: '-0.01em',
              color: hovered ? 'var(--accent)' : 'var(--text-1)',
            }}
          >
            {doc.title}
          </h2>
          <p
            className="leading-relaxed"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', maxWidth: '42ch', color: 'var(--text-2)' }}
          >
            {doc.description}
          </p>
          <span
            className="flex items-center gap-2 uppercase tracking-[0.18em] font-semibold mt-1"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.6rem', color: 'var(--accent)' }}
          >
            Baca Selengkapnya
            <span
              className="transition-transform duration-200"
              style={{ transform: hovered ? 'translateX(6px)' : 'none' }}
            >
              →
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}

function GridCard({ doc, number, delay, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="anim-fade-up text-left rounded-2xl overflow-hidden flex flex-col transition-colors duration-300"
      style={{
        border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        animationDelay: `${delay}ms`,
      }}
    >
      <CardVisual number={number} size="sm" />
      <div className="p-6 flex flex-col flex-1 gap-2.5" style={{ background: 'var(--surface-card)' }}>
        <h2
          className="font-normal leading-[1.2] transition-colors duration-200"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.4rem',
            color: hovered ? 'var(--accent)' : 'var(--text-1)',
          }}
        >
          {doc.title}
        </h2>
        <p
          className="leading-relaxed flex-1"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.75rem', color: 'var(--text-2)' }}
        >
          {doc.description}
        </p>
        <span
          className="uppercase tracking-[0.14em] font-semibold mt-1 transition-opacity duration-200"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '0.58rem',
            color: 'var(--accent)',
            opacity: hovered ? 1 : 0,
          }}
        >
          Baca →
        </span>
      </div>
    </button>
  );
}

export default function Home() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    listDocs()
      .then(setDocs)
      .catch(() => setError('Gagal memuat dokumen.'))
      .finally(() => setLoading(false));
  }, []);

  const featured = docs[0] || null;
  const rest = docs.slice(1);

  return (
    <div className="min-h-screen">

      {/* Page header */}
      <header style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-14 md:py-20">
          <div className="flex items-center justify-between mb-5">
            <p
              className="anim-fade-in uppercase font-semibold tracking-[0.3em]"
              style={{ color: 'var(--accent)', fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', animationDelay: '0ms' }}
            >
              Dokumentasi &amp; Karya
            </p>
            <div className="anim-fade-in" style={{ animationDelay: '40ms' }}>
              <ThemeToggle />
            </div>
          </div>
          <h1
            className="anim-fade-up font-light leading-[1.02]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(3.8rem, 9vw, 7rem)',
              letterSpacing: '-0.02em',
              color: 'var(--text-1)',
              animationDelay: '80ms',
            }}
          >
            H. Yusuf
          </h1>
          <p
            className="anim-fade-up font-normal mt-5"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '0.82rem',
              maxWidth: '46ch',
              lineHeight: 1.7,
              color: 'var(--text-2)',
              animationDelay: '140ms',
            }}
          >
            Arsitek. Catatan desain, referensi teknis, dan dokumentasi proyek.
          </p>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 md:px-14 py-14">
        {error && (
          <p className="text-red-400 mb-6 text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
            {error}
          </p>
        )}

        {loading && (
          <p
            className="text-center py-24 uppercase tracking-[0.12em]"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', color: 'var(--text-3)' }}
          >
            Memuat...
          </p>
        )}

        {featured && (
          <section className="anim-fade-up mb-14" style={{ animationDelay: '200ms' }}>
            <FeaturedCard doc={featured} onClick={() => navigate(`/doc/${featured.slug}`)} />
          </section>
        )}

        {rest.length > 0 && (
          <>
            <div className="flex items-center gap-5 mb-8">
              <h3
                className="uppercase tracking-[0.25em] font-semibold shrink-0"
                style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', color: 'var(--text-2)' }}
              >
                Semua Karya
              </h3>
              <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((doc, i) => (
                <GridCard
                  key={doc.id}
                  doc={doc}
                  number={i + 2}
                  delay={220 + i * 65}
                  onClick={() => navigate(`/doc/${doc.slug}`)}
                />
              ))}
            </div>
          </>
        )}

        {!loading && docs.length === 0 && !error && (
          <p
            className="text-center py-28 uppercase tracking-[0.1em]"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', color: 'var(--text-3)' }}
          >
            Belum ada dokumen.
          </p>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
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
