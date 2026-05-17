import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocBySlug } from '../hooks/useDocs';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ThemeToggle from '../components/ThemeToggle';

export default function DocDetail() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    getDocBySlug(slug)
      .then(data => {
        if (!data) { setStatus('not_found'); return; }
        setDoc(data);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  const topBar = (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="uppercase tracking-[0.16em] font-semibold flex items-center gap-2 transition-colors duration-200"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', color: 'var(--text-2)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
        >
          ← Kembali
        </Link>
        <div className="flex items-center gap-5">
          <span
            className="tracking-[0.18em] font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.92rem', color: 'var(--text-3)' }}
          >
            H. YUSUF
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  const shell = (children) => (
    <div className="min-h-screen">
      {topBar}
      <main className="max-w-screen-xl mx-auto px-6 md:px-14 py-12 md:py-16">{children}</main>
    </div>
  );

  if (status === 'loading') return shell(
    <p
      className="uppercase tracking-[0.1em]"
      style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', color: 'var(--text-3)' }}
    >
      Memuat...
    </p>
  );

  if (status === 'not_found') return shell(
    <div className="anim-fade-in">
      <p
        className="mb-5"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', color: 'var(--text-2)' }}
      >
        Dokumen tidak ditemukan.
      </p>
      <Link
        to="/"
        className="uppercase tracking-[0.18em] font-semibold transition-colors duration-200"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.6rem', color: 'var(--accent)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
      >
        ← Kembali
      </Link>
    </div>
  );

  if (status === 'error') return shell(
    <p className="text-red-400" style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem' }}>
      Gagal memuat dokumen.
    </p>
  );

  return (
    <div className="min-h-screen">
      {topBar}

      {/* Document hero */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-14 md:py-20 anim-fade-up">
          <p
            className="uppercase tracking-[0.25em] font-semibold mb-5"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.56rem', color: 'var(--accent)' }}
          >
            Dokumentasi
          </p>
          <h1
            className="font-light leading-[1.06] mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              letterSpacing: '-0.01em',
              color: 'var(--text-1)',
              maxWidth: '20ch',
            }}
          >
            {doc.title}
          </h1>
          {doc.description && (
            <p
              className="leading-relaxed"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', maxWidth: '52ch', color: 'var(--text-2)' }}
            >
              {doc.description}
            </p>
          )}
          <div className="mt-8 h-px w-12" style={{ background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-screen-xl mx-auto px-6 md:px-14 py-12 md:py-16 anim-fade-in" style={{ animationDelay: '100ms' }}>
        <MarkdownRenderer content={doc.content} />
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-8 flex items-center justify-between">
          <Link
            to="/"
            className="uppercase tracking-[0.18em] font-semibold flex items-center gap-2 transition-colors duration-200"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', color: 'var(--text-2)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            ← Semua Karya
          </Link>
          <span
            className="tracking-[0.2em] font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: 'var(--text-3)' }}
          >
            H. YUSUF
          </span>
        </div>
      </footer>
    </div>
  );
}
