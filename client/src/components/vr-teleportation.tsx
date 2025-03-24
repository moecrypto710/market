import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Type for teleportation targets - similar to RaycastHit points in Unity
interface TeleportationTarget {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  isActive: boolean;
  isPermitted: boolean; // Some targets might require special access
}

interface VRTeleportationProps {
  targets: TeleportationTarget[];
  onTeleport: (position: { x: number; y: number; z: number }) => void;
  currentPosition: { x: number; y: number; z: number };
  vrEnabled: boolean;
  activationKey?: string; // Default will be Space key
  targetingMode?: 'ray' | 'pointer'; // ray follows a path, pointer is direct
  showLabels?: boolean;
  cooldownTime?: number; // Time in ms between teleportations
}

/**
 * VR Teleportation Component
 * 
 * A React implementation of Unity's VRMovement/Teleportation system
 * Allows teleporting to designated targets in the VR environment
 */
export default function VRTeleportation({
  targets,
  onTeleport,
  currentPosition,
  vrEnabled = true,
  activationKey = ' ', // Space key by default
  targetingMode = 'ray',
  showLabels = true,
  cooldownTime = 1000,
}: VRTeleportationProps) {
  const { toast } = useToast();
  const [activeTarget, setActiveTarget] = useState<TeleportationTarget | null>(null);
  const [isRayActive, setIsRayActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCooldown, setIsCooldown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate directional vector (similar to raycast direction in Unity)
  const calculateDirection = () => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate normalized direction vector (from center to mouse position)
    const dirX = (mousePosition.x - centerX) / (rect.width / 2);
    const dirY = (mousePosition.y - centerY) / (rect.height / 2);
    
    return { x: dirX, y: dirY };
  };
  
  // Find closest teleport target in the direction of the ray (similar to RaycastHit)
  const findTargetInRayDirection = () => {
    if (!isRayActive) return null;
    
    const dir = calculateDirection();
    const permittedTargets = targets.filter(t => t.isActive && t.isPermitted);
    
    // No targets available
    if (permittedTargets.length === 0) return null;
    
    // For 'pointer' mode, use the closest target to the mouse position on screen
    if (targetingMode === 'pointer') {
      // Find the closest target based on screen position
      // In a real implementation, this would need to project 3D positions to 2D screen space
      return permittedTargets[0]; // Simplified for this example
    }
    
    // For 'ray' mode (simulating a Unity-style raycast)
    // Find the target that best matches the ray direction
    let bestTargetScore = -Infinity;
    let bestTarget = null;
    
    for (const target of permittedTargets) {
      // Calculate direction to target (normalized vector)
      const toTarget = {
        x: target.position.x - currentPosition.x,
        y: target.position.y - currentPosition.y,
        z: target.position.z - currentPosition.z
      };
      
      // Normalize the vector (simplified 2D version)
      const length = Math.sqrt(toTarget.x * toTarget.x + toTarget.z * toTarget.z);
      const normalizedTarget = {
        x: toTarget.x / length,
        z: toTarget.z / length
      };
      
      // Calculate dot product to find how aligned the directions are
      // In VR, this would be a 3D dot product, but we'll simplify to 2D (xz plane)
      const dotProduct = normalizedTarget.x * dir.x + normalizedTarget.z * (-dir.y);
      
      // Higher dot product means better alignment
      if (dotProduct > bestTargetScore) {
        bestTargetScore = dotProduct;
        bestTarget = target;
      }
    }
    
    // Only return a target if it's reasonably aligned with our direction
    return bestTargetScore > 0.7 ? bestTarget : null;
  };
  
  // Handle teleportation (equivalent to transform.position = hit.point in Unity)
  const performTeleport = () => {
    if (!activeTarget || isCooldown) return;
    
    // Trigger teleportation
    onTeleport(activeTarget.position);
    
    // Show teleport effect/animation
    toast({
      title: `تم الانتقال إلى ${activeTarget.name}`,
      description: "استخدم زر المسافة للانتقال مرة أخرى",
      duration: 2000,
    });
    
    // Apply cooldown
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), cooldownTime);
  };
  
  // Mouse movement to control ray direction (similar to controller orientation in VR)
  useEffect(() => {
    if (!vrEnabled) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [vrEnabled]);
  
  // Key presses for teleportation (similar to controller button press in Unity)
  useEffect(() => {
    if (!vrEnabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === activationKey) {
        setIsRayActive(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === activationKey) {
        setIsRayActive(false);
        performTeleport();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [vrEnabled, activationKey, activeTarget, isCooldown]);
  
  // Update active target when ray is active
  useEffect(() => {
    if (isRayActive) {
      const target = findTargetInRayDirection();
      setActiveTarget(target);
    } else {
      setActiveTarget(null);
    }
  }, [isRayActive, mousePosition, targets]);
  
  if (!vrEnabled) return null;
  
  return (
    <div 
      ref={containerRef}
      className="vr-teleportation-system absolute inset-0 pointer-events-none"
    >
      {/* Ray visualization (when active) */}
      {isRayActive && (
        <div className="teleportation-ray absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className="ray-line bg-blue-500/50 h-1 absolute"
            style={{
              width: '100px', 
              transformOrigin: 'left center',
              transform: `rotate(${Math.atan2(calculateDirection().y, calculateDirection().x) * (180 / Math.PI)}deg)`
            }}
          />
          <div className="ray-dot bg-blue-500 w-2 h-2 rounded-full absolute left-0 top-0" />
        </div>
      )}
      
      {/* Teleportation targets visualization */}
      {targets.map(target => (
        <div 
          key={target.id}
          className={`teleport-target absolute transform -translate-x-1/2 -translate-y-1/2 ${
            !target.isActive || !target.isPermitted ? 'opacity-30' : 'opacity-100'
          } ${
            target.id === activeTarget?.id ? 'scale-125' : ''
          }`}
          style={{
            // This is a simplified positioning for a 2D interface
            // In a real implementation, we would project 3D coordinates to 2D screen space
            left: `${50 + target.position.x * 2}%`,
            top: `${50 + target.position.z * 2}%`
          }}
        >
          {/* Target indicator */}
          <motion.div 
            className={`w-6 h-6 rounded-full ${
              target.id === activeTarget?.id ? 'bg-green-500 ring-4 ring-green-300' : 'bg-blue-400'
            } flex items-center justify-center`}
            animate={{
              scale: target.id === activeTarget?.id ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            <div className="w-1 h-1 bg-white rounded-full" />
          </motion.div>
          
          {/* Target label */}
          {showLabels && (
            <div className={`text-xs font-bold mt-1 text-center ${
              target.id === activeTarget?.id ? 'text-white' : 'text-white/70'
            }`}>
              {target.name}
            </div>
          )}
        </div>
      ))}
      
      {/* Cooldown indicator */}
      {isCooldown && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="teleport-cooldown bg-gray-800/80 px-3 py-1 rounded-full text-xs text-white">
            انتظر للانتقال مرة أخرى...
          </div>
        </div>
      )}
    </div>
  );
}