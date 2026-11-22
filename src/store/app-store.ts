import { create } from "zustand";
import type { BchNetwork } from "@/lib/bch/address";

export interface SplitParticipantDraft {
  id: string;
  label: string;
  shareSatoshis: number;
}

interface AppState {
  network: BchNetwork;
  title: string;
  merchantAddress: string;
  participants: SplitParticipantDraft[];
  setNetwork: (network: BchNetwork) => void;
  setTitle: (title: string) => void;
  setMerchantAddress: (address: string) => void;
  setParticipants: (participants: SplitParticipantDraft[]) => void;
  resetDraft: () => void;
}

const DEFAULT_PARTICIPANTS: SplitParticipantDraft[] = [
  { id: "p-1", label: "Host", shareSatoshis: 1500 },
  { id: "p-2", label: "Friend 1", shareSatoshis: 1500 },
];

export const useAppStore = create<AppState>((set) => ({
  network: "chipnet",
  title: "",
  merchantAddress: "",
  participants: DEFAULT_PARTICIPANTS,
  setNetwork: (network) => set({ network }),
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
