import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="border-b border-[#2c2620] bg-[#0b0a09] anim-fade-in" style={{ animationDelay: '0ms' }}>
      <div className="max-w-3xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4">
          <span
            className="text-[#ede4d4] font-light tracking-[0.18em]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', lineHeight: 1 }}
          >
            H. YUSUF
          </span>
          <span className="w-px h-[11px] bg-[#2c2620] inline-block" />
          <span
            className="text-[#7a6d5e] uppercase font-medium tracking-[0.22em]"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem' }}
          >
            Arsitek
          </span>
        </Link>
        <Link
          to="/"
          className="text-[#7a6d5e] hover:text-[#c4955a] transition-colors uppercase font-medium tracking-[0.2em]"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem' }}
        >
          Karya
        </Link>
      </div>
    </nav>
  );
}
