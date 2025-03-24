import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
  showLabels = true
}: CityMapProps) {
  const [mapCenter, setMapCenter] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // Map dimensions and scaling
  const mapWidth = isExpanded ? 300 : 180;
  const mapHeight = isExpanded ? 300 : 180;
  const mapScale = 10; // Scale factor to convert game coordinates to pixels

  // Calculate boundaries for the map
  useEffect(() => {
    if (buildings.length === 0) return;
    
    // Find the center of all the buildings
    const allPositions = [...buildings.map(b => b.position), ...pointsOfInterest.map(p => p.position)];
    
    const sumX = allPositions.reduce((sum, pos) => sum + pos.x, 0);
    const sumZ = allPositions.reduce((sum, pos) => sum + pos.z, 0);
    
    const avgX = sumX / allPositions.length;
    const avgZ = sumZ / allPositions.length;
    
    setMapCenter({ x: avgX, z: avgZ });
  }, [buildings, pointsOfInterest]);

  // Convert world position to map position
  const worldToMapPosition = (worldPos: { x: number; z: number }) => {
    const scaledX = (worldPos.x - mapCenter.x) * mapScale * mapZoom;
    const scaledZ = (worldPos.z - mapCenter.z) * mapScale * mapZoom;
    
    return {
      x: mapWidth / 2 + scaledX,
      y: mapHeight / 2 - scaledZ, // Invert Z axis to match top-down view
    };
  };

  // Handle clicking on a map location
  const handleLocationClick = (id: string, position: { x: number; y: number; z: number }) => {
    setSelectedLocation(id);
    if (onLocationSelect) {
      onLocationSelect(id, position);
    }
  };

  return (
    <div className="relative">
      <Card className={`
        transition-all duration-300 p-0 overflow-hidden
        ${isExpanded ? 'absolute bottom-0 right-0 shadow-2xl z-50' : 'shadow-md'}
      `}>
        <CardContent className="p-0">
          <div 
            className={`
              relative bg-slate-800 border border-slate-700 rounded-lg overflow-hidden
              ${isExpanded ? 'w-[300px] h-[300px]' : 'w-[180px] h-[180px]'}
            `}
          >
            {/* Map grid background */}
            <div className="absolute inset-0 grid"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: `${10 * mapZoom}px ${10 * mapZoom}px`,
                  backgroundPosition: `${mapWidth/2}px ${mapHeight/2}px`
                }}
            />
            
            {/* Decorative compass rose */}
            <div className="absolute top-2 left-2 opacity-40 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14 14H10L12 2Z" fill="rgba(255,255,255,0.8)" />
                <path d="M12 22L10 10H14L12 22Z" fill="rgba(255,255,255,0.5)" />
                <path d="M2 12L14 10V14L2 12Z" fill="rgba(255,255,255,0.5)" />
                <path d="M22 12L10 14V10L22 12Z" fill="rgba(255,255,255,0.5)" />
                <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.8)" />
              </svg>
            </div>
            
            {/* Buildings on map */}
            {buildings.map((building) => {
              const mapPos = worldToMapPosition({ x: building.position.x, z: building.position.z });
              
              // Building size based on type
              const buildingSize = building.type === 'travel' ? 14 : 12;
              
              return (
                <div
                  key={building.id}
                  className={`
                    absolute rounded-sm transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                    transition-all duration-200 hover:brightness-125 hover:shadow-glow
                    ${selectedLocation === building.id ? 'ring-2 ring-white ring-opacity-70' : ''}
                  `}
                  style={{
                    left: `${mapPos.x}px`,
                    top: `${mapPos.y}px`,
                    width: `${buildingSize}px`,
                    height: `${buildingSize}px`,
                    backgroundColor: building.color,
                    boxShadow: `0 0 5px ${building.color}80`,
                  }}
                  onClick={() => handleLocationClick(building.id, building.position)}
                >
                  {/* Building icon */}
                  {building.type === 'travel' && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-[6px]">
                      <i className="fas fa-plane"></i>
                    </div>
                  )}
                  {building.type === 'clothing' && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-[6px]">
                      <i className="fas fa-tshirt"></i>
                    </div>
                  )}
                  {building.type === 'electronics' && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-[6px]">
                      <i className="fas fa-mobile-alt"></i>
                    </div>
                  )}
                  
                  {/* Building label, visible when expanded or selected */}
                  {(showLabels || selectedLocation === building.id) && (
                    <div 
                      className={`
                        absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap
                        bg-slate-900/80 text-white px-1 py-0.5 rounded text-[8px] pointer-events-none
                        transition-opacity duration-200
                        ${isExpanded || selectedLocation === building.id ? 'opacity-100' : 'opacity-0'}
                      `}
                      style={{ direction: 'rtl' }}
                    >
                      {building.name}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Points of interest */}
            {pointsOfInterest.map((poi) => {
              const mapPos = worldToMapPosition({ x: poi.position.x, z: poi.position.z });
              
              return (
                <div
                  key={poi.id}
                  className="absolute w-3 h-3 rounded-full bg-yellow-400/70 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${mapPos.x}px`,
                    top: `${mapPos.y}px`,
                    boxShadow: '0 0 4px rgba(250, 204, 21, 0.5)',
                  }}
                  onClick={() => handleLocationClick(poi.id, poi.position)}
                >
                  {/* POI icon */}
                  <div className="absolute inset-0 flex items-center justify-center text-slate-900 text-[6px]">
                    <i className={`fas ${poi.icon || 'fa-star'}`}></i>
                  </div>
                  
                  {/* POI label */}
                  {(showLabels || selectedLocation === poi.id) && (
                    <div 
                      className={`
                        absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap
                        bg-slate-900/80 text-white px-1 py-0.5 rounded text-[8px] pointer-events-none
                        transition-opacity duration-200
                        ${isExpanded || selectedLocation === poi.id ? 'opacity-100' : 'opacity-0'}
                      `}
                      style={{ direction: 'rtl' }}
                    >
                      {poi.name}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Player position marker */}
            <div
              className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${worldToMapPosition({ x: playerPosition.x, z: playerPosition.z }).x}px`,
                top: `${worldToMapPosition({ x: playerPosition.x, z: playerPosition.z }).y}px`,
              }}
            >
              {/* Direction indicator triangle */}
              <svg width="16" height="16" viewBox="0 0 16 16" className="fill-white drop-shadow-glow">
                <polygon points="8,0 16,16 8,12 0,16" />
              </svg>
            </div>
            
            {/* Map controls */}
            <div className="absolute bottom-2 right-2 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 bg-slate-900/60 hover:bg-slate-900/80 text-[10px] text-white rounded-sm"
                onClick={() => setMapZoom(Math.min(mapZoom + 0.2, 2))}
              >
                <i className="fas fa-plus"></i>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 bg-slate-900/60 hover:bg-slate-900/80 text-[10px] text-white rounded-sm"
                onClick={() => setMapZoom(Math.max(mapZoom - 0.2, 0.5))}
              >
                <i className="fas fa-minus"></i>
              </Button>
              {isExpanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 bg-slate-900/60 hover:bg-slate-900/80 text-[10px] text-white rounded-sm"
                  onClick={() => setShowLegend(!showLegend)}
                >
                  <i className="fas fa-info"></i>
                </Button>
              )}
            </div>
            
            {/* Map title bar */}
            <div className="absolute top-0 left-0 right-0 bg-slate-900/80 py-1 px-2 flex justify-between items-center">
              <div className="text-white text-xs font-medium" style={{ direction: 'rtl' }}>
                خريطة المدينة
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-white hover:bg-slate-700/50 p-0"
                onClick={onToggleExpand}
              >
                <i className={`fas fa-${isExpanded ? 'compress-alt' : 'expand-alt'} text-[10px]`}></i>
              </Button>
            </div>
            
            {/* Map legend (only visible when expanded and legend is shown) */}
            {isExpanded && showLegend && (
              <div className="absolute left-2 bottom-2 bg-slate-900/80 p-2 rounded text-xs max-w-[120px]">
                <div className="mb-2 font-medium text-white">المفاتيح:</div>
                <div className="space-y-1.5">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-sm mr-1.5"></div>
                    <span className="text-[9px] text-white" style={{ direction: 'rtl' }}>وكالة سفر</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-sm mr-1.5"></div>
                    <span className="text-[9px] text-white" style={{ direction: 'rtl' }}>متجر ملابس</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-1.5"></div>
                    <span className="text-[9px] text-white" style={{ direction: 'rtl' }}>إلكترونيات</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1.5"></div>
                    <span className="text-[9px] text-white" style={{ direction: 'rtl' }}>نقطة اهتمام</span>
                  </div>
                  <div className="flex items-center">
                    <svg width="12" height="12" viewBox="0 0 16 16" className="fill-white mr-1.5">
                      <polygon points="8,0 16,16 8,12 0,16" />
                    </svg>
                    <span className="text-[9px] text-white" style={{ direction: 'rtl' }}>موقعك الحالي</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Selected location info card, only shown when a location is selected */}
      {selectedLocation && isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute left-2 top-12 bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg border border-slate-700 shadow-xl max-w-[200px] z-10"
        >
          {(() => {
            // Find selected building or POI
            const selected = 
              [...buildings, ...pointsOfInterest].find(item => item.id === selectedLocation);
            
            if (!selected) return null;
            
            const isBuilding = 'type' in selected && ['travel', 'clothing', 'electronics'].includes(selected.type);
            
            return (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge 
                    className="text-[9px] py-0 px-1.5"
                    style={{ backgroundColor: isBuilding ? (selected as any).color : '#ca8a04' }}
                  >
                    {isBuilding 
                      ? selected.type === 'travel' 
                        ? 'سفر' 
                        : selected.type === 'clothing' 
                          ? 'ملابس' 
                          : 'إلكترونيات'
                      : 'نقطة اهتمام'
                    }
                  </Badge>
                  <h4 className="text-xs font-medium text-white" style={{ direction: 'rtl' }}>
                    {selected.name}
                  </h4>
                </div>
                
                <div className="flex justify-between mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-slate-700 bg-slate-700/50 hover:bg-slate-700 text-white"
                    onClick={() => handleLocationClick(selected.id, selected.position)}
                  >
                    <i className="fas fa-location-arrow ml-1 text-[8px]"></i>
                    انتقال
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] hover:bg-slate-700/50 text-slate-400"
                    onClick={() => setSelectedLocation(null)}
                  >
                    إغلاق
                  </Button>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}