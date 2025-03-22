import { useVR } from "@/hooks/use-vr";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function VROverlay() {
  const { 
    vrEnabled,
    gestureControlEnabled, 
    soundEffectsEnabled, 
    qualitySetting,
    walkSpeed,
    toggleVR,
    toggleGestureControl, 
    toggleSoundEffects,
    setQualitySetting,
    setWalkSpeed,
    resetSettings
  } = useVR();
  const [showControls, setShowControls] = useState(false);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Simulate VR view movement effect
  useEffect(() => {
    if (!vrEnabled || !gestureControlEnabled) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      
      setRotationX(-y);
      setRotationY(x);
      
      if (soundEffectsEnabled && (Math.abs(x) > 0.3 || Math.abs(y) > 0.3)) {
        // Simulate spatial audio effect with subtle sound
        try {
          const audio = new Audio();
          audio.volume = 0.05;
          audio.play().catch(() => {});
        } catch (e) {}
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [vrEnabled, gestureControlEnabled, soundEffectsEnabled]);
  
  // Apply quality settings
  const qualityStyles = {
    low: {
      blur: '4px',
      opacity: 0.85,
      borderWidth: '10px',
    },
    medium: {
      blur: '2px',
      opacity: 0.75,
      borderWidth: '15px',
    },
    high: {
      blur: '1px',
      opacity: 0.65,
      borderWidth: '20px',
    }
  };
  
  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 z-40 pointer-events-none"
        style={{
          transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          transition: `transform ${walkSpeed/10}s ease-out`, // Speed affects transition time
        }}
      >
        {/* VR perspective overlay */}
        <div 
          className="absolute inset-0 border-black rounded-[25px]"
          style={{
            borderWidth: qualityStyles[qualitySetting].borderWidth,
            opacity: qualityStyles[qualitySetting].opacity,
            filter: `blur(${qualityStyles[qualitySetting].blur})`,
          }}
        ></div>
      </div>
      
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md py-2 px-4 rounded-full z-50 flex items-center">
        <i className="fas fa-vr-cardboard text-[#ffeb3b] ml-2"></i>
        <span>وضع الواقع الافتراضي نشط</span>
        <div className="flex items-center">
          <button 
            className="mx-2 text-white/80 hover:text-white"
            onClick={() => setShowControls(!showControls)}
          >
            <i className={`fas fa-cog text-xs`}></i>
          </button>
          <button 
            className="text-white/80 hover:text-white"
            onClick={toggleVR}
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>
      
      {showControls && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md p-4 rounded-lg z-50 min-w-[280px] flex flex-col gap-3">
          <div className="text-center font-bold border-b border-white/10 pb-2 mb-2">
            إعدادات الواقع الافتراضي
          </div>
          
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
          
          <button
            className="text-xs text-[#ffeb3b] underline mt-1 inline-block text-right"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            {showAdvancedSettings ? 'إخفاء الإعدادات المتقدمة' : 'إظهار الإعدادات المتقدمة'}
          </button>
          
          {showAdvancedSettings && (
            <div className="mt-2 space-y-4 border-t border-white/10 pt-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">جودة العرض</span>
                  <div className="flex space-x-2 space-x-reverse">
                    {['low', 'medium', 'high'].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setQualitySetting(quality as 'low' | 'medium' | 'high')}
                        className={`px-2 py-1 rounded-full text-xs ${
                          qualitySetting === quality ? 'bg-[#5e35b1] text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {quality === 'low' ? 'منخفضة' : quality === 'medium' ? 'متوسطة' : 'عالية'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">سرعة الحركة</span>
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                    {walkSpeed}
                  </span>
                </div>
                <Slider 
                  value={[walkSpeed]} 
                  min={1} 
                  max={10} 
                  step={1} 
                  onValueChange={(value) => setWalkSpeed(value[0])}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>بطيء</span>
                  <span>سريع</span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-white/20"
                  onClick={resetSettings}
                >
                  <i className="fas fa-sync-alt ml-1"></i>
                  إعادة تعيين الإعدادات
                </Button>
              </div>
            </div>
          )}
          
          <div className="text-xs text-white/60 mt-1 text-center border-t border-white/10 pt-2">
            {gestureControlEnabled 
              ? "حرك الماوس للتنقل في الواقع الافتراضي" 
              : "استخدم الأسهم للتنقل في الواقع الافتراضي"}
          </div>
        </div>
      )}
    </>
  );
}
