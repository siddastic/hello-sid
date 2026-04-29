<script lang="ts">
	import { onMount } from 'svelte';
	import { reducedMotion } from '$lib/stores/reducedMotion';
	import type * as THREE_TYPES from 'three';

	interface PhraseInput {
		prefix?: string;
		noun: string;
		suffix?: string;
	}

	interface Props {
		/** Multi-tone phrase slots. Each phrase paints its noun in mint and
		 * its prefix/suffix in white inside the dither. */
		phrases?: PhraseInput[];
		/** Single-slot string for legacy uses (project cards). Drawn as a
		 * mint noun only. */
		mask?: string;
		/** Float scroll position 0..N-1 — slides between slots. */
		phase?: number;
		accent?: [number, number, number];
		staticMode?: boolean;
		pixelScale?: number;
		ariaLabel?: string;
	}

	let {
		phrases,
		mask,
		phase = 0,
		accent,
		staticMode = false,
		pixelScale = 1,
		ariaLabel: _ariaLabel = 'Dithered surface'
	}: Props = $props();

	const phraseList = $derived.by<PhraseInput[]>(() => {
		if (Array.isArray(phrases) && phrases.length > 0) return phrases;
		if (typeof mask === 'string') return [{ noun: mask }];
		return [{ noun: '' }];
	});

	let canvas: HTMLCanvasElement | undefined = $state();

	type RuntimeRefs = {
		THREE: typeof THREE_TYPES;
		material: THREE_TYPES.ShaderMaterial;
		rebuildMask: () => void;
	};
	let runtime = $state<RuntimeRefs | null>(null);

	// React to word/accent/phase changes — rebuild the mask texture only
	// when the word list changes; phase is just a uniform set per frame.
	$effect(() => {
		if (!runtime) return;
		void phraseList;
		runtime.rebuildMask();
		if (accent) runtime.material.uniforms.uFgAccent.value.set(...accent);
	});

	$effect(() => {
		if (!runtime) return;
		runtime.material.uniforms.uPhase.value = phase;
	});

	onMount(() => {
		if (!canvas) return;
		let cleanup: (() => void) | null = null;
		let cancelled = false;

		(async () => {
			const [THREE, { createDitherMaterial }, { buildMaskTexture }] = await Promise.all([
				import('three'),
				import('$lib/three/DitherMaterial'),
				import('$lib/shaders/buildMaskTexture')
			]);

			if (cancelled || !canvas) return;

			const renderer = new THREE.WebGLRenderer({
				canvas,
				antialias: false,
				powerPreference: 'high-performance',
				alpha: false
			});
			renderer.setClearColor(0x050608, 1);

			const scene = new THREE.Scene();
			const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

			const material = createDitherMaterial({
				accent: accent ? new THREE.Vector3(...accent) : undefined
			});
			material.uniforms.uPixelScale.value = pixelScale;
			material.uniforms.uPhase.value = phase;
			material.uniforms.uPhaseCount.value = phraseList.length;

			const geom = new THREE.PlaneGeometry(2, 2);
			const quad = new THREE.Mesh(geom, material);
			scene.add(quad);

			const parent = canvas.parentElement!;
			let maskTex: THREE_TYPES.CanvasTexture | null = null;
			let lastW = 0;
			let lastH = 0;

			const rebuildMask = () => {
				const dpr = Math.min(window.devicePixelRatio, 2);
				const w = lastW || 1;
				const h = lastH || 1;
				maskTex?.dispose();
				maskTex = buildMaskTexture({ phrases: phraseList, width: w, height: h, dpr });
				material.uniforms.uMask.value = maskTex;
				material.uniforms.uPhaseCount.value = phraseList.length;
			};

			const setSize = () => {
				const dpr = Math.min(window.devicePixelRatio, 2);
				const rect = parent.getBoundingClientRect();
				const w = Math.max(1, rect.width);
				const h = Math.max(1, rect.height);
				renderer.setPixelRatio(dpr);
				renderer.setSize(w, h, false);
				material.uniforms.uRes.value.set(w * dpr, h * dpr);
				lastW = w;
				lastH = h;
				rebuildMask();
			};
			setSize();

			const onResize = () => setSize();
			window.addEventListener('resize', onResize);

			const mouseTarget = new THREE.Vector2(0.5, 0.5);
			const mouseSmooth = new THREE.Vector2(0.5, 0.5);
			const onMouse = (e: PointerEvent) => {
				if (staticMode) return;
				const rect = parent.getBoundingClientRect();
				mouseTarget.set(
					(e.clientX - rect.left) / rect.width,
					1 - (e.clientY - rect.top) / rect.height
				);
			};
			parent.addEventListener('pointermove', onMouse);

			let rmFlag = 0;
			const unsubRM = reducedMotion.subscribe((v) => (rmFlag = v ? 1 : 0));

			const t0 = performance.now();
			let raf = 0;
			let visible = true;

			const io = new IntersectionObserver(
				([entry]) => {
					visible = entry.isIntersecting;
				},
				{ threshold: 0 }
			);
			io.observe(canvas);

			const tick = () => {
				raf = requestAnimationFrame(tick);
				if (!visible) return;
				const t = (performance.now() - t0) / 1000;
				material.uniforms.uTime.value = t;
				material.uniforms.uReducedMotion.value = rmFlag;
				mouseSmooth.lerp(mouseTarget, 0.08);
				material.uniforms.uMouse.value.copy(mouseSmooth);
				renderer.render(scene, camera);
			};
			tick();

			runtime = { THREE, material, rebuildMask };

			cleanup = () => {
				cancelAnimationFrame(raf);
				window.removeEventListener('resize', onResize);
				parent.removeEventListener('pointermove', onMouse);
				io.disconnect();
				unsubRM();
				geom.dispose();
				material.dispose();
				maskTex?.dispose();
				renderer.dispose();
				runtime = null;
			};
		})();

		return () => {
			cancelled = true;
			cleanup?.();
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		background: var(--ns-obsidian);
	}
</style>
