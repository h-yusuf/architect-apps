# Markdown Portfolio CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Firestore-backed markdown CMS to the existing Vite + React portfolio app, with a public read-only listing/detail view and a password-protected admin panel for CRUD.

**Architecture:** All content stored in Firestore `documents` collection. Visitors read anonymously (existing anonymous auth unchanged). Admin authenticates with Firebase email/password; protected routes check `user.isAnonymous === false`. No test runner — use `npm run build` for verification at each task.

**Tech Stack:** React 18, Vite, Tailwind CSS v4, @tailwindcss/typography, react-markdown, Firebase Firestore + Auth

---

### Task 1: Firebase Console — Enable Email/Password Auth + Firestore Rules

**Files:**
- No code changes — manual Firebase Console steps

- [ ] **Step 1: Enable Email/Password Auth**

  Go to [Firebase Console](https://console.firebase.google.com) → project `h-yusuf-architect` → Authentication → Sign-in method → Email/Password → Enable → Save.

- [ ] **Step 2: Create admin user**

  Authentication → Users → Add user:
  - Email: (pilih email kamu, misal `admin@h-yusuf-architect.com`)
  - Password: `admin1999`

  Catat email ini — dipakai saat login di `/admin`.

- [ ] **Step 3: Create Firestore database**

  Firestore Database → Create database → Start in **production mode** → pilih region terdekat (asia-southeast1) → Done.

- [ ] **Step 4: Set Firestore security rules**

  Firestore Database → Rules → Replace isi dengan:

  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /documents/{docId} {
        allow read: if true;
        allow write: if request.auth != null
          && request.auth.token.firebase.sign_in_provider != 'anonymous';
      }
    }
  }
  ```

  Klik Publish.

---

### Task 2: Install Dependencies + Tailwind v4 Setup

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `vite.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Install packages**

  ```bash
  npm install tailwindcss @tailwindcss/vite @tailwindcss/typography react-markdown
  ```

- [ ] **Step 2: Update vite.config.js**

  ```js
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [react(), tailwindcss()],
  })
  ```

- [ ] **Step 3: Replace src/index.css**

  ```css
  @import "tailwindcss";
  @plugin "@tailwindcss/typography";
  ```

