// CRT power-off/power-on dither wipe. See BUILD_BRIEF.md §8.2.
// Same FBM + Bayer + tritone as dither.frag.glsl, but uPhase drives a
// directional wipe across the screen, "developing" black -> dither -> alpha.

precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uPhase;       // 0 → 1 across the transition
uniform vec3 uBgDark;
uniform vec3 uFgAccent;
uniform float uReducedMotion;

varying vec2 vUv;

float n(vec2 p) {
	return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float sn(vec2 p) {
	vec2 i = floor(p), f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(n(i), n(i + vec2(1.0, 0.0)), f.x),
		mix(n(i + vec2(0.0, 1.0)), n(i + vec2(1.0, 1.0)), f.x),
		f.y
	);
}

float fbm(vec2 p) {
	float v = 0.0;
	float a = 0.5;
	for (int i = 0; i < 5; i++) {
		v += a * sn(p);
		p *= 2.0;
		a *= 0.5;
	}
	return v;
}

float bayer4(int x, int y) {
	int idx = x + y * 4;
	if (idx == 0)  return 0.0625;
	if (idx == 1)  return 0.5625;
	if (idx == 2)  return 0.1875;
	if (idx == 3)  return 0.6875;
	if (idx == 4)  return 0.8125;
	if (idx == 5)  return 0.3125;
	if (idx == 6)  return 0.9375;
	if (idx == 7)  return 0.4375;
	if (idx == 8)  return 0.2500;
	if (idx == 9)  return 0.7500;
	if (idx == 10) return 0.1250;
	if (idx == 11) return 0.6250;
	if (idx == 12) return 1.0000;
	if (idx == 13) return 0.5000;
	if (idx == 14) return 0.8750;
	return 0.3750;
}

void main() {
	vec2 uv = vUv;
	float aspect = uRes.x / uRes.y;
	float t = uTime;

	// Soft-edge directional wipe with FBM noise edge.
	float wipe = uv.x + 0.1 * sn(uv * vec2(8.0, 4.0)) - 0.05;
	float devel = smoothstep(uPhase * 1.2 - 0.18, uPhase * 1.2 + 0.04, wipe);

	// Where devel > 0.5 the cell hasn't been covered yet (transparent).
	// Where devel < 0.5 it's currently being painted with dither.
	// Where devel ~ 0 it's fully black.

	// Dither pattern (active in the "developing" band).
	vec2 sp = uv * vec2(aspect, 1.0);
	float v = fbm(sp * 4.0 + vec2(t * 0.1, -t * 0.07));
	int px = int(mod(gl_FragCoord.x / 2.0, 4.0));
	int py = int(mod(gl_FragCoord.y / 2.0, 4.0));
	float thr = bayer4(px, py);
	float dith = step(thr, v);

	// Tritone: dark, accent. Within the developing band the dither shows
	// the accent against the obsidian bg.
	vec3 col = mix(uBgDark, uFgAccent * 0.65, dith);

	// Scanlines (subtle).
	float scan = 0.06 * sin(gl_FragCoord.y * 1.5);
	col -= scan * (1.0 - uReducedMotion);

	// Alpha: 1 where covered, 0 where not yet.
	float covered = 1.0 - smoothstep(0.45, 0.55, devel);

	gl_FragColor = vec4(col, covered);
}
