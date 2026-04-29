<script lang="ts">
	import { skillGroups } from '$lib/data/skills';
</script>

<div class="skills">
	{#each skillGroups as group (group.name)}
		<div class="group">
			<h3 id={`skills-${group.name.replace(/[^a-z0-9]/g, '-')}`} data-scramble>{group.name}</h3>
			<table aria-labelledby={`skills-${group.name.replace(/[^a-z0-9]/g, '-')}`}>
				<thead class="visually-hidden">
					<tr>
						<th scope="col">skill</th>
						<th scope="col">bucket</th>
						<th scope="col">context</th>
					</tr>
				</thead>
				<tbody>
					{#each group.rows as row (row.name)}
						<tr>
							<td class="skill">{row.name}</td>
							<td class="bucket">{row.bucket}</td>
							<td class="context">{row.context ?? ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/each}
</div>

<style>
	.skills {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 28px 36px;
	}

	.group h3 {
		margin: 0 0 8px;
		font-size: 13px;
		font-weight: 500;
		color: var(--ns-mint);
		letter-spacing: 0.02em;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 12px;
	}

	td {
		padding: 4px 8px 4px 0;
		vertical-align: top;
		border-bottom: 0.5px dashed var(--ns-border-lo);
	}

	tr:last-child td {
		border-bottom: none;
	}

	.skill {
		color: var(--ns-text-hi);
		width: 35%;
	}

	.bucket {
		color: var(--ns-text-mid);
		width: 28%;
		font-style: italic;
	}

	.context {
		color: var(--ns-text-lo);
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

	@media (max-width: 640px) {
		.skills {
			grid-template-columns: 1fr;
			gap: 24px;
		}
		.context {
			display: none;
		}
		.skill {
			width: 55%;
		}
		.bucket {
			width: 45%;
		}
	}
</style>
