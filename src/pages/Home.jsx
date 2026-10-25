import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listDocs, listPublishedDocs } from '../hooks/useDocs';
import useAuth from '../hooks/useAuth';
import useReveal from '../hooks/useReveal';
import PillNav from '../components/PillNav';
import Backdrop from '../components/Backdrop';

const privateBadge = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.5rem',
  color: 'var(--text-2)',
  background: 'var(--border-subtle)',
  border: '1px solid var(--border)',
  borderRadius: '2px',
  padding: '2px 6px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  display: 'inline-block',
  alignSelf: 'flex-start',
};

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
          {!doc.published && (
            <span
              style={privateBadge}
            >
              Private
            </span>
          )}
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
  const ref = useReveal();
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="reveal text-left rounded-2xl overflow-hidden flex flex-col transition-colors duration-300"
      style={{
        border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        '--reveal-delay': `${(delay % 3) * 80}ms`,
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
        {!doc.published && (
          <span
            style={privateBadge}
          >
            Private
          </span>
        )}
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
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user && !user.isAnonymous;

  useEffect(() => {
    if (authLoading) return;
    const adminNow = user && !user.isAnonymous;
    let stale = false;
    setLoading(true);
    setError('');
    (adminNow ? listDocs() : listPublishedDocs())
      .then(d => { if (!stale) setDocs(d); })
      .catch(() => { if (!stale) setError('Gagal memuat dokumen.'); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [user, authLoading]);

  const q = search.trim().toLowerCase();
  const shown = q
    ? docs.filter(d => `${d.title} ${d.description}`.toLowerCase().includes(q))
    : docs;
  const featured = q ? null : shown[0] || null;
  const rest = q ? shown : shown.slice(1);

  return (
    <div className="min-h-screen">
      <Backdrop />
      <PillNav />

      <header id="top" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-16 md:py-28">
          <p
            className="anim-fade-in uppercase font-semibold tracking-[0.3em] mb-5"
            style={{ color: 'var(--accent)', fontFamily: "'Syne', sans-serif", fontSize: '0.58rem' }}
          >
            Arsitek · Dokumentasi &amp; Karya
          </p>
          <h1
            className="anim-fade-up font-light leading-[1.02]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(3.8rem, 10vw, 8.5rem)',
              letterSpacing: '-0.02em',
              color: 'var(--text-1)',
              animationDelay: '80ms',
            }}
          >
            Desain yang<br />dibangun <em style={{ color: 'var(--accent)' }}>dengan teliti.</em>
          </h1>
          <p
            className="anim-fade-up font-normal mt-6"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', maxWidth: '46ch', lineHeight: 1.7, color: 'var(--text-2)', animationDelay: '140ms' }}
          >
            Saya H. Yusuf. Catatan desain, referensi teknis, dan dokumentasi proyek, dikumpulkan di satu tempat.
          </p>
          <a
            href="#karya"
            className="anim-fade-up inline-flex items-center gap-3 mt-9 rounded-full px-6 py-3 uppercase tracking-[0.18em] font-semibold transition-colors"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.6rem', background: 'var(--accent)', color: 'var(--bg)', animationDelay: '200ms' }}
          >
            <span className="roll"><span>Lihat karya</span><span aria-hidden="true">Lihat karya</span></span>
            <span aria-hidden="true">↓</span>
          </a>
          <div className="draft-rule mt-16 md:mt-24" />
        </div>
      </header>

      <main id="karya" className="max-w-screen-xl mx-auto px-6 md:px-14 py-14 scroll-mt-20">
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

        {docs.length > 3 && (
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari karya..."
            aria-label="Cari karya"
            className="w-full max-w-sm mb-10 bg-transparent rounded px-4 py-2.5 text-sm outline-none transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-1)', fontFamily: "'Syne', sans-serif" }}
          />
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
                  number={q ? i + 1 : i + 2}
                  delay={220 + i * 65}
                  onClick={() => navigate(`/doc/${doc.slug}`)}
                />
              ))}
            </div>
          </>
        )}

        {!loading && q && shown.length === 0 && (
          <p className="text-center py-20 text-sm" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-2)' }}>
            Tidak ada hasil untuk "{search}".
          </p>
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
          <Link
            to={isAdmin ? '/admin/dashboard' : '/admin'}
            className="uppercase tracking-[0.2em]"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.52rem', color: 'var(--text-3)' }}
          >
            {isAdmin ? 'Dashboard' : 'Admin'}
          </Link>
        </div>
      </footer>
    </div>
  );
}
