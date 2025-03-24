import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

/**
 * EarnMoney Component
 * 
 * React implementation of Unity's EarnMoney.cs script
 * Allows players to earn virtual currency when interacting with workstations
 */
interface EarnMoneyProps {
  playerPosition: { x: number; y: number; z: number };
  workstationPositions: Array<{ x: number; y: number; z: number; value: number; name: string }>;
  onMoneyEarned?: (amount: number) => void;
  playerMoney?: number;
  cooldownPeriod?: number; // in seconds
}

export default function EarnMoney({
  playerPosition,
  workstationPositions,
  onMoneyEarned,
  playerMoney = 0,
  cooldownPeriod = 10,
}: EarnMoneyProps) {
  // Track when player has entered different workstation zones
  const [enteredZones, setEnteredZones] = useState<Record<string, boolean>>({});
  
  // Track cooldown for each workstation
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  
  // Visual indicator for money earned
  const [moneyIndicator, setMoneyIndicator] = useState<{ amount: number; position: { x: number; y: number } } | null>(null);
  
  // Check for collision with workstations - similar to OnTriggerEnter in Unity
  useEffect(() => {
    const checkWorkstations = () => {
      workstationPositions.forEach((workstation, index) => {
        const stationId = `workstation-${index}`;
        
        // Calculate distance to workstation
        const dx = playerPosition.x - workstation.x;
        const dz = playerPosition.z - workstation.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // Check if player is in trigger zone (3 units radius) - similar to OnTriggerEnter
        const isInZone = distance < 3;
        
        // If player entered zone and wasn't in it before
        if (isInZone && !enteredZones[stationId]) {
          setEnteredZones(prev => ({ ...prev, [stationId]: true }));
          
          // Check if this workstation is on cooldown
          const isOnCooldown = cooldowns[stationId] > Date.now();
          
          if (!isOnCooldown) {
            // Award money - similar to playerMoney += 10 in Unity
            const earnedAmount = workstation.value || 10;
            onMoneyEarned?.(earnedAmount);
            
            // Create visual indicator
            setMoneyIndicator({
              amount: earnedAmount,
              position: { x: Math.random() * 300, y: Math.random() * 100 }
            });
            
            // Show toast notification - similar to Debug.Log in Unity
            toast({
              title: `لقد ربحت ${earnedAmount} عملة!`,
              description: `من ${workstation.name}`,
              variant: "default",
            });
            
            // Set cooldown for this workstation
            setCooldowns(prev => ({
              ...prev,
              [stationId]: Date.now() + (cooldownPeriod * 1000)
            }));
          } else {
            // Calculate remaining cooldown in seconds
            const remainingSecs = Math.ceil((cooldowns[stationId] - Date.now()) / 1000);
            
            toast({
              title: `لا يمكنك الكسب من هنا الآن`,
              description: `حاول مرة أخرى بعد ${remainingSecs} ثواني`,
              variant: "default",
            });
          }
        }
        // If player left zone, update state
        else if (!isInZone && enteredZones[stationId]) {
          setEnteredZones(prev => ({ ...prev, [stationId]: false }));
        }
      });
    };
    
    checkWorkstations();
  }, [playerPosition, workstationPositions, enteredZones, cooldowns, onMoneyEarned, cooldownPeriod]);
  
  // Clear money indicator after animation
  useEffect(() => {
    if (moneyIndicator) {
      const timeout = setTimeout(() => {
        setMoneyIndicator(null);
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
  }, [moneyIndicator]);
  
  // Render workstations based on player position (distance-based rendering)
  const renderWorkstations = () => {
    return workstationPositions.map((workstation, index) => {
      // Calculate distance to determine visibility
      const dx = playerPosition.x - workstation.x;
      const dz = playerPosition.z - workstation.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Only render if within visible range
      if (distance > 50) return null;
      
      // Calculate screen position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Simple perspective projection
      const scale = Math.max(0.3, Math.min(1, 20 / Math.max(1, distance)));
      const opacity = Math.min(1, 30 / Math.max(1, distance));
      
      // Calculate screen coordinates
      const angle = Math.atan2(dz, dx);
      const screenX = centerX + (Math.cos(angle) * distance * 10);
      const screenY = centerY + (Math.sin(angle) * distance * 10);
      
      const isOnCooldown = cooldowns[`workstation-${index}`] > Date.now();
      
      return (
        <div
          key={`workstation-${index}`}
          className="absolute"
          style={{
            left: `${screenX}px`,
            top: `${screenY}px`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            opacity,
            zIndex: Math.floor(1000 - distance),
          }}
        >
          <div className="relative">
            {/* Workstation visual */}
            <div 
              className={`w-24 h-24 flex items-center justify-center rounded-lg border-2 ${
                isOnCooldown ? 'border-gray-500 bg-gray-700' : 'border-yellow-500 bg-yellow-900'
              }`}
            >
              <div className="text-center">
                <div className={`text-lg font-bold ${isOnCooldown ? 'text-gray-400' : 'text-yellow-300'}`}>
                  {workstation.name}
                </div>
                <div className={`text-sm ${isOnCooldown ? 'text-gray-500' : 'text-yellow-200'}`}>
                  {isOnCooldown ? 'قيد الانتظار' : `+${workstation.value} عملة`}
                </div>
              </div>
            </div>
            
            {/* Cooldown indicator */}
            {isOnCooldown && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24">
                  <circle
                    className="text-gray-700"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="transparent"
                    r="10"
                    cx="12"
                    cy="12"
                  />
                  <motion.circle
                    className="text-blue-500"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="transparent"
                    r="10"
                    cx="12"
                    cy="12"
                    initial={{ pathLength: 1 }}
                    animate={{ 
                      pathLength: 0,
                      transition: { 
                        duration: (cooldowns[`workstation-${index}`] - Date.now()) / 1000,
                        ease: "linear"
                      }
                    }}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      );
    });
  };
  
  return (
    <>
      {/* Render workstations */}
      {renderWorkstations()}
      
      {/* Money earned indicator */}
      {moneyIndicator && (
        <motion.div
          className="fixed text-yellow-300 font-bold text-xl z-50"
          initial={{ 
            x: moneyIndicator.position.x, 
            y: moneyIndicator.position.y, 
            scale: 1,
            opacity: 1
          }}
          animate={{ 
            y: moneyIndicator.position.y - 100,
            scale: 1.5,
            opacity: 0
          }}
          transition={{ duration: 1.5 }}
        >
          +{moneyIndicator.amount} 💰
        </motion.div>
      )}
      
      {/* Current money display */}
      <div className="fixed top-4 left-4 bg-yellow-900/80 text-yellow-300 px-3 py-2 rounded-lg text-sm z-50 backdrop-blur-sm">
        <div className="flex items-center">
          <span className="mr-2">💰</span>
          <span className="font-bold">{playerMoney} عملة</span>
        </div>
      </div>
    </>
  );
}