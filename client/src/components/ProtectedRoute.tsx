import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-16 text-center text-gray-500">加载中…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
