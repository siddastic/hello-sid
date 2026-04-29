export type Compactness = 'full' | 'compact' | 'minimal';

export interface Role {
	title: string;
	type: 'full-time' | 'part-time' | 'internship';
	dates: string;
	location?: string;
	bullets: string[];
}

export interface ExperienceNode {
	kind: 'job' | 'education';
	company: string;
	location?: string;
	compact: Compactness;
	roles: Role[];
	degree?: string;
}

// From INVENTORY.md §6 — order: most recent first.
export const experience: ExperienceNode[] = [
	{
		kind: 'job',
		company: 'RideSense',
		location: 'Bengaluru, Karnataka, India · hybrid',
		compact: 'full',
		roles: [
			{
				title: 'Scrum Master',
				type: 'full-time',
				dates: 'Mar 2026 — present',
				location: 'remote',
				bullets: [
					'Run standup, deadlines, and outcomes for the team.',
					'Drive task unblocking and dependency management across engineering.',
					'Champion AI-tooling adoption to compress the repetitive parts of the work.'
				]
			},
			{
				title: 'Software Engineer',
				type: 'full-time',
				dates: 'Feb 2025 — present',
				location: 'Bengaluru / hybrid',
				bullets: [
					'Sole mobile engineer on the RideSense app (Flutter / Dart) — built personalised route planning, group ride coordination, live location sharing, and ride memories end-to-end on iOS and Android.',
					"Integrated the team's internal GraphHopper fork as the in-app routing engine."
				]
			},
			{
				title: 'Flutter Intern',
				type: 'internship',
				dates: 'Dec 2024 — Jan 2025',
				location: 'remote',
				bullets: [
					'Joined as a Flutter intern; converted to full-time Software Engineer at the end of the internship.'
				]
			}
		]
	},
	{
		kind: 'job',
		company: 'Camp Yellow',
		location: 'Bengaluru',
		compact: 'compact',
		roles: [
			{
				title: 'Flutter Developer',
				type: 'internship',
				dates: 'Jun 2022 — Aug 2022',
				bullets: []
			}
		]
	},
	{
		kind: 'job',
		company: 'Zesturo',
		compact: 'compact',
		roles: [
			{
				title: 'Software Engineer',
				type: 'part-time',
				dates: 'Apr 2022 — Jul 2022',
				bullets: []
			}
		]
	},
	{
		kind: 'job',
		company: 'Foster Reads',
		compact: 'compact',
		roles: [
			{
				title: 'Flutter Developer',
				type: 'internship',
				dates: 'Jan 2022 — Mar 2022',
				bullets: []
			}
		]
	},
	{
		kind: 'job',
		company: 'Khaana Paani',
		location: 'Dehradun, Uttarakhand, India',
		compact: 'minimal',
		roles: [
			{
				title: 'Software Engineer',
				type: 'full-time',
				dates: 'Jan 2021 — Dec 2021',
				bullets: []
			}
		]
	},
	{
		kind: 'education',
		company: 'UPES (University of Petroleum and Energy Studies)',
		location: 'Dehradun',
		compact: 'minimal',
		degree: 'B.Tech, Computer Science',
		roles: [
			{
				title: 'B.Tech, Computer Science',
				type: 'full-time',
				dates: '2020 — 2024',
				bullets: []
			}
		]
	}
];
