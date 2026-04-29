// Dithered noise field with an optional mask baked into the dither itself.
// See BUILD_BRIEF.md §8.1.

precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uMask;
uniform vec3 uBgDark;
uniform vec3 uBgLight;
uniform vec3 uFgAccent;
// Foreground "white" tone for prefix/suffix text in the multi-tone mask.
uniform vec3 uTextHi;
uniform float uReducedMotion;
uniform float uPixelScale;
// Mask is a tall texture stacking N slots. Each slot's R channel marks
// the noun (rendered in mint), G channel marks prefix/suffix text
// (rendered in text-hi white). uPhase slides slots vertically.
uniform float uPhase;
uniform float uPhaseCount;

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
	float t = uTime * (1.0 - uReducedMotion);

	// Mouse-driven flow bend.
	vec2 toM = uv - uMouse;
	float md = length(toM * vec2(aspect, 1.0));
	float push = exp(-md * md * 4.0) * 0.06 * (1.0 - uReducedMotion);
	vec2 nUv = uv;
	if (md > 0.001) nUv -= normalize(toM) * push;

	// Mask is multi-channel: R = noun (mint), G = prefix/suffix (text-hi).
	// Stacks uPhaseCount slots vertically (slot 0 at top of canvas). As
	// uPhase increases the visible slot slides UP and the next slides IN
	// from the bottom — matches the natural "page scroll" feel.
	float n = max(uPhaseCount, 1.0);
	float maskV = (n - 1.0 - uPhase + uv.y) / n;
	vec2 maskRG = texture2D(uMask, vec2(uv.x, maskV)).rg;
	float nounMask = maskRG.r;
	float fgMask = maskRG.g;
	// Combined mask drives the dither density (used for cell sizing below).
	float mask = max(nounMask, fgMask);

	// Two flow fields, scaled by aspect so noise looks square.
	vec2 sp = nUv * vec2(aspect, 1.0);
	float vBg = fbm(sp * 3.0 + vec2(t * 0.05, -t * 0.04));
	float vFg = fbm(sp * 4.5 + vec2(-t * 0.08, t * 0.06)) + 0.10;
	float v = mix(vBg, vFg, mask);

	// Variable-cell dither — finer cells inside letterforms.
	float pxSize = mix(2.5, 1.6, mask) * uPixelScale;
	int px = int(mod(gl_FragCoord.x / pxSize, 4.0));
	int py = int(mod(gl_FragCoord.y / pxSize, 4.0));
	float thr = bayer4(px, py);
	float dith = step(thr, v);

	// Tritone composition. Default = slate. Layer in white for fg text,
	// then mint for the noun (noun wins where both overlap).
	vec3 lightTone = uBgLight;
	lightTone = mix(lightTone, uTextHi, fgMask);
	lightTone = mix(lightTone, uFgAccent, nounMask);
	vec3 col = mix(uBgDark, lightTone, dith);

	gl_FragColor = vec4(col, 1.0);
}
