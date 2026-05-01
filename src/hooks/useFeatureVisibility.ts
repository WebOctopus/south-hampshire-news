import { useAuth } from '@/contexts/AuthContext';

/**
 * While the Events and Business Directory pages are still in development,
 * hide them from the public. Admins keep full access so we can keep building.
 * Flip the implementation to `return true;` to release publicly.
 */
export const useEventsAndDirectoryVisible = (): boolean => {
  const { isAdmin } = useAuth();
  return isAdmin;
};