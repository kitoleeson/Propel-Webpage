import { create } from "zustand";

export type CanvasSize = {
  width: number;
  height: number;
};

type AppState = {
  canvasSize: CanvasSize;
  setCanvasSize: (size: CanvasSize) => void;
};

/**
 * Zustand store to manage application-wide state, including canvas size for p5.js sketches.
*/

export const useAppStore = create<AppState>((set) => ({
  canvasSize: { width: 480, height: 400 },
  setCanvasSize: (canvasSize) => set({ canvasSize }),
}));