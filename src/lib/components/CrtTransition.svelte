<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { beforeNavigate, afterNavigate, goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { reducedMotion } from '$lib/stores/reducedMotion';
	import type * as THREE_TYPES from 'three';

	type Phase = 'idle' | 'powering-off' | 'black' | 'powering-on';

	let phase = $state<Phase>('idle');
	let canvas: HTMLCanvasElement | undefined = $state();
	let inflightTarget: string | null = null;

	// Manual scroll snapshots — keyed by pathname. SvelteKit's automatic
	// scroll restoration loses its grip when we cancel() + goto(), so we save
	// the current scroll position for every navigation away and restore it
	// on popstate.
	const scrollPositions = new Map<string, number>();

	type RenderState = {
		setSize(): void;
		setPhase(value: number): void;
		setReducedMotion(rm: number): void;
		dispose(): void;
	};
	let rstate: RenderState | null = null;

	function ease(x: number) {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	}

	function animatePhase(from: number, to: number, duration: number) {
		return new Promise<void>((resolve) => {
			if (!rstate) return resolve();
			const start = performance.now();
			const step = () => {
				const t = Math.min(1, (performance.now() - start) / duration);
				rstate?.setPhase(from + (to - from) * ease(t));
				if (t < 1) requestAnimationFrame(step);
				else resolve();
			};
			step();
		});
	}

	beforeNavigate(({ to, cancel, type }) => {
		// Save outgoing scroll for every nav, regardless of whether we
		// intercept it. Only path-changing navs need this.
		if (to && to.url.pathname !== window.location.pathname) {
			scrollPositions.set(window.location.pathname, window.scrollY);
		}

		if (type !== 'link') return;
		if (phase !== 'idle') return;
		if (!to) return;

		const fromUrl = new URL(window.location.href);
		if (
			to.url.pathname === fromUrl.pathname &&
			to.url.search === fromUrl.search &&
			to.url.hash !== fromUrl.hash
		) {
			return;
		}

		if (get(reducedMotion)) return;
		if (!rstate) return; // Three.js still loading; let nav happen normally.

		cancel();
		inflightTarget = to.url.pathname + to.url.search + to.url.hash;
		runTransition(inflightTarget);
	});

	afterNavigate(({ type, to }) => {
		// Restore scroll on browser back/forward. New 'link' navs scroll
		// themselves inside runTransition.
		if (type === 'popstate' && to) {
			const saved = scrollPositions.get(to.url.pathname);
			if (saved !== undefined && saved > 0) {
				// Run twice: once now (catches SvelteKit's default-to-top),
				// once after a tick (catches Lenis's internal sync). Without
				// the second pass, Lenis sometimes snaps back to ~0 a frame
				// after the popstate.
				const apply = () => {
					window.scrollTo({ top: saved, behavior: 'instant' });
					const lenis = (window as unknown as {
						__lenis?: { scrollTo: (y: number, o?: { immediate?: boolean }) => void };
					}).__lenis;
					lenis?.scrollTo(saved, { immediate: true });
				};
				apply();
				requestAnimationFrame(apply);
				setTimeout(apply, 50);
			}
		}

		if (get(reducedMotion)) {
			phase = 'powering-on';
			setTimeout(() => {
				phase = 'idle';
			}, 200);
		}
	});

	async function runTransition(target: string) {
		if (!rstate) return;
		phase = 'powering-off';
		document.documentElement.classList.add('crt-transitioning');
		await animatePhase(0, 1, 360);
		phase = 'black';
		await new Promise((r) => setTimeout(r, 60));

		// noScroll keeps SvelteKit's default scroll-to-top out of our way —
		// we manage forward scroll ourselves below, and the manual scroll
		// position Map handles back-nav restoration.
		await goto(target, { noScroll: true });
		await tick();
		const url = new URL(target, window.location.href);
		if (url.hash) {
			document.querySelector(url.hash)?.scrollIntoView({ behavior: 'instant', block: 'start' });
		} else {
			window.scrollTo({ top: 0, behavior: 'instant' });
		}

		phase = 'powering-on';
		await animatePhase(1, 0, 360);
		phase = 'idle';
		document.documentElement.classList.remove('crt-transitioning');
		inflightTarget = null;
	}

	onMount(() => {
		if (!canvas) return;
		let cancelled = false;

		// Lazy-load Three + the transition shader. Until the chunk arrives,
		// links navigate via SvelteKit's default behaviour (no transition).
		(async () => {
			const [THREE, { default: vert }, { default: frag }, { NS_OBSIDIAN, NS_MINT }] =
				await Promise.all([
					import('three'),
					import('$lib/shaders/dither.vert.glsl?raw'),
					import('$lib/shaders/transition.frag.glsl?raw'),
					import('$lib/three/DitherMaterial')
				]);

			if (cancelled || !canvas) return;

			const renderer = new THREE.WebGLRenderer({
				canvas,
				alpha: true,
				antialias: false,
				premultipliedAlpha: true,
				powerPreference: 'high-performance'
			});
			renderer.setClearColor(0x000000, 0);
			const scene = new THREE.Scene();
			const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

			const material = new THREE.ShaderMaterial({
				vertexShader: vert,
				fragmentShader: frag,
				uniforms: {
					uRes: { value: new THREE.Vector2(1, 1) },
					uTime: { value: 0 },
					uPhase: { value: 0 },
					uBgDark: { value: NS_OBSIDIAN.clone() },
					uFgAccent: { value: NS_MINT.clone() },
					uReducedMotion: { value: 0 }
				},
				transparent: true,
				depthTest: false,
				depthWrite: false
			});
			const geom = new THREE.PlaneGeometry(2, 2);
			const quad = new THREE.Mesh(geom, material);
			scene.add(quad);

			const setSize = () => {
				const dpr = Math.min(window.devicePixelRatio, 2);
				const w = window.innerWidth;
				const h = window.innerHeight;
				renderer.setPixelRatio(dpr);
				renderer.setSize(w, h, false);
				(material.uniforms.uRes.value as THREE_TYPES.Vector2).set(w * dpr, h * dpr);
			};
			setSize();
			const onResize = () => setSize();
			window.addEventListener('resize', onResize);

			let rmFlag = 0;
			const unsubRM = reducedMotion.subscribe((v) => {
				rmFlag = v ? 1 : 0;
				material.uniforms.uReducedMotion.value = rmFlag;
			});

			const t0 = performance.now();
			let raf = 0;
			const renderTick = () => {
				raf = requestAnimationFrame(renderTick);
				if (phase === 'idle') return; // skip RAF when not transitioning
				material.uniforms.uTime.value = (performance.now() - t0) / 1000;
				renderer.render(scene, camera);
			};
			renderTick();

			rstate = {
				setSize,
				setPhase: (value) => {
					material.uniforms.uPhase.value = value;
				},
				setReducedMotion: (rm) => {
					material.uniforms.uReducedMotion.value = rm;
				},
				dispose: () => {
					cancelAnimationFrame(raf);
					window.removeEventListener('resize', onResize);
					unsubRM();
					geom.dispose();
					material.dispose();
					renderer.dispose();
				}
			};
		})();

		return () => {
			cancelled = true;
			rstate?.dispose();
			rstate = null;
		};
	});
</script>

<div
	class="crt-overlay"
	class:active={phase !== 'idle'}
	class:reduced={$reducedMotion}
	aria-hidden="true"
>
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.crt-overlay {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 60;
		opacity: 0;
		transition: opacity 200ms ease;
	}

	.crt-overlay.active {
		opacity: 1;
	}

	.crt-overlay.reduced canvas {
		display: none;
	}
	.crt-overlay.reduced.active {
		background: var(--ns-obsidian);
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	:global(html.crt-transitioning) {
		overflow: hidden;
	}
	:global(html.crt-transitioning body) {
		filter: brightness(0.92) saturate(0.85);
		transition: filter 180ms ease;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html.crt-transitioning body) {
			filter: none;
			transition: none;
		}
	}
</style>
