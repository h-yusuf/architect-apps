import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { listDocs, deleteDoc } from '../hooks/useDocs';

export default function AdminDashboard() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDocs = () => {
    listDocs()
      .then(setDocs)
      .catch(() => setError('Gagal memuat dokumen.'));
  };

  useEffect(() => { loadDocs(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus "${title}"?`)) return;
    try {
      await deleteDoc(id);
      loadDocs();
    } catch {
      setError('Gagal menghapus dokumen.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch {
      setError('Gagal logout. Coba lagi.');
      return;
    }
    navigate('/');
  };

  const syne = { fontFamily: "'Syne', sans-serif" };

  return (
    <div className="min-h-screen bg-[#0b0a09] text-[#ede4d4]">
      <nav className="border-b border-[#2c2620] bg-[#131110]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[#7a6d5e] font-medium tracking-[0.15em] uppercase" style={{ ...syne, fontSize: '0.62rem' }}>
            Admin Dashboard
          </span>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/admin/doc/new')}
              className="bg-[#c4955a] hover:bg-[#d4a56a] text-[#0b0a09] font-semibold px-4 py-1.5 rounded text-sm transition-colors"
              style={syne}
            >
              + Dokumen Baru
            </button>
            <button
              onClick={handleLogout}
              className="text-[#7a6d5e] hover:text-[#ede4d4] transition-colors text-sm"
              style={syne}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && <p className="text-red-400 mb-5 text-xs" style={syne}>{error}</p>}

        <table className="w-full text-sm" style={syne}>
          <thead>
            <tr className="text-[#3d3630] text-left border-b border-[#2c2620]">
              <th className="pb-3 pr-4 font-medium text-xs tracking-wider uppercase">#</th>
              <th className="pb-3 pr-4 font-medium text-xs tracking-wider uppercase">Judul</th>
              <th className="pb-3 pr-4 font-medium text-xs tracking-wider uppercase">Slug</th>
              <th className="pb-3 font-medium text-xs tracking-wider uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => (
              <tr key={doc.id} className="border-b border-[#1c1915] hover:bg-[#131110] transition-colors">
                <td className="py-3.5 pr-4 text-[#3d3630] text-xs">{doc.order}</td>
                <td className="py-3.5 pr-4">
                  <div className="font-medium text-[#ede4d4] text-sm">{doc.title}</div>
                  <div className="text-[#7a6d5e] text-xs mt-0.5">{doc.description}</div>
                </td>
                <td className="py-3.5 pr-4 text-[#7a6d5e] font-mono text-xs">{doc.slug}</td>
                <td className="py-3.5 flex gap-4">
                  <button
                    onClick={() => navigate(`/admin/doc/${doc.id}/edit`)}
                    className="text-[#c4955a] hover:text-[#ede4d4] transition-colors text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.title)}
                    className="text-[#7a6d5e] hover:text-red-400 transition-colors text-xs font-medium"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {docs.length === 0 && !error && (
          <p className="text-[#3d3630] text-sm text-center mt-16" style={syne}>
            Belum ada dokumen.
          </p>
        )}
      </main>
    </div>
  );
}
