import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMovement } from '@/hooks/use-movement';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AirplaneBuildingInterior from './airplane-building-interior';
import EnterBuilding from './enter-building';
import StoreInteraction from './store-interaction';
import GateControl from './gate-control';
import CarTraffic from './car-traffic';
import TrafficLight from './traffic-light';
import TouchControls from './touch-controls';
import VirtualFittingRoom from './virtual-fitting-room';
import DynamicPromotions from './dynamic-promotions';
import ThreeProductView from './three-product-view';
import ThreeBuildingModel from './three-building-model';

interface Building {
  id: string;
  name: string;
  type: string; // Allow any building type
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: number;
  color: string;
  icon: string;
  description?: string;
  style?: 'modern' | 'traditional' | 'futuristic' | 'arabic';
  floors?: number;
  animated?: boolean;
  hasInterior?: boolean;
  interiorComponent?: React.ReactNode;
}

interface NPC {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  speed: number;
  color: string;
  dialog: string[];
  animated: boolean;
  movementPattern: string;
  modelType?: string;
}

interface EnvironmentSettings {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weatherCondition: 'clear' | 'cloudy' | 'rainy' | 'sandstorm';
  trafficDensity: 'low' | 'medium' | 'high';
  ambientSound: 'city' | 'market' | 'quiet' | 'nature' | 'none';
  soundVolume: number;
  shader: 'standard' | 'enhanced' | 'realistic';
  renderQuality: 'low' | 'medium' | 'high';
  shadowsEnabled: boolean;
  reflectionsEnabled: boolean;
  postProcessingEnabled: boolean;
}

/**
 * EnhancedCityBuilder Component
 * 
 * An immersive virtual city experience with realistic buildings, lighting,
 * sound effects, and interactive elements designed for regular devices
 * (without requiring VR hardware) to simulate a VR-like experience.
 * 
 * This component uses modern web technologies to create a 3D-like environment
 * that works on all devices from mobile to desktop.
 */
