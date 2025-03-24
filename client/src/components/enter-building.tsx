import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
  transitionDuration = 500,
}: EnterBuildingProps) {
  const [isInside, setIsInside] = useState(initiallyInside);
  const { toast } = useToast();

  // Function to enter the building (equivalent to Unity's Enter())
  const enter = () => {
    setIsInside(true);
    if (onEnter) onEnter();
    
    toast({
      title: `أنت الآن داخل ${buildingName}`,
      description: "اضغط على زر الخروج للعودة للخارج",
    });
  };

  // Function to exit the building (equivalent to Unity's Exit())
  const exit = () => {
    setIsInside(false);
    if (onExit) onExit();
    
    toast({
      title: `تم الخروج من ${buildingName}`,
      description: "أنت الآن في الخارج",
    });
  };

  // Keyboard controls for entering/exiting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'Enter') {
        if (!isInside) enter();
      } else if (e.key === 'Escape' || e.key === 'q') {
        if (isInside) exit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInside]);

  // Add fade transition similar to Unity's SetActive
  const fadeVariants = {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.95 }
  };

  return (
    <div className="building-container relative">
      <AnimatePresence>
        {/* Inside View (equivalent to insideView GameObject in Unity) */}
        {isInside && (
          <motion.div
            className="w-full h-full"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            transition={{ duration: transitionDuration / 1000 }}
          >
            {insideComponent}
            
            {/* Exit button */}
            <Button
              className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white"
              onClick={exit}
            >
              <i className="fas fa-door-open mr-2"></i>
              خروج
            </Button>
          </motion.div>
        )}

        {/* Outside View (equivalent to outsideView GameObject in Unity) */}
        {!isInside && (
          <motion.div
            className="w-full h-full"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            transition={{ duration: transitionDuration / 1000 }}
          >
            {outsideComponent}
            
            {/* Enter button */}
            <Button
              className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white"
              onClick={enter}
            >
              <i className="fas fa-door-closed mr-2"></i>
              دخول {buildingName}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}