import { WorkspaceShell } from "@/components/workspace/shell/WorkspaceShell";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectWorkspacePage({ params }: Props) {
  const { projectId } = await params;
  return <WorkspaceShell projectSlug={projectId} />;
}
