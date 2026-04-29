import { readable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Reactive readable: `true` when the user has requested reduced motion.
 * Safe on the server — emits `false` during SSR/prerender, then updates on
 * client mount and on every change to the OS-level setting.
 */
export const reducedMotion: Readable<boolean> = readable(false, (set) => {
	if (!browser) return;
	const mql = window.matchMedia(QUERY);
	set(mql.matches);
	const onChange = (e: MediaQueryListEvent) => set(e.matches);
	mql.addEventListener('change', onChange);
	return () => mql.removeEventListener('change', onChange);
});
