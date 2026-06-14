import { WorkspaceProviders } from "@/components/workspace/shell/WorkspaceProviders";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProviders>
      <div className="min-h-screen">{children}</div>
    </WorkspaceProviders>
  );
}
