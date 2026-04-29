<script lang="ts">
	import { onMount } from 'svelte';
	import { reducedMotion } from '$lib/stores/reducedMotion';
	import { get } from 'svelte/store';

	interface Props {
		value: number;
		/** Format the in-flight numeric value. Default: rounded integer. */
		format?: (n: number) => string;
		/** Suffix appended only after the count-up completes (e.g. "+"). */
		suffix?: string;
		duration?: number;
		/** Sleep this long after the element enters viewport before starting. */
		delay?: number;
	}

	let {
		value,
		format = (n: number) => String(Math.round(n)),
		suffix = '',
		duration = 1400,
		delay = 0
	}: Props = $props();

	let displayed = $state(0);
	let settled = $state(false);
	let el: HTMLSpanElement | undefined = $state();

	onMount(() => {
		if (!el) return;
		if (get(reducedMotion)) {
			displayed = value;
			settled = true;
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				io.unobserve(entry.target);
				const start = () => {
					const t0 = performance.now();
					const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
					const tick = () => {
						const t = Math.min(1, (performance.now() - t0) / duration);
						displayed = value * easeOut(t);
						if (t < 1) {
							requestAnimationFrame(tick);
						} else {
							displayed = value;
							settled = true;
						}
					};
					requestAnimationFrame(tick);
				};
				if (delay > 0) setTimeout(start, delay);
				else start();
			},
			{ threshold: 0.2 }
		);
		io.observe(el);
		return () => io.disconnect();
	});
</script>

<span bind:this={el} aria-label={`${format(value)}${suffix}`}>
	<span aria-hidden="true">{format(displayed)}{settled ? suffix : ''}</span>
</span>
