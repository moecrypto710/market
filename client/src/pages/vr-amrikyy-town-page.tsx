import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useVR } from '@/hooks/use-vr';
import CityBuilder from '@/components/city-builder';
import BuildingShowcase from '@/components/building-showcase';
import TouchControls from '@/components/touch-controls';
import CarTraffic from '@/components/car-traffic';
import TrafficLight from '@/components/traffic-light';
import GateControl from '@/components/gate-control';
import CityMap from '@/components/city-map';
import StoreInteraction from '@/components/store-interaction';
import ThreeBuildingModel from '@/components/three-building-model';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMovement } from '@/hooks/use-movement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

// Constants for movement
const DEFAULT_SPEED = 5;

/**
 * VR American Town Page
 * 
 * A combined experience that merges the American-style virtual town and interactive city
 * to provide a complete, immersive shopping experience.
 */
export default function VRAmrikyyTownPage() {
  const { user } = useAuth();
  const { vrEnabled, toggleVR, walkSpeed, setWalkSpeed, toggleGestureControl } = useVR();
  const isMobile = useIsMobile();
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [showControls, setShowControls] = useState(isMobile);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activePOI, setActivePOI] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState(false);
  const [dayTime, setDayTime] = useState<'morning' | 'noon' | 'evening' | 'night'>('noon');
  const [weather, setWeather] = useState<'clear' | 'cloudy' | 'rain' | 'sandstorm'>('clear');
  const [trafficDensity, setTrafficDensity] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Set up movement using our movement hook with options
  const movement = useMovement({
    initialPosition: { x: 0, y: 1, z: -10 },
    initialRotation: { x: 0, y: 0, z: 0 },
    speed: walkSpeed || DEFAULT_SPEED,
    enableCollisions: true
  });
  
  // Set initial position
  useEffect(() => {
    movement.resetPosition();
    // Set the initial position
    movement.position = { x: 0, y: 1, z: -10 };
  }, []);
  
  // Effects for fullscreen mode
  useEffect(() => {
    const toggleFullscreen = () => {
      if (!fullscreenMode) {
        try {
          const docEl = document.documentElement;
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(e => console.log("Fullscreen request failed"));
          }
        } catch (e) {
          console.log("Fullscreen not supported");
        }
      } else {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(e => console.log("Exit fullscreen failed"));
          }
        } catch (e) {
          console.log("Exit fullscreen not supported");
        }
      }
    };
    
    toggleFullscreen();
    
    return () => {
      // Exit fullscreen when component unmounts if needed
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(e => {});
      }
    };
  }, [fullscreenMode]);
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };
  
  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  // Define both landmarks from both components (American and Arabic style)
  const landmarks = [
    // American-style landmarks
    { id: 'downtown', name: 'وسط المدينة الأمريكي', icon: 'city', color: 'blue' },
    { id: 'mall', name: 'مركز التسوق', icon: 'shopping-cart', color: 'green' },
    { id: 'park', name: 'المنتزه', icon: 'tree', color: 'emerald' },
    
    // Arabic-style landmarks
    { id: 'travel', name: 'وكالة السفر العربي', icon: 'plane', color: 'indigo' },
    { id: 'clothing', name: 'متجر الملابس الفاخرة', icon: 'tshirt', color: 'amber' },
    { id: 'electronics', name: 'متجر الإلكترونيات والتقنية', icon: 'laptop', color: 'emerald' },
    { id: 'main-gate', name: 'البوابة الرئيسية', icon: 'archway', color: 'purple' },
  ];
  
  // Define city buildings combining both styles
  const cityBuildings = [
    // American-style buildings
    { id: 'downtown-skyscraper', name: 'ناطحة سحاب وسط المدينة', type: 'modern', position: { x: -25, y: 0, z: -15 }, color: '#2563eb' },
    { id: 'shopping-mall', name: 'مركز التسوق الأمريكي', type: 'modern', position: { x: -30, y: 0, z: 5 }, color: '#10b981' },
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
  
  // Handle navigation via map
  const handleMapLocationSelect = (locationId: string, position: { x: number; y: number; z: number }) => {
    // Set the current active POI
    setActivePOI(locationId);
    
    // In a real implementation, this would move the player to that position
    console.log(`Navigating to ${locationId} at position:`, position);
    
    // Update the player position (this would need to be enhanced for smooth movement)
    if (fullscreenMode) {
      movement.position = { ...position, y: 1 }; // Keep y at eye level
    }
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
  
  return (
    <div className={`relative ${fullscreenMode ? 'h-screen w-screen overflow-hidden fixed inset-0 z-50 bg-slate-900' : ''}`}>
      {/* VR Environment - shown only in fullscreen mode */}
      {fullscreenMode && (
        <div 
          className="absolute inset-0 overflow-hidden" 
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
            playerPosition={movement.position}
            gatePosition={{ x: 0, y: 0, z: -10 }}
            gateWidth={10}
            gateHeight={8}
            gateColor="#8B5A2B"
            triggerDistance={5}
          >
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold p-4 bg-black/40 rounded-xl">
              مرحباً بك في البلدة الأمريكية
            </div>
          </GateControl>
          
          {/* Virtual City Builder - this renders the buildings and environment */}
          <CityBuilder />
          
          {/* Buildings Showcase */}
          <div className="absolute top-20 left-1/4 transform -translate-x-1/2">
            <BuildingShowcase />
          </div>
          
          {/* Store Interactions - for both American and Arabic style stores */}
          <StoreInteraction
            storePosition={{ x: -25, y: 0, z: -15 }}
            storeName="ناطحة سحاب وسط المدينة"
            triggerDistance={10}
            storeColor="#2563eb"
            storeIcon="city"
            interiorComponent={
              <div className="p-8 bg-gradient-to-b from-slate-900 to-blue-900 text-white h-full">
                <h2 className="text-3xl font-bold mb-4">مرحباً بك في ناطحة السحاب</h2>
                <p className="mb-4">استمتع بمنظر المدينة من الطابق العلوي</p>
              </div>
            }
          />
          
          <StoreInteraction
            storePosition={{ x: 0, y: 0, z: 0 }}
            storeName="وكالة السفر العربي"
            triggerDistance={10}
            storeColor="#2563eb"
            storeIcon="plane"
            interiorComponent={
              <div className="p-8 bg-gradient-to-b from-slate-900 to-blue-900 text-white h-full">
                <h2 className="text-3xl font-bold mb-4">مرحباً بك في وكالة السفر</h2>
                <p className="mb-4">استكشف عروض السفر الحصرية</p>
              </div>
            }
          />
        </div>
      )}
      
      {/* Floating controls in fullscreen mode */}
      {fullscreenMode && (
        <>
          {/* Top-right controls */}
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/50"
              onClick={() => setFullscreenMode(false)}
            >
              <i className="fas fa-times mr-2"></i>
              خروج
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/50"
              onClick={() => setShowControls(!showControls)}
            >
              <i className={`fas fa-${showControls ? 'eye-slash' : 'eye'} mr-2`}></i>
              {showControls ? 'إخفاء التحكم' : 'إظهار التحكم'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/50"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <i className="fas fa-question-circle mr-2"></i>
              تعليمات
            </Button>
          </div>
          
          {/* Mobile touch controls */}
          {showControls && isMobile && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
              <TouchControls 
                onMove={(direction) => {
                  switch (direction) {
                    case 'forward': movement.moveForward(); break;
                    case 'backward': movement.moveBackward(); break;
                    case 'left': movement.moveLeft(); break;
                    case 'right': movement.moveRight(); break;
                  }
                }}
                onLook={(deltaX, deltaY) => movement.rotate(deltaX, deltaY)}
              />
            </div>
          )}
          
          {/* Environment controls */}
          {showControls && (
            <div className="fixed top-4 left-4 z-40">
              <Card className="w-64 bg-black/30 backdrop-blur-md border-white/20">
                <CardHeader className="p-3">
                  <CardTitle className="text-white text-sm">إعدادات البيئة</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs">الوقت</label>
                    <Select value={dayTime} onValueChange={(value: any) => setDayTime(value)}>
                      <SelectTrigger className="bg-black/50 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white">
                        <SelectItem value="morning">صباح</SelectItem>
                        <SelectItem value="noon">ظهر</SelectItem>
                        <SelectItem value="evening">مساء</SelectItem>
                        <SelectItem value="night">ليل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs">الطقس</label>
                    <Select value={weather} onValueChange={(value: any) => setWeather(value)}>
                      <SelectTrigger className="bg-black/50 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white">
                        <SelectItem value="clear">صافي</SelectItem>
                        <SelectItem value="cloudy">غائم</SelectItem>
                        <SelectItem value="rain">ممطر</SelectItem>
                        <SelectItem value="sandstorm">عاصفة رملية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs">كثافة المرور</label>
                    <Select value={trafficDensity} onValueChange={(value: any) => setTrafficDensity(value)}>
                      <SelectTrigger className="bg-black/50 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white">
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Bottom-right interactive map */}
          <div className="fixed bottom-4 right-4 z-40">
            <CityMap
              playerPosition={movement.position}
              buildings={cityBuildings}
              pointsOfInterest={cityPOIs}
              onLocationSelect={handleMapLocationSelect}
              isExpanded={expandedMap}
              onToggleExpand={() => setExpandedMap(!expandedMap)}
              showLabels={expandedMap}
            />
          </div>
        </>
      )}
      
      {/* Popup instruction modal */}
      {showInstructions && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowInstructions(false)}
        >
          <motion.div 
            className="bg-slate-800 p-6 rounded-xl max-w-md mx-auto border border-blue-500/30 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-white flex items-center">
              <i className="fas fa-info-circle text-blue-400 mr-2"></i>
              تعليمات التنقل
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                  <i className="fas fa-arrows-alt text-blue-400"></i>
                </div>
                <div className="text-slate-200 text-sm">مفاتيح الأسهم للتحرك</div>
              </div>
              
              <div className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                  <i className="fas fa-mouse text-blue-400"></i>
                </div>
                <div className="text-slate-200 text-sm">سحب الماوس للنظر</div>
              </div>
              
              <div className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                  <i className="fas fa-hand-pointer text-blue-400"></i>
                </div>
                <div className="text-slate-200 text-sm">النقر على المباني للدخول</div>
              </div>
              
              <div className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                  <i className="fas fa-mobile-alt text-blue-400"></i>
                </div>
                <div className="text-slate-200 text-sm">أزرار التحكم للجوال</div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setShowInstructions(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                فهمت
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Landing page content (when not in fullscreen) */}
      {!fullscreenMode && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div 
            className="text-center mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">بلدة أمريكي الافتراضية</h1>
            <p className="mt-2 text-slate-500 max-w-3xl mx-auto">
              استمتع بتجربة تسوق فريدة في بلدة أمريكية افتراضية ثلاثية الأبعاد مع تقنيات الواقع الافتراضي المتطورة
            </p>
          </motion.div>
          
          {/* VR Mode controls */}
          <motion.div 
            className="mb-8 bg-gradient-to-r from-slate-900 to-indigo-900 p-6 rounded-xl border border-indigo-500/20 shadow-xl"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-right">
                <h2 className="text-2xl font-bold text-white mb-2">تجربة واقع افتراضي متكاملة</h2>
                <p className="text-slate-300 max-w-xl">استكشف البلدة الأمريكية بشكل كامل في وضع ملء الشاشة للحصول على تجربة غامرة تُحاكي وكأنك متواجد في المكان</p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={() => setFullscreenMode(true)} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-700/30"
                  size="lg"
                >
                  <i className="fas fa-vr-cardboard mr-2"></i>
                  دخول التجربة الكاملة
                </Button>
                
                <Button 
                  onClick={() => toggleVR()} 
                  variant="outline" 
                  className="border-indigo-400/30 text-indigo-100 hover:bg-indigo-500/20"
                >
                  <i className={`fas fa-toggle-${vrEnabled ? 'on' : 'off'} mr-2`}></i>
                  {vrEnabled ? 'تعطيل' : 'تفعيل'} وضع الواقع الافتراضي
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Town Map Preview */}
          <motion.div 
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-4 shadow-lg">
                <i className="fas fa-map text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">خريطة البلدة الأمريكية</h2>
                <p className="text-slate-500">استكشف معالم وأماكن البلدة الأمريكية الافتراضية</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2 bg-slate-900 rounded-xl p-4 border border-blue-500/20 overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <i className="fas fa-map-marker-alt text-blue-400 mr-2"></i>
                  خريطة تفاعلية
                </h3>
                <div className="mx-auto flex justify-center">
                  <CityMap
                    playerPosition={{ x: 0, y: 1, z: -10 }}
                    buildings={cityBuildings}
                    pointsOfInterest={cityPOIs}
                    onLocationSelect={handleMapLocationSelect}
                    isExpanded={true}
                    showLabels={true}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/2 bg-slate-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                  دليل البلدة
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-50">
                    <h4 className="font-bold text-slate-800 mb-1 flex items-center">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-building text-blue-700 text-xs"></i>
                      </div>
                      المباني الرئيسية
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {cityBuildings.map(building => (
                        <li key={building.id} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-sm mr-2" 
                            style={{ backgroundColor: building.color }}
                          ></div>
                          {building.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-50">
                    <h4 className="font-bold text-slate-800 mb-1 flex items-center">
                      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-star text-amber-700 text-xs"></i>
                      </div>
                      نقاط الاهتمام
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {cityPOIs.map(poi => (
                        <li key={poi.id} className="flex items-center">
                          <div className="w-5 h-5 flex items-center justify-center mr-2">
                            <i className={`fas fa-${poi.icon} text-blue-500 text-xs`}></i>
                          </div>
                          {poi.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Features section */}
          <motion.div
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-4 shadow-lg">
                <i className="fas fa-magic text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">مميزات التجربة</h2>
                <p className="text-slate-500">اكتشف الميزات المذهلة في بلدتنا الأمريكية الافتراضية</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <i className="fas fa-building text-blue-700"></i>
                    </div>
                    مباني تفاعلية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-sm">
                    ادخل إلى المباني واستكشف المتاجر المختلفة بتصاميم معمارية متنوعة تجمع بين الطراز الأمريكي والعربي
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <i className="fas fa-cloud-sun text-green-700"></i>
                    </div>
                    تغيرات البيئة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-sm">
                    استمتع بتجربة مختلفة مع تغير أوقات اليوم والطقس، من الصباح المشمس إلى الليل مع تأثيرات الإضاءة المميزة
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <i className="fas fa-shopping-cart text-amber-700"></i>
                    </div>
                    تسوق افتراضي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-sm">
                    تصفح وشراء المنتجات في بيئة افتراضية كاملة مع عرض ثلاثي الأبعاد للمنتجات وتفاصيل مذهلة
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
          
          {/* Mini Building Showcase */}
          <motion.div
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mr-4 shadow-lg">
                <i className="fas fa-city text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">نماذج المباني</h2>
                <p className="text-slate-500">مباني البلدة بتصاميم مميزة تجمع بين الطرازين الأمريكي والعربي</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-slate-100 rounded-xl overflow-hidden">
                <ThreeBuildingModel 
                  type="travel" 
                  modelHeight="100%" 
                  showControls={true}
                />
              </div>
              
              <div className="h-64 bg-slate-100 rounded-xl overflow-hidden">
                <ThreeBuildingModel 
                  type="clothing" 
                  modelHeight="100%" 
                  showControls={true}
                />
              </div>
              
              <div className="h-64 bg-slate-100 rounded-xl overflow-hidden">
                <ThreeBuildingModel 
                  type="electronics" 
                  modelHeight="100%" 
                  showControls={true}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}