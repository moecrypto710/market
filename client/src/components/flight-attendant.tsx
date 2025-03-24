import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

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
}

export default function FlightAttendant({
  position = { x: 0, y: 0 },
  scale = 1,
  avatarUrl,
  onDialogueComplete,
  customDialogues,
}: FlightAttendantProps) {
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
      {/* Flight attendant avatar */}
      <div 
        className="cursor-pointer"
        onClick={() => showDialogue ? nextDialogue() : setShowDialogue(true)}
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Flight Attendant" 
            className="w-16 h-24 object-cover rounded-md"
          />
        ) : (
          <div className="w-16 h-24 bg-blue-600 rounded-md flex items-center justify-center relative">
            {/* Simple avatar representation */}
            <div className="w-10 h-10 bg-yellow-200 rounded-full absolute top-2"></div>
            <div className="w-14 h-12 bg-blue-700 absolute bottom-0 rounded-b-md"></div>
          </div>
        )}
      </div>
      
      {/* Dialogue bubble */}
      {showDialogue && (
        <motion.div
          className="absolute top-0 left-20 bg-white text-black p-3 rounded-lg w-64 shadow-md"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ direction: 'rtl' }}
        >
          <div className="absolute left-[-8px] top-4 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-white border-b-[8px] border-b-transparent"></div>
          
          <p className="text-sm font-medium mb-2">
            {dialogueComplete ? "هل تريد التحدث مرة أخرى؟" : dialogues[Math.max(0, currentDialogue - 1)]}
          </p>
          
          <div className="flex justify-end space-x-2">
            {dialogueComplete ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={restartDialogue}
                className="text-xs"
              >
                تحدث مرة أخرى
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextDialogue}
                className="text-xs"
              >
                {currentDialogue >= dialogues.length ? "إغلاق" : "متابعة"}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}