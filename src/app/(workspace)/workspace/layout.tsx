import { WorkspaceProviders } from "@/components/workspace/shell/WorkspaceProviders";
import { WorkspaceSimulationLayer } from "@/components/workspace/simulation/WorkspaceSimulationLayer";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProviders>
      <div className="min-h-screen">{children}</div>
      <WorkspaceSimulationLayer />
    </WorkspaceProviders>
  );
}
