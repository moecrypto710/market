import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnterBuildingProps {
  buildingName: string;
  insideComponent: React.ReactNode;
  outsideComponent: React.ReactNode;
  initiallyInside?: boolean;
  onEnter?: () => void;
  onExit?: () => void;
  transitionDuration?: number;
}

/**
 * Enter Building Component
 * 
 * A React implementation of Unity's EnterBuilding.cs script
 * Allows toggling between inside and outside views of buildings
 */
export default function EnterBuilding({
  buildingName,
  insideComponent,
  outsideComponent,
  initiallyInside = false,
  onEnter,
  onExit,
  transitionDuration = 800, // in ms
}: EnterBuildingProps) {
  const [isInside, setIsInside] = useState(initiallyInside);
  const [transitioning, setTransitioning] = useState(false);

  // Handle keyboard shortcuts for entering/exiting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'Enter') {
        // Enter the building on 'e' or 'Enter' key
        if (!isInside && !transitioning) {
          enter();
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        // Exit the building on 'Escape' or 'Backspace' key
        if (isInside && !transitioning) {
          exit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInside, transitioning]);

  // Enter building function
  const enter = () => {
    if (isInside || transitioning) return;
    
    setTransitioning(true);
    setTimeout(() => {
      setIsInside(true);
      setTransitioning(false);
      if (onEnter) onEnter();
    }, transitionDuration);
  };

  // Exit building function
  const exit = () => {
    if (!isInside || transitioning) return;
    
    setTransitioning(true);
    setTimeout(() => {
      setIsInside(false);
      setTransitioning(false);
      if (onExit) onExit();
    }, transitionDuration);
  };

  return (
    <div className="relative w-full h-full">
      {/* Transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="absolute inset-0 bg-black z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration / 1000 / 2 }}
          />
        )}
      </AnimatePresence>

      {/* Inside view */}
      <AnimatePresence>
        {isInside && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-full h-full">
              {insideComponent}
              
              {/* Exit button */}
              <button
                onClick={exit}
                className="absolute bottom-6 right-6 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white backdrop-blur-sm rounded-lg flex items-center space-x-2 border border-white/10 z-20"
                disabled={transitioning}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>الخروج من {buildingName}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outside view */}
      <AnimatePresence>
        {!isInside && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-full h-full">
              {outsideComponent}
              
              {/* Enter button */}
              <button
                onClick={enter}
                className="absolute bottom-6 right-6 px-4 py-2 bg-indigo-800/80 hover:bg-indigo-700/80 text-white backdrop-blur-sm rounded-lg flex items-center space-x-2 border border-white/10 z-20"
                disabled={transitioning}
              >
                <i className="fas fa-door-open"></i>
                <span>الدخول إلى {buildingName}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}