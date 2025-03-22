import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";

type VRSettings = {
  gestures: boolean;
  sound: boolean;
  quality: 'low' | 'medium' | 'high';
  walkSpeed: number; // 1-10
};

type VRContextType = {
  vrEnabled: boolean;
  gestureControlEnabled: boolean;
  soundEffectsEnabled: boolean;
  qualitySetting: 'low' | 'medium' | 'high';
  walkSpeed: number;
  toggleVR: () => void;
  toggleGestureControl: () => void;
  toggleSoundEffects: () => void;
  setQualitySetting: (quality: 'low' | 'medium' | 'high') => void;
  setWalkSpeed: (speed: number) => void;
  resetSettings: () => void;
  isVRSupported: boolean;
};

// Default VR settings
const DEFAULT_SETTINGS: VRSettings = {
  gestures: true,
  sound: true,
  quality: 'medium',
  walkSpeed: 5,
};

export const VRContext = createContext<VRContextType | null>(null);

export function VRProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [vrEnabled, setVrEnabled] = useState(false);
  const [gestureControlEnabled, setGestureControlEnabled] = useState(DEFAULT_SETTINGS.gestures);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(DEFAULT_SETTINGS.sound);
  const [qualitySetting, setQualitySetting] = useState<'low' | 'medium' | 'high'>(DEFAULT_SETTINGS.quality);
  const [walkSpeed, setWalkSpeed] = useState(DEFAULT_SETTINGS.walkSpeed);
  const [isVRSupported, setIsVRSupported] = useState(true);

  // Load settings from local storage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('amrikyy_vr_settings');
      if (savedSettings) {
        const settings: VRSettings = JSON.parse(savedSettings);
        setGestureControlEnabled(settings.gestures);
        setSoundEffectsEnabled(settings.sound);
        setQualitySetting(settings.quality);
        setWalkSpeed(settings.walkSpeed);
      }
    } catch (error) {
      console.error('Failed to load VR settings', error);
    }
    
    // Check for VR support
    checkVRSupport();
  }, []);
  
  // Save settings to local storage when they change
  useEffect(() => {
    try {
      const settings: VRSettings = {
        gestures: gestureControlEnabled,
        sound: soundEffectsEnabled,
        quality: qualitySetting,
        walkSpeed,
      };
      localStorage.setItem('amrikyy_vr_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save VR settings', error);
    }
  }, [gestureControlEnabled, soundEffectsEnabled, qualitySetting, walkSpeed]);
  
  // Simulate checking for VR/WebGL support
  const checkVRSupport = useCallback(() => {
    // In a real app, we would check for actual WebGL or WebXR support
    // For now, just simulate a check
    const hasWebGL = true; // Mock check
    
    setIsVRSupported(hasWebGL);
    
    if (!hasWebGL && vrEnabled) {
      setVrEnabled(false);
      toast({
        title: "وضع الواقع الافتراضي غير مدعوم",
        description: "المتصفح الخاص بك لا يدعم تقنيات الواقع الافتراضي المطلوبة.",
        variant: "destructive",
      });
    }
  }, [toast, vrEnabled]);

  const toggleVR = useCallback(() => {
    if (!isVRSupported && !vrEnabled) {
      toast({
        title: "وضع الواقع الافتراضي غير مدعوم",
        description: "المتصفح الخاص بك لا يدعم تقنيات الواقع الافتراضي المطلوبة.",
        variant: "destructive",
      });
      return;
    }
    
    setVrEnabled(prev => !prev);
    
    if (!vrEnabled) {
      // When enabling VR, show a toast notification
      toast({
        title: "تم تفعيل وضع الواقع الافتراضي",
        description: "يمكنك الآن التجول في المتجر بشخصيتك الافتراضية وتجربة المنتجات.",
      });
    }
  }, [isVRSupported, vrEnabled, toast]);
  
  const toggleGestureControl = useCallback(() => {
    setGestureControlEnabled(prev => !prev);
  }, []);
  
  const toggleSoundEffects = useCallback(() => {
    setSoundEffectsEnabled(prev => !prev);
    
    // Play a test sound when enabling
    if (!soundEffectsEnabled) {
      try {
        const audio = new Audio();
        audio.volume = 0.2;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  }, [soundEffectsEnabled]);
  
  const setQualitySettingHandler = useCallback((quality: 'low' | 'medium' | 'high') => {
    setQualitySetting(quality);
    
    toast({
      title: "تم تغيير جودة العرض",
      description: quality === 'low' ? "جودة منخفضة" : quality === 'medium' ? "جودة متوسطة" : "جودة عالية",
    });
  }, [toast]);
  
  const setWalkSpeedHandler = useCallback((speed: number) => {
    if (speed < 1) speed = 1;
    if (speed > 10) speed = 10;
    setWalkSpeed(speed);
  }, []);
  
  const resetSettings = useCallback(() => {
    setGestureControlEnabled(DEFAULT_SETTINGS.gestures);
    setSoundEffectsEnabled(DEFAULT_SETTINGS.sound);
    setQualitySetting(DEFAULT_SETTINGS.quality);
    setWalkSpeed(DEFAULT_SETTINGS.walkSpeed);
    
    toast({
      title: "تم إعادة تعيين الإعدادات",
      description: "تم استعادة إعدادات الواقع الافتراضي الافتراضية.",
    });
  }, [toast]);

  return (
    <VRContext.Provider
      value={{
        vrEnabled,
        gestureControlEnabled,
        soundEffectsEnabled,
        qualitySetting,
        walkSpeed,
        toggleVR,
        toggleGestureControl,
        toggleSoundEffects,
        setQualitySetting: setQualitySettingHandler,
        setWalkSpeed: setWalkSpeedHandler,
        resetSettings,
        isVRSupported,
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
