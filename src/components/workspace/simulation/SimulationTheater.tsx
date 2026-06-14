"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CouncilChamber } from "@/components/council/CouncilChamber";

export function SimulationTheater() {
  const open = useWorkspaceStore((s) => s.simulationTheaterOpen);
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const systemLog = useWorkspaceStore((s) => s.systemLog);
  const proposalTitle = useWorkspaceStore((s) => s.simulationProposalTitle);
  const proposalLocation = useWorkspaceStore((s) => s.simulationProposalLocation);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed inset-0 z-[100] bg-[var(--council-bg)]"
        >
          <CouncilChamber
            variant="theater"
            proposalTitle={proposalTitle || "Active decision"}
            proposalLocation={proposalLocation}
            agentRuns={agentRuns}
            showSystemLog
            systemLog={systemLog}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
