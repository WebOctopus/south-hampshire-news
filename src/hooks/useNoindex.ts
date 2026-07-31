import { useEffect } from 'react';

/**
 * Adds <meta name="robots" content="noindex,nofollow"> while the calling page
 * is mounted, and removes it on unmount so other routes stay indexable.
 *
 * Pre-launch only: remove this hook (and its call sites) when the directory
 * goes live and the nav link is added.
 */
export function useNoindex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex,nofollow');
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);
}