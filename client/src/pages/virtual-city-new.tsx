import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useVR } from '@/hooks/use-vr';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMovement } from '@/hooks/use-movement';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';

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
import { Product } from '../../../shared/schema';

const DEFAULT_SPEED = 5;

/**
 * مدينة أمريكي الافتراضية المتكاملة
 * 
 * صفحة تفاعلية ثلاثية الأبعاد تحتوي على مباني متنوعة لوكالات السفر ومتاجر الملابس 
 * ومتاجر الأجهزة الإلكترونية ومزيد من المرافق
 */
export default function VirtualCityNew() {
  // Hooks
  const { user } = useAuth();
  const { vrEnabled, walkSpeed, setWalkSpeed } = useVR();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const cityRef = useRef<HTMLDivElement>(null);

  // User interface state
  const [showCityControls, setShowCityControls] = useState(true);
  const [showTouchControls, setShowTouchControls] = useState(isMobile);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | undefined>("كيف أتنقل في المدينة؟");
  const [showTransition, setShowTransition] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque'>('cultural');

  // City environment state
  const [activePOI, setActivePOI] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState(false);
  const [dayTime, setDayTime] = useState<'morning' | 'noon' | 'evening' | 'night'>('noon');
  const [weather, setWeather] = useState<'clear' | 'cloudy' | 'rain' | 'dusty'>('clear');
  const [trafficDensity, setTrafficDensity] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Movement setup
  const { 
    position, rotation, isMoving, 
    moveForward, moveBackward, moveLeft, moveRight, 
    rotate, resetPosition, setSpeed
  } = useMovement({
    initialPosition: { x: 0, y: 1.7, z: -40 },
    initialRotation: { x: 0, y: 0, z: 0 },
    speed: walkSpeed || DEFAULT_SPEED,
    enableCollisions: true
  });
  
  // City buildings definition with types for travel, clothing, and electronics
  const cityBuildings = [
    // Travel Agency
    {
      id: 'travel-agency',
      name: 'وكالة السفر العربي',
      type: 'travel',
      position: { x: -30, y: 0, z: 20 },
      color: '#3b82f6',
    },
    
    // Clothing Store
    {
      id: 'clothing-store',
      name: 'متجر الأزياء الفاخرة',
      type: 'clothing',
      position: { x: 20, y: 0, z: 15 },
      color: '#f59e0b',
    },
    
    // Electronics Store
    {
      id: 'electronics-store',
      name: 'متجر الإلكترونيات المتطورة',
      type: 'electronics',
      position: { x: 0, y: 0, z: 30 },
      color: '#10b981',
    },
    
    // Restaurant
    {
      id: 'restaurant',
      name: 'مطعم النكهات العالمية',
      type: 'other',
      position: { x: -20, y: 0, z: -10 },
      color: '#ef4444',
    },
    
    // Bank
    {
      id: 'bank',
      name: 'البنك المركزي',
      type: 'other',
      position: { x: 35, y: 0, z: -20 },
      color: '#6366f1',
    },
    
    // Entertainment Center
    {
      id: 'entertainment',
      name: 'مركز الترفيه العائلي',
      type: 'other',
      position: { x: -40, y: 0, z: -25 },
      color: '#8b5cf6',
    }
  ];
  
  // Initialize city on mount
  useEffect(() => {
    // Reset player position
    resetPosition();
    
    // Show welcome toast
    toast({
      title: "مرحباً بك في مدينة أمريكي",
      description: "استكشف المباني المختلفة وانقر عليها للتفاعل معها",
    });
    
    // Trigger welcome transition
    setTransitionStyle('cultural');
    setShowTransition(true);
    
    // Fade in city
    if (cityRef.current) {
      cityRef.current.style.opacity = '0';
      setTimeout(() => {
        if (cityRef.current) cityRef.current.style.opacity = '1';
      }, 1000);
    }
    
    // Add keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Map key
      if (e.key === 'm' || e.key === 'M') {
        setExpandedMap(prev => !prev);
      }
      
      // Escape key
      if (e.key === 'Escape') {
        setShowInstructions(false);
      }
      
      // Instructions
      if (e.key === 'h' || e.key === 'H') {
        setShowInstructions(true);
      }
      
      // Number keys for time of day
      if (e.key === '1') setDayTime('morning');
      if (e.key === '2') setDayTime('noon');
      if (e.key === '3') setDayTime('evening');
      if (e.key === '4') setDayTime('night');
      
      // Weather keys
      if (e.key === 'c') setWeather('clear');
      if (e.key === 'r') setWeather('rain');
      if (e.key === 'd') setWeather('dusty');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Set walk speed when VR speed changes
  useEffect(() => {
    if (walkSpeed) {
      setSpeed(walkSpeed);
    }
  }, [walkSpeed]);
  
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
  
  // Handle camera rotation
  const handleLook = (deltaX: number, deltaY: number) => {
    rotate(deltaX, deltaY);
  };
  
  // Handle map location selection
  const handleMapLocationSelect = (locationId: string, position: { x: number; y: number; z: number }) => {
    // Set the current active POI
    setActivePOI(locationId);
    
    console.log(`Navigating to ${locationId} at position:`, position);
    
    // Show building info toast
    const building = cityBuildings.find(b => b.id === locationId);
    if (building) {
      toast({
        title: building.name,
        description: "تم تحديد المبنى على الخريطة. اقترب منه للتفاعل معه.",
      });
    }
    
    // Add teleport effect
    triggerTransition('cultural');
  };
  
  // Get environment styles based on time and weather
  const getEnvironmentStyles = () => {
    let timeStyle = {};
    let weatherStyle = {};
    
    // Time of day settings
    switch (dayTime) {
      case 'morning':
        timeStyle = {
          background: 'linear-gradient(to bottom, #87CEEB, #E0F7FA)',
          filter: 'brightness(1.1) contrast(0.95) hue-rotate(10deg)'
        };
        break;
      case 'noon':
        timeStyle = {
          background: 'linear-gradient(to bottom, #56CCF2, #2F80ED)'
        };
        break;
      case 'evening':
        timeStyle = {
          background: 'linear-gradient(to bottom, #FF7E5F, #FEB47B)',
          filter: 'brightness(0.9) sepia(0.2) hue-rotate(-10deg)'
        };
        break;
      case 'night':
        timeStyle = {
          background: 'linear-gradient(to bottom, #0F2027, #203A43)',
          filter: 'brightness(0.4) contrast(1.2) saturate(0.8)'
        };
        break;
    }
    
    // Weather effects
    switch (weather) {
      case 'cloudy':
        weatherStyle = {
          filter: 'brightness(0.9)',
          background: 'linear-gradient(to bottom, #cccccc, #eeeeee)'
        };
        break;
      case 'rain':
        weatherStyle = {
          filter: 'brightness(0.7) contrast(1.1)',
          background: 'linear-gradient(to bottom, #333333, #666666)'
        };
        break;
      case 'dusty':
        weatherStyle = {
          filter: 'sepia(0.7) brightness(0.85) contrast(1.1)',
          background: 'linear-gradient(to bottom, #d4a76a, #e8c496)'
        };
        break;
    }
    
    return { ...timeStyle, ...weatherStyle };
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
  
  // City points of interest
  const cityPOIs = [
    { id: 'main-gate', name: 'البوابة الرئيسية', position: { x: 0, y: 0, z: -40 }, type: 'entrance', icon: 'archway' },
    { id: 'central-square', name: 'الساحة المركزية', position: { x: 0, y: 0, z: 0 }, type: 'landmark', icon: 'monument' },
    { id: 'east-district', name: 'الحي الشرقي', position: { x: 30, y: 0, z: 0 }, type: 'landmark', icon: 'building' },
    { id: 'west-district', name: 'الحي الغربي', position: { x: -30, y: 0, z: 0 }, type: 'landmark', icon: 'building' },
    { id: 'north-district', name: 'الحي الشمالي', position: { x: 0, y: 0, z: 30 }, type: 'landmark', icon: 'building' },
  ];
  
  // Calculate whether a building is in direct view (by position)
  const isInView = (buildingId: string) => {
    const building = cityBuildings.find(b => b.id === buildingId);
    if (!building) return false;
    
    // Get direction vector from player to building
    const dx = building.position.x - position.x;
    const dz = building.position.z - position.z;
    
    // Calculate angle between player's forward vector and building
    const playerAngle = rotation.y * (Math.PI / 180);
    const playerForwardX = Math.sin(playerAngle);
    const playerForwardZ = Math.cos(playerAngle);
    
    // Normalize direction vector
    const distance = Math.sqrt(dx * dx + dz * dz);
    const dirX = dx / distance;
    const dirZ = dz / distance;
    
    // Calculate dot product (cosine of angle between vectors)
    const dotProduct = dirX * playerForwardX + dirZ * playerForwardZ;
    
    // If dot product > 0.7, building is roughly in front of player (within ~45 degrees)
    return dotProduct > 0.7;
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
        minimized={true} 
      />
      
      {/* Main Virtual City Environment */}
      <div 
        ref={cityRef}
        className="fixed inset-0 z-40 transition-opacity duration-1000"
        style={getEnvironmentStyles()}
      >
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
        
        {weather === 'dusty' && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-yellow-700/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 50 + 30}px`,
                  height: `${Math.random() * 50 + 30}px`,
                  filter: 'blur(8px)',
                  opacity: Math.random() * 0.3 + 0.1,
                  animation: `float${Math.floor(Math.random() * 3) + 1} ${Math.random() * 8 + 8}s infinite linear`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Insert City Builder Component */}
        <CityBuilder />
        
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
        
        {/* City entrance gate */}
        <GateControl
          playerPosition={position}
          gatePosition={{ x: 0, y: 0, z: -40 }}
          gateWidth={30}
          gateHeight={15}
          gateColor="#8B5A2B"
          triggerDistance={8}
        >
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold p-4 bg-black/40 rounded-xl">
            <div className="text-center">
              <div className="text-amber-400 flex justify-center items-center text-4xl mb-2">
                <i className="fas fa-city mr-3"></i>
                <span>مدينة أمريكي</span>
              </div>
              <div className="text-lg">
                المدينة الافتراضية المتكاملة
              </div>
            </div>
          </div>
        </GateControl>
        
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
          {showCityControls && (
            <div className="absolute top-4 right-4 z-30 pointer-events-auto w-60 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 hover-shadow-pulse">
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
                    onValueChange={(value) => setWeather(value as 'clear' | 'cloudy' | 'rain' | 'dusty')}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">صافي</SelectItem>
                      <SelectItem value="cloudy">غائم</SelectItem>
                      <SelectItem value="rain">ماطر</SelectItem>
                      <SelectItem value="dusty">غبار</SelectItem>
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
                      className="h-7 w-7 p-0 hover-jelly"
                    >-</Button>
                    <span className="text-white">{walkSpeed || DEFAULT_SPEED}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSpeed(Math.min(10, (walkSpeed || DEFAULT_SPEED) + 1))}
                      className="h-7 w-7 p-0 hover-jelly"
                    >+</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Toggle controls button */}
          <div className="absolute top-4 right-4 pointer-events-auto" style={{right: showCityControls ? "calc(15rem + 1rem)" : "1rem"}}>
            <Button
              variant="outline"
              size="sm"
              className="bg-black/30 hover:bg-black/50 transition-all hover-pulse"
              onClick={() => setShowCityControls(!showCityControls)}
            >
              <i className={`fas fa-${showCityControls ? 'eye-slash' : 'eye'} mr-2`}></i>
              {showCityControls ? 'إخفاء الإعدادات' : 'إظهار الإعدادات'}
            </Button>
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
              onClick={() => {
                // Exit with transition
                triggerTransition('cultural', '/');
              }}
              className="bg-red-600 hover:bg-red-700 hover-pulse"
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
              className="bg-black/30 hover:bg-black/50 hover-jelly"
            >
              <i className="fas fa-question-circle mr-2"></i>
              تعليمات
            </Button>
          </div>
        </div>
        
        {/* Instructions modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-slate-800/90 rounded-lg p-6 max-w-md w-full border border-white/10 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-white">تعليمات الاستخدام</h2>
              <div className="space-y-4 text-gray-300">
                <div className="p-3 bg-black/30 rounded-lg hover-shimmer">
                  <h3 className="font-bold text-white mb-2">التحرك</h3>
                  <p><strong>كمبيوتر:</strong> استخدم مفاتيح W A S D أو أسهم لوحة المفاتيح للتحرك</p>
                  <p><strong>جوال:</strong> استخدم عصا التحكم الافتراضية على الشاشة</p>
                </div>
                
                <div className="p-3 bg-black/30 rounded-lg hover-shimmer">
                  <h3 className="font-bold text-white mb-2">الدوران</h3>
                  <p><strong>كمبيوتر:</strong> اسحب الماوس للنظر حولك</p>
                  <p><strong>جوال:</strong> استخدم منطقة الدوران في أزرار التحكم</p>
                </div>
                
                <div className="p-3 bg-black/30 rounded-lg hover-shimmer">
                  <h3 className="font-bold text-white mb-2">التفاعل</h3>
                  <p>اقترب من المباني للتفاعل معها ودخولها</p>
                </div>
                
                <div className="p-3 bg-black/30 rounded-lg hover-shimmer">
                  <h3 className="font-bold text-white mb-2">اختصارات لوحة المفاتيح</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>M:</strong> فتح/إغلاق الخريطة</div>
                    <div><strong>H:</strong> تعليمات المساعدة</div>
                    <div><strong>1-4:</strong> تغيير وقت اليوم</div>
                    <div><strong>C,R,D:</strong> تغيير الطقس</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowInstructions(false)}
                  className="hover-jelly"
                >
                  إغلاق
                </Button>
                
                <Button
                  onClick={() => {
                    setShowInstructions(false);
                    // Show AI Assistant
                    setAiInitialQuestion("كيف أتنقل في المدينة؟");
                  }}
                  className="bg-purple-600 hover:bg-purple-700 hover-jelly"
                >
                  <i className="fas fa-robot mr-2"></i>
                  سؤال المساعد
                </Button>
              </div>
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
    </>
  );
}