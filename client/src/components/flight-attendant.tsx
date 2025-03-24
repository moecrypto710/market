import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * Flight Attendant Component
 * 
 * React implementation of Unity's FlightAttendant.cs script
 * Creates an interactive flight attendant character with dialogue
 */
interface FlightAttendantProps {
  position?: { x: number; y: number };
  scale?: number;
  avatarUrl?: string;
  onDialogueComplete?: () => void;
  customDialogues?: string[];
  onTryClothes?: () => void; // Callback for trying clothes in virtual fitting room
}

export default function FlightAttendant({
  position = { x: 0, y: 0 },
  scale = 1,
  avatarUrl,
  onDialogueComplete,
  customDialogues,
  onTryClothes,
}: FlightAttendantProps) {
  const { toast } = useToast();
  
  // Dialogue lines from the Unity script
  const defaultDialogues = [
    "مرحبًا بكم في رحلتنا!",
    "هل تحتاج إلى مشروب؟",
    "نتمنى لكم رحلة سعيدة!"
  ];
  
  // Use custom dialogues if provided, otherwise use default
  const dialogues = customDialogues || defaultDialogues;
  
  // Current dialogue index - equivalent to currentDialogue in Unity
  const [currentDialogue, setCurrentDialogue] = useState(0);
  
  // Whether dialogue is showing
  const [showDialogue, setShowDialogue] = useState(false);
  
  // Whether all dialogues have been shown
  const [dialogueComplete, setDialogueComplete] = useState(false);
  
  // Animation state to make the attendant more lively (like in Unity animations)
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Implement idle animation like in Unity's Animator component
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 5000);
    
    return () => clearInterval(animationInterval);
  }, []);
  
  // NextDialogue function from Unity script
  const nextDialogue = () => {
    if (currentDialogue < dialogues.length) {
      // Show current dialogue
      setShowDialogue(true);
      
      // Move to next dialogue for next click
      setCurrentDialogue(prevDialogue => {
        const next = prevDialogue + 1;
        
        // Check if we've reached the end
        if (next >= dialogues.length) {
          setDialogueComplete(true);
          onDialogueComplete?.();
        }
        
        return next;
      });
    } else {
      // Reset dialogue if we've gone through all of them
      setCurrentDialogue(0);
      setShowDialogue(false);
      setDialogueComplete(false);
    }
  };
  
  // Restart dialogue sequence
  const restartDialogue = () => {
    setCurrentDialogue(0);
    setShowDialogue(true);
    setDialogueComplete(false);
  };
  
  return (
    <div className="relative" style={{ 
      left: `${position.x}px`, 
      top: `${position.y}px`,
      transform: `scale(${scale})` 
    }}>
      {/* Flight attendant avatar - animated like Unity's character controllers */}
      <motion.div 
        className="cursor-pointer"
        onClick={() => showDialogue ? nextDialogue() : setShowDialogue(true)}
        animate={isAnimating ? { 
          y: [0, -5, 0], 
          rotate: [0, 2, 0, -2, 0],
        } : {}}
        transition={{ duration: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Flight Attendant" 
            className="w-16 h-24 object-cover rounded-md"
          />
        ) : (
          <div className="w-16 h-24 flex items-center justify-center relative overflow-hidden">
            {/* Flight Attendant Representation */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-800"></div>
            
            {/* Head and face */}
            <div className="w-10 h-10 bg-[#f8d3ac] rounded-full absolute top-2 flex items-center justify-center">
              <div className="w-6 h-2 absolute top-3 flex justify-between">
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
              </div>
              <div className="w-2 h-1 bg-red-500 absolute top-6 rounded-full"></div>
            </div>
            
            {/* Uniform - white scarf and blue hat */}
            <div className="w-12 h-3 bg-white absolute top-9 rounded-full transform -rotate-6"></div>
            <div className="w-6 h-2 bg-blue-600 absolute top-0 left-2 rounded-t-md"></div>
            
            {/* Body - airline uniform */}
            <div className="w-14 h-12 bg-blue-800 absolute bottom-0 rounded-b-md">
              <div className="w-full h-4 bg-blue-600 absolute top-0"></div>
              <div className="w-8 h-1 bg-yellow-400 absolute top-5 left-3"></div>
              <div className="w-8 h-1 bg-yellow-400 absolute top-7 left-3"></div>
            </div>
          </div>
        )}
        
        {/* Animated greeting icon */}
        <motion.div 
          className="absolute -top-4 -right-4 bg-yellow-400 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 3
          }}
        >
          👋
        </motion.div>
      </motion.div>
      
      {/* Dialogue bubble - styled like Emirates Airlines branding */}
      {showDialogue && (
        <motion.div
          className="absolute top-0 left-20 bg-gradient-to-b from-blue-800 to-blue-900 text-white p-3 rounded-lg w-64 shadow-md border-2 border-yellow-400"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ direction: 'rtl' }}
        >
          <div className="absolute left-[-10px] top-4 w-0 h-0 border-t-[10px] border-t-transparent border-r-[10px] border-r-blue-800 border-b-[10px] border-b-transparent"></div>
          
          {/* Emirates logo */}
          <div className="mb-3 flex items-center justify-center">
            <div className="text-yellow-400 font-bold text-xs bg-blue-950 px-2 py-1 rounded-sm inline-block">
              طيران الإمارات
            </div>
          </div>
          
          {/* Dialogue text */}
          <p className="text-sm font-medium mb-2 text-white">
            {dialogueComplete ? "هل تريد التحدث مرة أخرى؟" : dialogues[Math.max(0, currentDialogue - 1)]}
          </p>
          
          {/* Flying animation to mimic Unity particle effects */}
          <motion.div 
            className="absolute -top-2 -right-2 text-xs"
            animate={{ 
              y: [-5, -10, -5],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ✈️
          </motion.div>
          
          <div className="flex justify-end gap-2">
            {dialogueComplete ? (
              <Button 
                size="sm" 
                onClick={restartDialogue}
                className="text-xs bg-yellow-400 text-blue-900 hover:bg-yellow-500 border-none"
              >
                تحدث مرة أخرى
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={nextDialogue}
                className="text-xs bg-yellow-400 text-blue-900 hover:bg-yellow-500 border-none"
              >
                {currentDialogue >= dialogues.length ? "إغلاق" : "متابعة"}
              </Button>
            )}
            
            {/* Add a Virtual Fitting Room button, based on Unity's VirtualFittingRoom.cs */}
            {!dialogueComplete && currentDialogue > 1 && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-yellow-400 text-yellow-400 hover:bg-blue-800"
                onClick={() => {
                  if (onTryClothes) {
                    onTryClothes();
                  } else {
                    toast({
                      title: "تجربة الملابس",
                      description: "سيتم فتح غرفة تبديل الملابس الافتراضية!",
                    });
                  }
                }}
              >
                تجربة الملابس
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}