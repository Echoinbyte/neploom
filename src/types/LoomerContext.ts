import { ReactNode } from "react";
import { Loomer } from "./Loomer";

export interface LoomerContextType {
  loomer: Loomer | null;
  loading: boolean;
  setLoomer: React.Dispatch<React.SetStateAction<Loomer | null>>;
  fetchLoomerData: (id: string) => Promise<void>;
  logoutLoomer: () => void;
}
export interface LoomerProviderProps {
  children: ReactNode;
}
