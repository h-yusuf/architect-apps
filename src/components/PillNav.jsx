import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import useAuth from '../hooks/useAuth';

const syne = { fontFamily: "'Syne', sans-serif", fontSize: '0.58rem' };

function Roll({ children }) {
  return <span className="roll"><span>{children}</span><span aria-hidden="true">{children}</span></span>;
}

// Navbar pill melayang, selalu menempel di atas (sticky). back=true di halaman detail.
export default function PillNav({ back = false }) {
  const { user } = useAuth();
  const isAdmin = user && !user.isAnonymous;
  const link = 'uppercase tracking-[0.18em] font-semibold';
  return (
    <nav className="pill-nav" aria-label="Utama">
      <Link to="/" className="tracking-[0.18em] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--text-1)' }}>
        H. YUSUF
      </Link>
      <div className="flex items-center gap-5">
        {back ? (
          <Link to="/" className={link} style={{ ...syne, color: 'var(--text-2)' }}><Roll>← Semua karya</Roll></Link>
        ) : (
          <a href="#karya" className={link} style={{ ...syne, color: 'var(--text-2)' }}><Roll>Karya</Roll></a>
        )}
        <Link to={isAdmin ? '/admin/dashboard' : '/admin'} className={link} style={{ ...syne, color: 'var(--accent)' }}>
          <Roll>{isAdmin ? 'Dashboard' : 'Admin'}</Roll>
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
