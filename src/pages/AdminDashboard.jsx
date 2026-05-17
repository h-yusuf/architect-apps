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
    await signOut(auth);
    await signInAnonymously(auth); // restore anonymous session for visitor tracking
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <nav className="border-b border-[#333] bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold">Admin Dashboard</span>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/admin/doc/new')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              + Dokumen Baru
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-[#888] hover:text-[#e5e5e5] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#888] text-left border-b border-[#333]">
              <th className="pb-3 pr-4 font-medium">#</th>
              <th className="pb-3 pr-4 font-medium">Judul</th>
              <th className="pb-3 pr-4 font-medium">Slug</th>
              <th className="pb-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => (
              <tr key={doc.id} className="border-b border-[#222]">
                <td className="py-3 pr-4 text-[#444]">{doc.order}</td>
                <td className="py-3 pr-4">
                  <div className="font-medium text-[#e5e5e5]">{doc.title}</div>
                  <div className="text-[#888] text-xs mt-0.5">{doc.description}</div>
                </td>
                <td className="py-3 pr-4 text-[#888] font-mono text-xs">{doc.slug}</td>
                <td className="py-3 flex gap-4">
                  <button
                    onClick={() => navigate(`/admin/doc/${doc.id}/edit`)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.title)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {docs.length === 0 && !error && (
          <p className="text-[#888] text-sm text-center mt-12">Belum ada dokumen.</p>
        )}
      </main>
    </div>
  );
}
