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

  const syne = { fontFamily: "'Syne', sans-serif" };
  const inputCls = "bg-[#0b0a09] border border-[#2c2620] rounded px-4 py-2.5 text-[#ede4d4] text-sm outline-none focus:border-[#c4955a] transition-colors w-full";

  return (
    <div className="min-h-screen bg-[#0b0a09] text-[#ede4d4]">
      <nav className="border-b border-[#2c2620] bg-[#131110]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-5">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-[#7a6d5e] hover:text-[#ede4d4] text-sm transition-colors"
            style={syne}
          >
            ← Kembali
          </button>
          <span className="text-[#3d3630] text-xs">|</span>
          <span className="font-medium text-sm text-[#ede4d4]" style={syne}>
            {isEdit ? 'Edit Dokumen' : 'Dokumen Baru'}
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <p className="text-red-400 mb-5 text-xs leading-relaxed" style={syne}>{error}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={syne}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#7a6d5e] text-xs uppercase tracking-wider font-medium">Judul</label>
              <input
                value={title}
                onChange={handleTitleChange}
                required
                className={inputCls}
                style={syne}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#7a6d5e] text-xs uppercase tracking-wider font-medium">Order</label>
              <input
                type="number"
                value={order}
                onChange={e => setOrder(e.target.value)}
                required
                className={inputCls}
                style={syne}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#7a6d5e] text-xs uppercase tracking-wider font-medium">Deskripsi Singkat</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className={inputCls}
              style={syne}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#7a6d5e] text-xs uppercase tracking-wider font-medium">
              Slug (URL) — auto dari judul
            </label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
              required
              className={`${inputCls} font-mono`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#7a6d5e] text-xs uppercase tracking-wider font-medium">Konten Markdown</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={22}
              required
              className={`${inputCls} font-mono resize-y`}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#c4955a] hover:bg-[#d4a56a] disabled:opacity-50 text-[#0b0a09] font-semibold px-6 py-2.5 rounded text-sm transition-colors"
              style={syne}
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
