import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useVR } from '@/hooks/use-vr';
import { useMovement } from '@/hooks/use-movement';
import AirplaneBuildingInterior from './airplane-building-interior';
import EnterBuilding from './enter-building';
import StoreInteraction from './store-interaction';
import TouchControls from './touch-controls';
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
    // Set starting position 5 units in front of center
    movement.resetPosition();
    
    // Apply speed based on Unity's speed parameter
    movement.setSpeed(5);
  }, []);
  
  // Define building layout based on Unity TownBuilder script
  // This matches the provided Unity code structure with the same positions
  const buildings: Building[] = [
    {
      id: 'travelAgency',
      name: 'وكالة السفر', // مبنى وكالة السفر
      type: 'travel',
      position: { x: 0, y: 0, z: 0 }, // matches Vector3(0, 0, 0) in Unity
      rotation: 0,
      scale: 1,
      color: '#3b82f6', // blue-500
      icon: 'fa-plane'
    },
    {
      id: 'clothingStore',
      name: 'متجر الملابس', // متجر الملابس
      type: 'clothing',
      position: { x: 10, y: 0, z: 0 }, // matches Vector3(10, 0, 0) in Unity
      rotation: 0,
      scale: 1,
      color: '#f59e0b', // amber-500
      icon: 'fa-tshirt'
    },
    {
      id: 'electronicsStore',
      name: 'متجر الإلكترونيات', // متجر الإلكترونيات
      type: 'electronics',
      position: { x: -10, y: 0, z: 0 }, // matches Vector3(-10, 0, 0) in Unity
      rotation: 0,
      scale: 1,
      color: '#10b981', // emerald-500
      icon: 'fa-laptop'
    }
  ];
  
  // State to track active building
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  
  // Register buildings as collision objects
  useEffect(() => {
    // Clear existing collision objects
    buildings.forEach(building => {
      movement.addCollisionObject({
        id: building.id,
        position: building.position,
        size: { width: 5, height: 5, depth: 5 },
        type: 'object',
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
    
    return () => {
      buildings.forEach(building => {
        movement.removeCollisionObject(building.id);
      });
      movement.removeCollisionObject('road');
    };
  }, [movement]);
  
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
          <div className="flex flex-col items-center justify-center h-full bg-amber-50 text-black p-4">
            <h2 className="text-2xl font-bold mb-4">متجر الملابس</h2>
            <p className="text-center mb-6">مرحبًا بك في متجر الملابس. استكشف أحدث الأزياء والموديلات.</p>
            <Button>تصفح المنتجات</Button>
          </div>
        );
      case 'electronics':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-emerald-50 text-black p-4">
            <h2 className="text-2xl font-bold mb-4">متجر الإلكترونيات</h2>
            <p className="text-center mb-6">مرحبًا بك في متجر الإلكترونيات. استكشف أحدث المنتجات التقنية.</p>
            <Button>تصفح المنتجات</Button>
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
      
      return (
        <motion.div
          key={building.id}
          className="absolute flex items-center justify-center"
          style={{
            ...style,
            perspective: '1000px',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StoreInteraction
            storePosition={building.position}
            storeName={building.name}
            interiorComponent={getStoreInterior(building.type)}
            triggerDistance={2.5}
            onEnter={() => setActiveBuilding(building.id)}
            onExit={() => setActiveBuilding(null)}
            storeColor={building.color}
            storeIcon={building.icon}
          />
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
  const renderSky = () => (
    <div 
      className="absolute inset-0 z-0" 
      style={{
        background: 'linear-gradient(to bottom, #1e40af 0%, #3b82f6 60%, #93c5fd 100%)',
      }}
    >
      {/* Simple clouds */}
      <div className="absolute w-20 h-10 bg-white rounded-full blur-sm opacity-70" style={{ left: '10%', top: '15%' }}></div>
      <div className="absolute w-32 h-16 bg-white rounded-full blur-sm opacity-70" style={{ left: '30%', top: '10%' }}></div>
      <div className="absolute w-24 h-12 bg-white rounded-full blur-sm opacity-70" style={{ right: '20%', top: '20%' }}></div>
      
      {/* Sun */}
      <div className="absolute w-16 h-16 rounded-full bg-yellow-300 opacity-90" style={{ right: '15%', top: '5%', boxShadow: '0 0 30px rgba(253, 224, 71, 0.8)' }}></div>
    </div>
  );
  
  return (
    <div className="relative w-full h-[calc(100vh-8rem)] overflow-hidden border border-gray-800 rounded-lg bg-black">
      {/* Background sky */}
      {renderSky()}
      
      {/* Road layer */}
      {renderRoad()}
      
      {/* Buildings */}
      {renderBuildings()}
      
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