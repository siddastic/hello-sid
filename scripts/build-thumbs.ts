/**
 * Pre-renders dither PNGs for each project into static/thumbs/<slug>.png.
 * The algorithm mirrors src/lib/shaders/dither.frag.glsl so build-time and
 * runtime visuals match. See BUILD_BRIEF.md §10.
 */

import { createCanvas } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/lib/data/projects.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const NS_OBSIDIAN: [number, number, number] = [0.018, 0.025, 0.035];
const NS_SLATE: [number, number, number] = [0.3, 0.42, 0.36];

// 4×4 Bayer matrix, normalised to (0,1].
// Order matches the GLSL constant array, bayer[x + y*4].
const BAYER = [
	0.0625, 0.5625, 0.1875, 0.6875, 0.8125, 0.3125, 0.9375, 0.4375, 0.25, 0.75, 0.125, 0.625, 1.0,
	0.5, 0.875, 0.375
];

function hash(p: [number, number]) {
	const x = Math.sin(p[0] * 12.9898 + p[1] * 78.233) * 43758.5453;
	return x - Math.floor(x);
}

function smooth(x: number) {
	return x * x * (3 - 2 * x);
}

function valueNoise(x: number, y: number) {
	const ix = Math.floor(x);
	const iy = Math.floor(y);
	const fx = smooth(x - ix);
	const fy = smooth(y - iy);
	const a = hash([ix, iy]);
	const b = hash([ix + 1, iy]);
	const c = hash([ix, iy + 1]);
	const d = hash([ix + 1, iy + 1]);
	const ab = a + (b - a) * fx;
	const cd = c + (d - c) * fx;
	return ab + (cd - ab) * fy;
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

interface BuildOpts {
	slug: string;
	width: number;
	height: number;
	seed: number;
	accent: [number, number, number];
	outDir: string;
}

async function buildThumb(opts: BuildOpts) {
	const { width, height, seed, accent } = opts;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	const img = ctx.createImageData(width, height);
	const data = img.data;

	const aspect = width / height;
	const seedOffsetX = (seed * 0.137) % 100;
	const seedOffsetY = (seed * 0.241) % 100;

	// Constant within the build (no animation), so flow fields are static.
	const t = seed * 0.5;

	for (let py = 0; py < height; py++) {
		for (let px = 0; px < width; px++) {
			const u = px / width;
			const v = py / height;
			// Sample noise — same scaling as the GLSL fragment shader.
			const sx = u * aspect + seedOffsetX;
			const sy = v + seedOffsetY;
			const vBg = fbm(sx * 3 + t * 0.05, sy * 3 - t * 0.04);
			const vFg = fbm(sx * 4.5 - t * 0.08, sy * 4.5 + t * 0.06) + 0.1;
			// No mask in thumbnails — bias toward foreground for vibrance.
			const noiseValue = mix(vBg, vFg, 0.55);

			// Variable-cell dither, fixed at the foreground cell size for thumbs.
			const cellSize = 2.0;
			const cx = Math.floor(((px / cellSize) % 4) + 4) % 4;
			const cy = Math.floor(((py / cellSize) % 4) + 4) % 4;
			const thr = BAYER[cx + cy * 4];
			const dith = noiseValue >= thr ? 1 : 0;

			// Tritone: dark, slate, accent. Bias half-and-half between slate and accent for variety.
			const lightTone: [number, number, number] = [
				mix(NS_SLATE[0], accent[0], 0.55),
				mix(NS_SLATE[1], accent[1], 0.55),
				mix(NS_SLATE[2], accent[2], 0.55)
			];
			const r = mix(NS_OBSIDIAN[0], lightTone[0], dith);
			const g = mix(NS_OBSIDIAN[1], lightTone[1], dith);
			const b = mix(NS_OBSIDIAN[2], lightTone[2], dith);

			const idx = (py * width + px) * 4;
			data[idx] = srgb(r);
			data[idx + 1] = srgb(g);
			data[idx + 2] = srgb(b);
			data[idx + 3] = 255;
		}
	}

	ctx.putImageData(img, 0, 0);

	const outPath = resolve(opts.outDir, `${opts.slug}.png`);
	mkdirSync(opts.outDir, { recursive: true });
	const buf = await canvas.encode('png');
	writeFileSync(outPath, buf);
}

async function main() {
	const outDir = resolve(ROOT, 'static', 'thumbs');
	const start = Date.now();
	for (const p of projects) {
		const t0 = Date.now();
		await buildThumb({
			slug: p.slug,
			width: 800,
			height: 500,
			seed: p.thumbSeed,
			accent: p.thumbAccent,
			outDir
		});
		console.log(`  ✓ ${p.slug.padEnd(20)} ${Date.now() - t0}ms`);
	}
	console.log(`built ${projects.length} thumbs in ${Date.now() - start}ms`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
