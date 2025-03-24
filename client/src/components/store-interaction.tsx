import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMovement } from "@/hooks/use-movement";
import { motion, AnimatePresence } from "framer-motion";

interface StoreInteractionProps {
  storePosition: { x: number; y: number; z: number };
  storeName: string;
  interiorComponent: React.ReactNode;
  triggerDistance?: number;
  storeSize?: { width: number; height: number; depth: number };
  onEnter?: () => void;
  onExit?: () => void;
  storeColor?: string;
  storeIcon?: string;
}

/**
 * Store Interaction Component
 * 
 * React implementation of Unity's StoreInteraction.cs script
 * Handles entry and exit from virtual stores
 */
export default function StoreInteraction({
  storePosition,
  storeName,
  interiorComponent,
  triggerDistance = 5,
  storeSize = { width: 10, height: 5, depth: 10 },
  onEnter,
  onExit,
  storeColor = "#7c4dff",
  storeIcon = "fa-store"
}: StoreInteractionProps) {
  const [isNearStore, setIsNearStore] = useState(false);
  const [isInStore, setIsInStore] = useState(false);
  const [showStorePreview, setShowStorePreview] = useState(false);
  const { position, addCollisionObject, removeCollisionObject } = useMovement();
  const storeId = useRef(`store-${storeName.replace(/\s+/g, '-').toLowerCase()}`);
  
  // Calculate distance between player and store
  const getDistance = () => {
    return Math.sqrt(
      Math.pow(position.x - storePosition.x, 2) +
      Math.pow(position.y - storePosition.y, 2) +
      Math.pow(position.z - storePosition.z, 2)
    );
  };
  
  // Register store collision object only once on mount
  useEffect(() => {
    // Add store as a collision/trigger object - following Unity's pattern of registering colliders on scene load
    addCollisionObject({
      id: storeId.current,
      position: storePosition,
      size: { 
        width: storeSize.width || triggerDistance * 2, 
        height: storeSize.height || 3, 
        depth: storeSize.depth || triggerDistance * 2 
      },
      type: 'trigger',
      onCollision: () => setIsNearStore(true)
    });
    
    // Cleanup function to remove collision object
    return () => {
      removeCollisionObject(storeId.current);
    };
  }, []);  // Empty dependency array to run only once on mount
  
  // Track distance to store without re-registering colliders - similar to Unity's Update() function
  useEffect(() => {
    const checkDistance = () => {
      const distance = getDistance();
      
      // Update isNearStore state based on distance
      const isNear = distance <= triggerDistance;
      setIsNearStore(isNear);
      
      // Show store preview when getting close but not close enough to enter
      setShowStorePreview(distance <= triggerDistance * 1.5 && !isNear);
    };
    
    // Check immediately
    checkDistance();
    
    // Set up interval to check periodically (Unity's Update method equivalent)
    const intervalId = setInterval(checkDistance, 500);
    
    return () => clearInterval(intervalId);
  }, [position, storePosition, triggerDistance]);
  
  // Handle keyboard input (E key for enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNearStore && !isInStore && e.key.toLowerCase() === 'e') {
        enterStore();
      } else if (isInStore && e.key.toLowerCase() === 'escape') {
        exitStore();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNearStore, isInStore]);
  
  const enterStore = () => {
    setIsInStore(true);
    setIsNearStore(false);
    setShowStorePreview(false);
    if (onEnter) onEnter();
  };
  
  const exitStore = () => {
    setIsInStore(false);
    setIsNearStore(true);
    
    // Check distance after exiting to update states correctly
    setTimeout(() => {
      const distance = getDistance();
      setIsNearStore(distance <= triggerDistance);
      setShowStorePreview(distance <= triggerDistance * 1.5 && distance > triggerDistance);
    }, 100);
    
    if (onExit) onExit();
  };
  
  // Convert hex color to rgba
  const hexToRgba = (hex: string, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Generate gradient based on store color
  const generateGradient = (baseColor: string) => {
    // If it's already a gradient, return as is
    if (baseColor.includes('gradient')) return baseColor;
    
    // Extract hex if it's in the form #123456
    const hexColor = baseColor.startsWith('#') ? baseColor : '#7c4dff';
    
    // Create a lighter version for gradient
    const lightColor = hexToRgba(hexColor, 0.7);
    const darkColor = hexColor;
    
    return `linear-gradient(to right, ${darkColor}, ${lightColor})`;
  };
  
  const storeGradient = generateGradient(storeColor);
  
  return (
    <>
      {/* Store preview that appears when approaching but not close enough */}
      <AnimatePresence>
        {showStorePreview && !isInStore && (
          <motion.div 
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-md text-white text-sm border border-white/10 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <i className={`fas ${storeIcon}`}></i>
              <span>{storeName}</span>
              <span className="text-xs opacity-70">({Math.floor(getDistance())}م)</span>
              
              {/* Special badge for travel agency */}
              {storeName.includes('طيران الإمارات') && (
                <span className="ml-2 bg-yellow-500 text-blue-900 text-xs px-2 py-0.5 rounded-full font-bold">
                  وكالة رسمية
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enter button that appears when near the store */}
      <AnimatePresence>
        {isNearStore && !isInStore && (
          <motion.div 
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            {storeName.includes('طيران الإمارات') ? (
              // Special Emirates Airlines Button
              <Button 
                className="text-white font-bold px-6 py-3 rounded-xl shadow-lg border border-yellow-400/50 overflow-hidden group"
                style={{ background: 'linear-gradient(to right, #003366, #0066cc)' }}
                onClick={enterStore}
              >
                {/* Button interior glowing effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                
                <span className="relative z-10 flex items-center gap-2">
                  <i className="fas fa-plane-departure ml-2"></i>
                  <span className="font-arabic">دخول وكالة طيران الإمارات</span>
                  <span className="ml-2 bg-yellow-500/20 px-2 py-0.5 rounded text-xs text-yellow-300">(E)</span>
                </span>
              </Button>
            ) : (
              // Regular store button
              <Button 
                className="text-white font-bold px-6 py-3 rounded-xl shadow-lg border border-white/30 overflow-hidden group"
                style={{ background: storeGradient }}
                onClick={enterStore}
              >
                {/* Button interior glowing effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                
                <span className="relative z-10 flex items-center gap-2">
                  <i className={`fas ${storeIcon} ml-2`}></i>
                  دخول {storeName}
                  <span className="ml-2 bg-black/20 px-2 py-0.5 rounded text-xs">(E)</span>
                </span>
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Store interior */}
      <AnimatePresence>
        {isInStore && (
          <motion.div 
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Store header with name and exit button */}
            {storeName.includes('طيران الإمارات') ? (
              // Emirates Airlines Special Header
              <motion.div 
                className="text-white p-3 flex justify-between items-center shadow-md"
                style={{ background: 'linear-gradient(to right, #003366, #0066cc)' }}
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2">
                  <i className="fas fa-plane text-lg text-yellow-400"></i>
                  <h2 className="font-bold text-xl">وكالة طيران الإمارات</h2>
                  <div className="ml-2 px-2 py-0.5 bg-yellow-500 text-blue-900 text-xs rounded-full font-bold">
                    وكالة رسمية
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="hover:bg-white/10 text-white border-yellow-400/50 hover:border-yellow-400"
                  onClick={exitStore}
                >
                  <i className="fas fa-sign-out-alt ml-2"></i>
                  مغادرة الوكالة
                  <span className="ml-2 bg-blue-900/40 px-2 py-0.5 rounded text-xs text-yellow-300">(ESC)</span>
                </Button>
              </motion.div>
            ) : (
              // Regular Store Header
              <motion.div 
                className="text-white p-3 flex justify-between items-center shadow-md"
                style={{ background: storeGradient }}
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2">
                  <i className={`fas ${storeIcon} text-lg`}></i>
                  <h2 className="font-bold text-xl">{storeName}</h2>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="hover:bg-black/20 text-white"
                  onClick={exitStore}
                >
                  <i className="fas fa-sign-out-alt ml-2"></i>
                  خروج
                  <span className="ml-2 bg-black/20 px-2 py-0.5 rounded text-xs">(ESC)</span>
                </Button>
              </motion.div>
            )}
            
            {/* Store interior content */}
            <motion.div 
              className="flex-1 bg-gray-950 text-white overflow-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {interiorComponent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}