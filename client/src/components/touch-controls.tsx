import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface TouchControlsProps {
  onMove?: (direction: 'forward' | 'backward' | 'left' | 'right') => void;
  onStopMove?: () => void;
  onLook?: (deltaX: number, deltaY: number) => void;
  showControls?: boolean;
  className?: string;
}

/**
 * Touch Controls Component for Mobile Navigation
 * 
 * Provides virtual joystick for movement and swipe area for camera rotation
 * Inspired by Unity's mobile input system
 */
export default function TouchControls({
  onMove,
  onStopMove,
  onLook,
  showControls = true,
  className = '',
}: TouchControlsProps) {
  const isMobile = useIsMobile();
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const lookAreaRef = useRef<HTMLDivElement>(null);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const lastTouchPosition = useRef<{ x: number; y: number } | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const isMovingRef = useRef(false);

  // If not mobile, don't render the controls
  if (!isMobile) return null;
  
  // If controls are hidden, return empty fragment
  if (!showControls) return <></>;

  // Handle joystick movement
  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickBaseRef.current) return;
    
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const baseX = rect.left + rect.width / 2;
    const baseY = rect.top + rect.height / 2;
    setBasePosition({ x: baseX, y: baseY });
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    setJoystickActive(true);
    updateJoystickPosition(clientX, clientY);
    
    // Start continuous movement update
    if (!animationFrameId.current) {
      animationFrameId.current = requestAnimationFrame(updateMovement);
    }
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickActive) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    updateJoystickPosition(clientX, clientY);
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPosition({ x: 0, y: 0 });
    
    // Stop movement
    if (onStopMove) onStopMove();
    isMovingRef.current = false;
    
    // Cancel animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  // Handle look area for camera rotation
  const handleLookStart = (e: React.TouchEvent) => {
    lastTouchPosition.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleLookMove = (e: React.TouchEvent) => {
    if (lastTouchPosition.current) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchPosition.current.x;
      const deltaY = touch.clientY - lastTouchPosition.current.y;
      
      if (onLook) onLook(deltaX * 0.1, deltaY * 0.1);
      
      lastTouchPosition.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  };

  const handleLookEnd = () => {
    lastTouchPosition.current = null;
  };

  // Update joystick position with constraints
  const updateJoystickPosition = (x: number, y: number) => {
    const deltaX = x - basePosition.x;
    const deltaY = y - basePosition.y;
    
    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50; // Max joystick travel distance
    
    if (distance > maxDistance) {
      // Normalize and scale back to max distance
      const scale = maxDistance / distance;
      setJoystickPosition({
        x: deltaX * scale,
        y: deltaY * scale,
      });
    } else {
      setJoystickPosition({
        x: deltaX,
        y: deltaY,
      });
    }
  };

  // Update movement based on joystick position
  const updateMovement = () => {
    if (!joystickActive) return;
    
    const threshold = 10; // Minimum movement threshold
    const { x, y } = joystickPosition;
    
    // Determine primary direction based on joystick position
    if (Math.abs(x) > threshold || Math.abs(y) > threshold) {
      isMovingRef.current = true;
      
      // Determine primary direction
      if (Math.abs(y) > Math.abs(x)) {
        // Vertical movement is primary
        if (y < 0) {
          onMove && onMove('forward');
        } else {
          onMove && onMove('backward');
        }
      } else {
        // Horizontal movement is primary
        if (x < 0) {
          onMove && onMove('left');
        } else {
          onMove && onMove('right');
        }
      }
    } else if (isMovingRef.current) {
      // Stop movement if joystick returns to center
      onStopMove && onStopMove();
      isMovingRef.current = false;
    }
    
    animationFrameId.current = requestAnimationFrame(updateMovement);
  };

  return (
    <div className={`fixed bottom-0 left-0 w-full h-1/3 z-30 ${className}`}>
      {/* Joystick control for movement */}
      <div
        ref={joystickBaseRef}
        className="absolute left-10 bottom-32 w-24 h-24 rounded-full bg-black/30 backdrop-blur-md border border-white/20"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <motion.div
          ref={joystickRef}
          className="absolute top-1/2 left-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-lg"
          style={{
            x: joystickPosition.x,
            y: joystickPosition.y,
            translateX: '-50%',
            translateY: '-50%',
          }}
        />
      </div>
      
      {/* Camera look area (right side) */}
      <div
        ref={lookAreaRef}
        className="absolute right-0 bottom-0 w-1/2 h-full"
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
      >
        <div className="absolute right-10 bottom-32 w-16 h-16 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          <i className="fas fa-eye text-white/60 text-xl"></i>
        </div>
      </div>
      
      {/* Control hints */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white/70 text-xs border border-white/10">
        اسحب للحركة | اسحب يمينًا للنظر
      </div>
    </div>
  );
}