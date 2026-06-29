# Publish / Private Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah field `published` ke setiap dokumen — private hanya tampil di admin, public tampil di frontend tanpa login.

**Architecture:** Field `published: boolean` di Firestore. Frontend publik pakai `listPublishedDocs()` (filter published=true) kecuali admin login, maka pakai `listDocs()` (semua). Akses `/doc/:slug` private oleh visitor → redirect `/404`. Admin selalu bisa akses semua.

**Tech Stack:** React 18, Vite, Firebase Firestore, React Router v6, Tailwind CSS.

## Global Constraints

- `isAdmin` selalu: `user && !user.isAnonymous` (user dari `useAuth()`)
- Warna admin UI: bg `#0b0a09`, text `#ede4d4`, accent `#c4955a`, muted `#7a6d5e`, border `#2c2620`
- Font: `"'Syne', sans-serif"` untuk body/label, `"'Cormorant Garamond', serif"` untuk heading
- Tidak ada test runner — verifikasi manual di browser (`npm run dev`)
- Jangan ubah Firestore Security Rules

---

## File Map

| File | Status | Perubahan |
|------|--------|-----------|
| `src/hooks/useDocs.js` | Modify | Tambah `listPublishedDocs()` |
| `src/pages/NotFound.jsx` | **Create** | Halaman 404 |
| `src/App.jsx` | Modify | Tambah route `path="*"` → `<NotFound />` |
| `src/pages/Home.jsx` | Modify | Auth-aware query + badge Private |
| `src/pages/DocDetail.jsx` | Modify | Block private access untuk visitor |
| `src/pages/AdminDashboard.jsx` | Modify | Badge status + tombol toggle publish |
| `src/pages/AdminEditDoc.jsx` | Modify | Field `published` di form |

---

## Task 1: Tambah `listPublishedDocs()` ke useDocs.js

**Files:**
- Modify: `src/hooks/useDocs.js`

**Interfaces:**
- Produces: `listPublishedDocs(): Promise<Array<{id, title, description, slug, order, content, published, ...}>>` — hanya dokumen dengan `published === true`, diurutkan `order` ASC

- [ ] **Step 1: Tambah import `where`**

`where` sudah ada di import existing. Cek baris 1–5 `useDocs.js` — sudah ada `where` di destructure. Tidak perlu ubah.

- [ ] **Step 2: Tambah function `listPublishedDocs` setelah function `listDocs`**

Buka `src/hooks/useDocs.js`. Setelah closing `}` dari `listDocs`, tambah:

```js
export async function listPublishedDocs() {
  const q = query(col, where('published', '==', true), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
```

- [ ] **Step 3: Verifikasi manual**

Buka Firestore Console → collection `documents`. Set field `published: true` pada satu dokumen untuk test. Cek tidak ada error syntax dengan `npm run dev` di terminal — app harus boot tanpa error.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useDocs.js
git commit -m "feat: add listPublishedDocs query for public frontend"
```

---

## Task 2: Buat halaman 404 + tambah route `*`

**Files:**
- Create: `src/pages/NotFound.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: Route `path="*"` render `<NotFound />`. Halaman tampil teks 404 + tombol kembali ke `/`.

- [ ] **Step 1: Buat `src/pages/NotFound.jsx`**

