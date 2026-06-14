"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { decisions } from "@/lib/mock/decisions";

type NodePoint = {
  position: [number, number, number];
  decisionId: string;
  consequenceIdx: number;
  ring: number;
};

function buildNodes(): NodePoint[] {
  const pts: NodePoint[] = [];
  decisions.forEach((d, di) => {
    d.chain.forEach((_, ci) => {
      const ring = ci + 1;
      const baseRadius = 1.3 + ring * 0.7;
      // distribute around a circle slice per decision
      const slice = (Math.PI * 2) / decisions.length;
      const center = slice * di;
      // deterministic spread per (di, ci) so positions are stable across re-renders
      const jitter = Math.sin(di * 3.1 + ci * 1.7);
      const tiltSeed = Math.cos(di * 2.4 + ci * 0.9);
      const angle = center + jitter * slice * 0.32;
      const tilt = tiltSeed * 0.4;
      const x = Math.cos(angle) * baseRadius;
      const z = Math.sin(angle) * baseRadius;
      const y = tilt * ring * 0.35;
      pts.push({ position: [x, y, z], decisionId: d.id, consequenceIdx: ci, ring });
    });
  });
  return pts;
}

export function DecisionUniverseScene({ activeId }: { activeId: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);

  const nodes = useMemo(() => buildNodes(), []);
  const active = decisions.find((d) => d.id === activeId) ?? decisions[0];

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
      const px = state.pointer.x * 0.15;
      const py = state.pointer.y * 0.1;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -py,
        0.04
      );
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        px,
        0.04
      );
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.04;
      coreRef.current.scale.setScalar(s);
    }
    ringRefs.current.forEach((m, i) => {
      if (!m) return;
      const t = (state.clock.elapsedTime * 0.4 + i * 0.33) % 1;
      const scale = 0.6 + t * 4.5;
      m.scale.set(scale, scale, scale);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - t) * 0.5;
    });
  });

  const signalColor = "#3B82F6";
  const inkColor = "#94A3B8";

  return (
    <group ref={groupRef}>
      {/* central decision node */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color={signalColor} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshBasicMaterial color={signalColor} transparent opacity={0.18} />
      </mesh>

      {/* ripple rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.55, 0.57, 96]} />
          <meshBasicMaterial color={signalColor} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* center label */}
      <Html center distanceFactor={8} position={[0, -1.2, 0]}>
        <div className="pointer-events-none whitespace-nowrap text-center">
          <div className="font-mono-data text-[9px] uppercase tracking-[0.2em] text-ink-muted">
            {active.category}
          </div>
          <div className="font-display text-[15px] font-semibold text-ink">{active.title}</div>
        </div>
      </Html>

      {/* nodes + connections */}
      {nodes.map((n, i) => {
        const isActive = n.decisionId === active.id;
        const consequence = decisions.find((d) => d.id === n.decisionId)?.chain[n.consequenceIdx];
        const color = isActive ? signalColor : inkColor;
        return (
          <group key={i}>
            <Line
              points={[[0, 0, 0], n.position]}
              color={isActive ? signalColor : inkColor}
              opacity={isActive ? 0.35 : 0.08}
              transparent
              lineWidth={1}
              dashed={!isActive}
              dashSize={0.05}
              gapSize={0.05}
            />
            <mesh position={n.position}>
              <sphereGeometry args={[isActive ? 0.075 : 0.045, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={isActive ? 1 : 0.55} />
            </mesh>
            {isActive && consequence && (
              <Html
                position={n.position}
                distanceFactor={9}
                style={{ pointerEvents: "none" }}
              >
                <div className="-translate-y-1/2 translate-x-3 whitespace-nowrap rounded-sm border border-hairline bg-surface/95 px-2 py-1 shadow-sm backdrop-blur">
                  <div className="font-mono-data text-[8px] uppercase tracking-[0.18em] text-ink-muted">
                    L{n.ring}
                  </div>
                  <div className="font-display text-[11px] font-medium text-ink">
                    {consequence.label}
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}