import * as THREE from 'three';
import vert from '$lib/shaders/dither.vert.glsl?raw';
import frag from '$lib/shaders/dither.frag.glsl?raw';

export interface DitherUniforms {
	uRes: THREE.IUniform<THREE.Vector2>;
	uTime: THREE.IUniform<number>;
	uMouse: THREE.IUniform<THREE.Vector2>;
	uMask: THREE.IUniform<THREE.Texture | null>;
	uBgDark: THREE.IUniform<THREE.Vector3>;
	uBgLight: THREE.IUniform<THREE.Vector3>;
	uFgAccent: THREE.IUniform<THREE.Vector3>;
	uTextHi: THREE.IUniform<THREE.Vector3>;
	uReducedMotion: THREE.IUniform<number>;
	uPixelScale: THREE.IUniform<number>;
	uPhase: THREE.IUniform<number>;
	uPhaseCount: THREE.IUniform<number>;
}

export const NS_OBSIDIAN = new THREE.Vector3(0.018, 0.025, 0.035);
export const NS_SLATE = new THREE.Vector3(0.3, 0.42, 0.36);
export const NS_MINT = new THREE.Vector3(0.35, 0.94, 0.66);
// Roughly text-hi (rgba(220,240,230,0.95)) — the "white" foreground used
// for prefix/suffix text inside the dither.
export const NS_TEXT_HI = new THREE.Vector3(0.86, 0.94, 0.9);

export function createDitherMaterial(initial?: Partial<{
	accent: THREE.Vector3;
	bgDark: THREE.Vector3;
	bgLight: THREE.Vector3;
}>): THREE.ShaderMaterial {
	const uniforms = {
		uRes: { value: new THREE.Vector2(1, 1) },
		uTime: { value: 0 },
		uMouse: { value: new THREE.Vector2(0.5, 0.5) },
		uMask: { value: null as THREE.Texture | null },
		uBgDark: { value: initial?.bgDark?.clone() ?? NS_OBSIDIAN.clone() },
		uBgLight: { value: initial?.bgLight?.clone() ?? NS_SLATE.clone() },
		uFgAccent: { value: initial?.accent?.clone() ?? NS_MINT.clone() },
		uTextHi: { value: NS_TEXT_HI.clone() },
		uReducedMotion: { value: 0 },
		uPixelScale: { value: 1 },
		uPhase: { value: 0 },
		uPhaseCount: { value: 1 }
	};

	return new THREE.ShaderMaterial({
		vertexShader: vert,
		fragmentShader: frag,
		uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
		depthTest: false,
		depthWrite: false,
		transparent: false
	});
}
