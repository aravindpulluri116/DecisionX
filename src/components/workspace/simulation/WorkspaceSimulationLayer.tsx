"use client";

import dynamic from "next/dynamic";

const SimulationTheater = dynamic(
  () => import("./SimulationTheater").then((m) => ({ default: m.SimulationTheater })),
  { ssr: false },
);

const SimulationDock = dynamic(
  () => import("./SimulationDock").then((m) => ({ default: m.SimulationDock })),
  { ssr: false },
);

/** Global simulation UI — persists while browsing workspace projects. */
export function WorkspaceSimulationLayer() {
  return (
    <>
      <SimulationTheater />
      <SimulationDock />
    </>
  );
}
