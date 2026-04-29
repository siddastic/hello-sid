<script lang="ts">
	import type { Project } from '$lib/data/projects';
	import DitherSurface from '$lib/components/DitherSurface.svelte';
	import { reducedMotion } from '$lib/stores/reducedMotion';

	interface Props {
		project: Project;
	}

	let { project }: Props = $props();

	const href = $derived(`/work/${project.slug}`);

	let hot = $state(false);
	const live = $derived(hot && !$reducedMotion);
</script>

<a
	class="card"
	{href}
	aria-label={`Open ${project.title} — ${project.oneLiner}`}
	onpointerenter={() => (hot = true)}
	onpointerleave={() => (hot = false)}
	onfocus={() => (hot = true)}
	onblur={() => (hot = false)}
>
	<figure class="thumb">
		<img
			class="static"
			class:fade={live}
			src={`/thumbs/${project.slug}.png`}
			alt={`Dithered thumbnail for ${project.title}`}
			loading="lazy"
			decoding="async"
			width="800"
			height="500"
		/>
		{#if live}
			<div class="live" aria-hidden="true">
				<DitherSurface mask={project.slug.toUpperCase()} accent={project.thumbAccent} />
			</div>
		{/if}
	</figure>
	<header class="meta">
		<span class="num-slug">
			<span class="num">{project.number}</span>
			<span class="slug">/ {project.slug.toUpperCase()}</span>
		</span>
		<h3 class="title">{project.title}</h3>
		<p class="one-liner">{project.oneLiner}</p>
		<ul class="stack" aria-label="Stack">
			{#each project.stack as tag (tag)}
				<li>{tag}</li>
			{/each}
		</ul>
	</header>
	<span class="card-num" aria-hidden="true">{project.number}</span>
</a>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px;
		border: 0.5px solid var(--ns-border-lo);
		border-radius: var(--ns-radius-md);
		background: var(--ns-obsidian-mid);
		overflow: hidden;
		transition:
			border-color 200ms ease,
			background 200ms ease,
			transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.card:hover,
	.card:focus-visible {
		border-color: var(--ns-border-hi);
		background: var(--ns-obsidian-hi);
		transform: translateY(-2px);
	}

	.card:focus-visible {
		outline: 2px solid var(--ns-mint);
		outline-offset: 2px;
	}

	.thumb {
		position: relative;
		margin: 0;
		aspect-ratio: 8 / 5;
		overflow: hidden;
		border-radius: var(--ns-radius-sm);
		background: var(--ns-obsidian);
	}

	.thumb img.static {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 200ms ease;
	}

	.thumb img.static.fade {
		opacity: 0;
	}

	.live {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 6px;
		position: relative;
		z-index: 1;
	}

	.num-slug {
		font-size: 11px;
		color: var(--ns-text-lo);
		display: flex;
		gap: 6px;
	}

	.num {
		color: var(--ns-mint);
	}

	.title {
		margin: 0;
		font-size: 13px;
		font-weight: 500;
		color: var(--ns-text-hi);
	}

	.one-liner {
		margin: 0;
		font-size: 11px;
		color: var(--ns-text-mid);
		line-height: 1.5;
	}

	.stack {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin: 4px 0 0;
		padding: 0;
	}

	.stack li {
		font-size: 10px;
		color: var(--ns-mint);
		border: 0.5px solid var(--ns-border-hi);
		padding: 2px 6px;
		border-radius: var(--ns-radius-sm);
	}

	/* Decorative giant project number bleeding off the card edge.
	 * Kept low-opacity so it reads as texture, not text. */
	.card-num {
		position: absolute;
		right: -8px;
		bottom: -34px;
		font-size: 110px;
		font-weight: 500;
		color: var(--ns-mint);
		opacity: 0.06;
		letter-spacing: -0.04em;
		pointer-events: none;
		z-index: 0;
		line-height: 1;
		transition: opacity 280ms ease;
	}
	.card:hover .card-num,
	.card:focus-visible .card-num {
		opacity: 0.14;
	}
</style>
