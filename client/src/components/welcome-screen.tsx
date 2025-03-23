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
      {/* Canvas for confetti effect */}
      <canvas 
        ref={confettiRef} 
        className="absolute inset-0 z-30 pointer-events-none"
      ></canvas>
      
      {/* Futuristic grid background */}
      <div 
        className={`absolute inset-0 opacity-0 transition-opacity duration-1000 ${animationState !== 'initial' ? 'opacity-10' : ''}`}
        style={{
          backgroundImage: `linear-gradient(#5e35b120 1px, transparent 1px), linear-gradient(90deg, #5e35b120 1px, transparent 1px)`,
          backgroundSize: '25px 25px',
          perspective: '1000px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'center top',
        }}
      ></div>
      
      {/* Dynamic radial gradient */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1500"
          style={{
            background: 'radial-gradient(circle at center, rgba(94, 53, 177, 0.3) 0%, rgba(7, 3, 20, 0) 70%)',
            animation: 'pulse 8s ease-in-out infinite'
          }}
        ></div>
      </div>
      
      {/* Arabic geometric patterns - More elaborate */}
      <div className={`absolute inset-0 transition-opacity duration-1500 delay-300 ${animationState === 'initial' ? 'opacity-0' : 'opacity-30'}`}>
        {/* Top left arabesque pattern */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 overflow-hidden opacity-40">
          <div className="w-full h-full rotate-45 transform-gpu animate-pattern-rotate">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <defs>
                <pattern id="arabesque1" patternUnits="userSpaceOnUse" width="100" height="100">
                  <path fill="none" stroke="#5e35b1" strokeWidth="0.5" d="M0,50 C25,0 75,0 100,50 C75,100 25,100 0,50 Z M0,0 C50,25 50,75 0,100 M100,0 C50,25 50,75 100,100" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="300" height="300" fill="url(#arabesque1)" />
            </svg>
          </div>
        </div>
        
        {/* Top right arabesque pattern */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 overflow-hidden opacity-40">
          <div className="w-full h-full -rotate-45 transform-gpu animate-pattern-rotate" style={{ animationDirection: 'reverse' }}>
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <defs>
                <pattern id="arabesque2" patternUnits="userSpaceOnUse" width="100" height="100">
                  <path fill="none" stroke="#ff9800" strokeWidth="0.5" d="M0,50 C25,0 75,0 100,50 C75,100 25,100 0,50 Z M0,0 C50,25 50,75 0,100 M100,0 C50,25 50,75 100,100" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="300" height="300" fill="url(#arabesque2)" />
            </svg>
          </div>
        </div>
        
        {/* Bottom left arabesque pattern */}
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 overflow-hidden opacity-40">
          <div className="w-full h-full -rotate-45 transform-gpu animate-pattern-rotate" style={{ animationDuration: '35s' }}>
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <defs>
                <pattern id="arabesque3" patternUnits="userSpaceOnUse" width="100" height="100">
                  <path fill="none" stroke="#ff9800" strokeWidth="0.5" d="M0,50 C25,0 75,0 100,50 C75,100 25,100 0,50 Z M0,0 C50,25 50,75 0,100 M100,0 C50,25 50,75 100,100" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="300" height="300" fill="url(#arabesque3)" />
            </svg>
          </div>
        </div>
        
        {/* Bottom right arabesque pattern */}
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 overflow-hidden opacity-40">
          <div className="w-full h-full rotate-45 transform-gpu animate-pattern-rotate" style={{ animationDuration: '35s', animationDirection: 'reverse' }}>
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <defs>
                <pattern id="arabesque4" patternUnits="userSpaceOnUse" width="100" height="100">
                  <path fill="none" stroke="#5e35b1" strokeWidth="0.5" d="M0,50 C25,0 75,0 100,50 C75,100 25,100 0,50 Z M0,0 C50,25 50,75 0,100 M100,0 C50,25 50,75 100,100" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="300" height="300" fill="url(#arabesque4)" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Central Islamic Star Pattern - More intricate */}
      <div className={`w-80 h-80 transition-all duration-1500 delay-300 relative ${
        animationState === 'pattern' || animationState === 'calligraphy' || animationState === 'logo' || animationState === 'text'
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-50'
      }`}>
        {/* Rotating outer ring */}
        <div className="absolute inset-0 animate-spin-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5e35b1" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#ff9800" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#5e35b1" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="49" stroke="url(#ring-gradient)" strokeWidth="0.5" fill="none" />
            
            {/* Decorative dots around the circle */}
            {[...Array(24)].map((_, i) => {
              const angle = (i * 15) * Math.PI / 180;
              const x = 50 + 49 * Math.cos(angle);
              const y = 50 + 49 * Math.sin(angle);
              return (
                <circle key={i} cx={x} cy={y} r="0.5" fill={i % 2 === 0 ? "#5e35b1" : "#ff9800"} />
              );
            })}
          </svg>
        </div>
        
        {/* Main star pattern */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5e35b1" />
              <stop offset="100%" stopColor="#ff9800" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood floodColor="#5e35b1" floodOpacity="0.3" result="glow" />
              <feComposite in="glow" in2="blur" operator="in" result="glowBlur" />
              <feBlend in="SourceGraphic" in2="glowBlur" mode="overlay" />
            </filter>
          </defs>
          
          {/* Islamic 8-point star with more detailed design */}
          <g fill="url(#star-gradient)" fillRule="evenodd" filter="url(#glow)">
            <path d="M50,0 L61,35 L97,38 L69,62 L79,97 L50,79 L21,97 L31,62 L3,38 L39,35 Z" className="opacity-90" />
            <path d="M50,15 L58,40 L84,43 L64,60 L71,87 L50,73 L29,87 L36,60 L16,43 L42,40 Z" className="opacity-60" />
            <path d="M50,30 L55,45 L72,46 L59,57 L63,74 L50,65 L37,74 L41,57 L28,46 L45,45 Z" className="opacity-30" />
            
            {/* Central circle with pulsating effect */}
            <circle cx="50" cy="50" r="8" fill="white" className="opacity-90" style={{ animation: 'pulse 3s infinite' }} />
          </g>
          
          {/* Animated scanning line effect */}
          <line 
            x1="0" y1="50" x2="100" y2="50" 
            stroke="rgba(255,255,255,0.5)" 
            strokeWidth="0.5" 
            strokeDasharray="2,2"
            className="animate-scan-slow" 
          />
        </svg>
        
        {/* Holographic layers */}
        <div className="absolute inset-0 rounded-full holographic-bg opacity-20"></div>
        
        {/* Animated pulse rings */}
        <div className="absolute inset-0">
          <div className="absolute inset-8 rounded-full border border-purple-500/30 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-16 rounded-full border border-amber-500/20 animate-ping" style={{ animationDuration: '4s' }}></div>
          <div className="absolute inset-24 rounded-full border border-purple-500/10 animate-ping" style={{ animationDuration: '5s' }}></div>
        </div>
      </div>
      
      {/* Animated Arabic Calligraphy */}
      <div 
        className={`absolute transition-all duration-1000 ease-out ${
          animationState === 'calligraphy' || animationState === 'logo' || animationState === 'text'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90'
        }`}
        style={{ top: '25%' }}
      >
        <div className="animate-calligraphy-fade">
          <svg width="200" height="100" viewBox="0 0 200 100" className="opacity-80">
            <defs>
              <linearGradient id="calligraphy-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5e35b1" />
                <stop offset="100%" stopColor="#ff9800" />
              </linearGradient>
            </defs>
            <text 
              x="100" 
              y="60" 
              fontFamily="'Scheherazade New', serif" 
              fontSize="30" 
              fill="url(#calligraphy-gradient)" 
              textAnchor="middle"
            >
              ٱلسَّلَامُ عَلَيْكُمْ
            </text>
          </svg>
        </div>
      </div>
      
      {/* Logo / branding - Enhanced with futuristic elements */}
      <div 
        className={`absolute transition-all duration-1000 ease-out transform ${
          animationState === 'logo' || animationState === 'text'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90'
        }`}
      >
        <div className="relative">
          {/* Glitch effect lines */}
          <div className="absolute top-0 left-0 right-0 bottom-0 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5e35b1] to-[#9c27b0] mt-44 transform" style={{ clipPath: 'inset(10% 0 70% 0)', transform: 'translate(-2px, 2px)' }}>
            أمريكي مول
          </div>
          <div className="absolute top-0 left-0 right-0 bottom-0 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff9800] to-[#ffeb3b] mt-44 transform" style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translate(2px, -2px)' }}>
            أمريكي مول
          </div>
          
          {/* Main text with shimmer effect */}
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5e35b1] to-[#ff9800] mt-44 relative animate-shimmer">
            أمريكي مول
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-[#5e35b1] to-transparent opacity-70"></div>
          </h1>
          
          {/* Secondary branding line */}
          <div className="text-center mt-2 text-sm text-white/50">الواقع الافتراضي للتسوق المستقبلي</div>
        </div>
      </div>
      
      {/* Welcome Text with Arabic cultural elements - Enhanced with interactive elements */}
      <div 
        className={`max-w-3xl text-center mt-60 transition-all duration-1000 ease-out px-6 ${
          animationState === 'text'
            ? 'opacity-100 transform-none'
            : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Message with hovering effect */}
        <div className="relative group">
          <p className="text-xl text-white/80 mb-6 transition-transform duration-300 group-hover:scale-105">
            أهلاً بك في تجربة تسوق فريدة من نوعها، حيث يلتقي التراث العربي بتكنولوجيا المستقبل
          </p>
          
          {/* Subtle glow on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#5e35b1]/0 via-[#5e35b1]/5 to-[#ff9800]/0 opacity-0 group-hover:opacity-100 rounded-lg blur-lg transition-opacity duration-500"></div>
        </div>
        
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 my-8 relative">
          <div className="h-px bg-gradient-to-r from-transparent via-[#5e35b1]/50 to-transparent flex-1 animate-shimmer"></div>
          
          {/* Central geometric symbol */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#5e35b1] opacity-30 rounded-full animate-pulse"></div>
            <svg width="24" height="24" viewBox="0 0 24 24" className="relative z-10">
              <polygon points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10" fill="url(#star-gradient)" />
            </svg>
          </div>
          
          <div className="h-px bg-gradient-to-r from-transparent via-[#ff9800]/50 to-transparent flex-1 animate-shimmer" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        {/* Feature highlights with futuristic treatment */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors">
            <i className="fas fa-vr-cardboard text-[#5e35b1] text-xl mb-2"></i>
            <p className="text-white/60 text-sm">تجربة واقع افتراضي ثلاثية الأبعاد</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors">
            <i className="fas fa-shopping-bag text-[#ff9800] text-xl mb-2"></i>
            <p className="text-white/60 text-sm">تسوق سلس ومريح</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors">
            <i className="fas fa-users text-[#5e35b1] text-xl mb-2"></i>
            <p className="text-white/60 text-sm">تواصل مع مجتمع المتسوقين</p>
          </div>
        </div>
        
        {/* User welcome message with enhanced visual treatment */}
        {user ? (
          <div className="mt-4 bg-gradient-to-r from-[#5e35b1]/20 to-[#ff9800]/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#5e35b1] to-[#ff9800] font-semibold">
              مرحباً بعودتك، {user.fullName || user.username}!
            </p>
          </div>
        ) : null}
      </div>
      
      {/* Enhanced Skip button */}
      <Button
        onClick={handleSkip}
        variant="outline"
        className="absolute bottom-8 left-8 text-white/70 hover:text-white border-[#5e35b1]/50 hover:border-[#5e35b1] hover:bg-[#5e35b1]/10 transition-all group"
      >
        <span className="relative z-10">تخطي</span>
        <i className="fas fa-forward ml-2 group-hover:animate-pulse"></i>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#5e35b1]/0 via-[#5e35b1]/10 to-[#5e35b1]/0 rounded"></div>
      </Button>
      
      {/* Enhanced Loading indicator */}
      <div className="absolute bottom-8 right-8 flex items-center">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#5e35b1]/30"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-[#5e35b1] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border border-t-[#ff9800] border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
        <span className="text-sm text-white/60 mr-3">جاري تحميل عالم التسوق...</span>
      </div>
      
      {/* Enhanced Decorative lines with animation */}
      <div className={`absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-[#5e35b1] to-transparent transition-all duration-1000 ${animationState !== 'initial' ? 'opacity-30 w-1/3' : 'opacity-0 w-0'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}></div>
      <div className={`absolute top-0 right-0 w-1/3 h-1 bg-gradient-to-l from-[#ff9800] to-transparent transition-all duration-1000 delay-200 ${animationState !== 'initial' ? 'opacity-30 w-1/3' : 'opacity-0 w-0'}`} style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0 100%)' }}></div>
      <div className={`absolute bottom-0 left-0 w-1/3 h-1 bg-gradient-to-r from-[#ff9800] to-transparent transition-all duration-1000 delay-400 ${animationState !== 'initial' ? 'opacity-30 w-1/3' : 'opacity-0 w-0'}`} style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0 100%)' }}></div>
      <div className={`absolute bottom-0 right-0 w-1/3 h-1 bg-gradient-to-l from-[#5e35b1] to-transparent transition-all duration-1000 delay-600 ${animationState !== 'initial' ? 'opacity-30 w-1/3' : 'opacity-0 w-0'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}></div>
      
      {/* Radial highlight points */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-[#5e35b1]/20 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-to-r from-[#ff9800]/10 to-transparent rounded-full blur-xl"></div>
      </div>
      
      {/* Enhanced animated particles with trail effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: Math.random() > 0.5 ? '#5e35b1' : '#ff9800',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.1,
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: Math.random() > 0.7 ? `0 0 8px ${Math.random() > 0.5 ? '#5e35b1' : '#ff9800'}` : 'none',
            }}
          >
            {/* Particle trail */}
            <div 
              className="absolute w-full h-full rounded-full opacity-50"
              style={{
                boxShadow: `0 0 10px 2px ${Math.random() > 0.5 ? '#5e35b1' : '#ff9800'}`,
                animation: 'pulse 2s infinite',
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}