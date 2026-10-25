import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import useAuth from '../hooks/useAuth';
import PasswordInput from '../components/PasswordInput';
import { Link } from 'react-router-dom';

export default function AdminLogin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !user.isAnonymous) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(
        ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(err.code)
          ? 'Email atau password salah.'
          : err.code === 'auth/too-many-requests'
            ? 'Terlalu banyak percobaan. Coba lagi nanti.'
            : 'Gagal masuk. Cek koneksi lalu coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "bg-[#0b0a09] border border-[#2c2620] rounded px-4 py-2.5 text-[#ede4d4] text-sm outline-none focus:border-[#c4955a] transition-colors w-full";

  const serif = { fontFamily: "'Cormorant Garamond', serif" };
  const syne = { fontFamily: "'Syne', sans-serif" };

  return (
    <div className="dotgrid dotgrid-fade relative isolate min-h-screen text-[#ede4d4] grid md:grid-cols-[1.1fr_1fr]">
      {/* Panel kiri: blueprint */}
      <aside className="hidden md:flex flex-col justify-between p-14 border-r border-[#2c2620]">
        <Link to="/" className="tracking-[0.2em] font-light" style={{ ...serif, fontSize: '1.1rem' }}>
          H. YUSUF
        </Link>
        <div>
          <p className="text-[#c4955a] mb-6 text-sm" style={syne}>Ruang kerja dokumentasi</p>
          <h1 className="font-light leading-[1.02]" style={{ ...serif, fontSize: 'clamp(3rem, 5.5vw, 5.2rem)', letterSpacing: '-0.02em' }}>
            Tulis, atur,<br />terbitkan.
          </h1>
          <p className="mt-6 text-[#7a6d5e] leading-relaxed max-w-[38ch] text-sm" style={syne}>
            Kelola dokumen dan karya dari satu tempat. Yang private hanya terlihat setelah Anda masuk.
          </p>
          <div className="draft-rule mt-14" />
        </div>
        <p className="text-[#3d3630] text-xs" style={syne}>Arsitek · Portofolio</p>
      </aside>

      {/* Panel kanan: form */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden block mb-10 tracking-[0.2em] font-light" style={{ ...serif, fontSize: '1.1rem' }}>
            H. YUSUF
          </Link>
          <h2 className="font-normal mb-1" style={{ ...serif, fontSize: '2rem' }}>Masuk ke dashboard</h2>
          <p className="text-[#7a6d5e] text-sm mb-8" style={syne}>Gunakan akun admin Anda.</p>

          {error && (
            <p role="alert" className="text-red-400 mb-5 text-xs leading-relaxed" style={syne}>{error}</p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5 text-[#7a6d5e] text-xs font-medium" style={syne}>
              Email
              <input
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputCls}
                style={syne}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[#7a6d5e] text-xs font-medium" style={syne}>
              Password
              <PasswordInput
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={inputCls}
                style={syne}
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 bg-[#c4955a] hover:bg-[#d4a56a] disabled:opacity-50 text-[#0b0a09] rounded px-4 py-3 text-sm font-semibold transition-colors"
              style={syne}
            >
              {submitting ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
