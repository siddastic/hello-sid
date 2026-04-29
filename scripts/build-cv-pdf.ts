import puppeteer from 'puppeteer-core';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { startStaticServer } from './_static-server.ts';
import { chromePath } from './_chrome-path.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BUILD = resolve(ROOT, 'build');
const STATIC = resolve(ROOT, 'static');
const PORT = 4179;

async function main() {
	const chrome = chromePath();
	if (!chrome) {
		// No Chrome on this machine — typical for Netlify CI. Fall back to
		// the static/cv.pdf checked into the repo so the deployed bundle
		// still has a valid asset.
		const fallback = resolve(STATIC, 'cv.pdf');
		if (existsSync(fallback) && existsSync(BUILD)) {
			copyFileSync(fallback, resolve(BUILD, 'cv.pdf'));
			console.log('  ⚠ no Chrome found — copied static/cv.pdf to build/cv.pdf as fallback');
		} else {
			console.log('  ⚠ no Chrome found — skipping cv.pdf generation');
		}
		return;
	}

	const server = await startStaticServer(BUILD, PORT);
	const browser = await puppeteer.launch({
		executablePath: chrome,
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});
	try {
		const page = await browser.newPage();
		await page.goto(`http://127.0.0.1:${PORT}/cv`, {
			waitUntil: 'networkidle0',
			timeout: 30000
		});
		await page.emulateMediaType('print');
		// Set a viewport that matches the printable area (A4 minus 24mm
		// margins) so the page's own layout reflects the print width
		// before the PDF call rasterises it. Without this the .cv element's
		// max-width could exceed the printable area in some chromiums.
		await page.setViewport({ width: 800, height: 1100, deviceScaleFactor: 2 });
		const pdf = await page.pdf({
			format: 'A4',
			printBackground: true,
			// Generous gutters — matches typical printed-CV breathing room
			// and makes the layout feel less wallpapered when viewed in a
			// PDF reader that frames the page in dark chrome.
			margin: { top: '24mm', right: '22mm', bottom: '24mm', left: '22mm' },
			preferCSSPageSize: false
		});
		mkdirSync(STATIC, { recursive: true });
		writeFileSync(resolve(STATIC, 'cv.pdf'), pdf);
		if (existsSync(BUILD)) writeFileSync(resolve(BUILD, 'cv.pdf'), pdf);
		console.log(`  ✓ wrote cv.pdf (${(pdf.byteLength / 1024).toFixed(1)} KB) to static/ and build/`);
	} finally {
		await browser.close();
		server.close();
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
