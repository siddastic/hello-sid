<script lang="ts">
	import { experience, type ExperienceNode, type Role } from '$lib/data/experience';

	const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

	/** Convert "Mar 2026" → 24315 (year * 12 + monthIndex). For sorting only. */
	function monthsKey(dateLabel: string): number {
		const start = dateLabel.split('—')[0].trim();
		const [mon, year] = start.split(/\s+/);
		const m = MONTHS.indexOf(mon.toLowerCase().slice(0, 3));
		const y = parseInt(year, 10);
		if (Number.isNaN(y) || m < 0) return Number.MAX_SAFE_INTEGER;
		return y * 12 + m;
	}

	/** For full-mode nodes the company-level date should span from the earliest
	 * role's start to the latest role's end — not just whatever role happens
	 * to be first in the array. */
	function companyDateLabel(node: ExperienceNode): string {
		const earliest = [...node.roles].sort(
			(a: Role, b: Role) => monthsKey(a.dates) - monthsKey(b.dates)
		)[0];
		return earliest.dates.split('—')[0].trim();
	}
</script>

<ol class="timeline">
	{#each experience as node (node.company)}
		<li class={`node ${node.compact}`}>
			{#if node.compact === 'compact' || node.compact === 'minimal'}
				<div class="dates">{node.roles[0].dates}</div>
				<div class="body">
					<header class="role-head">
						<span class="role-title">{node.roles[0].title}</span>
						<span class="company">@ {node.company}</span>
					</header>
					{#if node.location}
						<p class="loc">{node.location}</p>
					{/if}
				</div>
			{:else}
				<div class="dates">{companyDateLabel(node)} —</div>
				<div class="body">
					<header class="company-head">
						<span class="company-name">{node.company}</span>
						{#if node.location}
							<span class="loc">{node.location}</span>
						{/if}
					</header>
					{#each node.roles as role (role.title + role.dates)}
						<div class="role">
							<header class="role-head">
								<span class="role-title">{role.title}</span>
								<span class="role-meta">
									<span class="role-type">{role.type}</span>
									<span class="role-dates">{role.dates}</span>
									{#if role.location}<span class="role-loc">{role.location}</span>{/if}
								</span>
							</header>
							{#if role.bullets.length}
								<ul class="bullets">
									{#each role.bullets as b (b)}
										<li>{b}</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		position: relative;
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: 110px;
		top: 0;
		bottom: 0;
		width: 0.5px;
		background: linear-gradient(
			180deg,
			transparent 0%,
			var(--ns-border-lo) 8%,
			rgba(90, 240, 168, 0.18) 50%,
			var(--ns-border-lo) 92%,
			transparent 100%
		);
		pointer-events: none;
	}

	.node {
		display: grid;
		grid-template-columns: 110px 1fr;
		gap: 24px;
		padding: 18px 0;
		position: relative;
	}

	.node::before {
		content: '';
		position: absolute;
		left: 106px;
		top: 26px;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--ns-mint);
		box-shadow: 0 0 8px var(--ns-mint-glow);
	}

	.dates {
		font-size: 11px;
		color: var(--ns-text-mid);
		padding-top: 22px;
	}

	.body {
		min-width: 0;
	}

	.company-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 14px;
		padding-top: 18px;
	}

	.company-name {
		font-size: 14px;
		font-weight: 500;
		color: var(--ns-text-hi);
	}

	.loc {
		font-size: 10px;
		color: var(--ns-text-lo);
		margin: 0;
	}

	.role {
		margin-top: 14px;
	}
	.role:first-child {
		margin-top: 0;
	}

	.role-head {
		display: flex;
		flex-direction: column;
		gap: 3px;
		margin-bottom: 6px;
	}

	.role-title {
		font-size: 12px;
		font-weight: 500;
		color: var(--ns-mint);
	}

	.role-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		font-size: 10px;
		color: var(--ns-text-lo);
	}

	.role-type {
		font-style: italic;
	}

	.bullets {
		list-style: none;
		margin: 6px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.bullets li {
		font-size: 11px;
		color: var(--ns-text-mid);
		line-height: 1.55;
		padding-left: 14px;
		position: relative;
	}
	.bullets li::before {
		content: '·';
		position: absolute;
		left: 4px;
		color: var(--ns-mint);
	}

	/* compact / minimal nodes (internships, education) */
	.node.compact .role-head,
	.node.minimal .role-head {
		flex-direction: row;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px;
		padding-top: 22px;
		margin-bottom: 0;
	}
	.node.compact .role-title,
	.node.minimal .role-title {
		color: var(--ns-text-hi);
	}
	.node.compact .company,
	.node.minimal .company {
		font-size: 11px;
		color: var(--ns-text-mid);
	}
	.node.compact .loc,
	.node.minimal .loc {
		padding-left: 0;
	}

	@media (max-width: 540px) {
		.timeline::before {
			left: 8px;
		}
		.node {
			grid-template-columns: 1fr;
			gap: 4px;
			padding: 22px 0 22px 28px;
		}
		.node::before {
			left: 4px;
			top: 26px;
		}
		.dates {
			padding-top: 0;
			color: var(--ns-mint);
		}
		.company-head,
		.node.compact .role-head,
		.node.minimal .role-head {
			padding-top: 0;
		}
	}
</style>
