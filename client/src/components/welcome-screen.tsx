import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import confetti from 'canvas-confetti';

interface WelcomeScreenProps {
  onComplete: () => void;
  skipAnimation?: boolean;
}

export default function WelcomeScreen({ onComplete, skipAnimation = false }: WelcomeScreenProps) {
  const [animationState, setAnimationState] = useState<'initial' | 'pattern' | 'calligraphy' | 'logo' | 'text' | 'complete'>('initial');
  const [skipIntro, setSkipIntro] = useState(skipAnimation);
  const [showParticles, setShowParticles] = useState(false);
  const { user } = useAuth();
  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (skipIntro) {
      setAnimationState('complete');
      return;
    }

    // Sequence the animations with better timing
    const patternTimer = setTimeout(() => {
      setAnimationState('pattern');
      setShowParticles(true);
    }, 500);
    
    const calligraphyTimer = setTimeout(() => setAnimationState('calligraphy'), 1500);
    const logoTimer = setTimeout(() => setAnimationState('logo'), 2400);
    const textTimer = setTimeout(() => setAnimationState('text'), 3200);
    
    // Trigger confetti when logo appears
    const confettiTimer = setTimeout(() => {
      if (confettiRef.current) {
        const myConfetti = confetti.create(confettiRef.current, {
          resize: true,
          useWorker: true,
        });
        
        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#5e35b1', '#9c27b0', '#ff9800', '#ffeb3b'],
          shapes: ['circle', 'square'],
        });
      }
    }, 2500);
    
    const completeTimer = setTimeout(() => setAnimationState('complete'), 8000);
    
    // Auto-complete animation after a delay if user doesn't skip
    const autoCompleteTimer = setTimeout(() => {
      onComplete();
    }, 10000);
    
    return () => {
      clearTimeout(patternTimer);
      clearTimeout(calligraphyTimer);
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(confettiTimer);
      clearTimeout(completeTimer);
      clearTimeout(autoCompleteTimer);
    };
  }, [skipIntro, onComplete]);

  const handleSkip = () => {
    setAnimationState('complete');
    onComplete();
  };
  
  if (animationState === 'complete') {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-[#070314] z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        direction: 'rtl' // For Arabic text orientation
      }}
    >
      {/* Background patterns */}
      <div 
        className={`absolute inset-0 opacity-0 transition-opacity duration-1000 ${animationState !== 'initial' ? 'opacity-20' : ''}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }}
      ></div>
      
      {/* Arabic geometric patterns */}
      <div className={`absolute inset-0 transition-opacity duration-1500 delay-300 ${animationState === 'initial' ? 'opacity-0' : 'opacity-30'}`}>
        <div className="absolute top-0 left-0 w-1/3 h-1/3">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#5e35b1]">
            <path fill="currentColor" d="M0,0 L100,0 L100,100 L0,100 L0,0 Z M50,50 L100,0 L100,100 L0,100 L0,0 Z"></path>
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#ff9800]">
            <path fill="currentColor" d="M0,0 L100,0 L100,100 L0,100 L0,0 Z M50,50 L100,0 L100,100 L0,100 L0,0 Z"></path>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 -rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#ff9800]">
            <path fill="currentColor" d="M0,0 L100,0 L100,100 L0,100 L0,0 Z M50,50 L100,0 L100,100 L0,100 L0,0 Z"></path>
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#5e35b1]">
            <path fill="currentColor" d="M0,0 L100,0 L100,100 L0,100 L0,0 Z M50,50 L100,0 L100,100 L0,100 L0,0 Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Islamic star pattern */}
      <div className={`w-80 h-80 transition-all duration-1500 delay-300 ${
        animationState === 'pattern' || animationState === 'logo' || animationState === 'text'
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-50'
      }`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5e35b1" />
              <stop offset="100%" stopColor="#ff9800" />
            </linearGradient>
          </defs>
          
          {/* Islamic 8-point star */}
          <g fill="url(#star-gradient)" fillRule="evenodd">
            <path d="M50,0 L61,35 L97,38 L69,62 L79,97 L50,79 L21,97 L31,62 L3,38 L39,35 Z" className="opacity-90" />
            <path d="M50,15 L58,40 L84,43 L64,60 L71,87 L50,73 L29,87 L36,60 L16,43 L42,40 Z" className="opacity-60" />
            <path d="M50,30 L55,45 L72,46 L59,57 L63,74 L50,65 L37,74 L41,57 L28,46 L45,45 Z" className="opacity-30" />
            <circle cx="50" cy="50" r="8" fill="white" className="opacity-90" />
          </g>
          
          {/* Animated pulse */}
          <circle cx="50" cy="50" r="48" stroke="url(#star-gradient)" strokeWidth="0.5" fill="none" className="animate-ping opacity-30" />
        </svg>
      </div>
      
      {/* Logo / branding */}
      <div 
        className={`absolute transition-all duration-1000 ease-out ${
          animationState === 'logo' || animationState === 'text'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90'
        }`}
      >
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5e35b1] to-[#ff9800] mt-44">
          مول الواقع الافتراضي
        </h1>
      </div>
      
      {/* Welcome Text with Arabic cultural elements */}
      <div 
        className={`max-w-3xl text-center mt-60 transition-all duration-1000 ease-out px-6 ${
          animationState === 'text'
            ? 'opacity-100 transform-none'
            : 'opacity-0 translate-y-10'
        }`}
      >
        <p className="text-xl text-white/80 mb-6">
          أهلاً بك في تجربة تسوق فريدة من نوعها، حيث يلتقي التراث العربي بتكنولوجيا المستقبل
        </p>
        
        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-px bg-gradient-to-r from-transparent via-[#5e35b1]/50 to-transparent flex-1"></div>
          <span className="text-white/50 text-sm">♦</span>
          <div className="h-px bg-gradient-to-r from-transparent via-[#ff9800]/50 to-transparent flex-1"></div>
        </div>
        
        <p className="text-white/60">
          استكشف المتاجر الافتراضية، جرب المنتجات، وانضم لمجتمعنا الرقمي
        </p>
        
        {user ? (
          <p className="mt-4 text-lg text-[#ff9800]">
            مرحباً بعودتك، {user.fullName}!
          </p>
        ) : null}
      </div>
      
      {/* Skip button */}
      <Button
        onClick={handleSkip}
        variant="ghost"
        className="absolute bottom-8 left-8 text-white/60 hover:text-white"
      >
        تخطي
        <i className="fas fa-forward ml-2"></i>
      </Button>
      
      {/* Loading indicator */}
      <div className="absolute bottom-8 right-8 flex items-center text-white/60">
        <div className="w-5 h-5 border-2 border-[#5e35b1] border-t-transparent rounded-full animate-spin mr-3"></div>
        <span className="text-sm">جاري التحميل...</span>
      </div>
      
      {/* Decorative lines */}
      <div className={`absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-[#5e35b1] to-transparent transition-all duration-1000 ${animationState !== 'initial' ? 'opacity-30 w-1/3' : 'opacity-0 w-0'}`}></div>
      <div className={`absolute top-0 right-0 w-1/3 h-px bg-gradient-to-l from-[#ff9800] to-transparent transition-all duration-1000 delay-200 ${animationState !== 'initial' ? 'opacity-30 w-1/3' : 'opacity-0 w-0'}`}></div>
      <div className={`absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-[#ff9800] to-transparent transition-all duration-1000 delay-400 ${animationState !== 'initial' ? 'opacity-30 w-1/3' : 'opacity-0 w-0'}`}></div>
      <div className={`absolute bottom-0 right-0 w-1/3 h-px bg-gradient-to-l from-[#5e35b1] to-transparent transition-all duration-1000 delay-600 ${animationState !== 'initial' ? 'opacity-30 w-1/3' : 'opacity-0 w-0'}`}></div>
      
      {/* Calligraphy decoration */}
      <div className={`absolute top-10 left-10 transition-all duration-1000 ease-out ${animationState === 'pattern' || animationState === 'logo' || animationState === 'text' ? 'opacity-30 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="text-[#5e35b1] text-6xl font-arabic transform -rotate-12">
          ٱلسَّلَامُ عَلَيْكُمْ
        </div>
      </div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              background: Math.random() > 0.5 ? '#5e35b1' : '#ff9800',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}