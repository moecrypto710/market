import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CityMapProps {
  playerPosition?: { x: number; y: number; z: number };
  buildings: Array<{
    id: string;
    name: string;
    type: string;
    position: { x: number; y: number; z: number };
    color: string;
  }>;
  pointsOfInterest?: Array<{
    id: string;
    name: string;
    position: { x: number; y: number; z: number };
    type: string;
    icon?: string;
  }>;
  onLocationSelect?: (buildingId: string, position: { x: number; y: number; z: number }) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showLabels?: boolean;
}

/**
 * Interactive 2D map component for the virtual city
 * Shows buildings, points of interest, and player location
 */
export default function CityMap({
  playerPosition = { x: 0, y: 0, z: 0 },
  buildings = [],
  pointsOfInterest = [],
  onLocationSelect,
  isExpanded = false,
  onToggleExpand,
  showLabels = false
}: CityMapProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ width: 300, height: 300 });
  
  // Map parameters for scaling and positioning
  const mapScale = 5; // Scale factor for converting 3D coordinates to 2D map
  const mapPadding = isExpanded ? 40 : 20; // Padding around the map
  
  // Set map size based on container and expanded state
  useEffect(() => {
    if (mapRef.current) {
      const size = isExpanded ? 400 : 200;
      setMapSize({ width: size, height: size });
    }
  }, [isExpanded, mapRef]);
  
  // Convert 3D coordinates to 2D map coordinates
  const toMapCoords = (pos: { x: number; y: number; z: number }) => {
    const centerX = mapSize.width / 2;
    const centerZ = mapSize.height / 2;
    
    return {
      x: centerX + pos.x / mapScale,
      y: centerZ + pos.z / mapScale  // Note: z-axis in 3D becomes y-axis in 2D map
    };
  };
  
  // Handle click on map item
  const handleItemClick = (id: string, position: { x: number; y: number; z: number }) => {
    setSelected(id);
    if (onLocationSelect) {
      onLocationSelect(id, position);
    }
  };
  
  // Calculate size of map elements based on expanded state
  const getItemSize = (type: 'building' | 'poi' | 'player') => {
    switch(type) {
      case 'building':
        return isExpanded ? 20 : 12;
      case 'poi':
        return isExpanded ? 16 : 10;
      case 'player':
        return isExpanded ? 14 : 8;
      default:
        return isExpanded ? 16 : 10;
    }
  };
  
  return (
    <div 
      className={`relative bg-slate-800 rounded-lg shadow-xl border border-blue-500/30 overflow-hidden transition-all duration-300 ${
        isExpanded ? 'w-[420px] h-[420px]' : 'w-[220px] h-[220px]'
      }`}
      ref={mapRef}
    >
      {/* Map toggle button */}
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2 z-10 bg-slate-800/80 border-blue-400/30 hover:bg-slate-700/80 text-blue-400"
        onClick={onToggleExpand}
      >
        <i className={`fas fa-${isExpanded ? 'compress-alt' : 'expand-alt'} text-xs`}></i>
      </Button>
      
      {/* Map title */}
      <div className="absolute top-2 left-2 z-10 text-white text-sm font-bold flex items-center">
        <i className="fas fa-map-marked text-blue-400 mr-2"></i>
        <span className={`${isExpanded ? 'block' : 'hidden'}`}>خريطة المدينة</span>
      </div>
      
      {/* Main map area */}
      <div 
        className="relative w-full h-full p-4"
        style={{
          background: `radial-gradient(circle, rgba(23,37,84,0.7) 0%, rgba(15,23,42,0.9) 100%)`,
          backgroundSize: '100% 100%',
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: `
                linear-gradient(to right, #4f46e5 1px, transparent 1px),
                linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
              `,
              backgroundSize: `${mapSize.width / 10}px ${mapSize.height / 10}px`
            }}
          />
        </div>
        
        {/* Compass rose */}
        <div className="absolute bottom-4 left-4 text-white/70 text-xs flex flex-col items-center">
          <div className="w-8 h-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform font-bold text-blue-400">N</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform font-bold text-blue-400/70">S</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 transform font-bold text-blue-400/70">W</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 transform font-bold text-blue-400/70">E</div>
            <div className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-400/40 rounded-full"></div>
            <div className="w-0.5 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-400/40"></div>
            <div className="w-6 h-0.5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-400/40"></div>
          </div>
        </div>
        
        {/* Buildings on the map */}
        {buildings.map((building) => {
          const mapPos = toMapCoords(building.position);
          const size = getItemSize('building');
          const isActive = selected === building.id;
          const isHovered = hoveredItem === building.id;
          
          return (
            <TooltipProvider key={building.id}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <motion.div
                    className={`absolute cursor-pointer ${isActive ? 'z-30' : 'z-10'}`}
                    style={{
                      left: mapPos.x - size/2,
                      top: mapPos.y - size/2,
                      width: size,
                      height: size,
                      backgroundColor: building.color,
                      borderRadius: '3px',
                      boxShadow: isActive || isHovered 
                        ? `0 0 10px 2px ${building.color}` 
                        : 'none'
                    }}
                    onClick={() => handleItemClick(building.id, building.position)}
                    onMouseEnter={() => setHoveredItem(building.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.2 }}
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      opacity: isHovered || isActive ? 1 : 0.8
                    }}
                  >
                    {(showLabels || isHovered || isActive) && (
                      <div 
                        className={`absolute whitespace-nowrap bg-slate-900/80 text-white px-2 py-0.5 rounded text-xs -translate-y-full -translate-x-1/4 transform -top-1 right-1/2 border-l-2 border-r-2`}
                        style={{ borderColor: building.color }}
                      >
                        {building.name}
                      </div>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs">
                    <div className="font-bold mb-1">{building.name}</div>
                    <div className="text-slate-400">
                      نوع: {building.type === 'travel' ? 'سفر وسياحة' : 
                             building.type === 'clothing' ? 'ملابس وأزياء' : 
                             building.type === 'electronics' ? 'إلكترونيات' : 'آخر'}
                    </div>
                    <div className="text-slate-400 mt-1">انقر للانتقال</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {/* Points of interest */}
        {pointsOfInterest.map((poi) => {
          const mapPos = toMapCoords(poi.position);
          const size = getItemSize('poi');
          const isActive = selected === poi.id;
          const isHovered = hoveredItem === poi.id;
          const icon = poi.icon || 'map-marker';
          
          return (
            <TooltipProvider key={poi.id}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <motion.div
                    className={`absolute cursor-pointer rounded-full bg-yellow-500/20 flex items-center justify-center ${isActive ? 'z-30' : 'z-20'}`}
                    style={{
                      left: mapPos.x - size/2,
                      top: mapPos.y - size/2,
                      width: size,
                      height: size
                    }}
                    onClick={() => handleItemClick(poi.id, poi.position)}
                    onMouseEnter={() => setHoveredItem(poi.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.2 }}
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      opacity: isHovered || isActive ? 1 : 0.8,
                      boxShadow: isActive || isHovered 
                        ? '0 0 8px 2px rgba(245, 158, 11, 0.5)' 
                        : '0 0 0px 0px rgba(245, 158, 11, 0)'
                    }}
                  >
                    <i className={`fas fa-${icon} text-amber-400 text-xs`}></i>
                    {(showLabels || isHovered || isActive) && (
                      <div 
                        className="absolute whitespace-nowrap bg-slate-900/80 text-amber-300 px-2 py-0.5 rounded text-xs -translate-y-full transform -top-1 right-0 border-l border-r border-amber-500/50"
                      >
                        {poi.name}
                      </div>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs">
                    <div className="font-bold mb-1 text-amber-400">{poi.name}</div>
                    <div className="text-slate-400">
                      نوع: {poi.type === 'entrance' ? 'مدخل' : 
                             poi.type === 'shopping' ? 'تسوق' : 
                             poi.type === 'landmark' ? 'معلم سياحي' : 'نقطة اهتمام'}
                    </div>
                    <div className="text-slate-400 mt-1">انقر للانتقال</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        
        {/* Player position marker */}
        <motion.div
          className="absolute z-50 flex items-center justify-center"
          style={{
            left: toMapCoords(playerPosition).x - getItemSize('player')/2,
            top: toMapCoords(playerPosition).y - getItemSize('player')/2,
            width: getItemSize('player'),
            height: getItemSize('player')
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <div className="absolute w-full h-full rounded-full bg-blue-600/40 animate-ping"></div>
          <div className="absolute w-3/4 h-3/4 rounded-full bg-blue-500/60"></div>
          <div className="absolute w-1/2 h-1/2 rounded-full bg-blue-400"></div>
          {isExpanded && (
            <div className="absolute -top-7 whitespace-nowrap bg-slate-900/80 text-blue-300 px-2 py-0.5 rounded text-xs">
              موقعك الحالي
            </div>
          )}
        </motion.div>
        
        {/* Map legend */}
        {isExpanded && (
          <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-sm p-2 rounded border border-blue-500/20 text-xs text-white">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-blue-500 mr-2 rounded-full"></div>
              <span>موقعك الحالي</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-amber-500/50 mr-2 rounded-full flex items-center justify-center">
                <i className="fas fa-star text-[6px] text-amber-300"></i>
              </div>
              <span>نقاط اهتمام</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-600 mr-2 rounded-sm"></div>
              <span>مباني</span>
            </div>
          </div>
        )}
        
        {/* Minimap feature - distance scale */}
        {isExpanded && (
          <div className="absolute bottom-4 left-14 flex items-center">
            <div className="h-0.5 w-10 bg-white/50"></div>
            <div className="text-white/50 text-[8px] ml-1">10م</div>
          </div>
        )}
      </div>
    </div>
  );
}