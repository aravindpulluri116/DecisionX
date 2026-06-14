import { create } from "zustand";
import type {
  AgentRunState,
  DecisionReport,
  Simulation,
  TimelineYear,
  WorkspaceMode,
} from "@/types/simulation";
import type { NodeIntelligence, Scenario } from "@/types/workspace";
import type { GeoCoordinates, GeoLayerKey, LocationIntelligence } from "@/types/geo";
import type { FutureBranch, TimelineMilestone, TimeMachineBundle } from "@/types/timemachine";

type WorkspaceStore = {
  selectedNodeId: string | null;
  selectedScenario: Scenario | null;
  nodeIntelligence: NodeIntelligence | null;
  builderOpen: boolean;
  wizardOpen: boolean;
  drawerOpen: boolean;
  loading: boolean;
  loadingMessage: string;
  collapsedNodeIds: Set<string>;
  workspaceMode: WorkspaceMode;
  simulationTheaterOpen: boolean;
  simulationProposalTitle: string;
  simulationProposalLocation: string;
  activeSimulationId: string | null;
  activeSimulation: Simulation | null;
  activeReport: DecisionReport | null;
  agentRuns: AgentRunState[];
  systemLog: string[];
  timelineYear: TimelineYear;
  compareScenarioIds: [string, string] | null;
  activeGeoLayers: Set<GeoLayerKey>;
  locationIntelligence: LocationIntelligence | null;
  storyModeOpen: boolean;
  selectedRadiusKm: 1 | 5 | 10;
  mapCenter: GeoCoordinates | null;
  timeMachineBundle: TimeMachineBundle | null;
  timeMachineBranch: FutureBranch;
  timeMachineMilestone: TimelineMilestone;
  timeMachineCompareYear: number;
  presentationModeOpen: boolean;
  timeMachineAutoPlay: boolean;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedScenario: (scenario: Scenario | null) => void;
  setNodeIntelligence: (intel: NodeIntelligence | null) => void;
  setBuilderOpen: (open: boolean) => void;
  setWizardOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setLoading: (loading: boolean, message?: string) => void;
  toggleNodeCollapsed: (id: string) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setSimulationTheaterOpen: (open: boolean) => void;
  setSimulationProposal: (title: string, location?: string) => void;
  setActiveSimulation: (sim: Simulation | null) => void;
  setActiveReport: (report: DecisionReport | null) => void;
  setAgentRuns: (runs: AgentRunState[]) => void;
  updateAgentRun: (id: AgentRunState["id"], patch: Partial<AgentRunState>) => void;
  appendAgentFinding: (id: AgentRunState["id"], finding: string) => void;
  appendLog: (message: string) => void;
  clearLog: () => void;
  setTimelineYear: (year: TimelineYear) => void;
  setCompareScenarioIds: (ids: [string, string] | null) => void;
  toggleGeoLayer: (layer: GeoLayerKey) => void;
  setLocationIntelligence: (intel: LocationIntelligence | null) => void;
  setStoryModeOpen: (open: boolean) => void;
  setSelectedRadiusKm: (km: 1 | 5 | 10) => void;
  setMapCenter: (center: GeoCoordinates | null) => void;
  setTimeMachineBundle: (bundle: TimeMachineBundle | null) => void;
  setTimeMachineBranch: (branch: FutureBranch) => void;
  setTimeMachineMilestone: (m: TimelineMilestone) => void;
  setTimeMachineCompareYear: (year: number) => void;
  setPresentationModeOpen: (open: boolean) => void;
  setTimeMachineAutoPlay: (on: boolean) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  selectedNodeId: null,
  selectedScenario: null,
  nodeIntelligence: null,
  builderOpen: false,
  wizardOpen: false,
  drawerOpen: false,
  loading: false,
  loadingMessage: "",
  collapsedNodeIds: new Set(),
  workspaceMode: "canvas",
  simulationTheaterOpen: false,
  simulationProposalTitle: "",
  simulationProposalLocation: "",
  activeSimulationId: null,
  activeSimulation: null,
  activeReport: null,
  agentRuns: [],
  systemLog: [],
  timelineYear: 1,
  compareScenarioIds: null,
  activeGeoLayers: new Set<GeoLayerKey>(["population", "services", "impact"]),
  locationIntelligence: null,
  storyModeOpen: false,
  selectedRadiusKm: 5,
  mapCenter: null,
  timeMachineBundle: null,
  timeMachineBranch: "expectedCase",
  timeMachineMilestone: "present",
  timeMachineCompareYear: 2037,
  presentationModeOpen: false,
  timeMachineAutoPlay: false,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),
  setNodeIntelligence: (intel) => set({ nodeIntelligence: intel }),
  setBuilderOpen: (open) => set({ builderOpen: open }),
  setWizardOpen: (open) => set({ wizardOpen: open }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setLoading: (loading, message = "") => set({ loading, loadingMessage: message }),
  toggleNodeCollapsed: (id) => {
    const next = new Set(get().collapsedNodeIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ collapsedNodeIds: next });
  },
  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),
  setSimulationTheaterOpen: (open) => set({ simulationTheaterOpen: open }),
  setSimulationProposal: (title, location = "") =>
    set({ simulationProposalTitle: title, simulationProposalLocation: location }),
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
  setTimelineYear: (year) => set({ timelineYear: year }),
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
  setTimeMachineBundle: (bundle) => set({ timeMachineBundle: bundle }),
  setTimeMachineBranch: (branch) => set({ timeMachineBranch: branch }),
  setTimeMachineMilestone: (m) => set({ timeMachineMilestone: m }),
  setTimeMachineCompareYear: (year) => set({ timeMachineCompareYear: year }),
  setPresentationModeOpen: (open) => set({ presentationModeOpen: open }),
  setTimeMachineAutoPlay: (on) => set({ timeMachineAutoPlay: on }),
}));
