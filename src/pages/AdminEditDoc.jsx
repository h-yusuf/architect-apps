import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createDoc, updateDoc, getDocBySlug, getDocById, listDocs } from '../hooks/useDocs';
import MarkdownRenderer from '../components/MarkdownRenderer';
import AdminShell from '../components/AdminShell';

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
  const inputCls = "bg-[#0b0a09]/70 border border-[#2c2620] rounded-xl px-4 py-2.5 text-[#ede4d4] text-sm outline-none focus:border-[#c4955a] transition-colors w-full";
  const labelCls = "flex flex-col gap-1.5 text-[#7a6d5e] text-xs font-medium";

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setContent(ev.target.result);
      setDirty(true);
      if (!title && !slugManual) {
        const name = file.name.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
        setTitle(name);
        setSlug(generateSlug(name));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <AdminShell
      title={isEdit ? 'Edit dokumen' : 'Dokumen baru'}
      subtitle={dirty ? 'Ada perubahan yang belum disimpan' : 'Tulis dalam Markdown, atur status publikasi di bawah.'}
      back="/admin/dashboard"
    >
      {error && <p role="alert" className="text-red-400 mb-5 text-sm" style={syne}>{error}</p>}

      <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="flex flex-col gap-6" style={syne}>
        <section className="cms-card p-5 sm:p-6 grid gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-5">
            <label className={labelCls}>
              Judul
              <input value={title} onChange={handleTitleChange} required className={inputCls} style={syne} />
            </label>
            <label className={labelCls}>
              Urutan
              <input type="number" value={order} onChange={e => setOrder(e.target.value)} required className={inputCls} style={syne} />
            </label>
          </div>
          <label className={labelCls}>
            Deskripsi singkat
            <input value={description} onChange={e => setDescription(e.target.value)} required className={inputCls} style={syne} />
          </label>
          <label className={labelCls}>
            Alamat halaman
            <div className="flex items-center rounded-xl border border-[#2c2620] bg-[#0b0a09]/70 focus-within:border-[#c4955a] transition-colors">
              <span className="pl-4 text-[#3d3630] font-mono text-sm">/doc/</span>
              <input
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                required
                className="bg-transparent flex-1 px-1 py-2.5 text-[#ede4d4] text-sm font-mono outline-none"
              />
            </div>
          </label>
        </section>

        <section className="cms-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex gap-1 p-1 rounded-full border border-[#2c2620] bg-[#0b0a09]/70">
              {[['Tulis', false], ['Preview', true]].map(([l, v]) => (
                <button key={l} type="button" onClick={() => setPreview(v)}
                  className="px-3.5 py-1 rounded-full text-xs font-semibold transition-colors"
                  style={{ background: preview === v ? '#c4955a' : 'transparent', color: preview === v ? '#0b0a09' : '#7a6d5e' }}>
                  {l}
                </button>
              ))}
            </div>
            <label className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-[#c4955a] hover:text-[#ede4d4] transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload file .md
              <input type="file" accept=".md,text/markdown,text/plain" className="hidden" onChange={handleFile} />
            </label>
          </div>
          {preview && (
            <div className="rounded-xl border border-[#2c2620] p-6 min-h-[22rem]">
              <MarkdownRenderer content={content} />
            </div>
          )}
          <textarea
            hidden={preview}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={22}
            required
            placeholder="# Judul&#10;&#10;Tulis isi dokumen di sini..."
            className={`${inputCls} font-mono resize-y leading-relaxed`}
          />
        </section>

        <div className="sticky bottom-4 z-20 cms-card flex items-center justify-between gap-4 px-5 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPublished(p => !p)}
            role="switch"
            aria-checked={published}
            className="flex items-center gap-3 text-xs font-semibold"
            style={{ color: published ? '#c4955a' : '#7a6d5e' }}
          >
            <span className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200" style={{ background: published ? '#c4955a' : '#2c2620' }}>
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200" style={{ transform: published ? 'translateX(18px)' : 'translateX(2px)' }} />
            </span>
            {published ? 'Public: tampil untuk semua pengunjung' : 'Private: hanya terlihat setelah login'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#c4955a] hover:bg-[#d4a56a] disabled:opacity-50 text-[#0b0a09] font-semibold px-6 py-2 rounded-full text-sm transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
