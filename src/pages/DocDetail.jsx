import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocBySlug } from '../hooks/useDocs';
import Navbar from '../components/Navbar';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function DocDetail() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | not_found | error

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

  const shell = (children) => (
    <div className="min-h-screen bg-[#0b0a09] text-[#ede4d4]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-8 py-14">{children}</main>
    </div>
  );

  if (status === 'loading') return shell(
    <p
      className="text-[#3d3630]"
      style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em' }}
    >
      Memuat...
    </p>
  );

  if (status === 'not_found') return shell(
    <div className="anim-fade-in">
      <p
        className="text-[#7a6d5e] mb-5"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem' }}
      >
        Dokumen tidak ditemukan.
      </p>
      <Link
        to="/"
        className="text-[#c4955a] hover:text-[#ede4d4] transition-colors uppercase tracking-[0.18em] font-medium"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.62rem' }}
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

  return shell(
    <div className="anim-fade-in">
      {/* Back link */}
      <Link
        to="/"
        className="text-[#7a6d5e] hover:text-[#c4955a] transition-colors uppercase tracking-[0.18em] font-medium inline-block mb-14"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.62rem' }}
      >
        ← Kembali
      </Link>

      {/* Document header */}
      <header className="mb-12">
        <h1
          className="text-[#ede4d4] font-light leading-[1.08] mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            letterSpacing: '-0.01em',
          }}
        >
          {doc.title}
        </h1>
        {doc.description && (
          <p
            className="text-[#7a6d5e] font-normal leading-relaxed mb-7"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', maxWidth: '52ch' }}
          >
            {doc.description}
          </p>
        )}
        <div className="h-px bg-[#c4955a] w-14" />
      </header>

      <MarkdownRenderer content={doc.content} />
    </div>
  );
}
