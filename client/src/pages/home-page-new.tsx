import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useVR } from "@/hooks/use-vr";
import { Button } from "@/components/ui/button";
import AIAssistant from "@/components/ai-assistant";
import CulturalTransition from "@/components/cultural-transition";
import confetti from 'canvas-confetti';
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { vrEnabled, toggleVR } = useVR();
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | undefined>();
  const [showTransition, setShowTransition] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque'>('arabesque');
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Get products
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Set initial AI assistant question based on VR mode
  // Also handle VR town redirection
  useEffect(() => {
    if (vrEnabled) {
      setAiInitialQuestion("كيف يمكنني استكشاف بلدة الأمريكي الافتراضية؟");
      // Redirect to the American-style VR town
      setLocation("/virtual-city");
    } else {
      setAiInitialQuestion(undefined);
    }
  }, [vrEnabled, products, setLocation]);
  
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
        minimized={!vrEnabled} 
      />
      
      {/* VR Town Experience - Redirect to American-style VR town */}
      {/* Redirection is now handled in the main useEffect above */}
      
      {/* Only show regular content when VR is disabled */}
      {!vrEnabled && (
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
                
                {/* VR Button */}
                <div className="ml-auto">
                  <Button 
                    onClick={toggleVR}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white"
                  >
                    <i className="fas fa-vr-cardboard mr-2"></i>
                    دخول بلدة الأمريكي
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Smart Hero Section - VR Town Focus */}
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
                  <span className="inline-block mx-2 px-3 py-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-md text-white">VR</span>
                </h1>
                
                <div className="flex justify-center mb-6">
                  <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                    أول مدينة أعمال افتراضية ذكية متكاملة في العالم العربي
                  </div>
                </div>
                
                {/* Realistic description with better styling */}
                <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-10 leading-relaxed font-normal bg-black/20 backdrop-blur-sm p-5 rounded-xl border border-white/10">
                  تجربة بلدة الأمريكي الافتراضية الذكية الأولى من نوعها، حيث يمكنك استكشاف المباني المختلفة لمتاجر الإلكترونيات وشركات السفر ومحلات الملابس في بيئة ثلاثية الأبعاد تفاعلية
                </p>
                
                {/* Single prominent VR button */}
                <motion.div
                  variants={fadeInUp}
                  className="flex justify-center"
                >
                  <Button 
                    onClick={() => {
                      triggerCelebration();
                      toggleVR();
                      setAiInitialQuestion("كيف أستخدم تجربة الواقع الافتراضي؟");
                      setTimeout(() => window.scrollTo(0, 0), 100);
                    }}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-10 py-6 h-auto text-xl md:text-2xl w-full sm:w-auto rounded-2xl shadow-xl shadow-purple-900/40 transform transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center gap-4">
                      <i className="fas fa-vr-cardboard text-3xl"></i>
                      <span>دخول البلدة الافتراضية الذكية</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform"></div>
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