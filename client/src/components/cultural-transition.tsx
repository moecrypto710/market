import { useState, useEffect } from 'react';

// Define transition types
type TransitionStyle = 'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque' | 'fade';

interface CulturalTransitionProps {
  show: boolean;
  style: TransitionStyle;
  onFinish: () => void;
}

export default function CulturalTransition({ show, style, onFinish }: CulturalTransitionProps) {
  const [animating, setAnimating] = useState(false);
  
  useEffect(() => {
    if (show) {
      setAnimating(true);
      
      // Hide transition after animation completes
      const timer = setTimeout(() => {
        setAnimating(false);
        onFinish();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [show, onFinish]);
  
  if (!show && !animating) return null;
  
  // Different transition styles with Arabic/cultural elements
  const getTransitionContent = () => {
    switch (style) {
      case 'modern':
        return (
          <div className="absolute inset-0 z-[100] flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
            <div className="absolute text-2xl font-bold text-white opacity-70">تحميل</div>
          </div>
        );
      
      case 'futuristic':
        return (
          <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center overflow-hidden">
            <div className="absolute w-96 h-96 border border-[#5e35b1]/30 rounded-full animate-ping"></div>
            <div className="absolute w-64 h-64 border border-[#5e35b1]/50 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute w-32 h-32 border border-[#5e35b1]/70 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="text-3xl font-bold text-white">منطقة جديدة</div>
          </div>
        );
      
      case 'cultural':
        return (
          <div className="absolute inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'url("https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323590/arabic-pattern_djomlx.png")',
              backgroundSize: '200px',
              transform: 'rotate(45deg)',
              animation: 'fadeIn 1.5s ease-in-out'
            }}></div>
            <div className="text-4xl font-bold text-white" style={{ fontFamily: 'Amiri, serif' }}>استكشف</div>
          </div>
        );
      
      case 'geometric':
        return (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center overflow-hidden">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 border-8 border-[#5e35b1]/30 rotate-45 animate-pulse"></div>
              <div className="absolute inset-0 border-8 border-[#ff9800]/30 -rotate-45 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="text-3xl font-bold text-white absolute">المركز التجاري</div>
          </div>
        );
      
      case 'calligraphy':
        return (
          <div className="absolute inset-0 z-[100] bg-gradient-to-br from-[#5e35b1]/80 to-black/90 flex items-center justify-center overflow-hidden">
            <div className="text-5xl font-bold text-white" style={{ 
              fontFamily: 'Aref Ruqaa, serif',
              textShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}>
              أمريكي
            </div>
          </div>
        );
      
      case 'arabesque':
        return (
          <div className="absolute inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center overflow-hidden">
            <div className="w-80 h-80 border-[16px] border-[#5e35b1]/20 rounded-full relative flex items-center justify-center">
              <div className="absolute inset-0 border-[8px] border-[#ff9800]/20 rounded-full" style={{ transform: 'scale(0.8)' }}></div>
              <div className="absolute inset-0 border-[4px] border-[#ff9800]/20 rounded-full" style={{ transform: 'scale(0.6)' }}></div>
              <div className="text-3xl font-bold text-white">مرحباً بك</div>
            </div>
          </div>
        );
      
      case 'fade':
      default:
        return (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-xl font-bold text-white/80">انتقال...</div>
          </div>
        );
    }
  };
  
  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-1500 ${animating ? 'opacity-100' : 'opacity-0'}`}>
      {getTransitionContent()}
    </div>
  );
}