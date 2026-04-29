export interface HeroPhrase {
	/** Text rendered before the dithered noun. Reads as the start of the
	 * sentence, in muted text colour. */
	prefix: string;
	/** The noun. Only painted by the dither shader (mint, viewport-scale).
	 * In the foreground line it's an invisible spacer so the prefix/suffix
	 * wrap around the visible dither word and read as one continuous
	 * sentence. */
	noun: string;
	/** Text rendered after the dithered noun. */
	suffix: string;
	/** Final phrase only — staggered hobby line sits below the dither's
	 * "sid" word. */
	hobbies?: string[];
}

export const heroPhrases: HeroPhrase[] = [
	// Friendly opener — entire phrase scrambles in on first paint.
	{ prefix: 'Hey, I am ', noun: 'sid', suffix: '' },
	// JS IDE — 10k+ installs since 2019 at age 17. Specifics land harder than adjectives.
	{ prefix: "I've shipped ", noun: 'apps', suffix: ' since I was 17.' },
	// Smurf-Engine. "From scratch" is the brag without the brag.
	{ prefix: 'I built ', noun: 'engines', suffix: ' from scratch.' },
	// This portfolio's hero is the proof — GLSL, dither, the whole thing.
	{ prefix: 'I push ', noun: 'pixels', suffix: ' through shaders.' },
	// WireGraph + sandbox + kitchen-sink. "For fun" reads as honest, not flex.
	{ prefix: 'I make ', noun: 'runtimes', suffix: ' for fun.' },
	// Six personal frameworks. Self-aware, sets up the name reveal that follows.
	{ prefix: 'I write ', noun: 'frameworks', suffix: ' no one asked for.' },
	{
		// Finale: foreground line is just the invisible spacer (the dither
		// paints the visible "sid"). Hobbies stagger in below.
		prefix: '',
		noun: 'sid',
		suffix: '',
		hobbies: ['artist', 'engineer', 'driving', 'guitar enthusiast']
	}
];
