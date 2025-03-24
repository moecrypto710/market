import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * CarTraffic Component
 * 
 * React implementation of Unity's CarTraffic.cs script
 * Creates moving vehicles that respond to traffic signals
 */
interface CarTrafficProps {
  carStyle?: 'sedan' | 'suv' | 'truck' | 'taxi';
  direction?: 'right-to-left' | 'left-to-right' | 'bottom-to-top' | 'top-to-bottom';
  speed?: number;
  trafficLightPosition?: { x: number; y: number; z: number };
  trafficLightState?: 'red' | 'yellow' | 'green';
  playerPosition?: { x: number; y: number; z: number };
  scale?: number;
  laneOffset?: number;
  initialDelay?: number;
}

export default function CarTraffic({
  carStyle = 'sedan',
  direction = 'left-to-right',
  speed = 5,
  trafficLightPosition,
  trafficLightState = 'green',
  playerPosition,
  scale = 1,
  laneOffset = 0,
  initialDelay = 0,
}: CarTrafficProps) {
  // Animation controls similar to animator in Unity
  const controls = useAnimation();
  
  // Track if car should stop based on traffic light
  const [stop, setStop] = useState(trafficLightState === 'red');
  
  // Position state - simulates Transform.position in Unity
  const [position, setPosition] = useState({ x: getInitialX(), y: 0, z: getInitialZ() });
  
  // Ref to track whether car is in traffic light trigger zone
  const inTrafficZone = useRef(false);
  
  // Track if car has passed beyond the visible area
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  
  // Get initial X position based on direction
  function getInitialX() {
    switch (direction) {
      case 'right-to-left':
        return 100 + (Math.random() * 20);
      case 'left-to-right':
        return -100 - (Math.random() * 20);
      case 'bottom-to-top':
      case 'top-to-bottom':
        return laneOffset;
      default:
        return -100;
    }
  }
  
  // Get initial Z position based on direction
  function getInitialZ() {
    switch (direction) {
      case 'bottom-to-top':
        return 100 + (Math.random() * 20);
      case 'top-to-bottom':
        return -100 - (Math.random() * 20);
      case 'right-to-left':
      case 'left-to-right':
        return laneOffset;
      default:
        return laneOffset;
    }
  }
  
  // Get the target X position to animate to
  function getTargetX() {
    switch (direction) {
      case 'right-to-left':
        return -100;
      case 'left-to-right':
        return 100;
      default:
        return position.x;
    }
  }
  
  // Get the target Z position to animate to
  function getTargetZ() {
    switch (direction) {
      case 'bottom-to-top':
        return -100;
      case 'top-to-bottom':
        return 100;
      default:
        return position.z;
    }
  }
  
  // Get rotation based on direction
  function getRotation() {
    switch (direction) {
      case 'right-to-left':
        return 270;
      case 'left-to-right':
        return 90;
      case 'bottom-to-top':
        return 0;
      case 'top-to-bottom':
        return 180;
      default:
        return 0;
    }
  }
  
  // Check if car is in traffic light zone - similar to OnTriggerEnter/Exit in Unity
  useEffect(() => {
    if (!trafficLightPosition || !playerPosition) return;
    
    const checkTrafficLight = () => {
      // Calculate distance to traffic light
      const dx = position.x - trafficLightPosition.x;
      const dz = position.z - trafficLightPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Check if entering traffic light zone (5 units radius)
      if (distance < 5 && !inTrafficZone.current) {
        inTrafficZone.current = true;
        if (trafficLightState === 'red') {
          setStop(true);
        }
      } 
      // Check if exiting traffic light zone
      else if (distance >= 5 && inTrafficZone.current) {
        inTrafficZone.current = false;
        setStop(false);
      }
    };
    
    checkTrafficLight();
  }, [position, trafficLightPosition, trafficLightState, playerPosition]);
  
  // Handle traffic light state changes
  useEffect(() => {
    if (inTrafficZone.current) {
      setStop(trafficLightState === 'red');
    }
  }, [trafficLightState]);
  
  // Update car position - similar to Update() in Unity
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = 0;
    
    const updatePosition = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      // Calculate time delta in seconds (like Time.deltaTime in Unity)
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      
      if (!stop) {
        // Calculate movement based on direction - similar to Transform.Translate
        let newX = position.x;
        let newZ = position.z;
        
        switch (direction) {
          case 'left-to-right':
            newX += speed * deltaTime * 60;
            break;
          case 'right-to-left':
            newX -= speed * deltaTime * 60;
            break;
          case 'bottom-to-top':
            newZ -= speed * deltaTime * 60;
            break;
          case 'top-to-bottom':
            newZ += speed * deltaTime * 60;
            break;
        }
        
        setPosition({ x: newX, y: position.y, z: newZ });
        
        // Check if car is out of bounds
        if (
          newX > 120 || newX < -120 ||
          newZ > 120 || newZ < -120
        ) {
          setIsOutOfBounds(true);
        }
      }
      
      animationFrameId = requestAnimationFrame(updatePosition);
    };
    
    // Start animation after initial delay
    const timeout = setTimeout(() => {
      animationFrameId = requestAnimationFrame(updatePosition);
    }, initialDelay);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
    };
  }, [position, stop, direction, speed, initialDelay]);
  
  // Reset car when it goes out of bounds
  useEffect(() => {
    if (isOutOfBounds) {
      const timeout = setTimeout(() => {
        setPosition({ x: getInitialX(), y: 0, z: getInitialZ() });
        setIsOutOfBounds(false);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [isOutOfBounds]);
  
  // CSS transform based on position and direction
  const getTransform = () => {
    // Calculate perspective scaling based on Z position
    const perspectiveScale = Math.max(0.2, Math.min(1, 1 - (Math.abs(position.z) / 120)));
    
    return {
      transform: `translate(${position.x}px, ${position.z}px) rotate(${getRotation()}deg) scale(${perspectiveScale * scale})`,
      opacity: perspectiveScale,
      zIndex: Math.floor(1000 - Math.abs(position.z)),
    };
  };
  
  // Get car color based on style
  const getCarColor = () => {
    switch (carStyle) {
      case 'taxi':
        return '#f59e0b'; // amber-500
      case 'suv':
        return '#10b981'; // emerald-500
      case 'truck':
        return '#3b82f6'; // blue-500
      case 'sedan':
      default:
        return '#ef4444'; // red-500
    }
  };
  
  return (
    <div 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{ 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      {!isOutOfBounds && (
        <div
          className="absolute"
          style={getTransform()}
        >
          {/* Car body */}
          <div className="relative" style={{ width: '40px', height: '20px' }}>
            <div 
              className="absolute inset-0 rounded-md"
              style={{ backgroundColor: getCarColor() }}
            />
            {/* Car roof */}
            <div 
              className="absolute top-1 left-5 right-5 bottom-8 rounded-t-md bg-gray-800"
            />
            {/* Car windows */}
            <div className="absolute top-2 left-10 w-5 h-3 bg-blue-200 opacity-70 rounded-sm" />
            <div className="absolute top-2 right-10 w-5 h-3 bg-blue-200 opacity-70 rounded-sm" />
            {/* Car lights */}
            <div className="absolute bottom-2 left-0 w-2 h-2 bg-yellow-200 rounded-full" />
            <div className="absolute bottom-2 right-0 w-2 h-2 bg-red-500 rounded-full" />
            {/* Car wheels */}
            <div className="absolute -left-1 -bottom-2 w-4 h-4 bg-gray-900 rounded-full" />
            <div className="absolute -right-1 -bottom-2 w-4 h-4 bg-gray-900 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}