<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import jbm400 from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?url';
	import jbm500 from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2?url';
	import StickyNav from '$lib/components/StickyNav.svelte';
	import CrtTransition from '$lib/components/CrtTransition.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { initScroll, attachFadeUps } from '$lib/scroll';
	import { wireScrambleObserver } from '$lib/scramble';
	import { siteHost, siteOrigin } from '$lib/site';
	import { page } from '$app/state';

	const host = $derived(siteHost());
	const origin = $derived(siteOrigin());
	// CV PDF is rendered through puppeteer hitting / and /cv. Hide the
	// sticky nav on /cv only — keeps the print output clean.
	const isCv = $derived(page.url.pathname === '/cv');

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
		const disposeScroll = initScroll();
		const disposeScramble = wireScrambleObserver();
		return () => {
			disposeScroll();
			disposeScramble();
		};
	});

	afterNavigate(() => {
		// New route may bring new fade-up targets — attach observers to them.
		queueMicrotask(() => attachFadeUps());
	});

	let { children } = $props();
</script>

<svelte:head>
	{#if !isCv}
		<meta name="color-scheme" content="dark" />
		<meta name="theme-color" content="#050608" />
	{/if}
	<link rel="icon" href={favicon} />
	<link rel="preload" as="font" type="font/woff2" href={jbm400} crossorigin="anonymous" />
	<link rel="preload" as="font" type="font/woff2" href={jbm500} crossorigin="anonymous" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={host} />
	<meta property="og:image" content="{origin}/og-image.png" />
	<meta property="og:url" content={origin} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{origin}/og-image.png" />
	<!-- Plausible analytics. Activate post-deploy by uncommenting and
		 setting `data-domain` to the live host.
	<script defer data-domain={host} src="https://plausible.io/js/script.js"></script>
	-->
</svelte:head>

{#if !isCv}
	<StickyNav />
{/if}

{@render children()}

{#if mounted && !isCv}
	<CrtTransition />
{/if}
