import { createServer, type Server } from 'node:http';
import { createReadStream, statSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const MIME: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.txt': 'text/plain; charset=utf-8',
	'.pdf': 'application/pdf',
	'.xml': 'application/xml; charset=utf-8'
};

/** Tiny static-file server for serving the `build/` directory during
 * post-build pipelines (Puppeteer PDF + OG image generation). */
export function startStaticServer(root: string, port: number): Promise<Server> {
	return new Promise((resolve, reject) => {
		const server = createServer((req, res) => {
			try {
				const url = new URL(req.url ?? '/', 'http://localhost');
				let pathname = decodeURIComponent(url.pathname);
				if (pathname.endsWith('/')) pathname += 'index.html';
				let filePath = normalize(join(root, pathname));
				if (!filePath.startsWith(normalize(root))) {
					res.writeHead(403);
					res.end();
					return;
				}
				if (!existsSync(filePath)) {
					// SvelteKit static adapter writes <slug>.html for prerendered routes.
					if (existsSync(filePath + '.html')) filePath = filePath + '.html';
					else {
						res.writeHead(404);
						res.end('not found');
						return;
					}
				}
				const stat = statSync(filePath);
				if (stat.isDirectory()) {
					filePath = join(filePath, 'index.html');
				}
				const ext = extname(filePath);
				res.writeHead(200, {
					'Content-Type': MIME[ext] ?? 'application/octet-stream',
					'Cache-Control': 'no-store'
				});
				createReadStream(filePath).pipe(res);
			} catch (e) {
				res.writeHead(500);
				res.end(String(e));
			}
		});
		server.on('error', reject);
		server.listen(port, () => resolve(server));
	});
}
