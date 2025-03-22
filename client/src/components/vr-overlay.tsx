import { useVR } from "@/hooks/use-vr";
import { useState, useEffect } from "react";

export default function VROverlay() {
  const { gestureControlEnabled, soundEffectsEnabled, toggleGestureControl, toggleSoundEffects } = useVR();
  const [showControls, setShowControls] = useState(false);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  
  // Simulate VR view movement effect
  useEffect(() => {
    if (!gestureControlEnabled) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      
      setRotationX(-y);
      setRotationY(x);
      
      if (soundEffectsEnabled && Math.abs(x) > 0.3 || Math.abs(y) > 0.3) {
        // Simulate spatial audio effect with subtle sound
        const audio = new Audio();
        audio.volume = 0.05;
        audio.play().catch(() => {});
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gestureControlEnabled, soundEffectsEnabled]);
  
  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 z-40 pointer-events-none"
        style={{
          transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* VR perspective overlay */}
        <div className="absolute inset-0 border-[15px] border-black rounded-[25px] opacity-70"></div>
      </div>
      
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md py-2 px-4 rounded-full z-50 flex items-center">
        <i className="fas fa-vr-cardboard text-[#ffeb3b] ml-2"></i>
        <span>وضع الواقع الافتراضي نشط</span>
        <button 
          className="ml-2 text-white/80 hover:text-white"
          onClick={() => setShowControls(!showControls)}
        >
          <i className={`fas fa-chevron-${showControls ? 'up' : 'down'} text-xs`}></i>
        </button>
      </div>
      
      {showControls && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md p-3 rounded-lg z-50 min-w-[200px] flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">تحكم الإيماءات</span>
            <button 
              onClick={toggleGestureControl}
              className={`px-2 py-1 rounded-full text-xs ${gestureControlEnabled ? 'bg-[#5e35b1] text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {gestureControlEnabled ? 'نشط' : 'غير نشط'}
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">مؤثرات صوتية</span>
            <button 
              onClick={toggleSoundEffects}
              className={`px-2 py-1 rounded-full text-xs ${soundEffectsEnabled ? 'bg-[#5e35b1] text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {soundEffectsEnabled ? 'نشطة' : 'غير نشطة'}
            </button>
          </div>
          
          <div className="text-xs text-white/60 mt-1 text-center">
            حرك الماوس للتنقل في وضع الواقع الافتراضي
          </div>
        </div>
      )}
    </>
  );
}
