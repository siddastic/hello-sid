<script lang="ts">
	import type { Project } from '$lib/data/projects';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import DitherSurface from '$lib/components/DitherSurface.svelte';

	interface Props {
		project: Project;
	}

	let { project }: Props = $props();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				history.length > 1 ? history.back() : goto('/');
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<svelte:head>
	<title>Sid — {project.title}</title>
	<meta name="description" content={project.oneLiner} />
</svelte:head>

<a class="skip-link" href="#detail-main">skip to content</a>

<article id="detail-main" class="detail">
	<a class="back" href="/" aria-label="Back to home">← back</a>

	<header class="detail-head">
		<div class="num-slug">
			<span class="num">{project.number}</span>
			<span class="slug">/ {project.slug.toUpperCase()}</span>
			<span class="status">· {project.status}</span>
		</div>
		<h1 class="title" data-scramble>{project.title}</h1>
		<p class="one-liner">{project.oneLiner}</p>
	</header>

	<figure class="hero-thumb">
		<img
			class="static-thumb"
			class:hide={mounted}
			src={`/thumbs/${project.slug}.png`}
			alt={`Dithered hero for ${project.title}`}
			width="800"
			height="500"
		/>
		{#if mounted}
			<div class="live-dither" aria-hidden="true">
				<DitherSurface
					phrases={[{ prefix: '', noun: project.slug.toUpperCase(), suffix: '' }]}
					accent={project.thumbAccent}
				/>
			</div>
		{/if}
	</figure>

	<dl class="facts">
		<div>
			<dt>year</dt>
			<dd>{project.year}</dd>
		</div>
		<div>
			<dt>role</dt>
			<dd>{project.role}</dd>
		</div>
		{#if project.publisher}
			<div>
				<dt>publisher</dt>
				<dd>{project.publisher}</dd>
			</div>
		{/if}
		<div>
			<dt>stack</dt>
			<dd>
				<ul class="stack-tags" aria-label="Stack">
					{#each project.stack as tag (tag)}
						<li>{tag}</li>
					{/each}
				</ul>
			</dd>
		</div>
		{#if project.sponsors}
			<div>
				<dt>sponsors</dt>
				<dd>{project.sponsors.join(' · ')}</dd>
			</div>
		{/if}
	</dl>

	{#if project.note}
		<aside class="note">{project.note}</aside>
	{/if}

	{#if project.features?.length}
		<section class="block">
			<h2 data-scramble>features</h2>
			<ul class="features">
				{#each project.features as f (f)}
					<li>{f}</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="block">
		<h2 data-scramble>hardest problem</h2>
		<p>{project.hardest}</p>
	</section>

	<section class="block">
		<h2 data-scramble>links</h2>
		<ul class="links">
			{#each project.links as l (l.url)}
				<li>
					<a href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
				</li>
			{/each}
		</ul>
	</section>
</article>

<style>
	.detail {
		max-width: 760px;
		margin: 0 auto;
		padding: 96px 24px 120px;
	}

	.back {
		display: inline-block;
		margin-bottom: 32px;
		font-size: 11px;
		color: var(--ns-text-mid);
		transition: color 150ms ease;
	}
	.back:hover,
	.back:focus-visible {
		color: var(--ns-mint);
	}
	.back:focus-visible {
		outline: 2px solid var(--ns-mint);
		outline-offset: 2px;
		border-radius: var(--ns-radius-sm);
	}

	.detail-head {
		margin-bottom: 28px;
	}

	.num-slug {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		font-size: 11px;
		color: var(--ns-text-lo);
		margin-bottom: 10px;
	}
	.num {
		color: var(--ns-mint);
	}

	.title {
		margin: 0 0 8px;
		font-size: 22px;
		font-weight: 500;
		color: var(--ns-text-hi);
	}

	.one-liner {
		margin: 0;
		color: var(--ns-text-mid);
	}

	.hero-thumb {
		position: relative;
		margin: 0 0 28px;
		aspect-ratio: 8 / 5;
		overflow: hidden;
		border-radius: var(--ns-radius-md);
		border: 0.5px solid var(--ns-border-lo);
		background: var(--ns-obsidian);
	}
	.hero-thumb img.static-thumb {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 200ms ease;
	}
	.hero-thumb img.static-thumb.hide {
		opacity: 0;
	}
	.hero-thumb .live-dither {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.facts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px 24px;
		margin: 0 0 28px;
		padding: 0;
	}
	.facts > div {
		display: grid;
		grid-template-columns: 110px 1fr;
		gap: 12px;
		padding: 8px 0;
		border-top: 0.5px dashed var(--ns-border-lo);
	}
	.facts dt {
		color: var(--ns-text-lo);
		font-size: 11px;
	}
	.facts dd {
		margin: 0;
		font-size: 12px;
		color: var(--ns-text-hi);
	}

	.stack-tags {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin: 0;
		padding: 0;
	}
	.stack-tags li {
		font-size: 10px;
		color: var(--ns-mint);
		border: 0.5px solid var(--ns-border-hi);
		padding: 2px 6px;
		border-radius: var(--ns-radius-sm);
	}

	.note {
		font-size: 11px;
		color: var(--ns-text-mid);
		font-style: italic;
		padding: 12px 14px;
		background: var(--ns-obsidian-mid);
		border-left: 2px solid var(--ns-mint);
		border-radius: var(--ns-radius-sm);
		margin-bottom: 28px;
	}

	.block {
		margin-bottom: 28px;
	}
	.block h2 {
		margin: 0 0 12px;
		font-size: 13px;
		font-weight: 500;
		color: var(--ns-mint);
		letter-spacing: 0.02em;
	}
	.block p {
		margin: 0;
		color: var(--ns-text-hi);
		max-width: 62ch;
	}

	.features,
	.links {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.features li {
		color: var(--ns-text-mid);
		padding-left: 16px;
		position: relative;
	}
	.features li::before {
		content: '·';
		position: absolute;
		left: 6px;
		color: var(--ns-mint);
	}
	.links a {
		color: var(--ns-mint);
	}
	.links a:hover,
	.links a:focus-visible {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.links a:focus-visible {
		outline: 2px solid var(--ns-mint);
		outline-offset: 2px;
		border-radius: var(--ns-radius-sm);
	}

	.skip-link {
		position: absolute;
		left: -9999px;
		top: 0;
		z-index: 100;
	}
	.skip-link:focus {
		left: 1rem;
		top: 1rem;
		padding: 0.5rem 0.75rem;
		background: var(--ns-obsidian-mid);
		border: 1px solid var(--ns-border-hi);
		color: var(--ns-mint);
		border-radius: var(--ns-radius-sm);
	}

	@media (max-width: 540px) {
		.detail {
			padding: 80px 18px 100px;
		}
		.facts {
			grid-template-columns: 1fr;
		}
		.facts > div {
			grid-template-columns: 90px 1fr;
		}
	}
</style>
