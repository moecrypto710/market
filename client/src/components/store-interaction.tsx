import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMovement } from "@/hooks/use-movement";

interface StoreInteractionProps {
  storePosition: { x: number; y: number; z: number };
  storeName: string;
  interiorComponent: React.ReactNode;
  triggerDistance?: number;
  onEnter?: () => void;
  onExit?: () => void;
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
  onEnter,
  onExit
}: StoreInteractionProps) {
  const [isNearStore, setIsNearStore] = useState(false);
  const [isInStore, setIsInStore] = useState(false);
  const { position, addCollisionObject, removeCollisionObject } = useMovement();
  
  // Check distance to store
  useEffect(() => {
    // Calculate distance between player and store
    const distance = Math.sqrt(
      Math.pow(position.x - storePosition.x, 2) +
      Math.pow(position.y - storePosition.y, 2) +
      Math.pow(position.z - storePosition.z, 2)
    );
    
    // Update isNearStore state based on distance
    setIsNearStore(distance <= triggerDistance);
    
    // Add store as a collision/trigger object
    const storeId = `store-${storeName.replace(/\s+/g, '-').toLowerCase()}`;
    addCollisionObject({
      id: storeId,
      position: storePosition,
      size: { width: triggerDistance * 2, height: 3, depth: triggerDistance * 2 },
      type: 'trigger',
      onCollision: () => setIsNearStore(true)
    });
    
    // Cleanup function to remove collision object
    return () => {
      removeCollisionObject(storeId);
    };
  }, [position, storePosition, triggerDistance, storeName, addCollisionObject, removeCollisionObject]);
  
  // Handle keyboard input (E key for enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNearStore && e.key.toLowerCase() === 'e') {
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
    if (onEnter) onEnter();
  };
  
  const exitStore = () => {
    setIsInStore(false);
    setIsNearStore(true);
    if (onExit) onExit();
  };
  
  return (
    <>
      {/* Enter button that appears when near the store */}
      {isNearStore && !isInStore && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40">
          <Button 
            className="bg-gradient-to-r from-[#00ffcd] to-[#7c4dff] text-black font-bold px-6 py-3 rounded-xl shadow-lg border-2 border-white/30"
            onClick={enterStore}
          >
            <i className="fas fa-door-open ml-2"></i>
            دخول {storeName}
            <span className="ml-2 opacity-70 text-xs">(E)</span>
          </Button>
        </div>
      )}
      
      {/* Store interior */}
      {isInStore && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="bg-gradient-to-r from-[#00ffcd] to-[#7c4dff] text-black p-3 flex justify-between items-center shadow-md">
            <h2 className="font-bold text-xl">{storeName}</h2>
            <Button 
              variant="ghost" 
              className="hover:bg-white/20"
              onClick={exitStore}
            >
              <i className="fas fa-sign-out-alt ml-2"></i>
              خروج
              <span className="ml-2 opacity-70 text-xs">(ESC)</span>
            </Button>
          </div>
          
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto">
            {interiorComponent}
          </div>
        </div>
      )}
    </>
  );
}