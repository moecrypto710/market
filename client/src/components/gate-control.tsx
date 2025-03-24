import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * GateControl Component
 * 
 * React implementation of Unity's GateControl.cs script
 * Handles gate/door animation when player enters/exits trigger zone
 */
interface GateControlProps {
  playerPosition: { x: number; y: number; z: number };
  gatePosition: { x: number; y: number; z: number };
  triggerDistance?: number;
  children?: React.ReactNode;
  onEnter?: () => void;
  onExit?: () => void;
  gateWidth?: number;
  gateHeight?: number;
  gateColor?: string;
  isOpen?: boolean;
  className?: string;
}

export default function GateControl({
  playerPosition,
  gatePosition,
  triggerDistance = 3,
  children,
  onEnter,
  onExit,
  gateWidth = 4,
  gateHeight = 5,
  gateColor = '#6b7280',
  isOpen: controlledIsOpen,
  className,
}: GateControlProps) {
  // State to track if gate is open (if not controlled externally)
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpenInternal;

  // Check if player is in trigger zone (equivalent to OnTriggerEnter/OnTriggerExit)
  useEffect(() => {
    // Calculate distance between player and gate
    const distanceX = playerPosition.x - gatePosition.x;
    const distanceZ = playerPosition.z - gatePosition.z;
    const distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
    
    // Player entered trigger zone
    if (distance <= triggerDistance && !isOpen) {
      setIsOpenInternal(true);
      onEnter?.();
    } 
    // Player exited trigger zone
    else if (distance > triggerDistance && isOpen && controlledIsOpen === undefined) {
      setIsOpenInternal(false);
      onExit?.();
    }
  }, [playerPosition, gatePosition, triggerDistance, isOpen, controlledIsOpen, onEnter, onExit]);

  // Gate doors animation variants
  const leftDoorVariants = {
    open: { rotateY: 80, x: -gateWidth/4 },
    closed: { rotateY: 0, x: 0 },
  };
  
  const rightDoorVariants = {
    open: { rotateY: -80, x: gateWidth/4 },
    closed: { rotateY: 0, x: 0 },
  };

  return (
    <div className={`relative ${className || ''}`}>
      <div 
        className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
        style={{
          perspective: '1000px',
        }}
      >
        {/* Gate frame */}
        <div
          style={{
            width: `${gateWidth + 1}rem`,
            height: `${gateHeight + 1}rem`,
            backgroundColor: gateColor,
            border: '4px solid #4b5563',
            borderRadius: '4px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: 'rotateX(5deg)',
          }}
        >
          {/* Gate doors container */}
          <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
            {/* Left door */}
            <motion.div
              className="absolute h-full"
              style={{
                width: `${gateWidth/2}rem`,
                backgroundColor: isOpen ? 'transparent' : '#374151',
                borderRight: '2px solid #4b5563',
                transformOrigin: 'left',
                left: '0',
                zIndex: 2,
              }}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              variants={leftDoorVariants}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            
            {/* Right door */}
            <motion.div
              className="absolute h-full"
              style={{
                width: `${gateWidth/2}rem`,
                backgroundColor: isOpen ? 'transparent' : '#374151',
                borderLeft: '2px solid #4b5563',
                transformOrigin: 'right',
                right: '0',
                zIndex: 2,
              }}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              variants={rightDoorVariants}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            
            {/* Content visible when gate is open */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: isOpen ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                transitionDelay: isOpen ? '0.3s' : '0s',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug indicator for trigger area - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute rounded-full border-2 border-red-500 border-dashed opacity-30 pointer-events-none"
          style={{
            width: `${triggerDistance * 2}rem`,
            height: `${triggerDistance * 2}rem`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}