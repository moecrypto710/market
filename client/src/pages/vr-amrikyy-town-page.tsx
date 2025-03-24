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
import VirtualFittingRoom from '@/components/virtual-fitting-room';
import ThreeProductView from '@/components/three-product-view';
import CameraIntegration from '@/components/camera-integration';
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
import { useToast } from '@/hooks/use-toast';

// Constants for movement
const DEFAULT_SPEED = 5;

/**
 * مدينة أمريكي الجديدة
 * 
 * تجربة مدينة أمريكي التفاعلية الجديدة بالكامل
 * صفحة موحدة تتيح للمستخدمين تجربة تسوق غامرة
 * بتصميم بسيط وسهل الاستخدام
 */
export default function VRAmrikyyTownPage() {
  const { user } = useAuth();
  const { vrEnabled, toggleVR, walkSpeed, setWalkSpeed, toggleGestureControl } = useVR();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [showControls, setShowControls] = useState(isMobile);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activePOI, setActivePOI] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState(false);
  const [dayTime, setDayTime] = useState<'morning' | 'noon' | 'evening' | 'night'>('noon');
  const [weather, setWeather] = useState<'clear' | 'cloudy' | 'rain' | 'sandstorm'>('clear');
  const [trafficDensity, setTrafficDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
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
    <div className="relative">
      {!fullscreenMode ? (
        <div className="container mx-auto py-8 px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
              مدينة أمريكي
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
              تجربة تسوق تفاعلية في مدينة أمريكي الافتراضية
            </p>
            <Button
              onClick={() => setFullscreenMode(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-xl rounded-xl"
            >
              <i className="fas fa-play-circle mr-2"></i>
              ابدأ التجربة
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                  <i className="fas fa-building text-blue-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">استكشف المباني</h3>
                <p className="text-gray-400">تجول في متاجر الملابس والإلكترونيات ووكالات السفر</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <i className="fas fa-tshirt text-purple-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">تجربة افتراضية للملابس</h3>
                <p className="text-gray-400">استخدم الكاميرا لتجربة الملابس افتراضياً قبل الشراء</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                  <i className="fas fa-sun text-indigo-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">تغيير الأجواء</h3>
                <p className="text-gray-400">غير بين أوقات النهار المختلفة وحالات الطقس المتنوعة</p>
              </div>
            </div>
            
            {/* Building Models */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-6">نماذج المباني</h2>
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
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="h-screen w-screen overflow-hidden fixed inset-0 z-50 bg-slate-900" 
          style={getEnvironmentStyles()}
        >
          {/* City environment */}
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
          </div>
          
          {/* HUD elements that remain fixed on screen */}
          <div className="fixed inset-0 pointer-events-none">
            {/* Map */}
            <div className={`absolute top-4 left-4 z-30 pointer-events-auto rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${expandedMap ? 'w-80 h-80' : 'w-40 h-40'}`}>
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
                      onClick={() => setWalkSpeed(Math.max(1, (walkSpeed || DEFAULT_SPEED) - 1))}
                      className="h-7 w-7 p-0"
                    >-</Button>
                    <span className="text-white">{walkSpeed || DEFAULT_SPEED}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setWalkSpeed(Math.min(10, (walkSpeed || DEFAULT_SPEED) + 1))}
                      className="h-7 w-7 p-0"
                    >+</Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile controls */}
            {isMobile && showControls && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
                <TouchControls 
                  onMove={(direction) => {
                    switch (direction) {
                      case 'forward':
                        movement.moveForward();
                        break;
                      case 'backward':
                        movement.moveBackward();
                        break;
                      case 'left':
                        movement.moveLeft();
                        break;
                      case 'right':
                        movement.moveRight();
                        break;
                    }
                  }}
                  onLook={(deltaX, deltaY) => {
                    movement.rotate(deltaX, deltaY);
                  }}
                />
              </div>
            )}
            
            {/* Exit button */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
              <Button
                variant="destructive"
                onClick={() => setFullscreenMode(false)}
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
      )}
    </div>
  );
}