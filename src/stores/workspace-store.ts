import { create } from "zustand";
import type {
  AgentRunState,
  DecisionReport,
  Simulation,
  WorkspaceMode,
} from "@/types/simulation";
import type { Scenario } from "@/types/workspace";
import type { GeoCoordinates, GeoLayerKey, LocationIntelligence } from "@/types/geo";

type WorkspaceStore = {
  selectedScenario: Scenario | null;
  builderOpen: boolean;
  wizardOpen: boolean;
  loading: boolean;
  loadingMessage: string;
  workspaceMode: WorkspaceMode;
  simulationTheaterOpen: boolean;
  activeSimulationId: string | null;
  activeSimulation: Simulation | null;
  activeReport: DecisionReport | null;
  agentRuns: AgentRunState[];
  systemLog: string[];
  compareScenarioIds: [string, string] | null;
  activeGeoLayers: Set<GeoLayerKey>;
  locationIntelligence: LocationIntelligence | null;
  storyModeOpen: boolean;
  selectedRadiusKm: 1 | 5 | 10;
  mapCenter: GeoCoordinates | null;
  setSelectedScenario: (scenario: Scenario | null) => void;
  setBuilderOpen: (open: boolean) => void;
  setWizardOpen: (open: boolean) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setSimulationTheaterOpen: (open: boolean) => void;
  setActiveSimulation: (sim: Simulation | null) => void;
  setActiveReport: (report: DecisionReport | null) => void;
  setAgentRuns: (runs: AgentRunState[]) => void;
  updateAgentRun: (id: AgentRunState["id"], patch: Partial<AgentRunState>) => void;
  appendAgentFinding: (id: AgentRunState["id"], finding: string) => void;
  appendLog: (message: string) => void;
  clearLog: () => void;
  setCompareScenarioIds: (ids: [string, string] | null) => void;
  toggleGeoLayer: (layer: GeoLayerKey) => void;
  setLocationIntelligence: (intel: LocationIntelligence | null) => void;
  setStoryModeOpen: (open: boolean) => void;
  setSelectedRadiusKm: (km: 1 | 5 | 10) => void;
  setMapCenter: (center: GeoCoordinates | null) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  selectedScenario: null,
  builderOpen: false,
  wizardOpen: false,
  loading: false,
  loadingMessage: "",
  workspaceMode: "report",
  simulationTheaterOpen: false,
  activeSimulationId: null,
  activeSimulation: null,
  activeReport: null,
  agentRuns: [],
  systemLog: [],
  compareScenarioIds: null,
  activeGeoLayers: new Set<GeoLayerKey>(["population", "services", "impact"]),
  locationIntelligence: null,
  storyModeOpen: false,
  selectedRadiusKm: 5,
  mapCenter: null,
  setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),
  setBuilderOpen: (open) => set({ builderOpen: open }),
  setWizardOpen: (open) => set({ wizardOpen: open }),
  setLoading: (loading, message = "") => set({ loading, loadingMessage: message }),
  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),
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
  toggleGeoLayer: (layer) => {
    const next = new Set(get().activeGeoLayers);
    if (next.has(layer)) next.delete(layer);
    else next.add(layer);
    set({ activeGeoLayers: next });
  },
  setLocationIntelligence: (intel) => set({ locationIntelligence: intel }),
  setStoryModeOpen: (open) => set({ storyModeOpen: open }),
  setSelectedRadiusKm: (km) => set({ selectedRadiusKm: km }),
  setMapCenter: (center) => set({ mapCenter: center }),
}));
