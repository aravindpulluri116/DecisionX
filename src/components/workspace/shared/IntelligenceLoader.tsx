"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { initAgentRuns } from "@/lib/orchestration/agentRuns";
import { CouncilChamber } from "@/components/council/CouncilChamber";

export function IntelligenceLoader() {
  const loading = useWorkspaceStore((s) => s.loading);
  const loadingMessage = useWorkspaceStore((s) => s.loadingMessage);
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const proposalTitle = useWorkspaceStore((s) => s.simulationProposalTitle);
  const proposalLocation = useWorkspaceStore((s) => s.simulationProposalLocation);

  const runs = agentRuns.length > 0 ? agentRuns : initAgentRuns();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-[var(--council-bg)]/92 backdrop-blur-md"
        >
          <CouncilChamber
            variant="overlay"
            proposalTitle={proposalTitle || "Loading intelligence…"}
            proposalLocation={proposalLocation}
            agentRuns={runs}
            statusMessage={loadingMessage || "Preparing analysis surface…"}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
