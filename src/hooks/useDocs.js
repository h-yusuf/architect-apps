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
