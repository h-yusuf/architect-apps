import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDocs } from '../hooks/useDocs';
import Navbar from '../components/Navbar';

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

  return (
    <div className="min-h-screen bg-[#0b0a09] text-[#ede4d4]">
      <Navbar />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-20 pb-16">
        <div className="anim-fade-up" style={{ animationDelay: '60ms' }}>
          <h1
            className="text-[#ede4d4] font-light leading-[1.04]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(3.8rem, 9vw, 5.8rem)',
              letterSpacing: '-0.01em',
            }}
          >
            H. Yusuf
          </h1>
          <p
            className="mt-4 text-[#c4955a] uppercase font-medium tracking-[0.28em]"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.62rem' }}
          >
            Arsitek — Dokumentasi &amp; Catatan
          </p>
        </div>

        <div
          className="mt-10 h-px bg-[#c4955a] anim-expand-x"
          style={{ animationDelay: '180ms' }}
        />
      </section>

      {/* Document list */}
      <main className="max-w-3xl mx-auto px-8 pb-28">
        {error && (
          <p
            className="text-red-400 mb-6"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem' }}
          >
            {error}
          </p>
        )}

        {loading && (
          <p
            className="text-[#3d3630] text-center py-16"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Memuat...
          </p>
        )}

        <div>
          {docs.map((doc, i) => (
            <button
              key={doc.id}
              onClick={() => navigate(`/doc/${doc.slug}`)}
              className="anim-fade-up w-full text-left group relative border-b border-[#1c1915] hover:border-[#2c2620] transition-colors py-8 px-0"
              style={{ animationDelay: `${240 + i * 75}ms` }}
            >
              {/* Large decorative number — right side background */}
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#1c1915] group-hover:text-[#252016] transition-colors duration-500 select-none pointer-events-none"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '7rem',
                  fontWeight: 300,
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="flex items-start gap-5 pr-20">
                {/* Small index label */}
                <span
                  className="text-[#3d3630] font-semibold tracking-[0.15em] uppercase mt-1 shrink-0"
                  style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', minWidth: '1.8rem' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <h2
                    className="text-[#ede4d4] group-hover:text-[#c4955a] transition-colors duration-200 font-normal leading-[1.15]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.55rem',
                      marginBottom: '0.45rem',
                    }}
                  >
                    {doc.title}
                  </h2>
                  <p
                    className="text-[#7a6d5e] font-normal leading-relaxed"
                    style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.77rem' }}
                  >
                    {doc.description}
                  </p>
                </div>

                {/* Arrow */}
                <span
                  className="text-[#c4955a] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0 mt-0.5"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.3rem',
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </button>
          ))}
        </div>

        {!loading && docs.length === 0 && !error && (
          <p
            className="text-[#3d3630] text-center mt-20"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Belum ada dokumen.
          </p>
        )}
      </main>
    </div>
  );
}
