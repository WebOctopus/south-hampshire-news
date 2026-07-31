import { useAuth } from '@/contexts/AuthContext';
import NotFound from '@/pages/NotFound';

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Pre-launch tester allowlist. These user IDs can view the gated directory
 * pages without being admins. This whole guard (and this list) is removed at
 * launch when the directory goes public.
 */
const PREVIEW_TESTER_IDS: string[] = [
  'a637537f-dad5-452c-8d87-a6add67506ed', // jamie@mirola.io
];

/**
 * Renders the wrapped page only for admin users or allowlisted testers.
 * Everyone else (including unauthenticated visitors) sees the standard 404
 * page so the URL behaves as if it does not exist. Used to hide
 * in-development sections from the public while keeping them reachable for
 * admins and pre-launch testers.
 */
const AdminOnlyRoute = ({ children }: AdminOnlyRouteProps) => {
  const { user, isAdmin, loading } = useAuth();

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

  const isTester = !!user && PREVIEW_TESTER_IDS.includes(user.id);

  if (!isAdmin && !isTester) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default AdminOnlyRoute;