import { useVR } from "@/hooks/use-vr";
import VROverlay from "../vr-overlay";

export default function Header() {
  const { vrEnabled, toggleVR } = useVR();
  
  return (
    <header className="bg-black/20 text-center py-4 px-2 sticky top-0 z-50 backdrop-blur-sm">
      <h1 className="text-2xl font-bold">Amrikyy</h1>
      <p className="text-sm text-neutral-200">تجربة تسوق افتراضية مميزة</p>
      
      <div 
        className="absolute left-4 top-1/2 -translate-y-1/2 animate-pulse cursor-pointer"
        onClick={toggleVR}
      >
        <span className="bg-[#ffeb3b] text-[#2a1f6f] px-2 py-1 rounded-full text-xs font-bold flex items-center">
          <i className="fas fa-vr-cardboard ml-1"></i> VR
        </span>
      </div>
      
      {vrEnabled && <VROverlay />}
    </header>
  );
}
