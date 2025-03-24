import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useVR } from '@/hooks/use-vr';
import { useMovement } from '@/hooks/use-movement';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';

interface Building {
  id: string;
  name: string;
  type: 'travel' | 'clothing' | 'electronics' | 'other';
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: number;
  color: string;
  icon: string;
}

/**
 * CityBuilder Component
 * 
 * React implementation of Unity's CityBuilder.cs
 * Creates a virtual city with different buildings for the user to explore
 */
export default function CityBuilder() {
  const { vrEnabled, gestureControlEnabled } = useVR();
  const isMobile = useIsMobile();
  
  // Set up movement and collisions, based on Unity PlayerController
  const movement = useMovement();
  
  // Initialize position similar to Unity's transform.position
  useEffect(() => {
    // This function should only run once at component mount
    const initializePosition = () => {
      // Set starting position 5 units in front of center
      movement.resetPosition();
      
      // Apply speed based on Unity's speed parameter
      movement.setSpeed(5);
    };
    
    initializePosition();
    // Empty dependency array means this runs once on mount
  }, []);
  
  // Define building layout based on Unity TownBuilder script
  // This matches the provided Unity code structure with the same positions
  const buildings: Building[] = [
    {
      id: 'travelAgency',
      name: 'وكالة السفر العربي', // Arab Travel Agency
      type: 'travel',
      position: { x: 0, y: 0, z: 0 }, // matches Vector3(0, 0, 0) in Unity
      rotation: 0,
      scale: 1.8, // Increased size to make it more prominent
      color: '#2563eb', // blue-600
      icon: 'fa-plane'
    },
    {
      id: 'clothingStore',
      name: 'متجر الملابس الفاخرة', // Luxury Clothing Store
      type: 'clothing',
      position: { x: 12, y: 0, z: 2 }, // moved further right and slightly forward
      rotation: 15, // rotated slightly
      scale: 1.2,
      color: '#f59e0b', // amber-500
      icon: 'fa-tshirt'
    },
    {
      id: 'electronicsStore',
      name: 'متجر الإلكترونيات والتقنية', // Electronics & Tech Store
      type: 'electronics',
      position: { x: -12, y: 0, z: 2 }, // moved further left and slightly forward
      rotation: -15, // rotated slightly in opposite direction
      scale: 1.2,
      color: '#10b981', // emerald-500
      icon: 'fa-laptop'
    }
  ];
  
  // State to track active building and gate
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState<boolean>(false);
  
  // Define gate positions based on Unity GateControl concept
  const gates = [
    {
      id: 'mainGate',
      position: { x: 0, y: 0, z: 5 },
      name: 'البوابة الرئيسية',
    },
    {
      id: 'mallGate',
      position: { x: 5, y: 0, z: 5 },
      name: 'بوابة المجمع التجاري',
    }
  ];

  // Register buildings and gates as collision objects
  useEffect(() => {
    // We need to create a stable reference to the buildings functions
    const addBuildingCollisions = () => {
      // Clear existing collision objects
      buildings.forEach(building => {
        movement.addCollisionObject({
          id: building.id,
          position: building.position,
          size: { width: 5, height: 5, depth: 5 },
          type: 'object',
        });
      });
      
      // Add gates as trigger zones (not solid objects)
      gates.forEach(gate => {
        movement.addCollisionObject({
          id: gate.id,
          position: gate.position,
          size: { width: 3, height: 5, depth: 3 },
          type: 'trigger',
          onCollision: () => setGateOpen(true),
        });
      });
      
      // Add road collision - matches road position in Unity's TownBuilder
      // Instantiate(road, new Vector3(0, -1, 0), Quaternion.identity);
      movement.addCollisionObject({
        id: 'road',
        position: { x: 0, y: -1, z: 0 }, // matches Vector3(0, -1, 0) in Unity
        size: { width: 50, height: 0.1, depth: 50 },
        type: 'object',
      });
    };
    
    // Add all building collisions
    addBuildingCollisions();
    
    // Cleanup function to remove collisions when unmounted
    return () => {
      buildings.forEach(building => {
        movement.removeCollisionObject(building.id);
      });
      gates.forEach(gate => {
        movement.removeCollisionObject(gate.id);
      });
      movement.removeCollisionObject('road');
    };
  }, [movement.addCollisionObject, movement.removeCollisionObject]);
  
  const getPositionStyle = (position: { x: number; y: number; z: number }) => {
    // Convert 3D position to 2D screen coordinates
    // This is a simplified version of what Unity would do with a camera projection
    const scale = 15; // Adjust based on viewport size
    const centerX = 50; // Center of the screen as percentage
    const centerZ = 50;
    
    // Calculate position relative to player
    const relX = position.x - movement.position.x;
    const relZ = position.z - movement.position.z;
    
    // Apply simple rotation matrix based on player's Y rotation
    const angle = movement.rotation.y * (Math.PI / 180);
    const rotatedX = relX * Math.cos(angle) - relZ * Math.sin(angle);
    const rotatedZ = relX * Math.sin(angle) + relZ * Math.cos(angle);
    
    // Convert to screen percentage
    const screenX = centerX + (rotatedX * scale);
    const screenZ = centerZ + (rotatedZ * scale);
    
    // Calculate distance for size and opacity
    const distance = Math.sqrt(relX * relX + relZ * relZ);
    const size = Math.max(20, 100 - (distance * 5)); // Size decreases with distance
    const opacity = Math.min(1, 2 - (distance / 10)); // Fade out with distance
    
    return {
      left: `${screenX}%`,
      top: `${screenZ}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity,
      zIndex: Math.floor(1000 - distance),
    };
  };
  
  const getStoreInterior = (buildingType: string) => {
    switch (buildingType) {
      case 'travel':
        return <AirplaneBuildingInterior />;
      case 'clothing':
        return (
          <div className="flex flex-col h-full bg-amber-50 text-black p-4">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold">متجر الملابس</h2>
              <p className="text-sm text-gray-600 mb-4">استكشف أحدث الأزياء والموديلات</p>
              <div className="h-1 w-32 bg-amber-400 mx-auto"></div>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row gap-4">
              {/* Left side - virtual fitting room */}
              <div className="flex-1 h-full">
                <div className="bg-white rounded-lg shadow-md p-3 h-full flex flex-col">
                  <h3 className="text-lg font-semibold mb-3 text-amber-700">غرفة تجربة الملابس الافتراضية</h3>
                  
                  <div className="flex-1 bg-amber-50 rounded-md flex flex-col items-center justify-center">
                    <VirtualFittingRoom 
                      outfits={[
                        {
                          id: 1,
                          name: "قميص كاجوال",
                          image: "/images/product-templates/adidas-tshirt.svg",
                          price: 299
                        },
                        {
                          id: 2,
                          name: "حذاء رياضي",
                          image: "/images/product-templates/nike-shoes.svg",
                          price: 799
                        },
                        {
                          id: 3,
                          name: "بنطلون جينز",
                          image: "/images/product-templates/levis-jeans.svg",
                          price: 450
                        }
                      ]}
                      showControls={true}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right side - dynamic promotions and store info */}
              <div className="w-full md:w-64">
                <div className="bg-white rounded-lg shadow-md p-3 mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-amber-700">عروض اليوم</h3>
                  <DynamicPromotions 
                    variant="highlight"
                    animated={true}
                  />
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-3">
                  <h3 className="text-lg font-semibold mb-2 text-amber-700">معلومات المتجر</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <span className="ml-2">⏰</span>
                      <span>ساعات العمل: 9ص - 10م</span>
                    </li>
                    <li className="flex items-center">
                      <span className="ml-2">📱</span>
                      <span>الهاتف: 1234-567-8910+</span>
                    </li>
                    <li className="flex items-center">
                      <span className="ml-2">🏬</span>
                      <span>الطابق الثاني، المدخل الرئيسي</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">تصفح المنتجات</Button>
            </div>
          </div>
        );
      case 'electronics':
        return (
          <div className="flex flex-col h-full bg-emerald-50 text-black p-4">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold">متجر الإلكترونيات</h2>
              <p className="text-sm text-gray-600 mb-4">استكشف أحدث المنتجات التقنية والأجهزة الذكية</p>
              <div className="h-1 w-32 bg-emerald-400 mx-auto"></div>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row gap-4">
              {/* Left side - 3D product view */}
              <div className="flex-1 h-full">
                <div className="bg-white rounded-lg shadow-md p-3 h-full flex flex-col">
                  <h3 className="text-lg font-semibold mb-3 text-emerald-700">عرض ثلاثي الأبعاد للمنتج</h3>
                  
                  <div className="flex-1 bg-[#1a1a2e] rounded-md flex flex-col items-center justify-center">
                    <ThreeProductView 
                      color="#10b981"
                      rotationSpeed={0.02}
                      height={250}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right side - product info and daily promotions */}
              <div className="w-full md:w-64">
                <div className="bg-white rounded-lg shadow-md p-3 mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-emerald-700">عروض اليوم</h3>
                  <DynamicPromotions 
                    variant="default"
                    animated={true}
                  />
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-3">
                  <h3 className="text-lg font-semibold mb-2 text-emerald-700">مواصفات المنتج</h3>
                  <ul className="text-sm text-gray-600 space-y-2 mr-4 list-disc" style={{ direction: 'rtl' }}>
                    <li>معالج متطور</li>
                    <li>ذاكرة 16 جيجابايت</li>
                    <li>شاشة عالية الوضوح</li>
                    <li>بطارية طويلة العمر</li>
                    <li>ضمان لمدة عامين</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">إضافة إلى السلة</Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 text-black">
            المتجر غير متاح
          </div>
        );
    }
  };
  
  const renderBuildings = () => {
    return buildings.map((building) => {
      const style = getPositionStyle(building.position);
      
      // Check if building should be rendered (in front of camera)
      if (style.opacity <= 0.1) return null;
      
      // Special styling for different building types
      const isTravelAgency = building.id === 'travelAgency';
      const isClothingStore = building.id === 'clothingStore';
      const isElectronicsStore = building.id === 'electronicsStore';
      
      // 3D building style with rotation
      const buildingRotation = building.rotation || 0;
      
      // Effect color based on building type
      const glowColor = building.color;
      const shadowColor = `${glowColor}80`; // semi-transparent glow
      
      return (
        <motion.div
          key={building.id}
          className="absolute flex items-center justify-center"
          style={{
            ...style,
            perspective: '1000px',
            transform: `rotateY(${buildingRotation}deg)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: building.scale || 1,
            opacity: style.opacity,
            y: isTravelAgency ? [0, -5, 0] : 0,
          }}
          transition={
            isTravelAgency 
              ? { 
                  y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                  scale: { duration: 0.7, ease: "easeOut" },
                  opacity: { duration: 0.5 }
                }
              : {
                  scale: { duration: 0.7, ease: "easeOut" },
                  opacity: { duration: 0.5 }
                }
          }
          whileHover={{ 
            scale: (building.scale || 1) * 1.05,
            boxShadow: `0 0 15px ${shadowColor}`,
          }}
          whileTap={{ scale: (building.scale || 1) * 0.95 }}
        >
          {/* Building wrapper with 3D effect */}
          <div className="relative group">
            {/* 3D building body */}
            <div 
              className="relative rounded-lg overflow-hidden transition-all duration-300"
              style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${building.color}, ${building.color}99)`,
                boxShadow: `0 5px 15px rgba(0,0,0,0.3), 0 0 8px ${shadowColor}`,
                border: `2px solid ${building.color}33`,
                transform: `perspective(500px) rotateX(10deg)`,
              }}
            >
              {/* Building facade with windows */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1 opacity-60">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-white/20 rounded-sm"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animation: i % 3 === 1 ? 'pulse 4s infinite' : 'none'
                    }}
                  />
                ))}
              </div>
              
              {/* Building nameplate */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-xs p-1 backdrop-blur-sm"
                style={{ direction: 'rtl' }}
              >
                {building.name}
              </div>
              
              {/* Store logo/icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <i 
                  className={`fas ${building.icon} text-white/80 text-4xl`}
                  style={{
                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
                    animation: 'pulse 3s infinite'
                  }}
                ></i>
              </div>
            </div>
            
            {/* Floating indicator/effects */}
            <motion.div 
              className={`absolute -top-4 -right-4 text-xl z-10 ${isElectronicsStore ? 'text-emerald-400' : isClothingStore ? 'text-amber-400' : 'text-blue-400'}`}
              animate={{ 
                y: [-3, 3, -3],
                rotate: isElectronicsStore ? [0, 15, 0, -15, 0] : isClothingStore ? [0, -10, 0] : [0, 10, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: isElectronicsStore ? 5 : 3,
                ease: "easeInOut" 
              }}
            >
              {isElectronicsStore ? '🖥️' : isClothingStore ? '👕' : '✈️'}
            </motion.div>
          </div>
          
          {/* Store interaction component */}
          <StoreInteraction
            storePosition={building.position}
            storeName={building.name}
            interiorComponent={getStoreInterior(building.type)}
            triggerDistance={3.5} // Increased trigger distance
            onEnter={() => setActiveBuilding(building.id)}
            onExit={() => setActiveBuilding(null)}
            storeColor={building.color}
            storeIcon={building.icon}
          />
          
          {/* Special indicator for different store types */}
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <motion.div 
              className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                isTravelAgency ? 'bg-yellow-400 text-blue-900' : 
                isClothingStore ? 'bg-amber-400 text-amber-900' :
                'bg-emerald-400 text-emerald-900'
              }`}
              animate={{ 
                scale: [1, 1.1, 1],
                y: isTravelAgency ? [0, -3, 0] : isClothingStore ? [0, -2, 0] : [0, -1, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: isTravelAgency ? 2 : isClothingStore ? 3 : 4
              }}
            >
              {isTravelAgency ? 'السفر العربي' : 
               isClothingStore ? 'أزياء فاخرة' : 
               'إلكترونيات متطورة'}
            </motion.div>
          </div>
        </motion.div>
      );
    });
  };
  
  const renderRoad = () => {
    // Simple road representation
    return (
      <div 
        className="absolute"
        style={{
          width: '100%',
          height: '60%',
          left: '0',
          top: '40%',
          background: 'linear-gradient(0deg, #374151 0%, #1f2937 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          transform: 'rotateX(60deg)',
          zIndex: 1,
          borderTop: '2px solid #f59e0b',
          borderBottom: '2px solid #f59e0b',
        }}
      >
        {/* Road markings */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[5px] bg-yellow-400 opacity-80" style={{ transform: 'translateX(-50%)' }}></div>
        
        {/* Crosswalks */}
        <div className="absolute left-1/4 top-0 bottom-0 w-4 flex flex-col justify-around">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-white opacity-70"></div>
          ))}
        </div>
        
        <div className="absolute right-1/4 top-0 bottom-0 w-4 flex flex-col justify-around">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-white opacity-70"></div>
          ))}
        </div>
      </div>
    );
  };
  
  // Simplified sky
  // Enhanced sky with day/night cycle inspired by Unity's DayNightCycle script
  const renderSky = () => {
    // Get time of day (could be dynamic in a more complex implementation)
    const timeOfDay = 'day'; // Can be 'dawn', 'day', 'dusk', 'night'
    
    // Sky gradients for different times of day - similar to setting Skybox materials in Unity
    const skyGradients = {
      dawn: 'linear-gradient(to bottom, #0c0a3e 0%, #6b2d5c 20%, #f7b733 60%, #f2f2f2 100%)',
      day: 'linear-gradient(to bottom, #0078ff 0%, #3b82f6 40%, #93c5fd 100%)',
      dusk: 'linear-gradient(to bottom, #2c3e50 0%, #fd746c 60%, #ff9068 100%)',
      night: 'linear-gradient(to bottom, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    };
    
    // Stars only visible at night
    const showStars = timeOfDay === 'night';
    
    return (
      <div 
        className="absolute inset-0 z-0 overflow-hidden" 
        style={{
          background: skyGradients[timeOfDay],
          transition: 'background 2s ease-in-out',
        }}
      >
        {/* Animated stars */}
        {showStars && (
          <div className="absolute inset-0">
            {Array.from({ length: 100 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  opacity: Math.random() * 0.7 + 0.3,
                  animation: `twinkle ${Math.random() * 5 + 3}s infinite alternate`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Enhanced clouds with animation */}
        <div className="absolute top-0 left-0 right-0 h-60 overflow-hidden">
          {/* First cloud layer - closer, faster */}
          <div className="absolute left-0 right-0 top-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`cloud1-${i}`}
                className="absolute"
                style={{
                  left: `${(i * 20 + Math.random() * 10)}%`,
                  top: `${Math.random() * 20}%`,
                  opacity: 0.7,
                  animation: 'driftRight 30s linear infinite',
                  animationDelay: `${i * -6}s`,
                }}
              >
                <div className="cloud flex">
                  <div className="w-16 h-16 bg-white rounded-full"></div>
                  <div className="w-20 h-20 bg-white rounded-full -mr-6"></div>
                  <div className="w-16 h-16 bg-white rounded-full -mr-6"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Second cloud layer - further, slower */}
          <div className="absolute left-0 right-0 top-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={`cloud2-${i}`}
                className="absolute"
                style={{
                  left: `${(i * 25 + Math.random() * 15)}%`,
                  top: `${Math.random() * 10}%`,
                  opacity: 0.5,
                  transform: 'scale(1.5)',
                  animation: 'driftRight 45s linear infinite',
                  animationDelay: `${i * -11}s`,
                }}
              >
                <div className="cloud flex">
                  <div className="w-16 h-16 bg-white rounded-full"></div>
                  <div className="w-20 h-20 bg-white rounded-full -mr-6"></div>
                  <div className="w-16 h-16 bg-white rounded-full -mr-6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dynamic sun/moon based on time of day */}
        {timeOfDay === 'day' && (
          <div 
            className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-200"
            style={{ 
              right: '15%', 
              top: '5%', 
              boxShadow: '0 0 40px rgba(253, 224, 71, 0.9)',
              animation: 'pulseSun 8s ease-in-out infinite alternate'
            }}
          >
            {/* Sun rays */}
            <div className="absolute inset-0 sun-rays"></div>
          </div>
        )}
        
        {timeOfDay === 'night' && (
          <div 
            className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-slate-100 to-slate-300"
            style={{ 
              right: '25%', 
              top: '15%', 
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
            }}
          >
            {/* Moon craters */}
            <div className="absolute w-3 h-3 rounded-full bg-slate-300 top-3 left-5 opacity-80"></div>
            <div className="absolute w-2 h-2 rounded-full bg-slate-300 top-6 left-10 opacity-80"></div>
            <div className="absolute w-4 h-4 rounded-full bg-slate-300 top-9 left-3 opacity-80"></div>
          </div>
        )}
        
        {/* Dynamic horizon glow (dawn/dusk only) */}
        {(timeOfDay === 'dawn' || timeOfDay === 'dusk') && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/3"
            style={{
              background: timeOfDay === 'dawn' 
                ? 'linear-gradient(to top, rgba(255, 140, 50, 0.5) 0%, transparent 100%)'
                : 'linear-gradient(to top, rgba(255, 80, 80, 0.5) 0%, transparent 100%)',
              opacity: 0.7,
            }}
          />
        )}
      </div>
    );
  };
  
  // Screen message state (based on ScreenInteraction.cs)
  const [screenMessage, setScreenMessage] = useState<string | null>(null);
  
  // Function to render gates based on Unity GateControl
  const renderGates = () => {
    return gates.map((gate) => {
      const style = getPositionStyle(gate.position);
      
      // Don't render gates that are too far away
      if (style.opacity <= 0.1) return null;
      
      // Calculate if player is near the gate
      const distX = movement.position.x - gate.position.x;
      const distZ = movement.position.z - gate.position.z;
      const distance = Math.sqrt(distX * distX + distZ * distZ);
      const isNearGate = distance < 3;
      
      // Apply animation when player approaches - similar to Unity's OnTriggerEnter
      const isOpen = gateOpen || isNearGate;
      
      return (
        <motion.div
          key={gate.id}
          className="absolute"
          style={{
            ...style,
            perspective: '1000px',
          }}
        >
          {/* Gate structure */}
          <div className="relative" style={{ width: '100px', height: '120px' }}>
            {/* Gate frame */}
            <div className="absolute inset-0 border-4 border-gray-700 bg-gray-800 rounded-t-lg">
              {/* Gate doors */}
              <div className="relative w-full h-full overflow-hidden">
                {/* Left door */}
                <motion.div
                  className="absolute top-0 bottom-0 left-0 w-1/2 bg-gray-600 border-r border-gray-700"
                  animate={{
                    x: isOpen ? '-100%' : '0%',
                  }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Right door */}
                <motion.div
                  className="absolute top-0 bottom-0 right-0 w-1/2 bg-gray-600 border-l border-gray-700"
                  animate={{
                    x: isOpen ? '100%' : '0%',
                  }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Gate sign */}
                <div 
                  className="absolute top-0 left-0 right-0 p-1 text-center text-white bg-blue-900 text-xs"
                  style={{ direction: 'rtl' }}
                >
                  {gate.name}
                </div>
              </div>
            </div>
            
            {/* Interactive screen - based on ScreenInteraction.cs */}
            <div 
              className="absolute bottom-[-40px] left-[15px] w-[70px] h-[30px] bg-black/80 border border-blue-500 rounded flex items-center justify-center cursor-pointer"
              onClick={() => setScreenMessage(`مرحباً بك في ${gate.name}!`)}
            >
              <span className="text-blue-400 text-xs">اضغط هنا</span>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  // Traffic light states
  const [trafficLightStates, setTrafficLightStates] = useState<Record<string, 'red' | 'yellow' | 'green'>>({
    'main-intersection': 'red',
    'east-intersection': 'green'
  });
  
  return (
    <div className="relative w-full h-[calc(100vh-8rem)] overflow-hidden border border-gray-800 rounded-lg bg-black">
      {/* Background sky */}
      {renderSky()}
      
      {/* Road layer */}
      {renderRoad()}
      
      {/* Buildings */}
      {renderBuildings()}
      
      {/* Gates */}
      {renderGates()}
      
      {/* Traffic lights */}
      <TrafficLight 
        position={{ x: -5, y: 0, z: 5 }}
        initialState="red"
        cycleTime={10}
        playerPosition={movement.position}
        onStateChange={(state) => setTrafficLightStates(prev => ({ ...prev, 'main-intersection': state }))}
        size={1.2}
      />
      
      <TrafficLight 
        position={{ x: 5, y: 0, z: -5 }}
        initialState="green"
        cycleTime={8}
        playerPosition={movement.position}
        onStateChange={(state) => setTrafficLightStates(prev => ({ ...prev, 'east-intersection': state }))}
      />
      
      {/* Cars */}
      <CarTraffic 
        carStyle="sedan"
        direction="left-to-right"
        speed={5}
        trafficLightPosition={{ x: -5, y: 0, z: 5 }}
        trafficLightState={trafficLightStates['main-intersection']}
        playerPosition={movement.position}
        laneOffset={2}
      />
      
      <CarTraffic 
        carStyle="taxi"
        direction="right-to-left"
        speed={4}
        trafficLightPosition={{ x: -5, y: 0, z: 5 }}
        trafficLightState={trafficLightStates['main-intersection']}
        playerPosition={movement.position}
        laneOffset={-2}
        initialDelay={2000}
      />
      
      <CarTraffic 
        carStyle="suv"
        direction="bottom-to-top"
        speed={3}
        trafficLightPosition={{ x: 5, y: 0, z: -5 }}
        trafficLightState={trafficLightStates['east-intersection']}
        playerPosition={movement.position}
        laneOffset={10}
        initialDelay={1000}
      />
      
      <CarTraffic 
        carStyle="truck"
        direction="top-to-bottom"
        speed={2}
        trafficLightPosition={{ x: 5, y: 0, z: -5 }}
        trafficLightState={trafficLightStates['east-intersection']}
        playerPosition={movement.position}
        laneOffset={-10}
        initialDelay={3000}
      />
      
      {/* Screen message - based on ScreenInteraction.cs */}
      {screenMessage && (
        <motion.div 
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 border-2 border-blue-500 rounded-lg p-4 text-white text-center z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <p className="text-xl font-bold mb-2">{screenMessage}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setScreenMessage(null)}
            className="mt-2"
          >
            إغلاق
          </Button>
        </motion.div>
      )}
      
      {/* Controls for mobile */}
      {isMobile && (
        <div className="absolute bottom-4 left-0 right-0 z-50">
          <TouchControls 
            onMove={(direction) => {
              if (direction === 'forward') movement.moveForward();
              if (direction === 'backward') movement.moveBackward();
              if (direction === 'left') movement.moveLeft();
              if (direction === 'right') movement.moveRight();
            }}
            onLook={(deltaX, deltaY) => movement.rotate(deltaX, deltaY)}
            showControls={true}
          />
        </div>
      )}
      
      {/* Status indicator */}
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm backdrop-blur-sm">
        <div>الموقع: X:{Math.round(movement.position.x)} Z:{Math.round(movement.position.z)}</div>
        <div>الاتجاه: {Math.round(movement.rotation.y)}°</div>
        {activeBuilding && <div className="text-green-400">المبنى النشط: {buildings.find(b => b.id === activeBuilding)?.name}</div>}
      </div>
      
      {/* Control instructions */}
      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm backdrop-blur-sm">
        {!isMobile ? (
          <>
            <div>استخدم W,A,S,D للتحرك</div>
            <div>الماوس للنظر حولك</div>
          </>
        ) : (
          <div>استخدم وحدة التحكم الافتراضية للتنقل</div>
        )}
      </div>
    </div>
  );
}