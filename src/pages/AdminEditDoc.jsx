import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createDoc, updateDoc, getDocBySlug, getDocById, listDocs } from '../hooks/useDocs';
import MarkdownRenderer from '../components/MarkdownRenderer';

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
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isEdit) return;
    listDocs().then(d => setOrder(Math.max(0, ...d.map(x => Number(x.order) || 0)) + 1)).catch(() => {});
  }, [isEdit]);

  // peringatan sebelum tab ditutup kalau ada perubahan belum disimpan
  useEffect(() => {
    if (!dirty) return;
    const h = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  useEffect(() => {
    if (!isEdit) return;
    getDocById(id)
      .then(d => {
        if (!d) { setError('Dokumen tidak ditemukan.'); return; }
        setTitle(d.title ?? '');
        setDescription(d.description ?? '');
        setSlug(d.slug);
        setOrder(d.order);
        setContent(d.content ?? '');
        setSlugManual(true);
        setPublished(d.published ?? false);
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
    setDirty(false);
    try {
      const existing = await getDocBySlug(slug);
      if (existing && existing.id !== id) {
        setError(`Slug "${slug}" sudah dipakai dokumen lain.`);
        setSubmitting(false);
        setDirty(true);
        return;
      }
      const data = { title, description, slug, order: Number(order), content, published };
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
        <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="flex flex-col gap-5" style={syne}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex items-center justify-between">
              <label className="text-[#7a6d5e] text-xs uppercase tracking-wider font-medium">Konten Markdown</label>
              <label
                className="cursor-pointer flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: '#c4955a' }}
                onMouseEnter={e => e.currentTarget.style.color = '#d4a56a'}
                onMouseLeave={e => e.currentTarget.style.color = '#c4955a'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload .md
                <input
                  type="file"
                  accept=".md,text/markdown,text/plain"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      setContent(ev.target.result);
                      if (!title && !slugManual) {
                        const name = file.name.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
                        setTitle(name);
                        setSlug(generateSlug(name));
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2">
              {[['Tulis', false], ['Preview', true]].map(([l, v]) => (
                <button key={l} type="button" onClick={() => setPreview(v)}
                  className="px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{ background: preview === v ? '#c4955a' : '#1c1915', color: preview === v ? '#0b0a09' : '#7a6d5e' }}>
                  {l}
                </button>
              ))}
            </div>
            {preview && (
              <div className="border border-[#2c2620] rounded p-6 min-h-[20rem]">
                <MarkdownRenderer content={content} />
              </div>
            )}
            <textarea
              hidden={preview}
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={22}
              required
              className={`${inputCls} font-mono resize-y`}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPublished(p => !p)}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none"
              style={{ background: published ? '#c4955a' : '#2c2620' }}
              aria-pressed={published}
            >
              <span
                className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200"
                style={{ transform: published ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            </button>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ fontFamily: "'Syne', sans-serif", color: published ? '#c4955a' : '#7a6d5e' }}
            >
              {published ? 'Public' : 'Private'}
            </span>
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
