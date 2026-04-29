<script lang="ts">
	import { projects } from '$lib/data/projects';
	import { experience } from '$lib/data/experience';
	import { skillGroups } from '$lib/data/skills';
	import { socials } from '$lib/data/socials';
	import { siteHost } from '$lib/site';

	const host = siteHost();
</script>

<svelte:head>
	<title>Siddhant Gaurav Sharma — CV</title>
	<meta name="description" content="Siddhant Gaurav Sharma · CV" />
	<!-- Override the layout's `color-scheme: dark`. Without this, Chromium's
		 print engine renders the @page canvas as dark and the page margin
		 area shows up as black around our white body. -->
	<meta name="color-scheme" content="light" />
</svelte:head>

<article class="cv">
	<header class="cv-head">
		<div class="head-left">
			<h1>Siddhant Gaurav Sharma</h1>
			<p class="brand">Sid · {host}</p>
			<p class="tag">friendly neighbourhood programmer — apps, engines, and everything between.</p>
		</div>
		<ul class="head-right" aria-label="Links">
			{#each socials as s (s.label)}
				<li>
					<span class="key">{s.label}</span>
					<a href={s.url}>{s.display}</a>
				</li>
			{/each}
		</ul>
	</header>

	<section>
		<h2>Experience</h2>
		{#each experience.filter((n) => n.kind === 'job') as node (node.company)}
			<div class="exp">
				<div class="exp-head">
					<strong>{node.company}</strong>
					{#if node.location}<span class="loc">— {node.location}</span>{/if}
				</div>
				{#each node.roles as role (role.title + role.dates)}
					<div class="role">
						<div class="role-head">
							<span class="role-title">{role.title}</span>
							<span class="role-meta">
								{role.type} · {role.dates}{role.location ? ` · ${role.location}` : ''}
							</span>
						</div>
						{#if role.bullets.length}
							<ul class="bullets">
								{#each role.bullets as b (b)}
									<li>{b}</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</section>

	<section>
		<h2>Selected work</h2>
		<ul class="proj-list">
			{#each projects as p (p.slug)}
				<li>
					<div class="proj-head">
						<strong>{p.title}</strong>
						<span class="proj-meta">{p.year} · {p.role}</span>
					</div>
					<p class="proj-line">{p.oneLiner}</p>
					<p class="proj-stack">stack: {p.stack.join(', ')}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>Skills</h2>
		<div class="skills">
			{#each skillGroups as g (g.name)}
				<div class="skill-group">
					<strong>{g.name}</strong>
					<span>{g.rows.map((r) => r.name).join(', ')}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2>Education</h2>
		{#each experience.filter((n) => n.kind === 'education') as node (node.company)}
			<div class="edu">
				<strong>{node.company}</strong>
				{#if node.location}<span class="loc">— {node.location}</span>{/if}
				<div class="role-meta">{node.degree ?? node.roles[0].title} · {node.roles[0].dates}</div>
			</div>
		{/each}
	</section>

	<section class="last">
		<h2>Accolades</h2>
		<div class="edu">
			<strong>DSC WoW 2020 — Code Off Duty Hackathon · 1st place (team Void).</strong>
			<div class="role-meta">Sponsors: Airmeet, Scaler Edge, Pratilipi · Dec 2020.</div>
		</div>
	</section>
</article>

<style>
	:global(html),
	:global(body) {
		background: #ffffff !important;
		color: #1a1a1a;
		margin: 0;
		padding: 0;
		color-scheme: light;
	}
	:global(body) {
		min-height: 0;
	}

	/* Page-level rules — control the @page canvas itself. Without these
	 * the dark `color-scheme` on the layout makes Chromium render the
	 * page margin area black around our white body. */
	@page {
		background: #ffffff;
		size: A4;
	}

	.cv {
		max-width: 640px;
		margin: 0 auto;
		padding: 12px 8px 20px;
		font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
		font-size: 10.5pt;
		line-height: 1.55;
		color: #1a1a1a;
	}

	/* Header — name left, contact right. Mirrors common ATS patterns
	 * without losing the brand voice. */
	.cv-head {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 24px;
		align-items: flex-start;
		padding-bottom: 18px;
		margin-bottom: 22px;
		border-bottom: 0.75pt solid #c9c9c9;
	}

	h1 {
		margin: 0 0 4px;
		font-size: 20pt;
		font-weight: 500;
		color: #000;
		letter-spacing: -0.01em;
		line-height: 1.1;
	}

	.brand {
		margin: 0 0 8px;
		font-size: 9pt;
		color: #047857;
	}

	.tag {
		margin: 0;
		font-size: 10pt;
		color: #444;
		max-width: 38ch;
	}

	.head-right {
		list-style: none;
		margin: 4px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 9pt;
	}
	.head-right li {
		display: grid;
		grid-template-columns: 64px 1fr;
		gap: 6px;
	}
	.head-right .key {
		color: #888;
	}
	.head-right a {
		color: #047857;
		text-decoration: none;
		word-break: break-all;
	}

	section {
		margin-bottom: 18px;
	}
	section.last {
		margin-bottom: 0;
	}

	h2 {
		margin: 0 0 12px;
		font-size: 10.5pt;
		font-weight: 500;
		color: #047857;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border-bottom: 0.5pt solid #d8d8d8;
		padding-bottom: 4px;
	}

	.exp {
		margin-bottom: 11px;
		page-break-inside: avoid;
	}
	.exp:last-child {
		margin-bottom: 0;
	}
	.exp-head {
		font-size: 11pt;
		margin-bottom: 6px;
	}
	.role {
		margin-top: 8px;
		page-break-inside: avoid;
	}
	.role-head {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: baseline;
		font-size: 9.5pt;
	}
	.role-title {
		color: #047857;
		font-weight: 500;
	}
	.role-meta {
		color: #666;
		font-size: 9pt;
	}

	.bullets {
		list-style: none;
		margin: 5px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.bullets li {
		position: relative;
		padding-left: 12px;
		page-break-inside: avoid;
	}
	.bullets li::before {
		content: '·';
		position: absolute;
		left: 2px;
		color: #047857;
	}

	.proj-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 7px;
	}
	.proj-list li {
		page-break-inside: avoid;
	}
	.proj-head {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: baseline;
		font-size: 11pt;
		margin-bottom: 2px;
	}
	.proj-meta {
		font-size: 9pt;
		color: #666;
	}
	.proj-line {
		margin: 1px 0;
		color: #333;
	}
	.proj-stack {
		margin: 2px 0 0;
		font-size: 9pt;
		color: #666;
	}

	.skills {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.skill-group {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 10px;
		font-size: 9.5pt;
	}
	.skill-group strong {
		color: #047857;
		font-weight: 500;
	}

	.edu {
		font-size: 10pt;
	}
	.edu .role-meta {
		margin-top: 2px;
	}

	.two-col {
		display: flex;
		gap: 28px;
		page-break-inside: avoid;
	}
	.two-col > div {
		flex: 1 1 0;
		min-width: 0;
	}
	.two-col h2 {
		margin-top: 0;
	}

	.loc {
		color: #777;
		font-size: 9pt;
	}

	@media print {
		:global(html),
		:global(body) {
			background: #fff;
			color: #000;
		}
		.cv {
			padding: 0;
			max-width: none;
		}
		a {
			color: #047857 !important;
			text-decoration: none;
		}
	}
</style>
