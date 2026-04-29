export interface ProjectLink {
	label: string;
	url: string;
}

export interface Project {
	slug: string;
	number: string;
	title: string;
	year: string;
	role: string;
	stack: string[];
	status: string;
	oneLiner: string;
	hardest: string;
	features?: string[];
	publisher?: string;
	note?: string;
	sponsors?: string[];
	links: ProjectLink[];
	thumbAccent: [number, number, number];
	thumbSeed: number;
}

// From INVENTORY.md §4 — order locked: Smurf, WireGraph, master_validator, RideSense, JS IDE, WBoard.
export const projects: Project[] = [
	{
		slug: 'smurf-engine',
		number: '001',
		title: 'smurf-engine',
		year: '2023 — present',
		role: 'sole engineer',
		stack: ['typescript', 'canvas', 'custom-architecture'],
		status: 'maintained',
		oneLiner: 'A TypeScript game engine I built from scratch — and the games on top of it.',
		hardest:
			'Spent disproportionate time on architecture upfront — pinning the entity model and render pipeline before writing engine code. Paid off when new games (flappy-bird, platformer_game, solid-system) slotted in without engine rewrites.',
		links: [
			{ label: 'engine', url: 'https://github.com/Smurf-Engine/engine' },
			{ label: 'flappy-bird', url: 'https://github.com/Smurf-Engine/flappy-bird' },
			{ label: 'platformer', url: 'https://github.com/Smurf-Engine/platformer_game' },
			{ label: 'solid-system', url: 'https://github.com/Smurf-Engine/solid-system' },
			{ label: 'docs', url: 'https://github.com/Smurf-Engine/docs' }
		],
		thumbAccent: [0.35, 0.94, 0.66],
		thumbSeed: 13.7
	},
	{
		slug: 'wiregraph',
		number: '002',
		title: 'wiregraph',
		year: '2022 — present',
		role: 'sole engineer · org owner',
		stack: ['typescript', 'node-graphs', 'custom-runtime'],
		status: 'maintained',
		oneLiner: 'A node-based visual programming framework for the web.',
		hardest:
			'Locked the runtime evaluation model before designing the editor — the editor never had to fight the runtime. API has stayed stable across wires + sandbox + kitchen-sink.',
		links: [
			{ label: 'wires', url: 'https://github.com/siddastic/wires' },
			{ label: 'sandbox', url: 'https://github.com/WireGraph/sandbox' },
			{ label: 'kitchen-sink', url: 'https://github.com/WireGraph/kitchen-sink' }
		],
		thumbAccent: [0.35, 0.78, 0.94],
		thumbSeed: 27.4
	},
	{
		slug: 'master-validator',
		number: '003',
		title: 'master_validator',
		year: '2022 — present',
		role: 'sole engineer',
		stack: ['dart', 'flutter', 'pub.dev'],
		status: 'published · maintained',
		oneLiner: 'A Flutter form validation library. Published, documented, maintained.',
		hardest:
			'Iterated on the API surface on paper before shipping a line of code. The chainable rule surface has stayed backwards-compatible since launch.',
		links: [
			{ label: 'package', url: 'https://github.com/siddastic/master_validator' },
			{ label: 'docs', url: 'https://github.com/siddastic/mv-docs' }
		],
		thumbAccent: [0.55, 0.94, 0.78],
		thumbSeed: 41.2
	},
	{
		slug: 'ridesense',
		number: '004',
		title: 'ridesense',
		year: '2024 — present',
		role: 'sole mobile engineer · iOS + Android via Flutter',
		stack: ['flutter', 'dart', 'firebase', 'graphhopper'],
		status: 'beta · 500+ installs across iOS and Android',
		oneLiner:
			'A Flutter app for motorcyclists — plan a route, ride together, share live location, remember the trip.',
		features: [
			'personalised route planning',
			'group ride coordination',
			'live location sharing',
			'ride memories (logs, maps, photos)'
		],
		hardest:
			"Live location sync that survives patchy signal on mountain roads. Plus dynamic re-planning mid-ride that doesn't break already-routing riders.",
		links: [
			{ label: 'ridesense.in', url: 'https://ridesense.in/' },
			{ label: 'download', url: 'https://ridesense.in/app' },
			{ label: 'features', url: 'https://ridesense.in/#features' }
		],
		thumbAccent: [0.2, 0.84, 0.94],
		thumbSeed: 55.9
	},
	{
		slug: 'js-ide',
		number: '005',
		title: 'javascript editor — mobile ide',
		year: '2019 — 2022',
		role: 'sole engineer · designer · owner',
		publisher: 'SidStuff',
		stack: ['flutter', 'dart'],
		note: 'Flutter 1.x — Sid was a year-one Flutter adopter; shipped this in 2019 at age 17.',
		status: '10,000+ installs · 4.2★ · 223 reviews · 3+ years of active updates',
		oneLiner:
			'A Flutter-built mobile IDE for JavaScript. Multi-tab, multi-language, with OCR code-scanning and cloud sync.',
		features: [
			'multi-tab editor with intellisense',
			'OCR code-scan from books / camera',
			'cloud sync (public + private code uploads)',
			'global chat between users',
			'code formatter, focus mode, color picker',
			'languages — js, ts, html, css, dart, markdown, json (jsx/tsx added later)'
		],
		hardest:
			'Built rich-text editing, syntax highlighting, and OCR for a code editor — on a phone — in Flutter 1.x, when none of those were standard library features. Most of the work was either custom rendering or carefully-chosen native bridges.',
		links: [
			{
				label: 'play store',
				url: 'https://play.google.com/store/apps/details?id=in.trptech.javascriptide'
			},
			{ label: 'bug tracker', url: 'https://github.com/siddastic/jside' }
		],
		thumbAccent: [0.94, 0.78, 0.35],
		thumbSeed: 67.3
	},
	{
		slug: 'wboard',
		number: '006',
		title: 'wboard',
		year: '2020',
		role: 'sole engineer · team Void (Ashhar Ali led, Purujeet Singh tested)',
		stack: ['firebase', 'express', 'canvas', 'realtime'],
		status: '1st place · DSC WoW 2020 · Code Off Duty hackathon',
		sponsors: ['Airmeet', 'Scaler Edge', 'Pratilipi'],
		oneLiner: 'A realtime collaborative whiteboard, built solo in a week. Won DSC WoW 2020.',
		hardest:
			"Streaming mousemove killed performance and N×N canvases didn't scale. One live canvas (active drawer) synced to DB on mouseup per stroke; every other participant sees a re-rendered snapshot at stroke boundaries. Felt live; cost almost nothing.",
		links: [
			{ label: 'source', url: 'https://github.com/team-void-code/DSCWOW_WBoard' },
			{ label: 'case study', url: 'https://devfolio.co/projects/wboard' }
		],
		thumbAccent: [0.94, 0.55, 0.78],
		thumbSeed: 79.1
	}
];

export function getProject(slug: string): Project | undefined {
	return projects.find((p) => p.slug === slug);
}
