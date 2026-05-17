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