```jsx
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="uppercase tracking-[0.16em] font-semibold transition-colors duration-200"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', color: 'var(--text-2)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            ← Beranda
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p
          className="anim-fade-in uppercase tracking-[0.3em] font-semibold mb-6"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', color: 'var(--accent)' }}
        >
          404
        </p>
        <h1
          className="anim-fade-up font-light leading-[1.05] mb-8"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            letterSpacing: '-0.02em',
            color: 'var(--text-1)',
          }}
        >
          Halaman tidak<br />ditemukan
        </h1>
        <Link
          to="/"
          className="anim-fade-up uppercase tracking-[0.2em] font-semibold transition-colors duration-200"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.6rem', color: 'var(--text-2)', animationDelay: '80ms' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
        >
          Kembali ke Beranda →
        </Link>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-14 py-8 flex items-center justify-between">
          <span
            className="tracking-[0.2em] font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: 'var(--text-3)' }}
          >
            H. YUSUF
          </span>
          <span
            className="uppercase tracking-[0.2em]"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.52rem', color: 'var(--text-3)' }}
          >
            Arsitek
          </span>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Tambah route `*` di `src/App.jsx`**

Tambah import di bagian atas bersama import pages lain:
```jsx
import NotFound from "./pages/NotFound";
```

Di dalam `<Routes>`, tambah route terakhir (setelah semua route existing):
```jsx
<Route path="*" element={<NotFound />} />
```

- [ ] **Step 3: Verifikasi manual**

`npm run dev` → buka browser → navigasi ke URL sembarang misal `http://localhost:5173/xyz` → harus tampil halaman 404. Klik "Kembali ke Beranda" → harus kembali ke `/`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/NotFound.jsx src/App.jsx
git commit -m "feat: add 404 NotFound page and catch-all route"
```

---

## Task 3: Update `Home.jsx` — auth-aware query + badge Private

**Files:**
- Modify: `src/pages/Home.jsx`

**Interfaces:**
- Consumes: `listPublishedDocs()` dari `src/hooks/useDocs.js` (Task 1), `useAuth()` dari `src/hooks/useAuth.js`
- Consumes: `listDocs()` — sudah ada

- [ ] **Step 1: Tambah import di `Home.jsx`**

Tambah dua import baru di bagian atas:
```jsx
import useAuth from '../hooks/useAuth';
import { listPublishedDocs } from '../hooks/useDocs';
```

`listDocs` sudah diimport — biarkan.

- [ ] **Step 2: Tambah `useAuth` hook dan ubah `useEffect` fetch**

Di dalam komponen `Home`, tambah hook auth setelah deklarasi state:
```jsx
const { user, loading: authLoading } = useAuth();
const isAdmin = user && !user.isAnonymous;
```

Ganti `useEffect` fetch yang ada (saat ini memanggil `listDocs()`) dengan:
```jsx
useEffect(() => {
  if (authLoading) return;
  setLoading(true);
  const fetcher = isAdmin ? listDocs() : listPublishedDocs();
  fetcher
    .then(setDocs)
    .catch(() => setError('Gagal memuat dokumen.'))
    .finally(() => setLoading(false));
}, [isAdmin, authLoading]);
```

- [ ] **Step 3: Tambah badge "Private" di `GridCard` dan `FeaturedCard`**

Pada komponen `GridCard`, di dalam `<div className="p-6 ...">` tambah badge setelah tag `<h2>`:
```jsx
{!doc.published && (
  <span
    style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: '0.5rem',
      color: '#7a6d5e',
      background: '#1c1915',
      border: '1px solid #2c2620',
      borderRadius: '2px',
      padding: '2px 6px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      display: 'inline-block',
    }}
  >
    Private
  </span>
)}
```

Pada komponen `FeaturedCard`, di dalam `<div className="p-8 ...">` tambah badge setelah tag `<h2>`:
```jsx
{!doc.published && (
  <span
    style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: '0.5rem',
      color: '#7a6d5e',
      background: '#1c1915',
      border: '1px solid #2c2620',
      borderRadius: '2px',
      padding: '2px 6px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      display: 'inline-block',
    }}
  >
    Private
  </span>
)}
```

- [ ] **Step 4: Verifikasi manual**

- Buka `http://localhost:5173/` tanpa login admin → hanya doc dengan `published: true` tampil
- Login ke `/admin`, lalu buka `http://localhost:5173/` → semua doc tampil, doc private ada badge "Private"

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: Home shows published-only for visitors, all docs for admin with Private badge"
```

---

## Task 4: Update `DocDetail.jsx` — block private access untuk visitor

**Files:**
- Modify: `src/pages/DocDetail.jsx`

**Interfaces:**
- Consumes: `useAuth()` — sudah ada di file ini (`isAdmin` sudah dideklarasi di line 13)

- [ ] **Step 1: Ubah logic di `useEffect` fetch DocDetail**

`useAuth` dan `isAdmin` sudah ada di file. Ubah `useEffect` agar setelah fetch, cek apakah visitor mengakses doc private:

```jsx
useEffect(() => {
  setStatus('loading');
  getDocBySlug(slug)
    .then(data => {
      if (!data) { setStatus('not_found'); return; }
      if (!data.published && !isAdmin) { setStatus('not_found'); return; }
      setDoc(data);
      setStatus('ok');
    })
    .catch(() => setStatus('error'));
}, [slug, isAdmin]);
```

Tambah `isAdmin` ke dependency array.

- [ ] **Step 2: Verifikasi manual**

- Ambil slug dari doc yang `published: false`
- Buka `http://localhost:5173/doc/<slug>` tanpa login → harus tampil status "Dokumen tidak ditemukan" (not_found UI)
- Login admin → buka URL yang sama → harus tampil normal

- [ ] **Step 3: Commit**

```bash
git add src/pages/DocDetail.jsx
git commit -m "feat: block private doc access for anonymous visitors in DocDetail"
```

---

## Task 5: Update `AdminDashboard.jsx` — badge status + tombol toggle

**Files:**
- Modify: `src/pages/AdminDashboard.jsx`

