<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Sid — {page.status === 404 ? '404 not found' : 'error'}</title>
</svelte:head>

<main class="err">
	<div class="head">
		<span class="num">/{page.status}</span>
		<h1>{page.status === 404 ? 'route not found' : 'something broke'}</h1>
	</div>
	<p class="msg">{page.error?.message ?? 'unknown error'}</p>
	<a class="back" href="/">← back home</a>
</main>

<style>
	.err {
		max-width: 760px;
		margin: 0 auto;
		padding: 96px 24px 120px;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 16px;
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.num {
		color: var(--ns-mint);
		font-size: 11px;
	}

	h1 {
		margin: 0;
		font-size: 22px;
		font-weight: 500;
		color: var(--ns-text-hi);
	}

	.msg {
		margin: 0;
		color: var(--ns-text-mid);
	}

	.back {
		font-size: 12px;
		color: var(--ns-mint);
		margin-top: 16px;
	}
	.back:hover,
	.back:focus-visible {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
