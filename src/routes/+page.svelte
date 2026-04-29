<script lang="ts">
	import { onMount } from 'svelte';
	import DitherSurface from '$lib/components/DitherSurface.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SkillsTable from '$lib/components/SkillsTable.svelte';
	import Timeline from '$lib/components/Timeline.svelte';
	import Counter from '$lib/components/Counter.svelte';
	import { projects } from '$lib/data/projects';
	import { socials } from '$lib/data/socials';
	import { heroPhrases } from '$lib/data/heroPhrases';
	import { scramble } from '$lib/scramble';
	import { reducedMotion } from '$lib/stores/reducedMotion';
	import { get } from 'svelte/store';
	import { siteHost } from '$lib/site';

	const host = $derived(siteHost());

	const HERO_ENTRANCE_KEY = 'sid:scramble:hero-mask';
	const N = heroPhrases.length;
	// Length of phrase 0's prefix string — we scramble the whole phrase as
	// one string and split it back into prefix/noun at this index per frame.
	const FIRST_PREFIX_LEN = heroPhrases[0].prefix.length;
	// Full target text for the first-phrase scramble: prefix + noun joined.
	const FIRST_PHRASE_TARGET = heroPhrases[0].prefix + heroPhrases[0].noun;

	let mounted = $state(false);
	let phaseFloat = $state(0);
	// Slot 0's full phrase string — animated by the entrance scramble.
	// Sliced into prefix and noun below so both ends scramble in unison.
	let firstPhrase = $state(FIRST_PHRASE_TARGET);
	let entranceSettled = $state(false);

	const firstPrefix = $derived(firstPhrase.slice(0, FIRST_PREFIX_LEN));
	const firstNoun = $derived(firstPhrase.slice(FIRST_PREFIX_LEN));

	// Phrases passed to the dither: slot 0's prefix + noun reflect the
	// scramble state; the rest are static.
	const heroPhrasesLive = $derived(
		heroPhrases.map((p, i) =>
			i === 0 ? { ...p, prefix: firstPrefix, noun: firstNoun } : p
		)
	);
	let heroOuter: HTMLElement | undefined = $state();

	onMount(() => {
		mounted = true;

		// --- Initial scramble entrance, applied to slot 0 only ------------
		const alreadyPlayed = (() => {
			try {
				return sessionStorage.getItem(HERO_ENTRANCE_KEY) === '1';
			} catch {
				return false;
			}
		})();

		const timeouts: ReturnType<typeof setTimeout>[] = [];
		let cancelScramble: (() => void) | null = null;

		if (get(reducedMotion) || alreadyPlayed) {
			firstPhrase = FIRST_PHRASE_TARGET;
			entranceSettled = true;
		} else {
			// Hold an empty phrase for a beat so nothing flashes before the
			// scramble starts (otherwise the settled "Hey, I am sid" would
			// briefly render at t=0 before the scramble kicks in at t=700).
			firstPhrase = ' '.repeat(FIRST_PHRASE_TARGET.length);
			timeouts.push(
				setTimeout(() => {
					cancelScramble = scramble({
						target: FIRST_PHRASE_TARGET,
						duration: 1400,
						tickMs: 55,
						onUpdate: (s) => {
							firstPhrase = s;
						},
						onComplete: () => {
							entranceSettled = true;
							try {
								sessionStorage.setItem(HERO_ENTRANCE_KEY, '1');
							} catch {
								/* private browsing — fine */
							}
						}
					});
				}, 700)
			);
		}

		// --- Scroll-driven phase ------------------------------------------
		const onScroll = () => {
			if (!heroOuter) return;
			const rect = heroOuter.getBoundingClientRect();
			const total = heroOuter.offsetHeight - window.innerHeight;
			if (total <= 0) {
				phaseFloat = 0;
				return;
			}
			const scrolled = Math.max(0, Math.min(total, -rect.top));
			phaseFloat = (scrolled / total) * (N - 1);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		return () => {
			for (const t of timeouts) clearTimeout(t);
			cancelScramble?.();
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

<svelte:head>
	<title>Sid — {host}</title>
	<meta
		name="description"
		content="Friendly neighbourhood programmer — apps, engines, and everything between. Mobile engineer & scrum master at RideSense, building things on the side."
	/>
</svelte:head>

<a class="skip-link" href="#main">skip to content</a>

<main id="main">
	<section class="hero-outer" bind:this={heroOuter} aria-label="Hero">
		<div class="hero-pin">
			<div class="hero-canvas" aria-hidden="true">
				{#if mounted}
					<DitherSurface phrases={heroPhrasesLive} phase={phaseFloat} />
				{/if}
			</div>
			<h1 class="visually-hidden">
				Sid — Siddhant Gaurav Sharma.
				{heroPhrases.map((p) => `${p.prefix}${p.noun}${p.suffix}`).join(' ')}
			</h1>

			<!-- Hobby finale — DOM text below the dither's "sid". Stagger-reveals
			     as the user scrolls into the final phase. -->
			{#each heroPhrases as phrase, i (i)}
				{#if phrase.hobbies}
					<div
						class="hobby-line"
						class:visible={phaseFloat >= i - 0.3}
						aria-label={phrase.hobbies.join(', ')}
					>
						{#each phrase.hobbies as h, hi (h)}
							{@const reveal = i - 0.2 + hi * 0.06}
							{@const sep =
								hi === 0
									? ''
									: hi === phrase.hobbies.length - 1
										? ' & '
										: ', '}
							<span class="hobby" class:visible={phaseFloat >= reveal}
								><span class="sep" aria-hidden="true">{sep}</span><span class="hobby-text"
									>{h}</span
								></span
							>
						{/each}
					</div>
				{/if}
			{/each}

			<div class="hero-caption">
				<span
					data-scramble
					data-scramble-delay-ms="2200"
					data-scramble-once="hero-caption"
					data-scramble-duration="1400"
					>mobile · web · backend · games · graphics — since 2020, bengaluru.</span
				>
				<span
					class="scroll-cue"
					aria-hidden="true"
					data-scramble
					data-scramble-delay-ms="2400"
					data-scramble-once="hero-scrollcue">scroll ↓</span
				>
			</div>
		</div>
	</section>

	<section id="about" class="section about" aria-labelledby="about-h" data-fadeup>
		<span class="ghost-num" aria-hidden="true">01</span>
		<div class="section-head">
			<span class="section-num">/01</span>
			<h2 id="about-h" data-scramble>about</h2>
		</div>
		<div class="prose">
			<p>
				mobile engineer &amp; scrum master at ridesense. off the clock i build the things i wish
				existed — a typescript game engine, a node-graph runtime, a flutter library, a web-component
				framework. i'd rather spend a week on the architecture than a month on a rewrite. bengaluru,
				originally faridabad.
			</p>
			<p>
				when i'm not at a keyboard i'm probably driving somewhere, playing guitar, or hoping for
				rain.
			</p>
			<p class="currently">
				currently · <span>learning rust</span> · <span>watching ai</span>
			</p>
		</div>
	</section>

	<section id="work" class="section work" aria-labelledby="work-h" data-fadeup>
		<span class="ghost-num" aria-hidden="true">02</span>
		<div class="section-head">
			<span class="section-num">/02</span>
			<h2 id="work-h" data-scramble>selected work · 06 of 06 →</h2>
		</div>
		<div class="work-grid">
			{#each projects as project (project.slug)}
				<ProjectCard {project} />
			{/each}
		</div>
	</section>

	<aside class="stats" aria-label="By the numbers" data-fadeup>
		<div class="stat">
			<span class="num"><Counter value={17} duration={1400} /></span>
			<span class="label">first commercial app, shipped.</span>
		</div>
		<div class="stat">
			<span class="num">
				<Counter
					value={10000}
					duration={1600}
					delay={150}
					format={(n) => (n >= 1000 ? `${Math.floor(n / 1000)}k` : String(Math.round(n)))}
					suffix="+"
				/>
			</span>
			<span class="label">installs since, still maintained.</span>
		</div>
		<div class="stat">
			<span class="num">
				<Counter
					value={6}
					duration={1400}
					delay={300}
					format={(n) => String(Math.round(n)).padStart(2, '0')}
				/>
			</span>
			<span class="label">personal frameworks, no one asked.</span>
		</div>
		<div class="stat">
			<span class="num">
				<Counter
					value={1}
					duration={1300}
					delay={450}
					format={(n) => String(Math.round(n)).padStart(2, '0')}
				/>
			</span>
			<span class="label">hackathon. solo. one week.</span>
		</div>
	</aside>

	<section id="experience" class="section experience" aria-labelledby="experience-h" data-fadeup>
		<span class="ghost-num" aria-hidden="true">03</span>
		<div class="section-head">
			<span class="section-num">/03</span>
			<h2 id="experience-h" data-scramble>experience · 2020 — now →</h2>
		</div>
		<Timeline />
	</section>

	<section id="skills" class="section skills-section" aria-labelledby="skills-h" data-fadeup>
		<span class="ghost-num" aria-hidden="true">04</span>
		<div class="section-head">
			<span class="section-num">/04</span>
			<h2 id="skills-h" data-scramble>stack</h2>
		</div>
		<SkillsTable />
	</section>

	<section id="side" class="section side" aria-labelledby="side-h" data-fadeup>
		<div class="section-head">
			<span class="section-num">/—</span>
			<h2 id="side-h" data-scramble>side &amp; accolades</h2>
		</div>
		<p>
			<span class="accolade">DSC WoW 2020 — Code Off Duty Hackathon · 1st place (team Void).</span>
			full case study at <a href="/work/wboard">/work/wboard</a>.
		</p>
	</section>

	<section id="contact" class="section contact" aria-labelledby="contact-h" data-fadeup>
		<span class="ghost-num" aria-hidden="true">05</span>
		<div class="section-head">
			<span class="section-num">/05</span>
			<h2 id="contact-h" data-scramble>contact</h2>
		</div>
		<dl class="contact-list">
			{#each socials as s (s.label)}
				<div class="row">
					<dt>{s.label}</dt>
					<dd><a href={s.url} target={s.label === 'email' ? undefined : '_blank'} rel="noreferrer">{s.display}</a></dd>
				</div>
			{/each}
			<div class="row">
				<dt>cv</dt>
				<dd><a href="/cv.pdf" download>download cv (.pdf) ↓</a></dd>
			</div>
		</dl>
	</section>

	<footer class="footer">
		<p>built with sveltekit, three.js, custom glsl. <a href="https://github.com/siddastic/hello-sid" target="_blank" rel="noreferrer">source on github ↗</a></p>
		<p>© 2026 siddhant gaurav sharma · {host}</p>
	</footer>
</main>

<style>
	/* Hero outer is N×100svh tall; the inner sticky child stays pinned in
	 * view while the user scrolls, and the phrase reel slides through the
	 * window. After the outer is fully scrolled, the rest of the page
	 * (about, work, etc.) takes over normally — no scroll lock release
	 * logic needed, it's emergent from the layout. */
	.hero-outer {
		position: relative;
		width: 100%;
		/* Total scroll travel = (N-1) × 100svh, plus 100svh for the first
		 * resting frame. Tuned per the heroPhrases length. */
		height: calc(7 * 100svh);
		isolation: isolate;
	}

	.hero-pin {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100svh;
		overflow: hidden;
	}

	.hero-canvas {
		position: absolute;
		inset: 0;
		background: var(--ns-obsidian);
	}

	/* Hobby finale — DOM text positioned below the dither's "sid" word.
	 * Centered horizontally, sitting roughly where the dither's noun
	 * baseline ends. Each hobby fades in as the scroll-driven phaseFloat
	 * crosses its threshold. */
	.hobby-line {
		position: absolute;
		left: 50%;
		top: calc(50% + min(17vw, 17svh));
		transform: translateX(-50%);
		width: calc(100% - 32px);
		max-width: 540px;
		padding: 0 16px;
		text-align: center;
		font-size: clamp(12px, 1.3vw, 15px);
		color: var(--ns-text-mid);
		letter-spacing: 0.01em;
		line-height: 1.55;
		pointer-events: none;
		opacity: 0;
		transition: opacity 320ms ease;
	}
	.hobby-line.visible {
		opacity: 1;
	}
	.hobby {
		opacity: 0;
		filter: blur(5px);
		display: inline-block;
		transition:
			opacity 480ms cubic-bezier(0.2, 0.8, 0.2, 1),
			filter 480ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.hobby.visible {
		opacity: 1;
		filter: blur(0);
	}
	.hobby .sep {
		color: var(--ns-text-lo);
		white-space: pre;
	}
	.hobby .hobby-text {
		color: var(--ns-mint);
	}

	@media (prefers-reduced-motion: reduce) {
		.hobby,
		.hobby-line {
			opacity: 1;
			filter: none;
			transition: none;
		}
	}

	.hero-caption {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
		font-size: 11px;
		color: var(--ns-text-mid);
		display: flex;
		justify-content: space-between;
		gap: 12px;
		mix-blend-mode: screen;
		pointer-events: none;
	}

	.scroll-cue {
		color: var(--ns-mint);
	}

	@media (max-width: 540px) {
		.hero-outer {
			height: calc(7 * 100svh);
		}
	}

	.section {
		position: relative;
		max-width: 760px;
		margin: 0 auto;
		padding: 96px 24px;
		isolation: isolate;
	}

	.ghost-num {
		position: absolute;
		top: 48px;
		right: -10px;
		font-size: 220px;
		font-weight: 500;
		color: var(--ns-mint);
		opacity: 0.045;
		letter-spacing: -0.06em;
		line-height: 0.85;
		pointer-events: none;
		z-index: -1;
		user-select: none;
	}

	@media (max-width: 540px) {
		.ghost-num {
			top: 32px;
			right: -4px;
			font-size: 140px;
			opacity: 0.06;
		}
	}

	.stats {
		max-width: 920px;
		margin: 32px auto;
		padding: 80px 32px;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 28px 24px;
		position: relative;
		border-top: 0.5px solid var(--ns-border-lo);
		border-bottom: 0.5px solid var(--ns-border-lo);
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}

	.stat .num {
		font-size: 48px;
		font-weight: 500;
		color: var(--ns-mint);
		letter-spacing: -0.04em;
		line-height: 1;
	}

	.stat .label {
		font-size: 11px;
		color: var(--ns-text-mid);
		line-height: 1.5;
	}

	@media (max-width: 640px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
			padding: 56px 20px;
			gap: 24px 16px;
		}
		.stat .num {
			font-size: 36px;
		}
	}

	.section-head {
		display: flex;
		gap: 12px;
		align-items: baseline;
		margin-bottom: 32px;
		border-bottom: 0.5px solid var(--ns-border-lo);
		padding-bottom: 12px;
	}

	.section-num {
		color: var(--ns-mint);
		font-size: 11px;
	}

	h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 500;
		color: var(--ns-text-hi);
	}

	.prose p {
		margin: 0 0 14px;
		color: var(--ns-text-hi);
		max-width: 62ch;
	}

	.prose .currently {
		color: var(--ns-text-mid);
	}
	.prose .currently span {
		color: var(--ns-mint);
	}

	.work-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}

	@media (max-width: 640px) {
		.work-grid {
			grid-template-columns: 1fr;
		}
	}

	.accolade {
		color: var(--ns-text-hi);
	}

	.side p a,
	.footer p a {
		color: var(--ns-mint);
		text-decoration: underline;
		text-decoration-thickness: 0.5px;
		text-underline-offset: 3px;
	}
	.contact a {
		color: var(--ns-mint);
	}
	.contact a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.side a:focus-visible,
	.contact a:focus-visible,
	.footer a:focus-visible {
		outline: 2px solid var(--ns-mint);
		outline-offset: 2px;
		border-radius: var(--ns-radius-sm);
	}

	.contact-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0;
	}
	.contact-list .row {
		display: grid;
		grid-template-columns: 110px 1fr;
		gap: 16px;
	}
	.contact-list dt {
		color: var(--ns-text-lo);
	}
	.contact-list dd {
		margin: 0;
	}

	.footer {
		max-width: 760px;
		margin: 0 auto;
		padding: 48px 24px 80px;
		border-top: 0.5px solid var(--ns-border-lo);
		font-size: 10px;
		color: var(--ns-text-lo);
	}
	.footer p {
		margin: 4px 0;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
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
		.section {
			padding: 72px 18px;
		}
		.contact-list .row {
			grid-template-columns: 70px 1fr;
			gap: 10px;
		}
	}
</style>