**Interfaces:**
- Consumes: `updateDoc(id, data)` dari `src/hooks/useDocs.js` — sudah ada, tambah ke import

- [ ] **Step 1: Tambah `updateDoc` ke import di AdminDashboard**

Baris import `useDocs` saat ini:
```jsx
import { listDocs, deleteDoc } from '../hooks/useDocs';
```

Ubah menjadi:
```jsx
import { listDocs, deleteDoc, updateDoc } from '../hooks/useDocs';
```

- [ ] **Step 2: Tambah handler toggle publish**

Di dalam komponen `AdminDashboard`, tambah handler setelah `handleLogout`:

```jsx
const handleTogglePublish = async (doc) => {
  try {
    await updateDoc(doc.id, { published: !doc.published });
    loadDocs();
  } catch {
    setError('Gagal mengubah status dokumen.');
  }
};
```

- [ ] **Step 3: Tambah kolom Status dan tombol toggle di tabel**

Di `<thead>`, tambah header kolom setelah kolom "Slug", sebelum kolom "Aksi":
```jsx
<th className="pb-3 pr-4 font-medium text-xs tracking-wider uppercase">Status</th>
```

Di `<tbody>`, tiap `<tr>`, tambah kolom setelah kolom slug, sebelum kolom aksi:
```jsx
<td className="py-3.5 pr-4">
  <button
    onClick={() => handleTogglePublish(doc)}
    className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
    style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: '0.52rem',
      background: doc.published ? '#1a2e1a' : '#1c1915',
      color: doc.published ? '#6db86d' : '#7a6d5e',
      border: `1px solid ${doc.published ? '#2d4a2d' : '#2c2620'}`,
      cursor: 'pointer',
    }}
  >
    {doc.published ? 'Public' : 'Private'}
  </button>
</td>
```

- [ ] **Step 4: Verifikasi manual**

- Buka `/admin/dashboard` (login dulu)
- Setiap row harus tampil badge "Public" (kehijauan) atau "Private" (abu-abu)
- Klik badge → status toggle → badge berubah, reload list

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminDashboard.jsx
git commit -m "feat: add publish/private toggle and status badge in admin dashboard"
```

---

## Task 6: Update `AdminEditDoc.jsx` — field `published` di form

**Files:**
- Modify: `src/pages/AdminEditDoc.jsx`

**Interfaces:**
- Field `published: boolean` disimpan bersama field lain saat `createDoc` / `updateDoc`

- [ ] **Step 1: Tambah state `published`**

Di dalam komponen `AdminEditDoc`, setelah deklarasi state `slugManual`, tambah:
```jsx
const [published, setPublished] = useState(false);
```

- [ ] **Step 2: Set `published` saat load doc existing**

Di dalam `useEffect` yang fetch doc by id, setelah `setSlugManual(true)`, tambah:
```jsx
setPublished(d.published ?? false);
```

- [ ] **Step 3: Sertakan `published` di data submit**

Di `handleSubmit`, ubah baris `const data = ...`:
```jsx
const data = { title, description, slug, order: Number(order), content, published };
```

- [ ] **Step 4: Tambah toggle UI di form**

Di dalam `<form>`, tambah sebelum tombol submit (setelah textarea konten, sebelum `<div className="flex justify-end">`):

```jsx
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
```

- [ ] **Step 5: Verifikasi manual**

- Buka `/admin/doc/new` → toggle default Private, klik toggle → berubah Public, submit → cek di dashboard badge sesuai
- Buka edit doc existing yang Public → toggle harus show Public, ubah ke Private → simpan → cek di dashboard

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminEditDoc.jsx
git commit -m "feat: add published toggle field to admin edit/create form"
```

---

## Task 7: Set `published` untuk dokumen existing di Firestore

**Files:**
- Tidak ada file code yang diubah — ini langkah data migration manual

- [ ] **Step 1: Set `published: true` untuk semua dokumen existing via admin dashboard**

Semua dokumen yang sudah ada di Firestore tidak punya field `published` — mereka akan tampil sebagai "Private" karena `doc.published ?? false === false`.

Buka `/admin/dashboard` → klik badge "Private" pada setiap dokumen yang ingin dipublish → badge berubah "Public".

Alternatif via Firestore Console: buka collection `documents`, tiap dokumen tambah field `published` type boolean, value `true`.

- [ ] **Step 2: Verifikasi akhir**

- Buka `http://localhost:5173/` tanpa login → dokumen public tampil, dokumen private tidak tampil
- Login admin → buka home → semua tampil + badge Private pada yang belum publish
- Coba akses `/doc/<slug-private>` tanpa login → tampil "Dokumen tidak ditemukan"
- Coba akses URL sembarang → tampil halaman 404

