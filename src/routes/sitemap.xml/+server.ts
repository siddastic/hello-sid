import { projects } from '$lib/data/projects';
import { siteOrigin } from '$lib/site';

export const prerender = true;

export function GET() {
	const SITE = siteOrigin();
	const urls = ['', ...projects.map((p) => `/work/${p.slug}`), '/cv'];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `	<url>
		<loc>${SITE}${u}</loc>
		<changefreq>monthly</changefreq>
	</url>`
	)
	.join('\n')}
</urlset>`;
	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
}
