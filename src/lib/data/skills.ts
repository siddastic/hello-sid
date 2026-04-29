export type Bucket = 'daily' | 'comfortable' | 'shipped with' | 'learning' | 'observing';

export interface SkillRow {
	name: string;
	bucket: Bucket;
	context?: string;
}

export interface SkillGroup {
	name: string;
	rows: SkillRow[];
}

// From INVENTORY.md §8.
export const skillGroups: SkillGroup[] = [
	{
		name: 'mobile',
		rows: [
			{ name: 'Flutter', bucket: 'daily' },
			{ name: 'Dart', bucket: 'daily' },
			{ name: 'Kotlin', bucket: 'daily' },
			{ name: 'Native Android', bucket: 'shipped with' }
		]
	},
	{
		name: 'frontend',
		rows: [
			{ name: 'TypeScript', bucket: 'daily' },
			{ name: 'JavaScript', bucket: 'daily' },
			{ name: 'React', bucket: 'comfortable' },
			{ name: 'Svelte', bucket: 'comfortable' },
			{ name: 'HTML', bucket: 'comfortable' },
			{ name: 'CSS', bucket: 'comfortable' },
			{
				name: 'custom frameworks',
				bucket: 'shipped with',
				context: 'WireGraph runtime, Ivy'
			}
		]
	},
	{
		name: 'backend',
		rows: [
			{ name: 'Node.js', bucket: 'comfortable' },
			{ name: 'Express', bucket: 'comfortable' },
			{ name: 'MongoDB', bucket: 'comfortable' },
			{ name: 'Firebase', bucket: 'comfortable' },
			{ name: 'PostgreSQL', bucket: 'comfortable' },
			{ name: 'Java', bucket: 'shipped with' },
			{ name: 'Typesense', bucket: 'shipped with' }
		]
	},
	{
		name: '3D / graphics / games',
		rows: [
			{ name: 'C#', bucket: 'daily' },
			{ name: 'Unity 3D', bucket: 'daily' },
			{ name: 'Canvas API', bucket: 'comfortable' },
			{
				name: 'custom TS engines',
				bucket: 'comfortable',
				context: 'Smurf-Engine'
			},
			{
				name: 'Three.js / Threlte',
				bucket: 'shipped with',
				context: 'this portfolio'
			},
			{ name: 'GLSL', bucket: 'shipped with', context: 'this portfolio' }
		]
	},
	{
		name: 'systems',
		rows: [
			{ name: 'C++', bucket: 'shipped with' },
			{ name: 'Rust', bucket: 'learning' }
		]
	},
	{
		name: 'tooling',
		rows: [
			{ name: 'Git', bucket: 'daily' },
			{ name: 'Android Studio', bucket: 'daily' },
			{
				name: 'JetBrains stack',
				bucket: 'daily',
				context: 'WebStorm, Rider'
			},
			{
				name: 'AI landscape',
				bucket: 'observing',
				context: 'pairs with championing AI-tool adoption at RideSense'
			}
		]
	}
];
