import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { useVR } from "@/hooks/use-vr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VRTown from "@/components/vr-town";
import AIAssistant from "@/components/ai-assistant";
import CulturalTransition from "@/components/cultural-transition";
import BrandsSection from "@/components/brands-section";
import confetti from 'canvas-confetti';
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import AiShoppingAssistant from "@/components/ai-shopping-assistant";
import AIVoiceControls from "@/components/ai-voice-controls";
import PersonalizedRecommendations from "@/components/personalized-recommendations";
import { RocketIcon, BrainCircuitIcon, PencilRulerIcon, SparklesIcon, Bot, Search, MicIcon, ShoppingCart, Wallet, Zap, BuildingIcon, Compass, CalendarIcon } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { vrEnabled, gestureControlEnabled, soundEffectsEnabled, toggleVR, toggleGestureControl, toggleSoundEffects } = useVR();
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | undefined>();
  const [showTransition, setShowTransition] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque'>('arabesque');
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeAiTab, setActiveAiTab] = useState("voice-ai");
  const [voiceCommandActive, setVoiceCommandActive] = useState(false);
  const [pulsatingMic, setPulsatingMic] = useState(false);
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: promotedProducts } = useQuery<Product[]>({
    queryKey: ['/api/products/promoted'],
  });
  
  const { data: rewards } = useQuery({
    queryKey: ['/api/rewards'],
  });
  
  const categories = [
    { id: 1, name: "إلكترونيات", icon: "laptop", color: "bg-blue-500", gradientFrom: "from-blue-900/40", gradientTo: "to-blue-700/40", borderColor: "border-blue-500/20" },
    { id: 2, name: "ملابس", icon: "tshirt", color: "bg-pink-500", gradientFrom: "from-pink-900/40", gradientTo: "to-pink-700/40", borderColor: "border-pink-500/20" },
    { id: 3, name: "سفر", icon: "plane", color: "bg-cyan-500", gradientFrom: "from-cyan-900/40", gradientTo: "to-cyan-700/40", borderColor: "border-cyan-500/20" },
    { id: 4, name: "إكسسوارات", icon: "gem", color: "bg-lime-500", gradientFrom: "from-lime-900/40", gradientTo: "to-lime-700/40", borderColor: "border-lime-500/20" }
  ];
  
  // AI tools offered
  const aiTools = [
    { id: "voice-ai", name: "الذكاء الصوتي", icon: MicIcon, description: "تحدث مع المساعد الذكي للبحث والتسوق", color: "bg-indigo-500" },
    { id: "shop-ai", name: "مساعد التسوق", icon: ShoppingCart, description: "توصيات مخصصة لتسوق أفضل", color: "bg-pink-500" },
    { id: "vr-ai", name: "مساعد الواقع الافتراضي", icon: Compass, description: "استكشف بلدة الأمريكي بشكل تفاعلي", color: "bg-teal-500" },
    { id: "smart-search", name: "بحث ذكي", icon: Search, description: "ابحث عن المنتجات باستخدام وصف طبيعي", color: "bg-amber-500" },
  ];
  
  // Calculate points progress
  const currentPoints = user?.points || 0;
  const nextRewardLevel = 1000;
  const progressPercentage = Math.min(100, (currentPoints / nextRewardLevel) * 100);
  
  // Set initial AI assistant question based on VR mode
  useEffect(() => {
    if (vrEnabled) {
      setAiInitialQuestion("كيف يمكنني استكشاف بلدة الأمريكي الافتراضية؟");
    } else {
      setAiInitialQuestion(undefined);
    }
  }, [vrEnabled]);
  
  // Track viewed products for personalized recommendations
  useEffect(() => {
    if (products) {
      // Get random featured products to simulate viewed items
      const randomSelection = [...products]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setViewedProducts(randomSelection);
    }
  }, [products]);
  
  // Simulated voice command activation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (voiceCommandActive) {
      setPulsatingMic(true);
      timer = setTimeout(() => {
        setPulsatingMic(false);
        setVoiceCommandActive(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [voiceCommandActive]);
  
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
  
  // Function to simulate voice command activation
  const activateVoiceCommand = () => {
    setVoiceCommandActive(true);
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
        minimized={!vrEnabled} 
      />
      
      {/* VR Town Experience */}
      {vrEnabled && products && <VRTown products={products} />}
      
      {/* Only show regular content when VR is disabled */}
      {!vrEnabled && (
        <div className="container mx-auto px-4 py-6">
          {/* User Profile Section - Only shown when logged in */}
          {user && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Profile Avatar and Name */}
                <div className="text-center md:text-right">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-full mx-auto md:mx-0 mb-3 flex items-center justify-center shadow-lg">
                    <i className="fas fa-user text-white text-4xl"></i>
                  </div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-fuchsia-100">
                    {user?.fullName || user?.username}
                  </h2>
                  <p className="text-white/70">{user?.email}</p>
                </div>
                
                {/* User Stats */}
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">نقاط الولاء</span>
                      <span className="text-lg font-bold text-fuchsia-300">{user.points} نقطة</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 bg-white/10" 
                      style={{
                        background: "linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.1))",
                      }}
                    />
                    <div className="flex justify-between mt-1 text-xs text-white/60">
                      <span>{user.points} نقطة</span>
                      <span>المستوى التالي: {nextRewardLevel} نقطة</span>
                    </div>
                  </div>
                  
                  {/* VR Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="flex items-center text-sm">
                          <i className="fas fa-vr-cardboard ml-2"></i>
                          الواقع الافتراضي
                        </label>
                        <Switch checked={vrEnabled} onCheckedChange={toggleVR} />
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="flex items-center text-sm">
                          <i className="fas fa-hand-pointer ml-2"></i>
                          إيماءات التحكم
                        </label>
                        <Switch checked={gestureControlEnabled} onCheckedChange={toggleGestureControl} />
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="flex items-center text-sm">
                          <i className="fas fa-volume-up ml-2"></i>
                          المؤثرات الصوتية
                        </label>
                        <Switch checked={soundEffectsEnabled} onCheckedChange={toggleSoundEffects} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                      onClick={() => triggerTransition('arabesque', '/rewards')}
                    >
                      <i className="fas fa-medal ml-2"></i>
                      مكافآتي
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                    >
                      <i className="fas fa-shopping-bag ml-2"></i>
                      طلباتي
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                    >
                      <i className="fas fa-heart ml-2"></i>
                      المفضلة
                    </Button>
                    {logoutMutation && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500/30 text-red-300 hover:bg-red-900/20"
                        onClick={() => logoutMutation.mutate()}
                      >
                        <i className="fas fa-sign-out-alt ml-2"></i>
                        تسجيل الخروج
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Hero Section with Arabesque Pattern Background */}
          <motion.div 
            ref={heroRef}
            className="relative mb-12 overflow-hidden rounded-2xl"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            {/* Enhanced futuristic background with arabesque patterns */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/90 via-purple-900/90 to-indigo-900/90 overflow-hidden">
              {/* Arabesque pattern overlay */}
              <div className="absolute inset-0 opacity-15" 
                   style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                     backgroundSize: '30px 30px'
                   }}
              ></div>
              
              {/* Digital circuit pattern */}
              <div className="absolute inset-0 opacity-5"
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                     backgroundSize: '80px 80px'
                   }}
              ></div>

              {/* Advanced glowing orbs with gradients */}
              <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 filter blur-3xl animate-pulse-slow"></div>
              <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-gradient-to-tr from-fuchsia-500/20 to-indigo-500/10 filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
              
              {/* Futuristic scanning line */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  background: 'linear-gradient(to bottom, transparent, transparent 50%, rgba(170, 0, 255, 0.2) 50%, transparent 50.5%)',
                  backgroundSize: '100% 120px',
                  animation: 'scanline 6s linear infinite'
                }}
              ></div>
              
              {/* Holographic dots */}
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-float1 z-20"></div>
              <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-float2 z-20"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float3 z-20"></div>
              <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-float1 z-20"></div>
            </div>
            
            <div className="relative py-16 px-6 md:px-12 z-10">
              <motion.div 
                className="text-center mb-8 hero-element"
                variants={fadeInUp}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-fuchsia-200">
                  بلدة الأمريكي
                  <span className="inline-block mx-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white">VR</span>
                </h1>
                
                <div className="flex justify-center mb-4">
                  <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                    أول مدينة أعمال افتراضية متكاملة في العالم العربي
                  </div>
                </div>
                
                <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-6 leading-relaxed font-normal bg-gradient-to-r from-black/40 to-black/40 backdrop-blur-sm p-4 rounded-lg">
                  اكتشف بلدة الأمريكي، المدينة الافتراضية المتكاملة للأعمال حيث تجتمع متاجر الهواتف والأجهزة الإلكترونية، وكالات السفر والطيران، الفنادق، متاجر الملابس والإكسسوارات في عالم افتراضي ثلاثي الأبعاد
                </p>
                
                {/* Hero buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-8 hero-element"
                  variants={fadeInUp}
                >
                  <Button 
                    onClick={() => {
                      triggerCelebration();
                      toggleVR();
                      setAiInitialQuestion("كيف أستخدم تجربة الواقع الافتراضي؟");
                      setTimeout(() => window.scrollTo(0, 0), 100);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 h-auto text-lg w-full sm:w-auto rounded-full shadow-lg shadow-purple-900/30 transform transition-transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <i className="fas fa-vr-cardboard text-2xl"></i>
                      <span>ابدأ تجربة الواقع الافتراضي</span>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => triggerTransition('arabesque', '/rewards')}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-4 h-auto text-lg w-full sm:w-auto rounded-full shadow-lg shadow-amber-900/30 transform transition-transform hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="relative">
                        <i className="fas fa-medal text-2xl"></i>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                      </div>
                      <span>برنامج الولاء التفاعلي</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform duration-1000"></div>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-2 border-purple-500/40 hover:bg-purple-500/20 px-8 py-4 h-auto w-full sm:w-auto text-lg rounded-full transform transition-transform hover:scale-105"
                    onClick={() => window.location.href = '/auth'}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <i className="fas fa-user text-xl"></i>
                      <span>تسجيل الدخول</span>
                    </div>
                  </Button>
                </motion.div>
                
                {/* Stats counter */}
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 text-center hero-element"
                  variants={fadeInUp}
                >
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-fuchsia-300 mb-1">+500</div>
                    <div className="text-white/70 text-sm">منتج عالمي</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-fuchsia-300 mb-1">+50</div>
                    <div className="text-white/70 text-sm">ماركة عالمية</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-fuchsia-300 mb-1">+60</div>
                    <div className="text-white/70 text-sm">متجر افتراضي</div>
                  </div>
                  <div className="hidden md:block bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-fuchsia-300 mb-1">+10K</div>
                    <div className="text-white/70 text-sm">مستخدم نشط</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Featured Ad Banner - Carousel with Arabic Cultural Elements */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Carousel 
              className="w-full rounded-xl overflow-hidden"
              opts={{
                loop: true,
                align: "start",
              }}
            >
              <CarouselContent>
                {/* Ad Slide 1 */}
                <CarouselItem className="md:basis-full">
                  <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                    {/* Background gradient with arabesque pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-900">
                      <div className="absolute inset-0 opacity-10" 
                           style={{ 
                             backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
                           }}
                      ></div>
                    </div>
                    
                    <div className="relative h-full flex flex-col justify-center items-center md:items-end text-center md:text-right p-8 md:p-12 z-10">
                      {/* Offer badge */}
                      <div className="absolute top-6 right-6 bg-white rounded-full px-4 py-1 text-purple-900 font-bold text-sm">
                        عرض حصري
                      </div>
                      
                      <div className="md:max-w-[50%]">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-white">
                          احجز محلك التجاري في بلدة الأمريكي واحصل على خصم 30%
                        </h2>
                        
                        <p className="text-white/80 mb-6 md:text-lg">
                          عروض حصرية لأصحاب الأعمال والمستثمرين للانضمام إلى أول مدينة أعمال افتراضية متكاملة في العالم العربي
                        </p>
                        
                        <Button className="bg-white text-purple-900 hover:bg-white/90 font-bold px-8 py-3 h-auto text-lg rounded-full">
                          اشترك الآن
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                
                {/* Ad Slide 2 */}
                <CarouselItem className="md:basis-full">
                  <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-fuchsia-900">
                      <div className="absolute inset-0 opacity-10" 
                           style={{ 
                             backgroundImage: `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` 
                           }}
                      ></div>
                    </div>
                    
                    <div className="relative h-full flex flex-col justify-center items-center md:items-start text-center md:text-left p-8 md:p-12 z-10">
                      {/* Animated badge */}
                      <div className="absolute top-6 left-6 bg-yellow-400 rounded-full px-4 py-1 text-indigo-900 font-bold text-sm animate-pulse">
                        لفترة محدودة
                      </div>
                      
                      <div className="md:max-w-[50%]">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-white">
                          تجربة الواقع الافتراضي الحصرية للمتاجر والأعمال
                        </h2>
                        
                        <p className="text-white/80 mb-6 md:text-lg">
                          افتح متجرًا للأزياء، وكالة سفر، محل أجهزة الكترونية، فندقًا أو أي نوع من الأعمال في بلدة الأمريكي وابدأ تجارتك الرقمية
                        </p>
                        
                        <Button className="bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-900 hover:from-yellow-500 hover:to-amber-600 font-bold px-8 py-3 h-auto text-lg rounded-full">
                          اكتشف الآن
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                
                {/* Ad Slide 3 */}
                <CarouselItem className="md:basis-full">
                  <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900 to-teal-600">
                      <div className="absolute inset-0 opacity-10" 
                           style={{ 
                             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264.888-.14 1.005-.174 1.837-.938 2.45-2.102.84-1.61 1.455-3.956 1.532-6.936.012-.493-.022-1.05-.15-1.62-.164-.698-.4-1.134-.86-1.384-.48-.26-1.18-.262-1.95.03-.85.327-1.63 1.04-2.26 2.105-.67 1.157-1.18 2.635-1.53 4.307.5-.03 1.04-.053 1.61-.07.2-.5.48-.007.69.027.22.033.44.077.67.14.24.061.48.152.71.255.2.086.43.2.69.33.9.045.14.084.16.12.02.036.04.084.04.145 0 .112-.06.223-.19.333-.13.11-.28.193-.41.252-.13.06-.25.102-.4.12-.14.02-.29.023-.42.012-.18-.013-.38-.033-.56-.06-.44-.065-.86-.158-1.27-.28-.15 1.14-.29 2.22-.35 3.16-.43.07-.27.18-.6.357-.32.176-.66.372-1.05.592-.28.16-.57.337-.87.527-.15.095-.3.194-.46.297-.15.104-.3.214-.47.328-.17.114-.33.235-.51.36-.17.128-.33.256-.49.39-.16.13-.32.275-.47.422-.15.147-.29.3-.42.455-.13.155-.25.322-.37.488-.09.138-.19.294-.27.458-.08.163-.15.326-.22.486-.07.16-.13.32-.19.48-.06.16-.12.31-.17.462-.02.07-.05.156-.08.253-.03.097-.05.2-.08.305-.03.104-.05.21-.08.32-.02.107-.04.214-.06.323 4.85-.01 9.67-.04 14.48-.1 4.06-.05 8.1-.148 12.12-.284.12-.413.24-.838.35-1.274.11-.435.21-.88.29-1.33.08-.45.13-.9.18-1.356.04-.456.06-.91.06-1.363v-.38c-.02-.81-.08-1.63-.2-2.46-.11-.83-.28-1.67-.48-2.52-.2-.85-.44-1.7-.71-2.55-.27-.85-.57-1.7-.91-2.55-.33-.85-.7-1.67-1.11-2.47-.4-.8-.86-1.57-1.35-2.32-.49-.74-1.01-1.43-1.57-2.08s-1.16-1.24-1.82-1.77c-.66-.52-1.36-.97-2.11-1.31-.75-.34-1.54-.6-2.38-.74-.29-.05-.58-.09-.88-.12-.3-.03-.61-.04-.92-.04-.42 0-.83.02-1.24.08-.42.05-.82.13-1.2.25-.38.12-.75.28-1.1.48-.34.19-.65.44-.94.72-.14.15-.27.31-.38.48.38-.02.79-.04 1.21-.05.42-.01.85-.02 1.3-.02 1.86-.01 3.84.02 5.92.08.67.02 1.34.04 2.03.06.68.03 1.38.06 2.08.1 1.4.08 2.85.17 4.34.28 1.5.11 3.03.23 4.58.36 1.55.13 3.13.27 4.72.41 1.6.15 3.21.3 4.83.46 0-.25-.02-.5-.05-.75-.03-.25-.06-.5-.1-.74-.08-.49-.18-.98-.29-1.45-.11-.47-.24-.95-.38-1.41-.07-.23-.14-.45-.21-.68-.07-.22-.15-.44-.22-.66-.15-.45-.32-.89-.49-1.32-.17-.43-.35-.85-.54-1.26-.19-.42-.39-.82-.6-1.22-.2-.39-.42-.77-.64-1.15-.22-.37-.44-.74-.67-1.1-.23-.36-.47-.71-.71-1.05-.24-.35-.49-.68-.74-1.01-.25-.33-.52-.65-.78-.97-.26-.31-.54-.61-.81-.91-.27-.3-.56-.59-.84-.87-.28-.29-.57-.56-.86-.83-.29-.27-.59-.53-.89-.78-.3-.25-.6-.49-.91-.73-.3-.24-.61-.47-.93-.7-.31-.22-.63-.44-.95-.66-.32-.21-.65-.42-.98-.62-.33-.2-.68-.4-1.02-.59l-.51-.28c-.17-.09-.34-.19-.52-.28-.65-.34-1.33-.67-2.02-.97-.69-.3-1.39-.59-2.1-.83-.72-.25-1.45-.47-2.19-.67-.74-.2-1.49-.36-2.24-.5-.38-.07-.76-.13-1.15-.17-.38-.05-.77-.09-1.16-.12-.77-.06-1.55-.1-2.33-.09-.78 0-1.56.03-2.33.12-.77.08-1.54.21-2.3.41-.71.18-1.4.43-2.05.75-.66.33-1.29.73-1.87 1.26-.57.53-1.1 1.2-1.56 2.05-.46.85-.85 1.87-1.12 3.08-.28 1.22-.42 2.66-.42 4.32 0 1.5.14 2.85.42 4.05.28 1.2.7 2.27 1.26 3.2.55.93 1.24 1.72 2.06 2.37.83.65 1.77 1.15 2.82 1.5 1.05.34 2.2.55 3.44.61 1.24.06 2.57-.02 3.97-.24 1.4-.22 2.87-.58 4.4-1.07 1.54-.49 3.14-1.1 4.78-1.85.11.55.27 1.06.47 1.53.2.47.45.9.72 1.26.28.37.59.67.92.9.33.23.68.37 1.05.42.37.05.77.01 1.17-.13.4-.13.82-.36 1.23-.67.42-.31.83-.7 1.23-1.15.4-.45.77-.97 1.13-1.54.35-.57.67-1.18.95-1.84.28-.65.51-1.34.69-2.05.18-.71.31-1.44.37-2.16.06-.73.04-1.45-.05-2.15-.09-.7-.28-1.38-.56-2.02-.28-.64-.65-1.24-1.09-1.78-.45-.55-.97-1.04-1.56-1.43-.25-.16-.51-.31-.77-.44-.27-.14-.54-.25-.82-.34-.29-.09-.58-.17-.88-.23-.3-.06-.6-.1-.9-.13-.31-.03-.61-.04-.92-.04-.3.01-.59.02-.88.04-.3.03-.59.06-.88.1-.29.05-.57.1-.86.16-.28.06-.57.12-.85.19-.28.07-.55.15-.83.22-.27.07-.55.15-.82.24-.27.08-.53.17-.8.25-.26.09-.53.18-.79.26-.38.14-.76.27-1.13.43-.37.15-.74.29-1.11.46-.37.16-.73.33-1.1.52-.36.18-.72.36-1.07.57-.53.29-1.07.6-1.6.92-.53.33-1.07.67-1.6 1.03-.52.36-1.05.73-1.57 1.12-.52.39-1.04.79-1.55 1.21-.51.42-1.02.85-1.51 1.3-.5.45-.99.91-1.48 1.38-.48.48-.96.97-1.42 1.48-.47.51-.93 1.03-1.38 1.57-.46.54-.9 1.1-1.33 1.67-.22.29-.43.58-.64.88-.2.3-.41.6-.6.91-.4.61-.78 1.24-1.13 1.88-.36.64-.69 1.29-1 1.95-.31.66-.6 1.33-.87 2.02-.27.68-.51 1.38-.74 2.09-.51 1.42-.88 2.88-1.13 4.39-.24 1.51-.36 3.05-.36 4.65 0 .92.04 1.8.12 2.64.08.84.18 1.63.32 2.39.14.76.32 1.48.52 2.18.2.69.43 1.36.69 2 .51 1.27 1.15 2.42 1.89 3.47.75 1.05 1.6 1.99 2.55 2.82.94.83 1.98 1.56 3.1 2.17 1.12.62 2.32 1.14 3.59 1.55.33.1.67.2 1.01.29.34.09.69.17 1.04.24.35.07.71.13 1.06.19.36.05.71.1 1.07.14.72.08 1.45.13 2.19.16.73.03 1.47.03 2.21.01.74-.02 1.48-.07 2.22-.14.74-.08 1.48-.19 2.21-.32.73-.13 1.46-.29 2.17-.48.72-.19 1.42-.41 2.11-.65.7-.24 1.37-.52 2.03-.81.66-.3 1.29-.62 1.9-.97s1.19-.74 1.75-1.15c.56-.42 1.09-.86 1.6-1.33.1-.09.19-.19.29-.28.09-.09.19-.19.28-.29.19-.19.38-.4.55-.61.17-.21.33-.43.49-.65.31-.44.59-.9.85-1.38.26-.49.49-.99.7-1.5.4-1.02.7-2.11.87-3.24.17-1.13.23-2.31.14-3.5-.06-.76-.19-1.5-.37-2.21-.19-.71-.43-1.39-.72-2.05-.72-1.31-1.63-2.46-2.65-3.46-.33-.33-.68-.64-1.03-.95-.36-.3-.73-.58-1.11-.86-.29-.2-.58-.4-.89-.59-.3-.19-.61-.36-.92-.54-.31-.17-.62-.34-.95-.5-.32-.15-.65-.29-.97-.43-.33-.14-.65-.26-.98-.38-.33-.12-.67-.23-1.01-.33-.34-.1-.69-.19-1.04-.27-.35-.08-.7-.15-1.06-.21-.36-.06-.72-.11-1.08-.15-.36-.04-.72-.07-1.09-.09-.37-.02-.74-.03-1.11-.03-.37 0-.73 0-1.1.01-.36.01-.72.03-1.08.05-.36.02-.71.05-1.06.08-.69.06-1.36.14-2.03.24-.67.11-1.32.23-1.97.38-.65.15-1.28.32-1.9.51-.61.2-1.21.41-1.79.64-.29.12-.57.24-.85.36-.28.13-.55.26-.82.39-.27.14-.53.28-.79.42-.26.15-.51.3-.76.45-.25.16-.49.32-.73.48-.23.16-.46.33-.69.49-.44.33-.87.68-1.29 1.04-.42.36-.82.75-1.21 1.14-.39.4-.75.81-1.1 1.24-.34.43-.66.88-.96 1.34-.29.46-.56.94-.8 1.42-.24.49-.46.99-.64 1.5-.18.5-.32 1.02-.43 1.54-.11.52-.18 1.05-.2 1.58-.02.53.01 1.06.07 1.58.06.52.17 1.04.32 1.54.15.5.34 1 .57 1.47.23.47.5.92.8 1.34.3.43.62.82.97 1.19.35.37.72.7 1.11.99.39.28.8.53 1.23.72.43.19.87.34 1.32.44.45.1.91.15 1.38.15.46 0 .93-.05 1.4-.15.46-.09.91-.24 1.35-.43.44-.2.86-.43 1.26-.71.4-.27.77-.59 1.12-.95.34-.36.66-.75.94-1.17.28-.42.52-.86.72-1.33.19-.47.35-.95.45-1.45.1-.5.16-1.03.16-1.55v-.08c0-.26-.01-.51-.04-.76-.03-.25-.06-.49-.11-.73-.09-.49-.22-.96-.38-1.41-.16-.45-.36-.87-.58-1.28-.23-.41-.48-.8-.75-1.16-.27-.36-.57-.7-.88-1.01-.31-.31-.64-.6-.99-.86-.34-.25-.71-.47-1.08-.66-.37-.19-.76-.35-1.16-.47-.4-.12-.81-.2-1.22-.25-.41-.05-.81-.06-1.22-.03-.4.02-.8.09-1.19.19-.39.1-.76.23-1.12.41-.36.17-.7.38-1.01.62-.31.25-.61.52-.88.82-.27.3-.52.62-.74.97-.23.35-.42.72-.59 1.11-.16.39-.29.8-.39 1.22-.09.42-.15.86-.17 1.29-.02.43.01.86.08 1.29.07.43.19.84.35 1.24.16.4.36.78.6 1.13.24.35.51.68.81.96.31.28.64.52 1.01.72.37.2.76.35 1.17.44.41.09.82.13 1.24.12.42-.01.84-.07 1.25-.16.41-.1.81-.24 1.19-.41.38-.18.74-.39 1.07-.64.33-.25.64-.53.92-.84.28-.31.53-.64.75-1 .21-.36.39-.74.52-1.13.13-.39.23-.8.27-1.2.05-.4.04-.81 0-1.2-.05-.4-.14-.78-.27-1.16-.03-.08-.06-.16-.09-.24s-.07-.16-.11-.24c-.08-.17-.17-.33-.26-.49-.1-.16-.2-.31-.31-.46-.15-.19-.29-.37-.45-.54Z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` 
                           }}
                      ></div>
                    </div>
                    
                    <div className="relative h-full flex items-center justify-center text-center p-8 md:p-12 z-10">
                      {/* Limited offer badge */}
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-1 text-emerald-900 font-bold text-sm">
                        جديد
                      </div>
                      
                      <div className="md:max-w-[80%]">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-white">
                          مساحات محدودة للإيجار في بلدة الأمريكي
                        </h2>
                        
                        <p className="text-white/80 mb-6 md:text-lg">
                          احجز محلك التجاري الخاص في بلدة الأمريكي واعرض خدماتك ومنتجاتك في أكبر مدينة أعمال افتراضية في المنطقة
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                          <Button 
                            className="bg-white text-emerald-900 hover:bg-white/90 font-bold px-8 py-3 h-auto rounded-full"
                            onClick={() => triggerTransition('cultural', '/store-rental')}
                          >
                            استأجر متجرك الآن
                          </Button>
                          
                          <Button 
                            variant="outline"
                            className="border-white hover:bg-white/10 text-white px-8 py-3 h-auto rounded-full"
                          >
                            تعرف على المزيد
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </motion.div>
          
          {/* Note about VR-only products */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="bg-gradient-to-r from-fuchsia-900/60 to-purple-900/60 backdrop-blur-md rounded-2xl p-6 border border-fuchsia-500/20 text-center">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4">
                <div className="text-4xl text-white">
                  <i className="fas fa-vr-cardboard"></i>
                </div>
                <div className="text-center md:text-right">
                  <h3 className="text-xl font-bold text-white mb-2">المنتجات متوفرة فقط داخل بلدة الأمريكي</h3>
                  <p className="text-white/80">لتصفح المنتجات والخدمات، يرجى الانتقال إلى تجربة الواقع الافتراضي</p>
                </div>
                <div>
                  <Button 
                    onClick={() => {
                      triggerCelebration();
                      toggleVR();
                      setAiInitialQuestion("كيف أستخدم تجربة الواقع الافتراضي؟");
                      setTimeout(() => window.scrollTo(0, 0), 100);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 h-auto rounded-full shadow-lg shadow-purple-900/30"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <i className="fas fa-vr-cardboard"></i>
                      <span>الدخول الآن</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Categories with Enhanced UI */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-fuchsia-500 to-purple-700 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">تصفح حسب الفئة</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Gamified Rewards Banner with AR Features */}
          {user && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div className="relative bg-gradient-to-r from-fuchsia-900/80 to-purple-900/80 backdrop-blur-md rounded-2xl p-6 border border-fuchsia-500/20 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-600/20 rounded-full filter blur-3xl"></div>
                
                <div className="relative z-10">
                  {/* Header with Level Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <i className="fas fa-medal text-yellow-400 text-2xl relative z-10"></i>
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 to-amber-500/30 rounded-full animate-pulse-slow"></div>
                      </div>
                      <div>
                        <h2 className="font-bold text-xl">برنامج الولاء التفاعلي</h2>
                        <div className="text-xs text-fuchsia-300">المستوى: رحالة أمريكي {Math.floor(currentPoints / 200) + 1}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-xl text-white">{currentPoints}</span>
                      <span className="text-fuchsia-400 mr-1 text-lg">نقطة</span>
                    </div>
                  </div>
                  
                  {/* Interactive Progress Bar */}
                  <div className="relative">
                    <Progress value={progressPercentage} className="h-3 bg-fuchsia-900/30" />
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                      <div className="w-full h-full opacity-50 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                          style={{backgroundSize: '200% 100%'}}></div>
                    </div>
                    {/* Achievement Markers on Progress Bar */}
                    {[25, 50, 75].map(marker => (
                      <div 
                        key={marker} 
                        className={`absolute top-0 bottom-0 w-1.5 bg-white/30 rounded-full
                                  ${progressPercentage >= marker ? 'bg-white' : 'bg-white/30'}`}
                        style={{left: `${marker}%`}}
                      >
                        <div className={`absolute -top-8 -translate-x-1/2 
                                      ${progressPercentage >= marker ? 'text-yellow-300' : 'text-white/50'}`}>
                          <i className="fas fa-star text-sm"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Rewards Information */}
                  <div className="flex justify-between text-sm mt-4 text-white/70">
                    <span>{currentPoints} / {nextRewardLevel}</span>
                    <span className="flex items-center">
                      <i className="fas fa-ticket-alt text-fuchsia-400 mr-1"></i>
                      المكافأة التالية: 
                      <span className="relative group mr-2">
                        <span className="text-yellow-300 underline decoration-dotted cursor-help">شارة AR حصرية</span>
                        <div className="absolute -top-24 right-0 w-48 p-2 bg-black/90 backdrop-blur-md rounded border border-fuchsia-500/30 
                                      invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 text-white text-xs z-50">
                          شارة AR تفاعلية يمكنك استخدامها في متجرك الافتراضي وعرضها للزوار
                          <div className="absolute w-2 h-2 bg-black/90 border-l border-b border-fuchsia-500/30 bottom-[-5px] right-4 transform rotate-45"></div>
                        </div>
                      </span>
                    </span>
                  </div>
                  
                  {/* Current Streak */}
                  <div className="mt-3 bg-gradient-to-r from-fuchsia-900/50 to-purple-900/50 p-2 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-fire text-orange-400"></i>
                      <span className="text-sm text-white/80">التتابع اليومي: <span className="text-white font-semibold">3 أيام</span></span>
                    </div>
                    <div className="text-xs px-2 py-1 bg-fuchsia-800/50 rounded-full text-white/80">
                      +5 نقاط إضافية على كل عملية
                    </div>
                  </div>
                  
                  {/* Latest Achievement */}
                  <div className="mt-3 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-lg p-2 flex items-center gap-3">
                    <div className="min-w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center">
                      <i className="fas fa-store text-white"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-indigo-300">الإنجاز الأخير</div>
                      <div className="text-sm text-white font-medium">زائر متميز لبلدة الأمريكي</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs bg-white/5 hover:bg-white/10 text-white/70">
                      <i className="fas fa-vr-cardboard mr-1.5"></i>
                      عرض AR
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-fuchsia-300 hover:text-fuchsia-200 hover:bg-fuchsia-900/20"
                    >
                      <i className="fas fa-map mr-2"></i>
                      خريطة التقدم
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-fuchsia-300 hover:text-fuchsia-200 hover:bg-fuchsia-900/20"
                      onClick={() => triggerTransition('arabesque', '/rewards')}
                    >
                      عرض جميع المكافآت <i className="fas fa-arrow-left mr-2"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Featured Brands Section */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-fuchsia-500 to-purple-700 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">تسوق حسب الماركة</h2>
            </div>
            
            <BrandsSection featuredOnly maxBrands={6} />
          </motion.div>
          
          {/* Large Sale Ad Banner */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <div className="relative bg-gradient-to-br from-purple-900 to-fuchsia-800 rounded-2xl overflow-hidden">
              {/* Arabesque pattern background */}
              <div className="absolute inset-0 opacity-10" 
                   style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                     backgroundSize: '20px 20px'
                   }}
              ></div>
              
              {/* Sale text */}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="text-[120px] md:text-[200px] font-bold text-white opacity-10 select-none">
                  SALE
                </div>
              </div>
              
              <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-6 md:mb-0 md:pr-12 text-center md:text-right">
                  <div className="inline-block bg-white text-purple-900 font-bold px-4 py-1 rounded-full text-sm mb-4">
                    خصم 20% على جميع المنتجات
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white leading-tight">
                    تخفيضات حصرية على منتجات الماركات العالمية
                  </h2>
                  
                  <p className="text-white/80 text-lg mb-6">
                    استخدم الكود: <span className="text-white font-bold bg-white/20 px-3 py-1 rounded-lg mx-1">AMRIKYY20</span> عند الدفع
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Button 
                      className="bg-white text-purple-900 hover:bg-white/90 font-bold px-8 py-3 h-auto text-lg rounded-full"
                      onClick={() => {
                        triggerCelebration();
                        setTimeout(() => window.scrollTo(0, 0), 100);
                      }}
                    >
                      تسوق الآن
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 px-8 py-3 h-auto text-lg rounded-full"
                    >
                      الشروط والأحكام
                    </Button>
                  </div>
                </div>
                
                {/* Countdown timer */}
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="text-white/80 text-lg mb-3">ينتهي العرض خلال</div>
                  
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                      <div className="text-2xl md:text-3xl font-bold text-white">05</div>
                      <div className="text-white/60 text-xs">أيام</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                      <div className="text-2xl md:text-3xl font-bold text-white">12</div>
                      <div className="text-white/60 text-xs">ساعات</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                      <div className="text-2xl md:text-3xl font-bold text-white">45</div>
                      <div className="text-white/60 text-xs">دقائق</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                      <div className="text-2xl md:text-3xl font-bold text-white">30</div>
                      <div className="text-white/60 text-xs">ثواني</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Footer CTA */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <div className="relative bg-gradient-to-r from-fuchsia-900/60 to-purple-900/60 backdrop-blur-md rounded-2xl p-10 border border-fuchsia-500/20 text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-fuchsia-600/30 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-600/30 rounded-full filter blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight max-w-3xl mx-auto">
                  استمتع بتجربة الأعمال الفريدة في بلدة الأمريكي الافتراضية
                </h2>
                
                <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                  ابدأ تجربة الأعمال الافتراضية الآن وافتح متجرك أو فندقك أو وكالة السفر الخاصة بك في أول مدينة أعمال عربية افتراضية
                </p>
                
                <Button 
                  onClick={() => {
                    triggerCelebration();
                    toggleVR();
                    setAiInitialQuestion("كيف أستخدم تجربة الواقع الافتراضي؟");
                    setTimeout(() => window.scrollTo(0, 0), 100);
                  }}
                  className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-bold px-10 py-6 h-auto text-xl rounded-full shadow-lg shadow-purple-900/30 transform transition-transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-3">
                    <i className="fas fa-vr-cardboard text-2xl"></i>
                    <span>ابدأ تجربة الواقع الافتراضي</span>
                  </div>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
