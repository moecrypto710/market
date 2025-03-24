import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * TrafficLight Component
 * 
 * Companion component for CarTraffic
 * Simulates a traffic light with changing states
 */
interface TrafficLightProps {
  position: { x: number; y: number; z: number };
  initialState?: 'red' | 'yellow' | 'green';
  cycleTime?: number; // Time in seconds for a complete light cycle
  playerPosition?: { x: number; y: number; z: number };
  onStateChange?: (state: 'red' | 'yellow' | 'green') => void;
  size?: number;
}

export default function TrafficLight({
  position,
  initialState = 'green',
  cycleTime = 10,
  playerPosition,
  onStateChange,
  size = 1,
}: TrafficLightProps) {
  // Current traffic light state
  const [lightState, setLightState] = useState<'red' | 'yellow' | 'green'>(initialState);
  
  // Calculate distance from player for rendering
  const [distance, setDistance] = useState(100);
  const [visible, setVisible] = useState(true);
  
  // Traffic light cycle
  useEffect(() => {
    const redDuration = cycleTime * 0.45; // 45% of cycle time
    const yellowDuration = cycleTime * 0.1; // 10% of cycle time
    const greenDuration = cycleTime * 0.45; // 45% of cycle time
    
    let timeout: NodeJS.Timeout;
    
    const changeLight = () => {
      switch (lightState) {
        case 'green':
          setLightState('yellow');
          onStateChange?.('yellow');
          timeout = setTimeout(changeLight, yellowDuration * 1000);
          break;
        case 'yellow':
          setLightState('red');
          onStateChange?.('red');
          timeout = setTimeout(changeLight, redDuration * 1000);
          break;
        case 'red':
          setLightState('green');
          onStateChange?.('green');
          timeout = setTimeout(changeLight, greenDuration * 1000);
          break;
      }
    };
    
    // Start the cycle based on initial state
    switch (initialState) {
      case 'green':
        timeout = setTimeout(changeLight, greenDuration * 1000);
        break;
      case 'yellow':
        timeout = setTimeout(changeLight, yellowDuration * 1000);
        break;
      case 'red':
        timeout = setTimeout(changeLight, redDuration * 1000);
        break;
    }
    
    return () => clearTimeout(timeout);
  }, [lightState, cycleTime, initialState, onStateChange]);
  
  // Calculate visibility based on player position
  useEffect(() => {
    if (!playerPosition) return;
    
    const calculateDistance = () => {
      const dx = position.x - playerPosition.x;
      const dz = position.z - playerPosition.z;
      const newDistance = Math.sqrt(dx * dx + dz * dz);
      
      setDistance(newDistance);
      setVisible(newDistance < 50); // Only visible within 50 units
    };
    
    calculateDistance();
  }, [position, playerPosition]);
  
  // Create 3D position style based on position relative to player
  const getPositionStyle = () => {
    if (!playerPosition) {
      return {
        transform: `translate(-50%, -50%)`,
        opacity: 1,
      };
    }
    
    // Direction vector from player to traffic light
    const dx = position.x - playerPosition.x;
    const dz = position.z - playerPosition.z;
    
    // Normalize direction based on window size
    const screenX = window.innerWidth / 2 + (dx * 10);
    const screenY = window.innerHeight / 2 + (dz * 10);
    
    // Scale based on distance (closer = bigger)
    const scale = Math.max(0.5, Math.min(1.5, 30 / Math.max(1, distance)));
    
    return {
      left: `${screenX}px`,
      top: `${screenY}px`,
      transform: `translate(-50%, -50%) scale(${scale * size})`,
      opacity: Math.min(1, 50 / Math.max(1, distance)),
      zIndex: Math.floor(1000 - distance),
    };
  };
  
  if (!visible) return null;
  
  return (
    <div
      className="absolute"
      style={getPositionStyle()}
    >
      {/* Traffic light structure */}
      <div className="relative" style={{ width: '20px', height: '60px' }}>
        {/* Traffic light body */}
        <div className="absolute inset-0 bg-gray-800 rounded-md"></div>
        
        {/* Red light */}
        <div 
          className={`absolute top-2 left-0 right-0 mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
            lightState === 'red' ? 'bg-red-500' : 'bg-red-900'
          }`}
        >
          {lightState === 'red' && (
            <motion.div 
              className="w-6 h-6 bg-red-400 rounded-full"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Yellow light */}
        <div 
          className={`absolute top-0 bottom-0 left-0 right-0 m-auto w-8 h-8 rounded-full flex items-center justify-center ${
            lightState === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-900'
          }`}
        >
          {lightState === 'yellow' && (
            <motion.div 
              className="w-6 h-6 bg-yellow-400 rounded-full"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Green light */}
        <div 
          className={`absolute bottom-2 left-0 right-0 mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
            lightState === 'green' ? 'bg-green-500' : 'bg-green-900'
          }`}
        >
          {lightState === 'green' && (
            <motion.div 
              className="w-6 h-6 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Traffic light pole */}
        <div className="absolute -bottom-20 left-1/2 w-3 h-20 bg-gray-700 transform -translate-x-1/2"></div>
      </div>
    </div>
  );
}