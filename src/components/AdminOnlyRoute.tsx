import { useAuth } from '@/contexts/AuthContext';
import NotFound from '@/pages/NotFound';

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Renders the wrapped page only for admin users. Everyone else (including
 * unauthenticated visitors) sees the standard 404 page so the URL behaves
 * as if it does not exist. Used to hide in-development sections from the
 * public while keeping them reachable for admins.
 */
const AdminOnlyRoute = ({ children }: AdminOnlyRouteProps) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-community-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default AdminOnlyRoute;