- [ ] **Step 4: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: `dist/` folder created, no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add vite.config.js src/index.css package.json package-lock.json
  git commit -m "feat: install tailwind v4 and react-markdown"
  ```

---

### Task 3: Add Firestore to firebase.js

**Files:**
- Modify: `src/firebase.js`

- [ ] **Step 1: Add Firestore export**

  ```js
  import { initializeApp } from "firebase/app";
  import { getAnalytics } from "firebase/analytics";
  import { getAuth } from "firebase/auth";
  import { getFirestore } from "firebase/firestore";

  const firebaseConfig = {
    apiKey: "AIzaSyBIlMX8uh6TUTVudsbvISd_LQ5DfcHypIQ",
    authDomain: "h-yusuf-architect.firebaseapp.com",
    projectId: "h-yusuf-architect",
    storageBucket: "h-yusuf-architect.firebasestorage.app",
    messagingSenderId: "93248512119",
    appId: "1:93248512119:web:b456aa0931c6eb6f882672",
    measurementId: "G-ZV5ZHG384N"
  };

  const app = initializeApp(firebaseConfig);
  export const analytics = getAnalytics(app);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export default app;
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/firebase.js
  git commit -m "feat: add Firestore to firebase.js"
  ```

---

### Task 4: Create useDocs Hook

**Files:**
- Create: `src/hooks/useDocs.js`

- [ ] **Step 1: Create src/hooks/useDocs.js**

  ```js
  import {
    collection, getDocs, query, orderBy, where,
    addDoc,
    updateDoc as fsUpdateDoc,
    deleteDoc as fsDeleteDoc,
    doc as fsDoc,
    getDoc,
    serverTimestamp,
  } from 'firebase/firestore';
  import { db } from '../firebase';

  const col = collection(db, 'documents');

  export async function listDocs() {
    const q = query(col, orderBy('order'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  export async function getDocBySlug(slug) {
    const q = query(col, where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  }

  export async function getDocById(id) {
    const snap = await getDoc(fsDoc(db, 'documents', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }

  export async function createDoc(data) {
    return addDoc(col, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  export async function updateDoc(id, data) {
    return fsUpdateDoc(fsDoc(db, 'documents', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  export async function deleteDoc(id) {
    return fsDeleteDoc(fsDoc(db, 'documents', id));
  }
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/hooks/useDocs.js
  git commit -m "feat: add useDocs Firestore CRUD hook"
  ```

---

### Task 5: Create useAuth Hook

**Files:**
- Create: `src/hooks/useAuth.js`

- [ ] **Step 1: Create src/hooks/useAuth.js**

  ```js
  import { useEffect, useState } from 'react';
  import { onAuthStateChanged } from 'firebase/auth';
  import { auth } from '../firebase';

  export default function useAuth() {
    const [user, setUser] = useState(undefined); // undefined = still loading

    useEffect(() => {
      return onAuthStateChanged(auth, setUser);
    }, []);

    return { user, loading: user === undefined };
  }
  ```

  > Note: `user` can be an anonymous Firebase user (visitor) or an email/password user (admin). Check `user.isAnonymous` to distinguish. `loading: true` while Firebase resolves the session.

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/hooks/useAuth.js
  git commit -m "feat: add useAuth hook"
  ```

---

### Task 6: Create Navbar Component

**Files:**
- Create: `src/components/Navbar.jsx`

- [ ] **Step 1: Create src/components/Navbar.jsx**

  ```jsx
  import { Link } from 'react-router-dom';

  export default function Navbar() {
    return (
      <nav className="border-b border-[#333] bg-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-[#e5e5e5] tracking-wide">
            H. Yusuf · Architect
          </Link>
          <div className="flex gap-6 text-sm text-[#888]">
            <Link to="/" className="hover:text-[#e5e5e5] transition-colors">Home</Link>
            <Link to="/about" className="hover:text-[#e5e5e5] transition-colors">About</Link>
          </div>
        </div>
      </nav>
    );
  }
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/Navbar.jsx
  git commit -m "feat: add Navbar component"
  ```

---

### Task 7: Create ProtectedRoute Component

**Files:**
- Create: `src/components/ProtectedRoute.jsx`

- [ ] **Step 1: Create src/components/ProtectedRoute.jsx**

  ```jsx
  import { Navigate } from 'react-router-dom';
  import useAuth from '../hooks/useAuth';

  export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
          <p className="text-[#888] text-sm">Memuat...</p>
        </div>
      );
    }

    if (!user || user.isAnonymous) {
      return <Navigate to="/admin" replace />;
    }

    return children;
  }
  ```

  > `user.isAnonymous === true` means visitor (not admin). Only non-anonymous authenticated users pass through.

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/ProtectedRoute.jsx
  git commit -m "feat: add ProtectedRoute component"
  ```

---

### Task 8: Create MarkdownRenderer Component

**Files:**
- Create: `src/components/MarkdownRenderer.jsx`

- [ ] **Step 1: Create src/components/MarkdownRenderer.jsx**

  ```jsx
  import ReactMarkdown from 'react-markdown';

  function extractTOC(content) {
    const headings = [];
    for (const line of content.split('\n')) {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        headings.push({ level, text, id });
      }
    }
    return headings;
  }

  function headingId(children) {
    return String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  export default function MarkdownRenderer({ content }) {
    const toc = extractTOC(content);

    return (
      <div className="flex gap-12">
        <article className="flex-1 min-w-0 prose prose-invert prose-headings:text-[#e5e5e5] prose-p:text-[#aaa] prose-a:text-indigo-400 prose-code:text-indigo-300 max-w-none">
          <ReactMarkdown
            components={{
              h2({ children }) {
                return <h2 id={headingId(children)}>{children}</h2>;
              },
              h3({ children }) {
                return <h3 id={headingId(children)}>{children}</h3>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        {toc.length > 0 && (
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#555] mb-3">
                Isi
              </p>
              <nav className="flex flex-col gap-2">
                {toc.map(({ level, text, id }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`text-sm text-[#888] hover:text-indigo-400 transition-colors leading-snug${level === 3 ? ' pl-3' : ''}`}
                  >
                    {text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/MarkdownRenderer.jsx
  git commit -m "feat: add MarkdownRenderer with TOC extraction"
  ```

---

### Task 9: Update Home Page

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Replace src/pages/Home.jsx**

  ```jsx
  import { useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { listDocs } from '../hooks/useDocs';
  import Navbar from '../components/Navbar';

  export default function Home() {
    const [docs, setDocs] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
      listDocs()
        .then(setDocs)
        .catch(() => setError('Gagal memuat dokumen.'));
    }, []);

    return (
      <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-12">
          {error && <p className="text-red-400 mb-6 text-sm">{error}</p>}
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
          {docs.length === 0 && !error && (
            <p className="text-[#888] text-sm text-center mt-12">Belum ada dokumen.</p>
          )}
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/Home.jsx
  git commit -m "feat: update Home page with Firestore numbered list"
  ```

---

### Task 10: Create DocDetail Page

**Files:**
- Create: `src/pages/DocDetail.jsx`

- [ ] **Step 1: Create src/pages/DocDetail.jsx**

  ```jsx
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
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/DocDetail.jsx
  git commit -m "feat: add DocDetail page with markdown rendering and TOC"
  ```

---

### Task 11: Create AdminLogin Page

**Files:**
- Create: `src/pages/AdminLogin.jsx`

- [ ] **Step 1: Create src/pages/AdminLogin.jsx**

  ```jsx
  import { useState, useEffect } from 'react';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { useNavigate } from 'react-router-dom';
  import { auth } from '../firebase';
  import useAuth from '../hooks/useAuth';

  export default function AdminLogin() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      if (!loading && user && !user.isAnonymous) {
        navigate('/admin/dashboard', { replace: true });
      }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSubmitting(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/admin/dashboard', { replace: true });
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-[#e5e5e5] font-bold text-xl mb-6">Admin Login</h1>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-2 text-[#e5e5e5] text-sm outline-none focus:border-indigo-500 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-2 text-[#e5e5e5] text-sm outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {submitting ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/AdminLogin.jsx
  git commit -m "feat: add AdminLogin page"
  ```

---

### Task 12: Create AdminDashboard Page

**Files:**
- Create: `src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Create src/pages/AdminDashboard.jsx**

  ```jsx
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
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/AdminDashboard.jsx
  git commit -m "feat: add AdminDashboard page with CRUD list"
  ```

---

### Task 13: Create AdminEditDoc Page

**Files:**
- Create: `src/pages/AdminEditDoc.jsx`

- [ ] **Step 1: Create src/pages/AdminEditDoc.jsx**

  ```jsx
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
  ```

- [ ] **Step 2: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/AdminEditDoc.jsx
  git commit -m "feat: add AdminEditDoc page (shared create/edit form)"
  ```

---

### Task 14: Update App.jsx with All Routes

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace src/App.jsx**

  ```jsx
  import { useEffect } from "react";
  import { Routes, Route } from "react-router-dom";
  import { signInAnonymously } from "firebase/auth";
  import { auth } from "./firebase";
  import Home from "./pages/Home";
  import DocDetail from "./pages/DocDetail";
  import AdminLogin from "./pages/AdminLogin";
  import AdminDashboard from "./pages/AdminDashboard";
  import AdminEditDoc from "./pages/AdminEditDoc";
  import ProtectedRoute from "./components/ProtectedRoute";

  function App() {
    useEffect(() => {
      signInAnonymously(auth).catch(console.error);
    }, []);

    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doc/:slug" element={<DocDetail />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/doc/new"
          element={<ProtectedRoute><AdminEditDoc /></ProtectedRoute>}
        />
        <Route
          path="/admin/doc/:id/edit"
          element={<ProtectedRoute><AdminEditDoc /></ProtectedRoute>}
        />
      </Routes>
    );
  }

  export default App;
  ```

- [ ] **Step 2: Final build verification**

  ```bash
  npm run build
  ```

  Expected: no errors. Check `dist/` exists.

- [ ] **Step 3: Smoke test in browser**

  ```bash
  npm run dev
  ```

  Buka http://localhost:5173 dan verifikasi:
  - `/` → halaman kosong "Belum ada dokumen" (Firestore kosong)
  - `/admin` → form login muncul
  - Login dengan email + password dari Task 1 → redirect ke `/admin/dashboard`
  - Dashboard: klik "+ Dokumen Baru" → form muncul
  - Isi form, simpan → kembali ke dashboard, dokumen ada di tabel
  - Klik slug di browser: `/doc/<slug>` → markdown ter-render dengan TOC
  - Logout → kembali ke `/`

- [ ] **Step 4: Commit**

  ```bash
  git add src/App.jsx
  git commit -m "feat: wire up all routes including admin panel"
  ```

---

## Selesai

App siap. Deploy ke Firebase:

```bash
npm run build
firebase deploy
```
