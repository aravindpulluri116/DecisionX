import { WorkspaceProviders } from "@/components/workspace/shell/WorkspaceProviders";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProviders>
      <div className="h-screen overflow-hidden">{children}</div>
    </WorkspaceProviders>
  );
}