export default function EnhancedCityBuilder() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // City layout and state
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  const [isInteriorView, setIsInteriorView] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeDialog, setActiveDialog] = useState<{ npcId: string, messages: string[], index: number } | null>(null);
  
  // Environment settings
  const [settings, setSettings] = useState<EnvironmentSettings>({
    timeOfDay: 'day',
    weatherCondition: 'clear',
    trafficDensity: 'medium',
    ambientSound: 'city',
    soundVolume: 0.5,
    shader: 'enhanced',
    renderQuality: 'medium',
    shadowsEnabled: true,
    reflectionsEnabled: true,
    postProcessingEnabled: true
  });
  
  // Movement and position
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
  } = useMovement({
    initialPosition: { x: 0, y: 1.7, z: 0 },
    speed: 0.15, // Adjusted speed for smoother movement
    sensitivity: 0.2
  });

  // Initialize city with buildings
  useEffect(() => {
    const initializeCity = () => {
      // Create building instances
      const cityBuildings: Building[] = [
        {
          id: "travel_agency",
          name: "وكالة السفر",
          type: "travel",
          position: { x: -20, y: 0, z: -30 },
          rotation: 0,
          scale: 1.5,
          color: "#64b5f6",
          icon: "✈️",
          description: "وكالة السفر - اكتشف وجهات جديدة",
          style: "modern",
          animated: true,
          hasInterior: true
        },
        {
          id: "clothing_store",
          name: "متجر الأزياء",
          type: "clothing",
          position: { x: 20, y: 0, z: -25 },
          rotation: 180,
          scale: 1.3,
          color: "#ec407a",
          icon: "👕",
          description: "متجر الأزياء - أحدث صيحات الموضة",
          style: "traditional",
          animated: true,
          hasInterior: true
        },
        {
          id: "electronics_store",
          name: "متجر الإلكترونيات",
          type: "electronics",
          position: { x: -15, y: 0, z: 25 },
          rotation: 90,
          scale: 1.4,
          color: "#4dd0e1",
          icon: "📱",
          description: "متجر الإلكترونيات - أحدث التقنيات",
          style: "futuristic",
          animated: true,
          hasInterior: true
        },
        {
          id: "restaurant",
          name: "مطعم",
          type: "restaurant",
          position: { x: 15, y: 0, z: 20 },
          rotation: 270,
          scale: 1.2,
          color: "#ffb74d",
          icon: "🍽️",
          description: "مطعم - أشهى المأكولات",
          style: "arabic",
          animated: true,
          hasInterior: true
        },
        {
          id: "bank",
          name: "البنك",
          type: "bank",
          position: { x: 0, y: 0, z: -20 },
          rotation: 0,
          scale: 1.3,
          color: "#81c784",
          icon: "🏦",
          description: "البنك - خدمات مالية آمنة",
          style: "modern",
          hasInterior: true
        },
        {
          id: "mosque",
          name: "المسجد",
          type: "religious",
          position: { x: -25, y: 0, z: 0 },
          rotation: 0,
          scale: 1.5,
          color: "#b39ddb",
          icon: "🕌",
          description: "المسجد - للصلاة والعبادة",
          style: "arabic",
          animated: false,
          hasInterior: true
        },
        {
          id: "coffee_shop",
          name: "مقهى",
          type: "cafe",
          position: { x: 25, y: 0, z: 5 },
          rotation: 180,
          scale: 1.1,
          color: "#a1887f",
          icon: "☕",
          description: "مقهى - استرخاء ومشروبات لذيذة",
          style: "traditional",
          animated: true,
          hasInterior: true
        },
        {
          id: "book_store",
          name: "مكتبة",
          type: "books",
          position: { x: 10, y: 0, z: -15 },
          rotation: 45,
          scale: 1.2,
          color: "#9575cd",
          icon: "📚",
          description: "مكتبة - عالم من المعرفة",
          style: "traditional",
          animated: false,
          hasInterior: true
        }
      ];
      
      setBuildings(cityBuildings);
      
      // Create NPCs
      const cityNPCs: NPC[] = [
        {
          id: "npc1",
          type: "civilian",
          name: "مواطن",
          position: { x: 5, y: 0, z: 5 },
          rotation: 0,
          speed: 0.5,
          color: "#3498db",
          dialog: ["مرحباً بك في مدينة أمريكي!", "هل أنت بحاجة للمساعدة؟", "استمتع بالتسوق!"],
          animated: true,
          movementPattern: "wander",
          modelType: "male_casual"
        },
        {
          id: "npc2",
          type: "shopkeeper",
          name: "بائع",
          position: { x: -5, y: 0, z: 8 },
          rotation: 180,
          speed: 0.2,
          color: "#e74c3c",
          dialog: ["أهلاً بك في متجرنا!", "لدينا عروض مميزة اليوم", "تفضل بالدخول"],
          animated: true,
          movementPattern: "stationary",
          modelType: "male_business"
        },
        {
          id: "npc3",
          type: "guard",
          name: "حارس",
          position: { x: 10, y: 0, z: -3 },
          rotation: 90,
          speed: 0.3,
          color: "#2c3e50",
          dialog: ["المنطقة آمنة", "هل تحتاج للمساعدة؟", "مرحباً بك"],
          animated: true,
          movementPattern: "patrol",
          modelType: "male_guard"
        },
        {
          id: "npc4",
          type: "chef",
          name: "طباخ",
          position: { x: 15, y: 0, z: 18 },
          rotation: 270,
          speed: 0.2,
          color: "#f39c12",
          dialog: ["مرحباً بك في مطعمنا!", "جرب أطباقنا الشهية", "لدينا عروض لذيذة اليوم"],
          animated: true,
          movementPattern: "stationary",
          modelType: "male_chef"
        },
        {
          id: "npc5",
          type: "tourist",
          name: "سائح",
          position: { x: -18, y: 0, z: -28 },
          rotation: 0,
          speed: 0.4,
          color: "#9b59b6",
          dialog: ["أحب زيارة هذه المدينة!", "هل هناك مناطق سياحية قريبة؟", "إنها مدينة جميلة!"],
          animated: true,
          movementPattern: "wander",
          modelType: "male_tourist"
        }
      ];
      
      setNPCs(cityNPCs);
    };
    
    initializeCity();
  }, []);
  
  // Handle keyboard events for building interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' && activeBuilding) {
        setIsInteriorView(!isInteriorView);
        toast({
          title: isInteriorView ? "خروج من المبنى" : "دخول المبنى",
          description: isInteriorView ? `أنت الآن خارج ${activeBuilding}` : `أنت الآن داخل ${activeBuilding}`,
        });
      }
      
      if (e.key === 'm') {
        setShowMap(!showMap);
      }
      
      if (e.key === 'Escape') {
        if (activeDialog) {
          setActiveDialog(null);
        } else if (showSettings) {
          setShowSettings(false);
        } else if (showMap) {
          setShowMap(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeBuilding, isInteriorView, showMap, showSettings, activeDialog, toast]);
  
  // Function to render NPCs (non-player characters)
  const renderNPCs = () => {
    return npcs.map((npc) => {
      // Calculate position relative to player
      const relX = npc.position.x - position.x;
      const relZ = npc.position.z - position.z;
      
      // Calculate distance to NPC
      const distance = Math.sqrt(relX * relX + relZ * relZ);
      
      // Only render NPCs within a certain distance
      if (distance > 50) return null;
      
      // Calculate screen position (perspective projection)
      // This is a simplified perspective calculation
      const scale = 1 / (distance * 0.1 + 1);
      const angle = Math.atan2(relX, relZ) - rotation.y;
      
      // Normalize angle to [-PI, PI]
      const normalizedAngle = ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
      
      // Only show NPCs in view (front 180 degrees)
      if (Math.abs(normalizedAngle) > Math.PI / 2) return null;
      
      // Calculate screen coordinates
      const screenX = 50 + 50 * Math.sin(normalizedAngle);
      
      // Determine which NPC model to display based on type
      let npcStyle = {};
      
      switch (npc.type) {
        case 'civilian':
          npcStyle = { backgroundColor: npc.color, borderRadius: '50% 50% 0 0' };
          break;
        case 'shopkeeper':
          npcStyle = { backgroundColor: npc.color, borderRadius: '50% 50% 0 0', border: '2px solid #f39c12' };
          break;
        case 'guard':
          npcStyle = { backgroundColor: npc.color, borderRadius: '30% 30% 0 0', border: '2px solid #34495e' };
          break;
        case 'chef':
          npcStyle = { backgroundColor: npc.color, borderRadius: '50% 50% 0 0', border: '2px solid white' };
          break;
        case 'tourist':
          npcStyle = { backgroundColor: npc.color, borderRadius: '50% 50% 0 0', border: '2px solid #3498db' };
          break;
        default:
          npcStyle = { backgroundColor: npc.color, borderRadius: '50% 50% 0 0' };
      }
      
      // اختر الأنيميشن بناءً على نمط الحركة
      let animationClass = '';
      
      if (npc.animated) {
        switch (npc.movementPattern) {
          case 'wander':
            animationClass = 'animate-floating-dust';
            break;
          case 'patrol':
            animationClass = 'animate-pulse-slow';
            break;
          case 'stationary':
            animationClass = 'animate-pulse-gentle';
            break;
          default:
            animationClass = '';
        }
      }
      
      // Handle NPC interaction
      const handleNPCClick = () => {
        // Show dialog when NPC is clicked
        setActiveDialog({
          npcId: npc.id,
          messages: npc.dialog,
          index: 0
        });
        
        // Display toast notification
        toast({
          title: `${npc.name} يتحدث`,
          description: npc.dialog[0],
          duration: 3000,
        });
      };
      
      return (
        <motion.div
          key={npc.id}
          className={`absolute cursor-pointer ${animationClass}`}
          style={{
            left: `${screenX}%`,
            bottom: `${20 + 10 * scale}%`,
            transform: `scale(${scale}) rotate(${npc.rotation}deg)`,
            transformOrigin: 'center bottom',
            zIndex: Math.floor(1000 - distance),
            ...npcStyle
          }}
          whileHover={{ scale: scale * 1.1 }}
          onClick={handleNPCClick}
        >
          <div 
            className="npc-model" 
            style={{ 
              width: '40px', 
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            {/* NPC head */}
            <div 
              className="npc-head" 
              style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                backgroundColor: npc.color,
                marginBottom: '2px'
              }} 
            />
            
            {/* NPC body */}
            <div 
              className="npc-body" 
              style={{ 
                width: '30px', 
                height: '40px', 
                backgroundColor: npc.color,
                borderRadius: '5px 5px 0 0'
              }} 
            />
            
            {/* NPC label (only visible when close) */}
            {distance < 15 && (
              <div 
                className="absolute text-xs font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded whitespace-nowrap"
                style={{
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap'
                }}
              >
                {npc.name}
              </div>
            )}
          </div>
        </motion.div>
      );
    });
  };
  
  // Function to render buildings
  const renderBuildings = () => {
    return buildings.map((building) => {
      // Calculate position relative to player
      const relX = building.position.x - position.x;
      const relZ = building.position.z - position.z;
      
      // Calculate distance to building
      const distance = Math.sqrt(relX * relX + relZ * relZ);
      
      // Only render buildings within a certain distance
      if (distance > 100) return null;
      
      // Calculate screen position (perspective projection)
      const scale = 1 / (distance * 0.1 + 1);
      const angle = Math.atan2(relX, relZ) - rotation.y;
      
      // Normalize angle to [-PI, PI]
      const normalizedAngle = ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
      
      // Only show buildings in view (front 180 degrees)
      if (Math.abs(normalizedAngle) > Math.PI / 2) return null;
      
      // Calculate screen coordinates
      const screenX = 50 + 50 * Math.sin(normalizedAngle);
      
      // Handle building interaction
      const handleBuildingClick = () => {
        setActiveBuilding(building.name);
        
        // If close enough, enter the building
        if (distance < 10) {
          setIsInteriorView(true);
          toast({
            title: "دخول المبنى",
            description: `أنت الآن داخل ${building.name}`,
          });
        } else {
          toast({
            title: "المبنى بعيد",
            description: "اقترب أكثر للدخول",
            variant: "destructive"
          });
        }
      };
      
      return (
        <motion.div
          key={building.id}
          className="absolute cursor-pointer"
          style={{
            left: `${screenX}%`,
            bottom: `${20 + 10 * scale}%`,
            transform: `scale(${scale}) rotate(${building.rotation}deg)`,
            transformOrigin: 'center bottom',
            zIndex: Math.floor(1000 - distance)
          }}
          whileHover={{ scale: scale * 1.1 }}
          onClick={handleBuildingClick}
        >
          <ThreeBuildingModel
            type={building.type}
            color={building.color}
            width={150 * building.scale}
            height={150 * building.scale}
            depth={150 * building.scale}
            showControls={false}
            className="building-model"
          />
          
          {/* Building label (only visible when close) */}
          {distance < 30 && (
            <div 
              className="absolute text-sm font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded whitespace-nowrap"
              style={{
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              {building.name} {building.icon}
            </div>
          )}
        </motion.div>
      );
    });
  };
  
  // Render HUD elements (heads-up display)
  const renderHUD = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Compass */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-30 text-white px-4 py-2 rounded-full">
          <div className="flex items-center justify-center">
            <span className={rotation.y > -Math.PI/4 && rotation.y < Math.PI/4 ? "text-yellow-300 font-bold" : ""}>N</span>
            <span className="mx-2">|</span>
            <span className={rotation.y > Math.PI/4 && rotation.y < 3*Math.PI/4 ? "text-yellow-300 font-bold" : ""}>E</span>
            <span className="mx-2">|</span>
            <span className={Math.abs(rotation.y) > 3*Math.PI/4 ? "text-yellow-300 font-bold" : ""}>S</span>
            <span className="mx-2">|</span>
            <span className={rotation.y < -Math.PI/4 && rotation.y > -3*Math.PI/4 ? "text-yellow-300 font-bold" : ""}>W</span>
          </div>
        </div>
        
        {/* Location indicator */}
        {activeBuilding && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-30 text-white px-4 py-2 rounded-full">
            {isInteriorView ? `داخل ${activeBuilding}` : `بالقرب من ${activeBuilding}`}
          </div>
        )}
        
        {/* Time indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-30 text-white px-4 py-2 rounded-full">
          {settings.timeOfDay === 'dawn' && 'الفجر'}
          {settings.timeOfDay === 'day' && 'النهار'}
          {settings.timeOfDay === 'dusk' && 'الغروب'}
          {settings.timeOfDay === 'night' && 'الليل'}
        </div>
        
        {/* Weather indicator */}
        <div className="absolute top-16 right-4 bg-black bg-opacity-30 text-white px-4 py-2 rounded-full">
          {settings.weatherCondition === 'clear' && '☀️ صافي'}
          {settings.weatherCondition === 'cloudy' && '☁️ غائم'}
          {settings.weatherCondition === 'rainy' && '🌧️ ممطر'}
          {settings.weatherCondition === 'sandstorm' && '🌪️ عاصفة رملية'}
        </div>
        
        {/* Active dialog box */}
        {activeDialog && (
          <div 
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 text-black p-4 rounded-lg max-w-md pointer-events-auto"
            style={{ zIndex: 2000 }}
          >
            <div className="text-lg font-bold mb-2">
              {npcs.find(npc => npc.id === activeDialog.npcId)?.name || "شخصية"}
            </div>
            <div className="text-md mb-3">
              {activeDialog.messages[activeDialog.index]}
            </div>
            <div className="flex justify-between">
              {activeDialog.index > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveDialog({
                    ...activeDialog,
                    index: activeDialog.index - 1
                  })}
                >
                  السابق
                </Button>
              )}
              
              {activeDialog.index < activeDialog.messages.length - 1 ? (
                <Button 
                  className="ml-auto"
                  size="sm"
                  onClick={() => setActiveDialog({
                    ...activeDialog,
                    index: activeDialog.index + 1
                  })}
                >
                  التالي
                </Button>
              ) : (
                <Button 
                  className="ml-auto"
                  size="sm"
                  onClick={() => setActiveDialog(null)}
                >
                  إغلاق
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render control panel for environment settings
  const renderControlPanel = () => {
    if (!showSettings) return (
      <Button
        className="absolute bottom-4 right-4 z-50"
        onClick={() => setShowSettings(true)}
      >
        الإعدادات
      </Button>
    );
    
    return (
      <motion.div 
        className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">إعدادات البيئة</h3>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>إغلاق</Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label htmlFor="timeOfDay" className="block mb-1">الوقت</label>
            <Select 
              value={settings.timeOfDay}
              onValueChange={(value: any) => setSettings({...settings, timeOfDay: value})}
            >
              <SelectTrigger id="timeOfDay">
                <SelectValue placeholder="اختر الوقت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dawn">الفجر</SelectItem>
                <SelectItem value="day">النهار</SelectItem>
                <SelectItem value="dusk">الغروب</SelectItem>
                <SelectItem value="night">الليل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="weatherCondition" className="block mb-1">الطقس</label>
            <Select 
              value={settings.weatherCondition}
              onValueChange={(value: any) => setSettings({...settings, weatherCondition: value})}
            >
              <SelectTrigger id="weatherCondition">
                <SelectValue placeholder="اختر الطقس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">صافي</SelectItem>
                <SelectItem value="cloudy">غائم</SelectItem>
                <SelectItem value="rainy">ممطر</SelectItem>
                <SelectItem value="sandstorm">عاصفة رملية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="trafficDensity" className="block mb-1">كثافة المرور</label>
            <Select 
              value={settings.trafficDensity}
              onValueChange={(value: any) => setSettings({...settings, trafficDensity: value})}
            >
              <SelectTrigger id="trafficDensity">
                <SelectValue placeholder="كثافة المرور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="renderQuality" className="block mb-1">جودة العرض</label>
            <Select 
              value={settings.renderQuality}
              onValueChange={(value: any) => setSettings({...settings, renderQuality: value})}
            >
              <SelectTrigger id="renderQuality">
                <SelectValue placeholder="جودة العرض" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              resetPosition();
              toast({
                title: "تم إعادة الموضع",
                description: "تم إعادة ضبط موضعك في المدينة",
              });
            }}
          >
            إعادة الموضع
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSettings({
                timeOfDay: 'day',
                weatherCondition: 'clear',
                trafficDensity: 'medium',
                ambientSound: 'city',
                soundVolume: 0.5,
                shader: 'enhanced',
                renderQuality: 'medium',
                shadowsEnabled: true,
                reflectionsEnabled: true,
                postProcessingEnabled: true
              });
              toast({
                title: "إعادة الإعدادات",
                description: "تم إعادة ضبط إعدادات البيئة للوضع الافتراضي",
              });
            }}
          >
            استعادة الافتراضي
          </Button>
        </div>
      </motion.div>
    );
  };
  
  // Render minimap
  const renderMinimap = () => {
    if (!showMap) return (
      <Button
        className="absolute bottom-4 left-4 z-50"
        onClick={() => setShowMap(true)}
      >
        الخريطة
      </Button>
    );
    
    return (
      <motion.div 
        className="absolute bottom-4 left-4 bg-black bg-opacity-60 p-4 rounded-lg z-50"
        style={{ width: '250px', height: '250px' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <div className="relative w-full h-full">
          {/* Map background */}
          <div className="absolute inset-0 bg-green-900 rounded-lg"></div>
          
          {/* Roads */}
          <div className="absolute left-1/2 top-0 w-4 h-full bg-gray-600 transform -translate-x-1/2"></div>
          <div className="absolute left-0 top-1/2 w-full h-4 bg-gray-600 transform -translate-y-1/2"></div>
          
          {/* Buildings on minimap */}
          {buildings.map(building => {
            // Scale building positions to minimap
            const mapX = (building.position.x / 100) * 250 * 0.4 + 125;
            const mapY = (building.position.z / 100) * 250 * 0.4 + 125;
            
            return (
              <div
                key={`map-${building.id}`}
                className="absolute w-4 h-4 rounded-sm"
                style={{
                  left: `${mapX}px`,
                  top: `${mapY}px`,
                  backgroundColor: building.color,
                  transform: 'translate(-50%, -50%)'
                }}
                title={building.name}
              />
            );
          })}
          
          {/* NPCs on minimap */}
          {npcs.map(npc => {
            // Scale NPC positions to minimap
            const mapX = (npc.position.x / 100) * 250 * 0.4 + 125;
            const mapY = (npc.position.z / 100) * 250 * 0.4 + 125;
            
            return (
              <div
                key={`map-npc-${npc.id}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${mapX}px`,
                  top: `${mapY}px`,
                  backgroundColor: npc.color,
                  transform: 'translate(-50%, -50%)'
                }}
                title={npc.name}
              />
            );
          })}
          
          {/* Player position */}
          <div 
            className="absolute w-3 h-3 bg-yellow-500 rounded-full z-10"
            style={{ 
              left: '125px', 
              top: '125px',
              boxShadow: '0 0 8px 2px rgba(255, 255, 0, 0.6)'
            }}
          />
          
          {/* Player direction indicator */}
          <div 
            className="absolute w-0 h-0 z-10"
            style={{ 
              left: '125px', 
              top: '125px',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '10px solid yellow',
              transformOrigin: 'center bottom',
              transform: `rotate(${rotation.y * (180 / Math.PI)}deg)`
            }}
          />
          
          <div className="absolute top-2 left-2 text-white text-xs">
            خريطة مدينة أمريكي المتكاملة
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setShowMap(false)}
          >
            إغلاق
          </Button>
        </div>
      </motion.div>
    );
  };
  
  // Environment effects based on weather and time settings
  const renderEnvironmentEffects = () => {
    // Weather effects
    if (settings.weatherCondition === 'rainy') {
      const raindrops = Array.from({ length: 100 }).map((_, i) => (
        <div
          key={`rain-${i}`}
          className="absolute bg-blue-200 opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            width: '1px',
            height: `${5 + Math.random() * 10}px`,
            animation: `falling-rain ${0.5 + Math.random() * 1}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ));
      
      return <div className="absolute inset-0 overflow-hidden pointer-events-none">{raindrops}</div>;
    }
    
    if (settings.weatherCondition === 'sandstorm') {
      const sandParticles = Array.from({ length: 50 }).map((_, i) => (
        <div
          key={`sand-${i}`}
          className="absolute rounded-full bg-yellow-700 opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            animation: `floating-dust ${3 + Math.random() * 7}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ));
      
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-yellow-700 bg-opacity-20">
          {sandParticles}
        </div>
      );
    }
    
    if (settings.weatherCondition === 'cloudy') {
      const clouds = Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`cloud-${i}`}
          className="absolute bg-white rounded-full opacity-70"
          style={{
            left: `-20%`,
            top: `${10 + Math.random() * 30}%`,
            width: `${100 + Math.random() * 200}px`,
            height: `${50 + Math.random() * 100}px`,
            animation: `floating-cloud ${30 + Math.random() * 60}s linear infinite`,
            animationDelay: `${Math.random() * 30}s`,
            filter: 'blur(10px)'
          }}
        />
      ));
      
      return <div className="absolute inset-0 overflow-hidden pointer-events-none">{clouds}</div>;
    }
    
    // Time of day effects
    if (settings.timeOfDay === 'night') {
      const stars = Array.from({ length: 100 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            animation: `pulse-gentle ${1 + Math.random() * 2}s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ));
      
      // Building windows that light up at night
      const windows = buildings.map(building => {
        // Only create windows for buildings in view
        const relX = building.position.x - position.x;
        const relZ = building.position.z - position.z;
        const distance = Math.sqrt(relX * relX + relZ * relZ);
        
        if (distance > 100) return null;
        
        const angle = Math.atan2(relX, relZ) - rotation.y;
        const normalizedAngle = ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
        
        if (Math.abs(normalizedAngle) > Math.PI / 2) return null;
        
        const scale = 1 / (distance * 0.1 + 1);
        const screenX = 50 + 50 * Math.sin(normalizedAngle);
        
        return Array.from({ length: Math.floor(3 + Math.random() * 5) }).map((_, i) => (
          <div
            key={`window-${building.id}-${i}`}
            className="absolute bg-yellow-300 rounded-sm"
            style={{
              left: `${screenX + (Math.random() * 10 - 5) * scale}%`,
              bottom: `${20 + (20 + Math.random() * 10) * scale}%`,
              width: `${3 * scale}px`,
              height: `${4 * scale}px`,
              transform: `scale(${scale})`,
              opacity: 0.8,
              animation: `blink-window ${10 + Math.random() * 20}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
              zIndex: Math.floor(1000 - distance + 1)
            }}
          />
        ));
      });
      
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-blue-900 bg-opacity-50">
          {stars}
          {windows}
          <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-gray-300 blur-md opacity-60" />
        </div>
      );
    }
    
    if (settings.timeOfDay === 'dawn' || settings.timeOfDay === 'dusk') {
      const gradient = settings.timeOfDay === 'dawn' 
        ? 'linear-gradient(to top, #ff7e5f, #feb47b, #ffcda5, #4ca1af, #2c3e50)' 
        : 'linear-gradient(to top, #ff7e5f, #feb47b, #ff5f6d, #a42e6c, #2c3e50)';
      
      return (
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none opacity-30"
          style={{ background: gradient }}
        />
      );
    }
    
    return null;
  };
  
  // Mobile touch controls
  const renderTouchControls = () => {
    if (!isMobile) return null;
    
    return (
      <TouchControls
        onMove={(direction) => {
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
        }}
        onLook={rotate}
        showControls={true}
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-auto z-40"
      />
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-blue-300 to-blue-600">
      {/* Environment styling based on time of day and weather */}
      <div className="absolute inset-0 z-0">
        {settings.timeOfDay === 'day' && settings.weatherCondition === 'clear' && (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600" />
        )}
        {settings.timeOfDay === 'night' && (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black" />
        )}
        {settings.timeOfDay === 'dawn' && (
          <div className="absolute inset-0 bg-gradient-to-b from-orange-300 to-blue-600" />
        )}
        {settings.timeOfDay === 'dusk' && (
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500 to-purple-900" />
        )}
      </div>
      
      {/* Environment effects (rain, clouds, etc.) */}
      {renderEnvironmentEffects()}
      
      {/* 3D world container */}
      <div className="absolute inset-0 perspective z-10">
        {/* Main content changes based on view mode */}
        {isInteriorView ? (
          <EnterBuilding
            buildingName={activeBuilding || "المبنى"}
            insideComponent={
              <div className="relative w-full h-full bg-gray-100">
                {activeBuilding === "وكالة السفر" && <AirplaneBuildingInterior />}
                {activeBuilding === "متجر الأزياء" && <VirtualFittingRoom outfits={[
                  { id: 1, name: "تيشيرت كاجوال", image: "/images/product-templates/tshirt.png", price: 150 },
                  { id: 2, name: "قميص رسمي", image: "/images/product-templates/formal-shirt.png", price: 250 },
                  { id: 3, name: "بنطلون جينز", image: "/images/product-templates/jeans.png", price: 200 },
                ]} />}
                {activeBuilding === "متجر الإلكترونيات" && (
                  <div className="flex flex-wrap justify-center items-center p-8">
                    <ThreeProductView color="#4dd0e1" showControls={true} />
                    <div className="text-center mt-4">
                      <h2 className="text-2xl font-bold">منتجاتنا الإلكترونية</h2>
                      <p>استكشف أحدث الأجهزة والتقنيات</p>
                    </div>
                  </div>
                )}
                <Button
                  className="absolute top-4 right-4"
                  onClick={() => setIsInteriorView(false)}
                >
                  خروج
                </Button>
              </div>
            }
            outsideComponent={<div />}
            initiallyInside={true}
            onExit={() => setIsInteriorView(false)}
          />
        ) : (
          <>
            {/* 3D buildings */}
            <div className="absolute inset-0">
              {renderBuildings()}
              {renderNPCs()}
            </div>
          </>
        )}
      </div>
      
      {/* HUD elements (always visible) */}
      {renderHUD()}
      
      {/* Control panel (togglable) */}
      {renderControlPanel()}
      
      {/* Minimap */}
      {renderMinimap()}
      
      {/* Mobile touch controls */}
      {renderTouchControls()}
      
      {/* Dynamic promotions */}
      <DynamicPromotions 
        position={{ bottom: '80px', right: '10px' }}
        animated={true}
        variant="highlight"
      />
      
      {/* Custom CSS animations */}
      <style>{`
        @keyframes falling-rain {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        
        @keyframes floating-dust {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(100px, 50px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        @keyframes floating-cloud {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        
        @keyframes pulse-gentle {
          0% {
            opacity: 0.5;
          }
          100% {
            opacity: 0.8;
          }
        }
        
        @keyframes blink-window {
          0%, 92%, 100% {
            opacity: 0.8;
          }
          95% {
            opacity: 0.2;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes animate-border-tl {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(100%, 0);
          }
          50% {
            transform: translate(100%, 100%);
          }
          75% {
            transform: translate(0, 100%);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        @keyframes animate-border-tr {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(0, 100%);
          }
          50% {
            transform: translate(-100%, 100%);
          }
          75% {
            transform: translate(-100%, 0);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        @keyframes animate-border-bl {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(0, -100%);
          }
          50% {
            transform: translate(100%, -100%);
          }
          75% {
            transform: translate(100%, 0);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        @keyframes animate-border-br {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-100%, 0);
          }
          50% {
            transform: translate(-100%, -100%);
          }
          75% {
            transform: translate(0, -100%);
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
}