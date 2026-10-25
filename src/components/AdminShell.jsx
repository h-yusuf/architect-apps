import { Link } from 'react-router-dom';

const syne = { fontFamily: "'Syne', sans-serif" };

// Kerangka halaman CMS: latar dots, bar atas melayang, judul halaman.
export default function AdminShell({ title, subtitle, back, actions, children }) {
  return (
    <div className="dotgrid dotgrid-fade min-h-screen relative isolate text-[#ede4d4]">
      <header className="pill-nav" style={{ width: 'min(calc(100% - 24px), 1000px)' }}>
        <div className="flex items-center gap-4 min-w-0">
          {back ? (
            <Link to={back} className="text-[#7a6d5e] hover:text-[#c4955a] transition-colors text-sm shrink-0" style={syne}>← Dashboard</Link>
          ) : (
            <Link to="/" className="tracking-[0.18em] font-light shrink-0" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}>H. YUSUF</Link>
          )}
          <span className="w-px h-4 bg-[#2c2620] shrink-0" />
          <span className="text-[#7a6d5e] text-xs truncate" style={syne}>CMS</span>
        </div>
        <div className="flex items-center gap-3">{actions}</div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 pt-14 pb-24">
        <div className="mb-9">
          <h1 className="font-light leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3rem)' }}>{title}</h1>
          {subtitle && <p className="text-[#7a6d5e] text-sm mt-1.5" style={syne}>{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
