import { useRef, useEffect } from 'react';
import * as THREE from 'three';

// ─── Shaders ────────────────────────────────────────────────────────

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uHover;
uniform float uClick;
uniform vec3 uColor;
varying vec2 vUv;

float hexDist(vec2 p) {
    p = abs(p);
    float c = dot(p, normalize(vec2(1.0, 1.73)));
    c = max(c, p.x);
    return c;
}

void main() {
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);

    // Circular Mask (soft edge)
    float mask = smoothstep(0.5, 0.45, dist);
    if (mask < 0.01) discard;

    // Hex Pattern
    vec2 gridUV = vUv * 10.0;
    gridUV.x += uTime * 0.5;
    gridUV.y += sin(uTime * 0.2 + gridUV.x * 0.1);

    vec2 r = vec2(1.0, 1.73);
    vec2 h = r * 0.5;
    vec2 a = mod(gridUV, r) - h;
    vec2 b = mod(gridUV - h, r) - h;
    vec2 g = dot(a, a) < dot(b, b) ? a : b;
    float hexD = 1.0 - length(g) * 2.0;
    float grid = smoothstep(0.05, 0.1, hexD);

    // Ripple
    float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.5 + 0.5;

    // Intensity
    float alpha = 0.05;
    alpha += uHover * 0.3 * grid;
    alpha += uClick * 0.6 * ripple;

    // Edge Glow
    float rim = smoothstep(0.4, 0.5, dist) * smoothstep(0.5, 0.4, dist);
    alpha += rim * (0.5 + uHover);

    // Color Tint
    vec3 color = uColor;
    color = mix(color, vec3(1.0), uClick * ripple * 0.5);

    gl_FragColor = vec4(color, alpha * mask);
}
`;

// ─── Types ──────────────────────────────────────────────────────────

interface ForceFieldTarget {
  /** Centre X in artwork-space pixels */
  cx: number;
  /** Centre Y in artwork-space pixels */
  cy: number;
  /** Width of the bounding region (the mesh is 1.5× this) */
  w: number;
  /** Height of the bounding region (the mesh is 1.5× this) */
  h: number;
  hovered: boolean;
  clicked: boolean;
  color?: string;
}

interface ForceFieldCanvasProps {
  /** Full artwork width in CSS px */
  width: number;
  /** Full artwork height in CSS px */
  height: number;
  /** Array of target objects to render force fields on */
  targets: ForceFieldTarget[];
}

/**
 * Self-contained vanilla-Three.js force-field overlay.
 * Renders onto its own transparent <canvas> — no @react-three/fiber needed.
 */
export function ForceFieldCanvas({ width, height, targets }: ForceFieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ targets, width, height });

  // Keep the latest props accessible from the rAF loop without re-creating it
  useEffect(() => {
    stateRef.current = { targets, width, height };
  }, [targets, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Orthographic camera (matches artwork pixel space) ────────
    const camera = new THREE.OrthographicCamera(0, width, 0, -height, 0.1, 1000);
    camera.position.set(0, 0, 100);
    camera.updateProjectionMatrix();

    const scene = new THREE.Scene();

    // ── Build one mesh per initial target ─────────────────────────
    interface MeshEntry {
      mesh: THREE.Mesh;
      material: THREE.ShaderMaterial;
      hoverVal: number;
      clickVal: number;
    }
    const meshEntries: MeshEntry[] = [];

    const buildMeshes = (tgts: ForceFieldTarget[]) => {
      // Remove old meshes
      meshEntries.forEach(e => {
        scene.remove(e.mesh);
        e.material.dispose();
        e.mesh.geometry.dispose();
      });
      meshEntries.length = 0;

      tgts.forEach(t => {
        const geo = new THREE.PlaneGeometry(1, 1);
        const mat = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uHover: { value: 0 },
            uClick: { value: 0 },
            uColor: { value: new THREE.Color(t.color ?? '#CE302E') },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(t.cx, -t.cy, 0);
        mesh.scale.set(t.w * 1.5, t.h * 1.5, 1);
        scene.add(mesh);
        meshEntries.push({ mesh, material: mat, hoverVal: 0, clickVal: 0 });
      });
    };

    buildMeshes(stateRef.current.targets);

    // Track target count so we can rebuild when it changes
    let prevTargetCount = stateRef.current.targets.length;

    // ── Clock ─────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    // ── Animation loop ────────────────────────────────────────────
    let rafId = 0;
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const { targets: tgts, width: w, height: h } = stateRef.current;

      // Resize renderer + camera if dimensions changed
      if (renderer.domElement.width !== Math.round(w * renderer.getPixelRatio()) ||
          renderer.domElement.height !== Math.round(h * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false);
        camera.right = w;
        camera.bottom = -h;
        camera.updateProjectionMatrix();
      }

      // Rebuild meshes if target count changed
      if (tgts.length !== prevTargetCount) {
        buildMeshes(tgts);
        prevTargetCount = tgts.length;
      }

      const elapsed = clock.getElapsedTime();

      // Update each mesh
      for (let i = 0; i < meshEntries.length && i < tgts.length; i++) {
        const entry = meshEntries[i];
        const t = tgts[i];

        // Lerp hover / click
        entry.hoverVal = THREE.MathUtils.lerp(entry.hoverVal, t.hovered ? 1 : 0, 0.1);
        entry.clickVal = THREE.MathUtils.lerp(entry.clickVal, t.clicked ? 1 : 0, 0.1);

        entry.material.uniforms.uTime.value = elapsed;
        entry.material.uniforms.uHover.value = entry.hoverVal;
        entry.material.uniforms.uClick.value = entry.clickVal;

        // Re-position in case targets move
        entry.mesh.position.set(t.cx, -t.cy, 0);
        entry.mesh.scale.set(t.w * 1.5, t.h * 1.5, 1);
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(loop);

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      meshEntries.forEach(e => {
        scene.remove(e.mesh);
        e.material.dispose();
        e.mesh.geometry.dispose();
      });
      renderer.dispose();
    };
    // Only run once on mount — the rAF loop reads stateRef for latest props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block' }}
    />
  );
}
