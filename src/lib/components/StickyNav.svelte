<script lang="ts">
	import { onMount } from 'svelte';

	const links = [
		{ id: 'work', label: './work' },
		{ id: 'experience', label: './experience' },
		{ id: 'contact', label: './contact' }
	];

	let active = $state<string | null>(null);

	onMount(() => {
		const sections = links
			.map((l) => document.getElementById(l.id))
			.filter((el): el is HTMLElement => !!el);

		if (sections.length === 0) return;

		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) active = e.target.id;
				}
			},
			{ rootMargin: '-40% 0px -55% 0px', threshold: 0 }
		);
		sections.forEach((s) => io.observe(s));
		return () => io.disconnect();
	});
</script>

<nav class="sticky-nav" aria-label="Primary">
	<a class="brand" href="/" data-scramble data-scramble-delay-ms="0" data-scramble-once="nav-brand"
		>~/sid</a
	>

	<ul class="links">
		{#each links as l, idx (l.id)}
			<li>
				<a
					href={`/#${l.id}`}
					aria-current={active === l.id ? 'true' : undefined}
					data-scramble
					data-scramble-delay-ms={120 + idx * 90}
					data-scramble-once={`nav-${l.id}`}>{l.label}</a
				>
			</li>
		{/each}
		<li>
			<a
				href="/cv.pdf"
				download
				data-scramble
				data-scramble-delay-ms={120 + links.length * 90}
				data-scramble-once="nav-cv">./cv ↓</a
			>
		</li>
	</ul>
</nav>

<style>
	.sticky-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		background: rgba(5, 6, 8, 0.85);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-bottom: 0.5px solid var(--ns-border-lo);
		z-index: 50;
		font-size: 13px;
	}

	.brand {
		color: var(--ns-text-hi);
		font-weight: 500;
		letter-spacing: 0.01em;
	}

	.links {
		list-style: none;
		display: flex;
		gap: 18px;
		margin: 0;
		padding: 0;
		font-size: 12px;
		color: var(--ns-text-mid);
	}

	.links a {
		transition: color 150ms ease;
	}

	.links a:hover,
	.links a:focus-visible,
	.links a[aria-current='true'] {
		color: var(--ns-mint);
	}

	.links a:focus-visible {
		outline: 2px solid var(--ns-mint);
		outline-offset: 2px;
		border-radius: var(--ns-radius-sm);
	}

	@media (max-width: 540px) {
		.sticky-nav {
			padding: 0 14px;
		}
		.links {
			gap: 12px;
			font-size: 11px;
		}
	}

	@media (max-width: 380px) {
		.links li:nth-child(2),
		.links li:nth-child(3) {
			display: none;
		}
	}
</style>
