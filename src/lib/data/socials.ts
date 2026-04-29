export interface Social {
	label: string;
	display: string;
	url: string;
	primary: boolean;
}

// From INVENTORY.md §10.
export const socials: Social[] = [
	{
		label: 'github',
		display: 'github.com/siddastic',
		url: 'https://github.com/siddastic',
		primary: true
	},
	{
		label: 'linkedin',
		display: 'linkedin.com/in/siddastic',
		url: 'https://www.linkedin.com/in/siddastic',
		primary: true
	},
	{
		label: 'email',
		display: 'sid5173@proton.me',
		url: 'mailto:sid5173@proton.me',
		primary: true
	}
];
