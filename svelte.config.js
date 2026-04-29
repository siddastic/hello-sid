import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: ({ path, message }) => {
				// /cv.pdf and /og-image.png are produced by post-build scripts
				// (puppeteer pipeline). They don't exist during prerender, but they
				// will exist in the deployed bundle. Tolerate the 404 here.
				if (path === '/cv.pdf' || path === '/og-image.png') return;
				throw new Error(message);
			}
		}
	}
};

export default config;
