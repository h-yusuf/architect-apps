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
      .catch(() => setError('Gagal memual dokumen.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        {error && <p className="text-red-400 mb-6 text-sm">{error}</p>}
        {loading && <p className="text-[#888] text-sm text-center">Memuat...</p>}
        <div className="divide-y divide-[#222]">
          {docs.map((doc, i) => (
            <button
              key={doc.id}
              onClick={() => navigate(`/doc/${doc.slug}`)}
              className="w-full flex items-start gap-4 py-4 px-2 text-left hover:bg-[#1a1a1a] rounded transition-colors group"
            >
              <span className="text-xs font-bold text-[#444] min-w-[24px] mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <h2 className="font-bold text-[#e5e5e5]">{doc.title}</h2>
                <p className="text-sm text-[#888] mt-1">{doc.description}</p>
              </div>
              <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                →
              </span>
            </button>
          ))}
        </div>
        {!loading && docs.length === 0 && !error && (
          <p className="text-[#888] text-sm text-center mt-12">Belum ada dokumen.</p>
        )}
      </main>
    </div>
  );
}
