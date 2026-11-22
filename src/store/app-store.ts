import { create } from "zustand";

export interface SplitParticipantDraft {
  id: string;
  label: string;
  shareSatoshis: number;
}

interface AppState {
  readonly network: "mainnet";
  title: string;
  merchantAddress: string;
  participants: SplitParticipantDraft[];
  setTitle: (title: string) => void;
  setMerchantAddress: (address: string) => void;
  setParticipants: (participants: SplitParticipantDraft[]) => void;
  resetDraft: () => void;
}

const DEFAULT_PARTICIPANTS: SplitParticipantDraft[] = [
  { id: "p-1", label: "You", shareSatoshis: 0 },
  { id: "p-2", label: "Friend 2", shareSatoshis: 0 },
];

export const useAppStore = create<AppState>((set) => ({
  network: "mainnet",
  title: "",
  merchantAddress: "",
  participants: DEFAULT_PARTICIPANTS,
  setTitle: (title) => set({ title }),
  setMerchantAddress: (merchantAddress) => set({ merchantAddress }),
  setParticipants: (participants) => set({ participants }),
  resetDraft: () =>
    set({
      title: "",
      merchantAddress: "",
      participants: DEFAULT_PARTICIPANTS,
    }),
}));
