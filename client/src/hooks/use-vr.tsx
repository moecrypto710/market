import { createContext, ReactNode, useContext, useState } from "react";

type VRContextType = {
  vrEnabled: boolean;
  gestureControlEnabled: boolean;
  soundEffectsEnabled: boolean;
  toggleVR: () => void;
  toggleGestureControl: () => void;
  toggleSoundEffects: () => void;
};

export const VRContext = createContext<VRContextType | null>(null);

export function VRProvider({ children }: { children: ReactNode }) {
  const [vrEnabled, setVrEnabled] = useState(false);
  const [gestureControlEnabled, setGestureControlEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  const toggleVR = () => setVrEnabled(prev => !prev);
  const toggleGestureControl = () => setGestureControlEnabled(prev => !prev);
  const toggleSoundEffects = () => setSoundEffectsEnabled(prev => !prev);

  return (
    <VRContext.Provider
      value={{
        vrEnabled,
        gestureControlEnabled,
        soundEffectsEnabled,
        toggleVR,
        toggleGestureControl,
        toggleSoundEffects,
      }}
    >
      {children}
    </VRContext.Provider>
  );
}

export function useVR() {
  const context = useContext(VRContext);
  if (!context) {
    throw new Error("useVR must be used within a VRProvider");
  }
  return context;
}
