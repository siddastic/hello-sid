import { browser } from '$app/environment';

/**
 * Canonical hostname used for build-time rendering (prerender, sitemap,
 * OG meta, CV PDF). When the site is loaded in a real browser, prefer the
 * actual `window.location.host` so deployment-preview URLs and the final
 * domain both reflect themselves correctly.
 *
 * Override at build time with `VITE_SITE_HOST` if needed.
 */
const FALLBACK_HOST =
	(typeof import.meta !== 'undefined' &&
		(import.meta as unknown as { env?: { VITE_SITE_HOST?: string } }).env?.VITE_SITE_HOST) ||
	'hello-sid.netlify.app';

function isLocalHost(h: string): boolean {
	return (
		h.startsWith('127.') ||
		h.startsWith('192.168.') ||
		h.startsWith('10.') ||
		h.startsWith('localhost') ||
		h.startsWith('0.0.0.0')
	);
}

/** Display-friendly host string. Uses live `window.location.host` in the
 * browser (so Netlify deploy previews show their own URL), but strips
 * private/loopback addresses so the PDF generator and dev server fall
 * back to the canonical host. */
export function siteHost(): string {
	if (browser) {
		const h = window.location.host;
		if (isLocalHost(h)) return FALLBACK_HOST;
		return h;
	}
	return FALLBACK_HOST;
}

/** Full origin (`https://host`). For absolute URLs in OG meta + sitemap. */
export function siteOrigin(): string {
	if (browser) {
		const h = window.location.host;
		if (isLocalHost(h)) return `https://${FALLBACK_HOST}`;
		return window.location.origin;
	}
	return `https://${FALLBACK_HOST}`;
}
