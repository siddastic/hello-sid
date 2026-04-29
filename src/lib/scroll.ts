/**
 * Scroll module — IntersectionObserver-driven fade-ups + lazy-loaded Lenis
 * smooth scroll. No GSAP — the brief listed it but we only need fade-ups,
 * which IO handles with zero dependency cost. Skips entirely under reduced
 * motion.
 */

import { get } from 'svelte/store';
import { reducedMotion } from '$lib/stores/reducedMotion';

let observer: IntersectionObserver | null = null;
let lenisDispose: (() => void) | null = null;
let lenisRef: {
	scrollTo: (target: HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;
} | null = null;

export function initScroll(): () => void {
	if (typeof window === 'undefined') return () => {};
	if (get(reducedMotion)) return () => {};

	document.documentElement.classList.add('has-scroll');

	observer = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					(e.target as HTMLElement).classList.add('is-visible');
					observer?.unobserve(e.target);
				}
			}
		},
		{ rootMargin: '0px 0px -8% 0px', threshold: 0 }
	);
	attachFadeUps();

	let cancelled = false;
	(async () => {
		const { default: Lenis } = await import('lenis');
		if (cancelled) return;
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			smoothWheel: true
		});
		let raf = 0;
		const tick = (time: number) => {
			lenis.raf(time);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		lenisRef = lenis;
		// Expose globally so CrtTransition can re-sync Lenis after popstate
		// scroll restoration (otherwise its internal state snaps to 0).
		(window as unknown as { __lenis?: unknown }).__lenis = lenis;
		// If a hash navigation already happened before Lenis mounted, snap to it.
		const initialHash = window.location.hash;
		if (initialHash) {
			const t = document.querySelector(initialHash) as HTMLElement | null;
			if (t) lenis.scrollTo(t, { offset: -56, immediate: false });
		}
		lenisDispose = () => {
			cancelAnimationFrame(raf);
			lenis.destroy();
			lenisRef = null;
			delete (window as unknown as { __lenis?: unknown }).__lenis;
		};
	})();

	// Catch all in-page hash links (e.g. ./work in StickyNav) so they smooth-
	// scroll through Lenis instead of doing a default jump.
	const onClick = (e: MouseEvent) => {
		const a = (e.target as HTMLElement | null)?.closest?.('a');
		if (!a) return;
		const href = a.getAttribute('href');
		if (!href) return;
		// Only intercept on-site hash links and not modifier-clicks/middle-clicks.
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
		if (a.target === '_blank') return;

		let url: URL;
		try {
			url = new URL(href, window.location.href);
		} catch {
			return;
		}
		if (url.origin !== window.location.origin) return;
		if (!url.hash) return;
		// Different path: let SvelteKit nav handle it; CrtTransition will scroll on land.
		if (url.pathname !== window.location.pathname) return;

		const target = document.querySelector(url.hash) as HTMLElement | null;
		if (!target) return;
		e.preventDefault();
		// Update URL hash without jumping.
		history.replaceState(null, '', url.hash);
		if (lenisRef) {
			lenisRef.scrollTo(target, { offset: -56 });
		} else {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};
	document.addEventListener('click', onClick);

	const unsubRM = reducedMotion.subscribe((v) => {
		if (v) {
			document.documentElement.classList.remove('has-scroll');
			observer?.disconnect();
			observer = null;
			lenisDispose?.();
			lenisDispose = null;
		}
	});

	return () => {
		cancelled = true;
		document.removeEventListener('click', onClick);
		unsubRM();
		document.documentElement.classList.remove('has-scroll');
		observer?.disconnect();
		observer = null;
		lenisDispose?.();
		lenisDispose = null;
	};
}

export function attachFadeUps() {
	if (!observer) return;
	const targets = document.querySelectorAll<HTMLElement>(
		'[data-fadeup]:not([data-fadeup-attached])'
	);
	for (const el of targets) {
		el.setAttribute('data-fadeup-attached', '');
		observer.observe(el);
	}
}
