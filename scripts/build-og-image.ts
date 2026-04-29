/**
 * Bake the OG image with @napi-rs/canvas using the same dither algorithm as
 * the runtime shader, with the "sid_" wordmark masked in. Uses Node-side
 * canvas instead of Puppeteer/WebGL for determinism and CI portability.
 */

import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_HOST = process.env.VITE_SITE_HOST || process.env.SITE_HOST || 'hello-sid.netlify.app';

const NS_OBSIDIAN: [number, number, number] = [0.018, 0.025, 0.035];
const NS_SLATE: [number, number, number] = [0.3, 0.42, 0.36];
const NS_MINT: [number, number, number] = [0.35, 0.94, 0.66];
const NS_TEXT_HI: [number, number, number] = [0.86, 0.94, 0.9];

const BAYER = [
	0.0625, 0.5625, 0.1875, 0.6875, 0.8125, 0.3125, 0.9375, 0.4375, 0.25, 0.75, 0.125, 0.625, 1.0,
	0.5, 0.875, 0.375
];

function hash(x: number, y: number) {
	const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
	return s - Math.floor(s);
}

function smooth(x: number) {
	return x * x * (3 - 2 * x);
}

function valueNoise(x: number, y: number) {
	const ix = Math.floor(x);
	const iy = Math.floor(y);
	const fx = smooth(x - ix);
	const fy = smooth(y - iy);
	const a = hash(ix, iy);
	const b = hash(ix + 1, iy);
	const c = hash(ix, iy + 1);
	const d = hash(ix + 1, iy + 1);
	return a + (b - a) * fx + ((c - a) * fy + (a - b - c + d) * fx * fy);
}

function fbm(x: number, y: number) {
	let v = 0;
	let a = 0.5;
	for (let i = 0; i < 5; i++) {
		v += a * valueNoise(x, y);
		x *= 2;
		y *= 2;
		a *= 0.5;
	}
	return v;
}

function mix(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

function srgb(c: number) {
	return Math.max(0, Math.min(255, Math.round(c * 255)));
}

async function main() {
	// Try to register the bundled JetBrains Mono font for the wordmark.
	const candidates = [
		resolve(
			ROOT,
			'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2'
		),
		resolve(
			ROOT,
			'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'
		)
	];
	for (const p of candidates) {
		if (existsSync(p)) {
			try {
				GlobalFonts.registerFromPath(p, 'JetBrains Mono');
				break;
			} catch {
				/* ignore */
			}
		}
	}

	const W = 1200;
	const H = 630;
	const canvas = createCanvas(W, H);
	const ctx = canvas.getContext('2d');

	// 1) Build the mask canvas with "sid_" text drawn large and centred.
	const maskCanvas = createCanvas(W, H);
	const maskCtx = maskCanvas.getContext('2d');
	maskCtx.fillStyle = '#000';
	maskCtx.fillRect(0, 0, W, H);
	maskCtx.fillStyle = '#fff';
	maskCtx.textAlign = 'center';
	maskCtx.textBaseline = 'middle';
	const fontSize = Math.floor(H * 0.42);
	maskCtx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
	maskCtx.fillText('sid', W / 2, H / 2);
	const maskData = maskCtx.getImageData(0, 0, W, H).data;

	// 2) Run the dither for every pixel.
	const img = ctx.createImageData(W, H);
	const data = img.data;
	const aspect = W / H;
	const t = 7.42;

	for (let py = 0; py < H; py++) {
		for (let px = 0; px < W; px++) {
			const u = px / W;
			const v = py / H;
			const idxMask = (py * W + px) * 4;
			const mask = maskData[idxMask] / 255;

			const sx = u * aspect;
			const sy = v;
			const vBg = fbm(sx * 3 + t * 0.05, sy * 3 - t * 0.04);
			const vFg = fbm(sx * 4.5 - t * 0.08, sy * 4.5 + t * 0.06) + 0.1;
			const noise = mix(vBg, vFg, mask);

			const cellSize = mix(2.5, 1.6, mask);
			const cx = Math.floor(((px / cellSize) % 4) + 4) % 4;
			const cy = Math.floor(((py / cellSize) % 4) + 4) % 4;
			const thr = BAYER[cx + cy * 4];
			const dith = noise >= thr ? 1 : 0;

			const lightTone: [number, number, number] = [
				mix(NS_SLATE[0], NS_MINT[0], mask),
				mix(NS_SLATE[1], NS_MINT[1], mask),
				mix(NS_SLATE[2], NS_MINT[2], mask)
			];
			const r = mix(NS_OBSIDIAN[0], lightTone[0], dith);
			const g = mix(NS_OBSIDIAN[1], lightTone[1], dith);
			const b = mix(NS_OBSIDIAN[2], lightTone[2], dith);

			const idx = (py * W + px) * 4;
			data[idx] = srgb(r);
			data[idx + 1] = srgb(g);
			data[idx + 2] = srgb(b);
			data[idx + 3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);

	// 3) Overlay the small wordmark + tag at the bottom.
	ctx.fillStyle = `rgba(${srgb(NS_TEXT_HI[0])}, ${srgb(NS_TEXT_HI[1])}, ${srgb(NS_TEXT_HI[2])}, 0.95)`;
	ctx.font = '500 22px "JetBrains Mono", monospace';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(`~/sid · ${SITE_HOST}`, 48, H - 56);
	ctx.fillStyle = `rgba(170, 210, 190, 0.65)`;
	ctx.font = '400 16px "JetBrains Mono", monospace';
	ctx.fillText('friendly neighbourhood programmer.', 48, H - 32);

	const buf = await canvas.encode('png');

	// Write to both static/ (for prerender resolution) and build/ (for the
	// final deployed asset).
	const staticDir = resolve(ROOT, 'static');
	const buildDir = resolve(ROOT, 'build');
	mkdirSync(staticDir, { recursive: true });
	writeFileSync(resolve(staticDir, 'og-image.png'), buf);
	if (existsSync(buildDir)) writeFileSync(resolve(buildDir, 'og-image.png'), buf);
	console.log(`  ✓ wrote og-image.png (${(buf.byteLength / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
