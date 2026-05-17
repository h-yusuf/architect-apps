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
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      signInAnonymously(auth).catch(console.error);
    }
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
