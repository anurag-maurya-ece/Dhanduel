import { create } from 'zustand';

interface SimulationState {
    isSimulationMode: boolean;
    toggleSimulationMode: () => void;
    simulationSpeed: number; // multiplier for simulation 
}

export const useSimulationStore = create<SimulationState>((set) => ({
    isSimulationMode: false,
    toggleSimulationMode: () => set((state) => ({ isSimulationMode: !state.isSimulationMode })),
    simulationSpeed: 10,
}));
