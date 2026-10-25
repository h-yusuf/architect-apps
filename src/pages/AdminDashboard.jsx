import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { listDocs, deleteDoc, updateDoc } from '../hooks/useDocs';
import AdminShell from '../components/AdminShell';

const syne = { fontFamily: "'Syne', sans-serif" };
const PAGE_SIZE = 8;
const SORTS = {
  order: ['Urutan', (a, b) => (a.order ?? 0) - (b.order ?? 0)],
  newest: ['Terbaru', (a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0)],
  title: ['Judul A–Z', (a, b) => (a.title ?? '').localeCompare(b.title ?? '')],
};
const FILTERS = [['all', 'Semua'], ['public', 'Public'], ['private', 'Private']];

function Switch({ on, onClick, label }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
      style={{ background: on ? '#c4955a' : '#2c2620' }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200"
        style={{ transform: on ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

export default function AdminDashboard() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const loadDocs = () =>
    listDocs()
      .then(d => { setDocs(d); setError(''); })
      .catch(() => setError('Gagal memuat dokumen. Muat ulang halaman untuk mencoba lagi.'))
      .finally(() => setLoading(false));

  useEffect(() => { loadDocs(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDelete = async (doc) => {
    if (confirmId !== doc.id) { setConfirmId(doc.id); return; }
    try {
      await deleteDoc(doc.id);
      setConfirmId(null);
      setToast('Dokumen dihapus');
      loadDocs();
    } catch {
      setError('Gagal menghapus dokumen.');
    }
  };

  const handleTogglePublish = async (doc) => {
    try {
      await updateDoc(doc.id, { published: !doc.published });
      setToast(doc.published ? 'Dijadikan private' : 'Dipublikasikan');
      loadDocs();
    } catch {
      setError('Gagal mengubah status dokumen.');
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch { setError('Gagal logout. Coba lagi.'); return; }
    navigate('/');
  };

  const counts = useMemo(() => ({
    all: docs.length,
    public: docs.filter(d => d.published).length,
    private: docs.filter(d => !d.published).length,
  }), [docs]);

  const q = search.trim().toLowerCase();
  const filtered = docs
    .filter(d =>
      (filter === 'all' || (filter === 'public') === Boolean(d.published)) &&
      (!q || `${d.title} ${d.description} ${d.slug}`.toLowerCase().includes(q))
    )
    .sort(SORTS[sort][1]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages); // halaman aman kalau data berkurang (mis. habis hapus)
  const shown = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  return (
    <AdminShell
      title="Dokumen"
      subtitle={`${counts.all} dokumen · ${counts.public} public · ${counts.private} private`}
      actions={
        <>
          <Link to="/" className="text-[#7a6d5e] hover:text-[#ede4d4] transition-colors text-sm hidden sm:block" style={syne}>Lihat situs</Link>
          <button onClick={handleLogout} className="text-[#7a6d5e] hover:text-[#ede4d4] transition-colors text-sm" style={syne}>Keluar</button>
          <button
            onClick={() => navigate('/admin/doc/new')}
            className="bg-[#c4955a] hover:bg-[#d4a56a] text-[#0b0a09] font-semibold px-4 py-1.5 rounded-full text-sm transition-colors"
            style={syne}
          >
            + Dokumen baru
          </button>
        </>
      }
    >
      {error && <p role="alert" className="text-red-400 mb-5 text-sm" style={syne}>{error}</p>}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-full border border-[#2c2620] bg-[#0f0d0b]/70">
          {FILTERS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => { setFilter(k); setPage(1); }}
              className="px-3.5 py-1 rounded-full text-xs font-semibold transition-colors"
              style={{ ...syne, background: filter === k ? '#c4955a' : 'transparent', color: filter === k ? '#0b0a09' : '#7a6d5e' }}
            >
              {l} <span className="opacity-60">{counts[k]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari judul atau slug..."
          aria-label="Cari dokumen"
          className="flex-1 min-w-[180px] max-w-xs bg-[#0f0d0b]/70 border border-[#2c2620] rounded-full px-4 py-2 text-sm outline-none focus:border-[#c4955a] transition-colors"
          style={syne}
        />
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          aria-label="Urutkan"
          className="bg-[#0f0d0b]/70 border border-[#2c2620] rounded-full px-4 py-2 text-sm text-[#7a6d5e] outline-none focus:border-[#c4955a] transition-colors"
          style={syne}
        >
          {Object.entries(SORTS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>

      {loading && <p className="text-[#7a6d5e] text-sm py-16 text-center" style={syne}>Memuat...</p>}

      <ul className="flex flex-col gap-3">
        {shown.map(doc => (
          <li key={doc.id} className="cms-card p-4 sm:p-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="w-8 h-8 shrink-0 rounded-full border border-[#2c2620] flex items-center justify-center text-xs text-[#7a6d5e]" style={syne}>
              {doc.order}
            </span>
            <button onClick={() => navigate(`/admin/doc/${doc.id}/edit`)} className="flex-1 min-w-[200px] text-left">
              <span className="block text-lg leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{doc.title}</span>
              <span className="line-clamp-2 text-[#7a6d5e] text-xs mt-1" style={syne}>{doc.description}</span>
              <span className="block font-mono text-[0.65rem] text-[#3d3630] mt-1">/doc/{doc.slug}</span>
            </button>
            <label className="flex items-center gap-2 text-xs" style={{ ...syne, color: doc.published ? '#c4955a' : '#7a6d5e' }}>
              <Switch on={Boolean(doc.published)} onClick={() => handleTogglePublish(doc)} label={`Publikasikan ${doc.title}`} />
              {doc.published ? 'Public' : 'Private'}
            </label>
            <div className="flex items-center gap-4 text-xs font-medium" style={syne}>
              <Link to={`/doc/${doc.slug}`} className="text-[#7a6d5e] hover:text-[#ede4d4] transition-colors">Lihat</Link>
              <button onClick={() => navigate(`/admin/doc/${doc.id}/edit`)} className="text-[#c4955a] hover:text-[#ede4d4] transition-colors">Edit</button>
              <button
                onClick={() => handleDelete(doc)}
                onBlur={() => setConfirmId(null)}
                className={confirmId === doc.id ? 'text-red-400 font-semibold' : 'text-[#7a6d5e] hover:text-red-400 transition-colors'}
              >
                {confirmId === doc.id ? 'Yakin hapus?' : 'Hapus'}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav aria-label="Halaman" className="flex items-center justify-between mt-6 text-xs" style={syne}>
          <span className="text-[#7a6d5e]">
            {(cur - 1) * PAGE_SIZE + 1}–{Math.min(cur * PAGE_SIZE, filtered.length)} dari {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(cur - 1)} disabled={cur === 1} className="px-3 py-1.5 rounded-full text-[#7a6d5e] hover:text-[#ede4d4] disabled:opacity-30 disabled:hover:text-[#7a6d5e] transition-colors">← Sebelumnya</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                aria-current={n === cur ? 'page' : undefined}
                className="w-8 h-8 rounded-full font-semibold transition-colors"
                style={{ background: n === cur ? '#c4955a' : 'transparent', color: n === cur ? '#0b0a09' : '#7a6d5e' }}
              >
                {n}
              </button>
            ))}
            <button onClick={() => setPage(cur + 1)} disabled={cur === pages} className="px-3 py-1.5 rounded-full text-[#7a6d5e] hover:text-[#ede4d4] disabled:opacity-30 disabled:hover:text-[#7a6d5e] transition-colors">Berikutnya →</button>
          </div>
        </nav>
      )}

      {!loading && shown.length === 0 && !error && (
        <div className="cms-card text-center py-16 px-6">
          <p className="text-[#ede4d4] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem' }}>
            {docs.length === 0 ? 'Belum ada dokumen' : 'Tidak ada yang cocok'}
          </p>
          <p className="text-[#7a6d5e] text-sm mb-5" style={syne}>
            {docs.length === 0 ? 'Mulai dengan menulis dokumen pertama Anda.' : 'Ubah filter atau kata pencarian.'}
          </p>
          {docs.length === 0 && (
            <button onClick={() => navigate('/admin/doc/new')} className="bg-[#c4955a] hover:bg-[#d4a56a] text-[#0b0a09] font-semibold px-5 py-2 rounded-full text-sm transition-colors" style={syne}>
              + Dokumen baru
            </button>
          )}
        </div>
      )}

      <div
        role="status"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-semibold bg-[#c4955a] text-[#0b0a09] transition-all duration-300"
        style={{ ...syne, opacity: toast ? 1 : 0, transform: `translate(-50%, ${toast ? 0 : 12}px)`, pointerEvents: 'none' }}
      >
        {toast}
      </div>
    </AdminShell>
  );
}
