import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import AIAssistant from "@/components/ai-assistant";
import CulturalTransition from "@/components/cultural-transition";
import TouchControls from "@/components/touch-controls";
import StoreInteraction from "@/components/store-interaction";
import confetti from 'canvas-confetti';
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMovement } from "@/hooks/use-movement";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | undefined>();
  const [showTransition, setShowTransition] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque'>('arabesque');
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const [showTouchControls, setShowTouchControls] = useState(isMobile);
  const [immersiveMode, setImmersiveMode] = useState(false);
  
  // Initialize movement with useMovement hook
  const {
    position,
    rotation,
    isMoving,
    moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    rotate,
    resetPosition,
    setSpeed
  } = useMovement();
  
  // Get products
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Track viewed products for personalized recommendations
  useEffect(() => {
    if (products) {
      // Get random selection to simulate viewed items
      const randomSelection = [...products]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setViewedProducts(randomSelection);
    }
  }, [products]);
  
  // Function to trigger cultural transition
  const triggerTransition = (style: 'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque', destination?: string) => {
    setTransitionStyle(style);
    setShowTransition(true);
    
    // If destination provided, navigate after transition finishes
    if (destination) {
      setTimeout(() => {
        setLocation(destination);
      }, 1200);
    }
  };
  
  // Function to trigger confetti celebration
  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  }

  // Handle movement direction for touch controls
  const handleMove = (direction: 'forward' | 'backward' | 'left' | 'right') => {
    switch (direction) {
      case 'forward':
        moveForward();
        break;
      case 'backward':
        moveBackward();
        break;
      case 'left':
        moveLeft();
        break;
      case 'right':
        moveRight();
        break;
    }
  };

  // Handle stop movement
  const handleStopMove = () => {
    // Movement will stop automatically when touch ends
    // This is just for additional cleanup if needed
  };

  // Handle camera rotation
  const handleLook = (deltaX: number, deltaY: number) => {
    rotate(deltaX, deltaY);
  };
  
  // Function to toggle immersive mode (replaces VR mode)
  const toggleImmersiveMode = () => {
    setImmersiveMode(prev => !prev);
    setShowTouchControls(isMobile || !showTouchControls);
    setAiInitialQuestion(immersiveMode ? undefined : "كيف أستخدم تجربة التفاعلية؟");
    triggerCelebration();
    
    // Enhanced immersive mode experience
    if (!immersiveMode) {
      // Reset position when entering immersive mode
      resetPosition();
      
      // Add some sound effects for immersion if the browser supports it
      try {
        const audio = new Audio();
        audio.src = "/sounds/ambience.mp3"; // This would need to be added to public folder
        audio.volume = 0.2;
        audio.loop = true;
        audio.play().catch(e => console.log("Audio autoplay blocked by browser policy"));
      } catch (e) {
        console.log("Audio not supported");
      }
      
      // Apply fullscreen for better immersion on supported browsers
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(e => console.log("Fullscreen request failed"));
        }
      } catch (e) {
        console.log("Fullscreen not supported");
      }
    } else {
      // Exit fullscreen when leaving immersive mode
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(e => console.log("Exit fullscreen failed"));
        }
      } catch (e) {
        console.log("Exit fullscreen not supported");
      }
    }
    
    // Scroll to top when toggling mode
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      } 
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <>
      {/* Cultural transition overlay */}
      <CulturalTransition 
        show={showTransition} 
        style={transitionStyle} 
        onFinish={() => setShowTransition(false)} 
      />
      
      {/* AI Assistant - always available */}
      <AIAssistant 
        initialQuestion={aiInitialQuestion} 
        viewedProducts={viewedProducts}
        minimized={false} 
      />
      
      {/* Main content */}
      {(
        <div className="container mx-auto px-4 py-6">
          {/* Profile Summary - Only shown when logged in */}
          {user && (
            <motion.div 
              className="bg-gradient-to-br from-black/80 via-purple-950/30 to-indigo-950/30 backdrop-blur-md rounded-2xl p-6 mb-10 overflow-hidden border border-white/10 shadow-2xl relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-500 p-1 relative overflow-hidden">
                  <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center">
                    <i className="fas fa-user text-white text-2xl"></i>
                  </div>
                </div>
                
                {/* User Info */}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {user?.fullName || user?.username}
                  </h2>
                  <p className="text-white/70 text-sm">{user?.email || 'user@example.com'}</p>
                </div>
                
                {/* Immersive Mode Button */}
                <div className="ml-auto">
                  <Button 
                    onClick={toggleImmersiveMode}
                    aria-label="دخول بلدة الأمريكي التفاعلية"
                    className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-5 py-2 h-auto shadow-lg shadow-purple-600/30 transform transition-all duration-300 hover:scale-105 overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
                    <span className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <i className="fas fa-cube text-lg"></i>
                      <span className="font-bold">دخول بلدة الأمريكي</span>
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Smart Hero Section - Interactive Town Focus */}
          <motion.div 
            ref={heroRef}
            className="relative mb-12 overflow-hidden rounded-2xl"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            {/* Enhanced futuristic background with digital patterns */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-fuchsia-900/90 overflow-hidden">
              {/* Digital circuit pattern */}
              <div className="absolute inset-0 opacity-10"
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                     backgroundSize: '80px 80px'
                   }}
              ></div>

              {/* Futuristic glow effects */}
              <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 filter blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/10 filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
              
              {/* Scanning line effect */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'linear-gradient(to bottom, transparent, transparent 50%, rgba(170, 0, 255, 0.3) 50%, transparent 50.5%)',
                  backgroundSize: '100% 120px',
                  animation: 'scanline 6s linear infinite'
                }}
              ></div>
            </div>
            
            {/* Content with proper spacing and hierarchy */}
            <div className="relative py-20 px-6 md:px-12 z-10">
              <motion.div 
                className="text-center mb-10 hero-element"
                variants={fadeInUp}
              >
                {/* Main Title with Modern Styling */}
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
                  بلدة الأمريكي
                  <span className="inline-block mx-2 px-3 py-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-md text-white">3D</span>
                </h1>
                
                <div className="flex justify-center mb-6">
                  <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                    أول مدينة أعمال تفاعلية ثلاثية الأبعاد متكاملة في العالم العربي
                  </div>
                </div>
                
                {/* Realistic description with better styling */}
                <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-10 leading-relaxed font-normal bg-black/20 backdrop-blur-sm p-5 rounded-xl border border-white/10">
                  تجربة بلدة الأمريكي التفاعلية ثلاثية الأبعاد الأولى من نوعها، حيث يمكنك استكشاف المباني المختلفة لمتاجر الإلكترونيات وشركات السفر ومحلات الملابس في بيئة غامرة
                </p>
                
                {/* Single prominent immersive button */}
                <motion.div
                  variants={fadeInUp}
                  className="flex justify-center"
                >
                  <Button 
                    onClick={toggleImmersiveMode}
                    aria-label="دخول البلدة التفاعلية الذكية"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-10 py-8 h-auto text-xl md:text-2xl w-full sm:w-auto rounded-2xl shadow-2xl shadow-purple-900/40 transform transition-all duration-300 hover:scale-105 hover:shadow-purple-600/50 relative overflow-hidden group border border-white/20"
                  >
                    {/* Interior glow effects */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform"></div>
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Animated border */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-border-tl"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-border-tr"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-border-bl"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-border-br"></div>
                    </div>
                    
                    {/* 3D Text and Icon */}
                    <div className="relative z-10 flex items-center justify-center gap-4 transition-transform duration-300 group-hover:scale-105">
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-sm">
                        <i className="fas fa-cube text-3xl drop-shadow-lg"></i>
                      </div>
                      <span className="drop-shadow-md text-shadow-lg">دخول البلدة التفاعلية الذكية</span>
                    </div>
                    
                    {/* Pulsing accent indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white/40 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-white animate-pulse-fast"></div>
                    </div>
                  </Button>
                </motion.div>
                
                {/* Compact realistic stats showcase */}
                <div className="flex justify-center mt-10">
                  <motion.div 
                    className="flex flex-wrap justify-center gap-4 max-w-3xl"
                    variants={fadeInUp}
                  >
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <div className="text-xl font-bold text-blue-300">+30</div>
                      <div className="text-white/70 text-sm">منتج متنوع</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <div className="text-xl font-bold text-purple-300">3</div>
                      <div className="text-white/70 text-sm">أقسام رئيسية</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <div className="text-xl font-bold text-pink-300">+10</div>
                      <div className="text-white/70 text-sm">مبنى تفاعلي</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}