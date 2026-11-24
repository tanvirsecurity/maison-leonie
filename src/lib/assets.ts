/**
 * Resolves static asset paths relative to Vite's configured BASE_URL.
 * Seamlessly handles localhost (/), Vercel (/), and GitHub Pages (/maison-leonie/).
 * Safe and idempotent.
 */
export function getAssetUrl(path: string | undefined): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;

  if (path.startsWith(prefix) || (base !== '/' && path.startsWith(base))) {
    return path;
  }

  const clean = path.replace(/^\.?\//, '');
  return `${prefix}${clean}`;
}
