import { error } from '@sveltejs/kit';
import { getProject, projects } from '$lib/data/projects';
import type { PageLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => projects.map((p) => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
	const project = getProject(params.slug);
	if (!project) error(404, `Unknown project: ${params.slug}`);
	return { project };
};
