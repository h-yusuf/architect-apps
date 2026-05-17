import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocBySlug } from '../hooks/useDocs';
import Navbar from '../components/Navbar';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function DocDetail() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | not_found | error

  useEffect(() => {
    getDocBySlug(slug)
      .then(data => {
        if (!data) { setStatus('not_found'); return; }
        setDoc(data);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  const shell = (children) => (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">{children}</main>
    </div>
  );

  if (status === 'loading') return shell(<p className="text-[#888] text-sm">Memuat...</p>);

  if (status === 'not_found') return shell(
    <>
      <p className="text-[#888]">Dokumen tidak ditemukan.</p>
      <Link to="/" className="text-indigo-500 text-sm mt-2 inline-block hover:underline">
        ← Kembali
      </Link>
    </>
  );

  if (status === 'error') return shell(
    <p className="text-red-400 text-sm">Gagal memuat dokumen.</p>
  );

  return shell(
    <>
      <Link to="/" className="text-sm text-[#888] hover:text-indigo-400 transition-colors mb-8 inline-block">
        ← Kembali
      </Link>
      <h1 className="text-2xl font-bold mb-2">{doc.title}</h1>
      <p className="text-[#888] mb-8">{doc.description}</p>
      <MarkdownRenderer content={doc.content} />
    </>
  );
}
