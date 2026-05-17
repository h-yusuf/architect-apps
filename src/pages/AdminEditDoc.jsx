import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createDoc, updateDoc, getDocBySlug, getDocById } from '../hooks/useDocs';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function AdminEditDoc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState(1);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getDocById(id)
      .then(d => {
        if (!d) { setError('Dokumen tidak ditemukan.'); return; }
        setTitle(d.title);
        setDescription(d.description);
        setSlug(d.slug);
        setOrder(d.order);
        setContent(d.content);
        setSlugManual(true);
      })
      .catch(() => setError('Gagal memuat dokumen.'));
  }, [id, isEdit]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (!slugManual) setSlug(generateSlug(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const existing = await getDocBySlug(slug);
      if (existing && existing.id !== id) {
        setError(`Slug "${slug}" sudah dipakai dokumen lain.`);
        setSubmitting(false);
        return;
      }
      const data = { title, description, slug, order: Number(order), content };
      if (isEdit) {
        await updateDoc(id, data);
      } else {
        await createDoc(data);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-2 text-[#e5e5e5] text-sm outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <nav className="border-b border-[#333] bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-[#888] hover:text-[#e5e5e5] text-sm transition-colors"
          >
            ← Kembali
          </button>
          <span className="font-bold">{isEdit ? 'Edit Dokumen' : 'Dokumen Baru'}</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#888]">Judul</label>
              <input
                value={title}
                onChange={handleTitleChange}
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#888]">Order</label>
              <input
                type="number"
                value={order}
                onChange={e => setOrder(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#888]">Deskripsi Singkat</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#888]">
              Slug (URL) — auto dari judul, bisa override
            </label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
              required
              className={`${inputClass} font-mono`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#888]">Konten Markdown</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={20}
              required
              className={`${inputClass} font-mono resize-y`}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
