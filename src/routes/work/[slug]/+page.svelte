<script lang="ts">
	import ProjectDetailPage from '$lib/components/ProjectDetailPage.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<ProjectDetailPage project={data.project} />
