import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppRoot() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-white via-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-accent-300/30" />
          <div className="absolute inset-0 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}
