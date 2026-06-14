import { create } from "zustand";
import type {
  AgentRunState,
  DecisionReport,
  Simulation,
  WorkspaceMode,
  WorkspaceTab,
} from "@/types/simulation";
import type { Scenario } from "@/types/workspace";
import type { LocationIntelligence } from "@/types/geo";
import type { ExplanationTarget } from "@/types/evidence";

type WorkspaceStore = {
  selectedScenario: Scenario | null;
  builderOpen: boolean;
  wizardOpen: boolean;
  loading: boolean;
  loadingMessage: string;
  workspaceMode: WorkspaceMode;
  workspaceTab: WorkspaceTab;
  simulationTheaterOpen: boolean;
  activeSimulationId: string | null;
  activeSimulation: Simulation | null;
  activeReport: DecisionReport | null;
  agentRuns: AgentRunState[];
  systemLog: string[];
  compareScenarioIds: [string, string] | null;
  locationIntelligence: LocationIntelligence | null;
  explanationOpen: boolean;
  explanationTarget: ExplanationTarget | null;
  setSelectedScenario: (scenario: Scenario | null) => void;
  setBuilderOpen: (open: boolean) => void;
  setWizardOpen: (open: boolean) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  setSimulationTheaterOpen: (open: boolean) => void;
  setActiveSimulation: (sim: Simulation | null) => void;
  setActiveReport: (report: DecisionReport | null) => void;
  setAgentRuns: (runs: AgentRunState[]) => void;
  updateAgentRun: (id: AgentRunState["id"], patch: Partial<AgentRunState>) => void;
  appendAgentFinding: (id: AgentRunState["id"], finding: string) => void;
  appendLog: (message: string) => void;
  clearLog: () => void;
  setCompareScenarioIds: (ids: [string, string] | null) => void;
  setLocationIntelligence: (intel: LocationIntelligence | null) => void;
  openExplanation: (target: ExplanationTarget) => void;
  closeExplanation: () => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  selectedScenario: null,
  builderOpen: false,
  wizardOpen: false,
  loading: false,
  loadingMessage: "",
  workspaceMode: "report",
  workspaceTab: "report",
  simulationTheaterOpen: false,
  activeSimulationId: null,
  activeSimulation: null,
  activeReport: null,
  agentRuns: [],
  systemLog: [],
  compareScenarioIds: null,
  locationIntelligence: null,
  explanationOpen: false,
  explanationTarget: null,
  setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),
  setBuilderOpen: (open) => set({ builderOpen: open }),
  setWizardOpen: (open) => set({ wizardOpen: open }),
  setLoading: (loading, message = "") => set({ loading, loadingMessage: message }),
  setWorkspaceMode: (mode) =>
    set({ workspaceMode: mode, workspaceTab: mode === "compare" ? "compare" : "report" }),
  setWorkspaceTab: (tab) => {
    const { selectedScenario } = get();
    if (tab === "compare") {
      const { selectedScenario, compareScenarioIds } = get();
      set({
        workspaceTab: tab,
        workspaceMode: "compare",
        compareScenarioIds:
          compareScenarioIds ??
          (selectedScenario ? [selectedScenario.id, ""] : null),
      });
      return;
    }
    if (tab === "report") {
      set({ workspaceTab: tab, workspaceMode: "report" });
      return;
    }
    set({ workspaceTab: tab });
  },
  setSimulationTheaterOpen: (open) => set({ simulationTheaterOpen: open }),
  setActiveSimulation: (sim) =>
    set({ activeSimulation: sim, activeSimulationId: sim?.id ?? null }),
  setActiveReport: (report) => set({ activeReport: report }),
  setAgentRuns: (runs) => set({ agentRuns: runs }),
  updateAgentRun: (id, patch) =>
    set({
      agentRuns: get().agentRuns.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }),
  appendAgentFinding: (id, finding) =>
    set({
      agentRuns: get().agentRuns.map((r) =>
        r.id === id ? { ...r, findings: [...r.findings, finding] } : r,
      ),
    }),
  appendLog: (message) => {
    const log = get().systemLog;
    const trimmed = log.length >= 100 ? log.slice(-99) : log;
    set({ systemLog: [...trimmed, message] });
  },
  clearLog: () => set({ systemLog: [] }),
  setCompareScenarioIds: (ids) => set({ compareScenarioIds: ids }),
  setLocationIntelligence: (intel) => set({ locationIntelligence: intel }),
  openExplanation: (target) => set({ explanationOpen: true, explanationTarget: target }),
  closeExplanation: () => set({ explanationOpen: false, explanationTarget: null }),
}));
