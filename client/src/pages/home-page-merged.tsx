import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useVR } from '@/hooks/use-vr';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMovement } from '@/hooks/use-movement';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import confetti from 'canvas-confetti';

// Components
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AIAssistant from '@/components/ai-assistant';
import CityBuilder from '@/components/city-builder';
import BuildingShowcase from '@/components/building-showcase';
import TouchControls from '@/components/touch-controls';
import CarTraffic from '@/components/car-traffic';
import TrafficLight from '@/components/traffic-light';
import GateControl from '@/components/gate-control';
import CityMap from '@/components/city-map';
import StoreInteraction from '@/components/store-interaction';
import ThreeBuildingModel from '@/components/three-building-model';
import VirtualFittingRoom from '@/components/virtual-fitting-room';
import CameraIntegration from '@/components/camera-integration';
import CulturalTransition from '@/components/cultural-transition';

// Constants
import { Product } from '@/shared/schema';

// Constants
const DEFAULT_SPEED = 5;

/**
 * الصفحة الرئيسية موحدة مع مدينة أمريكي التفاعلية
 * 
 * تجمع هذه الصفحة بين الصفحة الرئيسية التقليدية ومدينة أمريكي التفاعلية
 * لتوفير تجربة موحدة للمستخدمين
 */
export default function HomePage() {
  // Hooks
  const { user } = useAuth();
  const { vrEnabled, toggleVR, walkSpeed, setWalkSpeed, toggleGestureControl } = useVR();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);

  // User interface state
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(isMobile);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | undefined>(undefined);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque'>('cultural');

  // City environment state
  const [activePOI, setActivePOI] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState(false);
  const [dayTime, setDayTime] = useState<'morning' | 'noon' | 'evening' | 'night'>('noon');
  const [weather, setWeather] = useState<'clear' | 'cloudy' | 'rain' | 'sandstorm'>('clear');
  const [trafficDensity, setTrafficDensity] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Movement setup
  const { 
    position, rotation, isMoving, 
    moveForward, moveBackward, moveLeft, moveRight, 
    rotate, resetPosition, setSpeed
  } = useMovement({
    initialPosition: { x: 0, y: 1, z: -10 },
    initialRotation: { x: 0, y: 0, z: 0 },
    speed: walkSpeed || DEFAULT_SPEED,
    enableCollisions: true
  });
  
  // Reset position when entering immersive mode
  useEffect(() => {
    if (immersiveMode) {
      resetPosition();
    }
  }, [immersiveMode]);
  
  // Get products for recommendations
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
  };

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
  
  // Handle map location selection
  const handleMapLocationSelect = (locationId: string, position: { x: number; y: number; z: number }) => {
    // Set the current active POI
    setActivePOI(locationId);
    
    console.log(`Navigating to ${locationId} at position:`, position);
    
    // Update position to the selected location
    if (immersiveMode) {
      resetPosition();
      // Set the position
      position = { ...position, y: 1 }; // Keep y at eye level
    }
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
  
  // Get weather styles based on current settings
  const getWeatherStyle = () => {
    switch (weather) {
      case 'rain':
        return {
          filter: 'brightness(0.7) contrast(1.1)',
          background: 'linear-gradient(to bottom, #333333, #666666)'
        };
      case 'cloudy':
        return {
          filter: 'brightness(0.9)',
          background: 'linear-gradient(to bottom, #cccccc, #eeeeee)'
        };
      case 'sandstorm':
        return {
          filter: 'sepia(0.7) brightness(0.85) contrast(1.1)',
          background: 'linear-gradient(to bottom, #d4a76a, #e8c496)'
        };
      default:
        return {}; // Clear weather
    }
  };
  
  // Get lighting based on time of day
  const getDayTimeStyle = () => {
    switch (dayTime) {
      case 'morning':
        return {
          filter: 'brightness(1.1) contrast(0.95) hue-rotate(10deg)',
          background: 'linear-gradient(to bottom, #87CEEB, #E0F7FA)'
        };
      case 'evening':
        return {
          filter: 'brightness(0.9) sepia(0.2) hue-rotate(-10deg)',
          background: 'linear-gradient(to bottom, #FF7E5F, #FEB47B)'
        };
      case 'night':
        return {
          filter: 'brightness(0.4) contrast(1.2) saturate(0.8)',
          background: 'linear-gradient(to bottom, #0F2027, #203A43)'
        };
      default:
        return {
          background: 'linear-gradient(to bottom, #56CCF2, #2F80ED)'
        }; // Noon
    }
  };
  
  // Combined styles for sky and environment
  const getEnvironmentStyles = () => {
    const weatherStyle = getWeatherStyle();
    const timeStyle = getDayTimeStyle();
    
    return {
      ...weatherStyle,
      ...timeStyle,
    };
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
  
  // Define city buildings combining both styles
  const cityBuildings = [
    // American-style buildings
    { id: 'downtown-skyscraper', name: 'ناطحة سحاب وسط المدينة', type: 'modern', position: { x: -25, y: 0, z: -15 }, color: '#2563eb' },
    { id: 'shopping-mall', name: 'مدينة أمريكي', type: 'modern', position: { x: -30, y: 0, z: 5 }, color: '#10b981' },
    { id: 'apartment-building', name: 'مبنى سكني عصري', type: 'modern', position: { x: -20, y: 0, z: 15 }, color: '#f59e0b' },
    
    // Arabic-style buildings
    { id: 'travelAgency', name: 'وكالة السفر العربي', type: 'travel', position: { x: 0, y: 0, z: 0 }, color: '#2563eb' },
    { id: 'clothingStore', name: 'متجر الملابس الفاخرة', type: 'clothing', position: { x: 15, y: 0, z: 10 }, color: '#f59e0b' },
    { id: 'electronicsStore', name: 'متجر الإلكترونيات والتقنية', type: 'electronics', position: { x: 25, y: 0, z: 15 }, color: '#10b981' },
  ];
  
  const cityPOIs = [
    { id: 'main-gate', name: 'البوابة الرئيسية', position: { x: 0, y: 0, z: -20 }, type: 'entrance', icon: 'archway' },
    { id: 'central-square', name: 'الساحة المركزية', position: { x: 0, y: 0, z: 5 }, type: 'landmark', icon: 'monument' },
    { id: 'park', name: 'المنتزه', position: { x: -15, y: 0, z: 20 }, type: 'leisure', icon: 'tree' },
    { id: 'bridge', name: 'الجسر', position: { x: 10, y: 0, z: -10 }, type: 'landmark', icon: 'archway' },
  ];

  return (
    <>
      {/* Cultural transition overlay */}
      <CulturalTransition 
        show={showTransition} 
        style={transitionStyle} 
        onFinish={() => setShowTransition(false)} 
      />
      
      {/* AI Assistant - always available but minimized by default */}
      <AIAssistant 
        initialQuestion={aiInitialQuestion} 
        viewedProducts={viewedProducts}
        minimized={true} 
      />
      
      {/* Immersive Mode - مدينة أمريكي المتكاملة */}
      {immersiveMode ? (
        <div className="fixed inset-0 z-40" style={getEnvironmentStyles()}>
          {/* Sky and environment */}
          <div className="absolute inset-0 z-0"></div>
          
          {/* Weather effects */}
          {weather === 'rain' && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-0.5 bg-blue-200 opacity-70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    height: `${Math.random() * 20 + 10}px`,
                    animationDuration: `${Math.random() * 1 + 0.5}s`,
                    animation: 'falling-rain linear infinite',
                  }}
                ></div>
              ))}
            </div>
          )}
          
          {weather === 'sandstorm' && (
            <div className="absolute inset-0 pointer-events-none z-10 bg-yellow-700/30 animate-pulse"></div>
          )}
          
          {/* Traffic based on density */}
          {trafficDensity !== 'low' && (
            <>
              <CarTraffic 
                carStyle="sedan" 
                direction="right-to-left" 
                speed={trafficDensity === 'high' ? 3 : 1.5} 
                laneOffset={5}
                initialDelay={0}
              />
              
              {trafficDensity === 'high' && (
                <>
                  <CarTraffic 
                    carStyle="suv" 
                    direction="left-to-right" 
                    speed={2} 
                    laneOffset={-5}
                    initialDelay={1.5}
                  />
                  <CarTraffic 
                    carStyle="truck" 
                    direction="bottom-to-top" 
                    speed={1.2} 
                    laneOffset={15}
                    initialDelay={3}
                  />
                </>
              )}
              
              <TrafficLight 
                position={{ x: 5, y: 0, z: -15 }}
                cycleTime={trafficDensity === 'high' ? 5 : 10}
              />
            </>
          )}
          
          {/* Gates for different sections */}
          <GateControl
            playerPosition={position}
            gatePosition={{ x: 0, y: 0, z: -10 }}
            gateWidth={10}
            gateHeight={8}
            gateColor="#8B5A2B"
            triggerDistance={5}
          >
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold p-4 bg-black/40 rounded-xl">
              مرحباً بك في مدينة أمريكي المتكاملة
            </div>
          </GateControl>
          
          {/* City Builder */}
          <CityBuilder />
          
          {/* Store interactions */}
          <StoreInteraction
            storePosition={{ x: 15, y: 0, z: 10 }}
            storeName="متجر الملابس الفاخرة"
            triggerDistance={10}
            storeColor="#f59e0b"
            storeIcon="tshirt"
            interiorComponent={
              <div className="p-8 bg-gradient-to-b from-slate-900 to-amber-900 text-white h-full">
                <h2 className="text-3xl font-bold mb-4">متجر الملابس الفاخرة</h2>
                <p className="mb-4">جرب ملابسنا بتقنية الواقع المعزز</p>
                
                <Button
                  onClick={() => setShowCamera(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <i className="fas fa-camera mr-2"></i>
                  تجربة الملابس افتراضياً
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">أزياء رجالية</h3>
                    <VirtualFittingRoom 
                      outfits={[
                        { id: 1, name: 'بدلة رسمية', image: '/images/outfit1.png', price: 1200 },
                        { id: 2, name: 'طقم كاجوال', image: '/images/outfit2.png', price: 800 },
                      ]}
                      showControls={true}
                    />
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">أزياء نسائية</h3>
                    <VirtualFittingRoom 
                      outfits={[
                        { id: 3, name: 'فستان سهرة', image: '/images/outfit3.png', price: 1500 },
                        { id: 4, name: 'تصميم عصري', image: '/images/outfit4.png', price: 900 },
                      ]}
                      showControls={true}
                    />
                  </div>
                </div>
              </div>
            }
          />
          
          {/* HUD elements that remain fixed on screen */}
          <div className="fixed inset-0 pointer-events-none">
            {/* Map */}
            <div className={`absolute top-4 left-4 z-30 pointer-events-auto rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${expandedMap ? 'w-80 h-80' : 'w-40 h-40'}`}>
              <CityMap 
                playerPosition={position}
                buildings={cityBuildings}
                pointsOfInterest={cityPOIs}
                onLocationSelect={handleMapLocationSelect}
                isExpanded={expandedMap}
                onToggleExpand={() => setExpandedMap(!expandedMap)}
                showLabels={expandedMap}
              />
            </div>
            
            {/* Environment controls */}
            <div className="absolute top-4 right-4 z-30 pointer-events-auto w-60 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">إعدادات البيئة</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">الوقت</span>
                  <Select 
                    defaultValue={dayTime} 
                    onValueChange={(value) => setDayTime(value as 'morning' | 'noon' | 'evening' | 'night')}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">الصباح</SelectItem>
                      <SelectItem value="noon">الظهيرة</SelectItem>
                      <SelectItem value="evening">المساء</SelectItem>
                      <SelectItem value="night">الليل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">الطقس</span>
                  <Select 
                    defaultValue={weather} 
                    onValueChange={(value) => setWeather(value as 'clear' | 'cloudy' | 'rain' | 'sandstorm')}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">صافي</SelectItem>
                      <SelectItem value="cloudy">غائم</SelectItem>
                      <SelectItem value="rain">ماطر</SelectItem>
                      <SelectItem value="sandstorm">عاصفة رملية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">حركة المرور</span>
                  <Select 
                    defaultValue={trafficDensity} 
                    onValueChange={(value) => setTrafficDensity(value as 'low' | 'medium' | 'high')}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">مرتفعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">سرعة المشي</span>
                  <div className="w-28 flex justify-between">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSpeed(Math.max(1, (walkSpeed || DEFAULT_SPEED) - 1))}
                      className="h-7 w-7 p-0"
                    >-</Button>
                    <span className="text-white">{walkSpeed || DEFAULT_SPEED}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSpeed(Math.min(10, (walkSpeed || DEFAULT_SPEED) + 1))}
                      className="h-7 w-7 p-0"
                    >+</Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile controls */}
            {isMobile && showTouchControls && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
                <TouchControls 
                  onMove={handleMove}
                  onLook={handleLook}
                />
              </div>
            )}
            
            {/* Exit button */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
              <Button
                variant="destructive"
                onClick={toggleImmersiveMode}
                className="bg-red-600 hover:bg-red-700"
              >
                <i className="fas fa-times mr-2"></i>
                خروج من المدينة
              </Button>
            </div>
            
            {/* Instructions button */}
            <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
              <Button
                variant="outline"
                onClick={() => setShowInstructions(true)}
              >
                <i className="fas fa-question-circle mr-2"></i>
                تعليمات
              </Button>
            </div>
          </div>
          
          {/* Instructions modal */}
          {showInstructions && (
            <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-white">تعليمات الاستخدام</h2>
                <div className="space-y-4 text-gray-300">
                  <p><strong>التحرك:</strong> استخدم مفاتيح W A S D أو أسهم لوحة المفاتيح للتحرك</p>
                  <p><strong>الدوران:</strong> اسحب الماوس للنظر حولك، أو استخدم منطقة الدوران في أزرار التحكم</p>
                  <p><strong>التفاعل:</strong> اقترب من المباني للتفاعل معها ودخولها</p>
                  <p><strong>الخريطة:</strong> استخدم الخريطة في الزاوية العلوية اليسرى للتنقل</p>
                  <p><strong>الإعدادات:</strong> غير الوقت والطقس من القائمة في الزاوية العلوية اليمنى</p>
                </div>
                <Button
                  onClick={() => setShowInstructions(false)}
                  className="mt-6 w-full"
                >
                  فهمت
                </Button>
              </div>
            </div>
          )}
          
          {/* Camera for AR fitting experience */}
          {showCamera && (
            <CameraIntegration
              onCapture={(imageSrc) => {
                setCapturedImage(imageSrc);
                setShowCamera(false);
                toast({
                  title: "تم التقاط الصورة بنجاح",
                  description: "يمكنك الآن تجربة الملابس افتراضياً",
                });
              }}
              onClose={() => setShowCamera(false)}
              mode="product-try-on"
              enableFilters={true}
              enableAREffects={true}
            />
          )}
        </div>
      ) : (
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
                    aria-label="دخول مدينة أمريكي المتكاملة"
                    className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 py-3 h-auto shadow-lg shadow-purple-600/30 transform transition-all duration-300 hover:scale-105 overflow-hidden group text-lg font-bold"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
                    <span className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <i className="fas fa-city text-lg"></i>
                      <span>دخول مدينة أمريكي</span>
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Hero Section */}
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
                  مدينة أمريكي
                  <span className="inline-block mx-2 px-3 py-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-md text-white">3D</span>
                </h1>
                
                <div className="flex justify-center mb-6">
                  <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                    أول مدينة أعمال تفاعلية ثلاثية الأبعاد متكاملة في العالم العربي
                  </div>
                </div>
                
                {/* Realistic description with better styling */}
                <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-10 leading-relaxed font-normal bg-black/20 backdrop-blur-sm p-5 rounded-xl border border-white/10">
                  تجربة مدينة أمريكي التفاعلية ثلاثية الأبعاد الأولى من نوعها، حيث يمكنك استكشاف المباني المختلفة لمتاجر الإلكترونيات وشركات السفر ومحلات الملابس في بيئة غامرة
                </p>
                
                {/* Single prominent button for VR mode */}
                <motion.div
                  variants={fadeInUp}
                  className="flex justify-center"
                >
                  <Button 
                    onClick={toggleImmersiveMode}
                    aria-label="دخول مدينة أمريكي"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-8 py-6 h-auto text-xl md:text-2xl rounded-2xl shadow-2xl shadow-purple-900/40 transform transition-all duration-300 hover:scale-105 hover:shadow-purple-600/50 relative overflow-hidden group border border-white/20"
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
                    
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <i className="fas fa-vr-cardboard text-2xl"></i>
                      <span>دخول المدينة التفاعلية</span>
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Building Types Section */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">أنواع المباني في المدينة</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-blue-700/30 h-full">
                <div className="h-48 bg-slate-100 rounded-t-xl overflow-hidden">
                  <ThreeBuildingModel 
                    type="travel" 
                    modelHeight="100%" 
                    showControls={true}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">وكالة السفر العربي</h3>
                  <p className="text-blue-200">استكشف عروض السفر وحجز الرحلات والفنادق في مكان واحد</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-amber-700/30 h-full">
                <div className="h-48 bg-slate-100 rounded-t-xl overflow-hidden">
                  <ThreeBuildingModel 
                    type="clothing" 
                    modelHeight="100%" 
                    showControls={true}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">متجر الملابس الفاخرة</h3>
                  <p className="text-amber-200">تسوق أحدث الأزياء والملابس مع إمكانية تجربتها افتراضياً باستخدام الكاميرا</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-emerald-700/30 h-full">
                <div className="h-48 bg-slate-100 rounded-t-xl overflow-hidden">
                  <ThreeBuildingModel 
                    type="electronics" 
                    modelHeight="100%" 
                    showControls={true}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">متجر الإلكترونيات والتقنية</h3>
                  <p className="text-emerald-200">اكتشف أحدث المنتجات الإلكترونية والأجهزة الذكية بعروض حصرية</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features section */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">مميزات التجربة التفاعلية</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <i className="fas fa-map text-purple-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">خريطة تفاعلية</h3>
                <p className="text-gray-300">تنقل بسهولة بين مختلف أنحاء المدينة باستخدام الخريطة التفاعلية</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                  <i className="fas fa-cloud-sun-rain text-blue-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">أجواء متغيرة</h3>
                <p className="text-gray-300">استمتع بتغيير الطقس والوقت لتحصل على تجربة مختلفة في كل زيارة</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                  <i className="fas fa-tshirt text-amber-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">تجربة الملابس</h3>
                <p className="text-gray-300">جرب الملابس افتراضياً قبل الشراء باستخدام كاميرا الواقع المعزز</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <i className="fas fa-robot text-emerald-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">مساعد ذكي</h3>
                <p className="text-gray-300">تفاعل مع المساعد الافتراضي للحصول على المساعدة والاقتراحات</p>
              </div>
            </div>
          </motion.div>

          {/* Call to action */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button 
              onClick={toggleImmersiveMode}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-xl rounded-xl"
            >
              <i className="fas fa-city mr-2"></i>
              ابدأ التجربة الآن
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
}