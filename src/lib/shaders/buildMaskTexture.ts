import * as THREE from 'three';

export interface MaskPhrase {
	/** Small white-tone text rendered above-left of the noun. */
	prefix?: string;
	/** Mint, viewport-scale word — the visual hero of the slot. */
	noun: string;
	/** Small white-tone text rendered below-right of the noun. */
	suffix?: string;
}

export interface MaskOptions {
	phrases: MaskPhrase[];
	/** Pixel width of one slot (= viewport width at the surface size). */
	width: number;
	/** Pixel height of ONE slot (= viewport height at the surface size). */
	height: number;
	font?: string;
	weight?: number;
	/** Noun cap-height as a fraction of min(w, slotH). */
	scale?: number;
	/** Prefix/suffix cap-height as a fraction of the noun's font size. */
	smallScale?: number;
	dpr?: number;
}

/**
 * Renders a stack of phrases (each with optional prefix + noun + optional
 * suffix) to an offscreen canvas. The R channel marks the mint noun, the
 * G channel marks the white prefix/suffix text — the dither shader reads
 * both and composes a tritone palette so the whole sentence reads as one
 * dithered phrase.
 *
 * Slot 0 is drawn at the TOP of the canvas; combined with CanvasTexture's
 * default flipY=true and the shader formula `(N-1-phase+uv.y)/N`, slots
 * slide UP out of viewport top as `uPhase` advances.
 */
export function buildMaskTexture(opts: MaskOptions): THREE.CanvasTexture {
	const dpr = Math.min(opts.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1), 2);
	const w = Math.max(1, Math.floor(opts.width * dpr));
	const slotH = Math.max(1, Math.floor(opts.height * dpr));
	const N = Math.max(1, opts.phrases.length);
	const totalH = slotH * N;

	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = totalH;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2d context unavailable');

	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, w, totalH);

	const noun_scale = opts.scale ?? 0.32;
	const small_scale = opts.smallScale ?? 0.18;
	const family = opts.font ?? '"JetBrains Mono", Menlo, Monaco, monospace';
	const weight = opts.weight ?? 500;

	const nounFontSize = Math.floor(Math.min(w, slotH) * noun_scale);
	const smallFontSize = Math.max(Math.floor(12 * dpr), Math.floor(nounFontSize * small_scale));
	const gap = Math.floor(smallFontSize * 0.5);

	for (let i = 0; i < N; i++) {
		const phrase = opts.phrases[i];
		const slotY = i * slotH;
		const cx = w / 2;
		const cy = slotY + slotH / 2;

		// 1) Noun — large, centred, RED channel (mint). Auto-shrink so it
		// always fits within the canvas width with breathing room (long words
		// like "frameworks" used to clip on narrower viewports).
		const maxNounWidth = w - 2 * Math.floor(w * 0.06);
		let actualNounSize = nounFontSize;
		ctx.font = `${weight} ${actualNounSize}px ${family}`;
		const minNounSize = Math.max(Math.floor(48 * dpr), Math.floor(nounFontSize * 0.35));
		while (
			phrase.noun &&
			ctx.measureText(phrase.noun).width > maxNounWidth &&
			actualNounSize > minNounSize
		) {
			actualNounSize -= 2;
			ctx.font = `${weight} ${actualNounSize}px ${family}`;
		}
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#ff0000';
		if (phrase.noun) ctx.fillText(phrase.noun, cx, cy);

		const nounMetrics = phrase.noun ? ctx.measureText(phrase.noun) : { width: 0 };
		const nounW = nounMetrics.width;

		// Try font size `start` for `text` in `maxWidth`. Returns the largest
		// size ≤ start that fits, or 0 if nothing ≥ minReadable does.
		const fitFont = (text: string, maxWidth: number, start: number, minReadable: number) => {
			let size = start;
			ctx.font = `${weight} ${size}px ${family}`;
			while (ctx.measureText(text).width > maxWidth && size > minReadable) {
				size -= 1;
				ctx.font = `${weight} ${size}px ${family}`;
			}
			if (ctx.measureText(text).width > maxWidth) return 0;
			return size;
		};

		const sideMargin = Math.floor(w * 0.04);
		// Below this the prefix becomes hieroglyphics on phones.
		const minReadable = Math.max(Math.floor(11 * dpr), Math.floor(smallFontSize * 0.55));
		ctx.fillStyle = '#00ff00';

		// 2) Prefix — top-left of noun if it fits readably; otherwise
		//    centered above the noun.
		if (phrase.prefix && phrase.prefix.trim()) {
			const txt = phrase.prefix.trim();
			const availLeft = cx - nounW / 2 - gap - sideMargin;
			const sizeTL = fitFont(txt, availLeft, smallFontSize, minReadable);
			if (sizeTL > 0) {
				ctx.font = `${weight} ${sizeTL}px ${family}`;
				ctx.textAlign = 'right';
				ctx.textBaseline = 'alphabetic';
				ctx.fillText(txt, cx - nounW / 2 - gap, cy - actualNounSize * 0.36);
			} else {
				const availFull = w - 2 * sideMargin;
				const sizeAbove = fitFont(txt, availFull, smallFontSize, Math.floor(10 * dpr));
				const useSize = sizeAbove > 0 ? sizeAbove : Math.floor(10 * dpr);
				ctx.font = `${weight} ${useSize}px ${family}`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'alphabetic';
				ctx.fillText(txt, cx, cy - actualNounSize * 0.58);
			}
		}

		// 3) Suffix — bottom-right of noun if it fits; otherwise centered
		//    below.
		if (phrase.suffix && phrase.suffix.trim()) {
			const txt = phrase.suffix.trim();
			const availRight = w - (cx + nounW / 2 + gap) - sideMargin;
			const sizeBR = fitFont(txt, Math.max(availRight, 1), smallFontSize, minReadable);
			if (sizeBR > 0) {
				ctx.font = `${weight} ${sizeBR}px ${family}`;
				ctx.textAlign = 'left';
				ctx.textBaseline = 'alphabetic';
				ctx.fillText(txt, cx + nounW / 2 + gap, cy + actualNounSize * 0.5);
			} else {
				const availFull = w - 2 * sideMargin;
				const sizeBelow = fitFont(txt, availFull, smallFontSize, Math.floor(10 * dpr));
				const useSize = sizeBelow > 0 ? sizeBelow : Math.floor(10 * dpr);
				ctx.font = `${weight} ${useSize}px ${family}`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.fillText(txt, cx, cy + actualNounSize * 0.55);
			}
		}
	}

	const tex = new THREE.CanvasTexture(canvas);
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	tex.wrapS = THREE.ClampToEdgeWrapping;
	tex.wrapT = THREE.ClampToEdgeWrapping;
	tex.needsUpdate = true;
	return tex;
}
