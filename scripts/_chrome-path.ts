import { existsSync } from 'node:fs';
import { platform } from 'node:os';

/** Resolve a Chrome/Chromium binary path for puppeteer-core.
 * Order: `PUPPETEER_EXECUTABLE_PATH` env → platform default.
 * Returns `null` instead of throwing — callers should skip cleanly
 * (e.g. on Netlify CI that has no Chrome installed). */
export function chromePath(): string | null {
	const env = process.env.PUPPETEER_EXECUTABLE_PATH;
	if (env && existsSync(env)) return env;

	const candidates: string[] =
		platform() === 'darwin'
			? [
					'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
					'/Applications/Chromium.app/Contents/MacOS/Chromium'
				]
			: platform() === 'win32'
				? [
						'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
						'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
					]
				: ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];

	for (const c of candidates) {
		if (existsSync(c)) return c;
	}
	return null;
}
