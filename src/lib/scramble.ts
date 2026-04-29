/**
 * Decode-style scramble animation: text starts as random gibberish and
 * resolves character-by-character into the target string.
 *
 * Used for the hero shader mask and every section heading. The character
 * "lock" times are slightly jittered so chars settle in a roughly left-to-
 * right wave, but with enough chaos to feel alive.
 *
 * No deps — vanilla JS, RAF-driven.
 */

import { get } from 'svelte/store';
import { reducedMotion } from '$lib/stores/reducedMotion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?/<>[]{}=+';

interface ScrambleOpts {
	target: string;
	/** Total animation duration in ms. */
	duration?: number;
	/** Frequency of visual updates, in ms. Lower = smoother + more expensive. */
	tickMs?: number;
	onUpdate: (text: string) => void;
	onComplete?: () => void;
}

/** Run a scramble animation. Returns a cancel function. */
export function scramble(opts: ScrambleOpts): () => void {
	const { target, onUpdate, onComplete } = opts;
	const duration = opts.duration ?? 700;
	const tickMs = opts.tickMs ?? 0;

	if (get(reducedMotion)) {
		onUpdate(target);
		onComplete?.();
		return () => {};
	}

	const start = performance.now();
	const len = target.length;

	// Each character has a "lock time" — when elapsed >= lockTime, that
	// position settles to the target char. Jitter so the front edge isn't a
	// rigid sweep.
	const lockTimes = Array.from({ length: len }, (_, i) => {
		const base = len <= 1 ? 1 : i / (len - 1);
		const jitter = (Math.random() - 0.5) * 0.25;
		return Math.max(0, Math.min(1, base + jitter)) * duration;
	});

	let raf = 0;
	let lastTick = 0;
	let cancelled = false;

	const tick = () => {
		if (cancelled) return;
		const now = performance.now();
		const elapsed = now - start;
		if (tickMs > 0 && now - lastTick < tickMs && elapsed < duration) {
			raf = requestAnimationFrame(tick);
			return;
		}
		lastTick = now;

		let out = '';
		for (let i = 0; i < len; i++) {
			const ch = target[i];
			if (elapsed >= lockTimes[i]) {
				out += ch;
			} else if (ch === ' ' || ch === '\n' || ch === '\t') {
				out += ch;
			} else {
				out += CHARS[(Math.random() * CHARS.length) | 0];
			}
		}
		onUpdate(out);

		if (elapsed < duration) {
			raf = requestAnimationFrame(tick);
		} else {
			onUpdate(target);
			onComplete?.();
		}
	};
	raf = requestAnimationFrame(tick);

	return () => {
		cancelled = true;
		cancelAnimationFrame(raf);
	};
}

/** Compute a sensible scramble duration from a string's length.
 * Short titles snap fast, long titles take longer — feels natural.
 * 1.5x slower than the original tuning per Sid's call. */
export function durationFor(text: string, base = 540, perChar = 33): number {
	return base + text.length * perChar;
}

/** Watch all `[data-scramble]` elements; scramble each into its current
 * textContent the first time it enters the viewport. Idempotent.
 *
 * Optional per-element data attributes:
 *  - `data-scramble-duration` : override the auto-computed duration in ms
 *  - `data-scramble-delay-ms` : sleep this long after viewport entry before
 *    starting (lets you sequence elements that are all initially visible)
 *  - `data-scramble-once`     : key into sessionStorage — if previously
 *    played, just snap to the final text, no re-scramble. Used for the
 *    hero entrance so re-entering the home page from a project doesn't
 *    replay it.
 */
export function wireScrambleObserver(): () => void {
	if (typeof window === 'undefined') return () => {};

	const startScramble = (el: HTMLElement) => {
		if (el.dataset.scrambleRan === '1') return;
		el.dataset.scrambleRan = '1';
		const target = el.dataset.scrambleText ?? el.textContent ?? '';
		if (!target) return;

		const onceKey = el.dataset.scrambleOnce;
		if (onceKey) {
			try {
				if (sessionStorage.getItem(`sid:scramble:${onceKey}`) === '1') {
					el.textContent = target;
					return;
				}
				sessionStorage.setItem(`sid:scramble:${onceKey}`, '1');
			} catch {
				/* private browsing or storage disabled — proceed without gating */
			}
		}

		const dur = el.dataset.scrambleDuration
			? parseInt(el.dataset.scrambleDuration, 10)
			: durationFor(target);
		const delay = el.dataset.scrambleDelayMs ? parseInt(el.dataset.scrambleDelayMs, 10) : 0;

		const run = () =>
			scramble({
				target,
				duration: dur,
				onUpdate: (s) => {
					el.textContent = s;
				}
			});

		if (delay > 0) {
			// Pre-fill with random gibberish IMMEDIATELY so the user doesn't see
			// the settled text first, then suddenly randomise, then re-settle —
			// which is how a delayed scramble used to read.
			let pre = '';
			for (let i = 0; i < target.length; i++) {
				const ch = target[i];
				pre += ch === ' ' || ch === '\n' || ch === '\t'
					? ch
					: CHARS[(Math.random() * CHARS.length) | 0];
			}
			el.textContent = pre;
			setTimeout(run, delay);
		} else {
			run();
		}
	};

	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				const el = e.target as HTMLElement;
				io.unobserve(el);
				startScramble(el);
			}
		},
		// No shrink — fire as soon as ANY pixel of the element is in the
		// viewport. Hero-area elements sit near the bottom of the initial
		// fold, and a negative bottom margin would prevent them from
		// triggering on first paint.
		{ rootMargin: '0px', threshold: 0 }
	);

	const rm = get(reducedMotion);
	const attach = () => {
		document
			.querySelectorAll<HTMLElement>('[data-scramble]:not([data-scramble-attached])')
			.forEach((el) => {
				el.setAttribute('data-scramble-attached', '');
				if (!el.dataset.scrambleText) el.dataset.scrambleText = el.textContent ?? '';
				if (!el.getAttribute('aria-label')) {
					el.setAttribute('aria-label', el.dataset.scrambleText);
				}
				// If this element has a delay, replace its text with random
				// gibberish IMMEDIATELY so the settled string never flashes
				// before the scramble's turn comes up.
				const delay = el.dataset.scrambleDelayMs
					? parseInt(el.dataset.scrambleDelayMs, 10)
					: 0;
				if (delay > 0 && !rm) {
					const target = el.dataset.scrambleText ?? '';
					let pre = '';
					for (let i = 0; i < target.length; i++) {
						const ch = target[i];
						pre += ch === ' ' || ch === '\n' || ch === '\t'
							? ch
							: CHARS[(Math.random() * CHARS.length) | 0];
					}
					el.textContent = pre;
				}
				io.observe(el);
			});
	};
	attach();

	const mo = new MutationObserver(() => attach());
	mo.observe(document.body, { childList: true, subtree: true });

	return () => {
		io.disconnect();
		mo.disconnect();
	};
}
