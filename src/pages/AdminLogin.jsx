import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import useAuth from '../hooks/useAuth';

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
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "bg-[#0b0a09] border border-[#2c2620] rounded px-4 py-2.5 text-[#ede4d4] text-sm outline-none focus:border-[#c4955a] transition-colors w-full";

  return (
    <div className="min-h-screen bg-[#0b0a09] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-10 text-center">
          <p
            className="text-[#ede4d4] font-light tracking-[0.2em] mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}
          >
            H. YUSUF
          </p>
          <p
            className="text-[#3d3630] uppercase tracking-[0.2em] font-medium"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem' }}
          >
            Admin
          </p>
        </div>

        <div className="bg-[#131110] border border-[#2c2620] rounded-xl p-8">
          {error && (
            <p className="text-red-400 mb-5 text-xs leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputCls}
              style={{ fontFamily: "'Syne', sans-serif" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputCls}
              style={{ fontFamily: "'Syne', sans-serif" }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 bg-[#c4955a] hover:bg-[#d4a56a] disabled:opacity-50 text-[#0b0a09] rounded px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {submitting ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
