import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="border-b border-[#333] bg-[#1a1a1a]">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-[#e5e5e5] tracking-wide">
          H. Yusuf · Architect
        </Link>
        <div className="flex gap-6 text-sm text-[#888]">
          <Link to="/" className="hover:text-[#e5e5e5] transition-colors">Home</Link>
        </div>
      </div>
    </nav>
  );
}
