import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * Virtual Fitting Room Component
 * 
 * React implementation of Unity's VirtualFittingRoom.cs script
 * Allows users to try on different outfits virtually
 */
interface Outfit {
  id: number;
  name: string;
  image: string;
  description?: string;
  price?: number;
}

interface VirtualFittingRoomProps {
  outfits: Outfit[];
  initialOutfitIndex?: number;
  avatarImage?: string; // Base avatar image to display outfits on
  onOutfitSelected?: (outfit: Outfit) => void;
  showControls?: boolean;
  backgroundColor?: string;
}

export default function VirtualFittingRoom({
  outfits,
  initialOutfitIndex = 0,
  avatarImage,
  onOutfitSelected,
  showControls = true,
  backgroundColor = 'linear-gradient(to bottom, #003366, #0066cc)'
}: VirtualFittingRoomProps) {
  // Current outfit index - equivalent to currentOutfit in Unity
  const [currentOutfit, setCurrentOutfit] = useState(initialOutfitIndex);

  // Function to change outfit - equivalent to ChangeOutfit() in Unity
  const changeOutfit = (direction: 'next' | 'prev' = 'next') => {
    setCurrentOutfit(currentIndex => {
      // Hide current outfit and show next one
      const newIndex = direction === 'next'
        ? (currentIndex + 1) % outfits.length  // Go to next outfit
        : (currentIndex - 1 + outfits.length) % outfits.length;  // Go to previous outfit
      
      // Notify about outfit selection if callback provided
      if (onOutfitSelected) {
        onOutfitSelected(outfits[newIndex]);
      }
      
      return newIndex;
    });
  };

  // Select a specific outfit by index
  const selectOutfit = (index: number) => {
    if (index >= 0 && index < outfits.length) {
      setCurrentOutfit(index);
      if (onOutfitSelected) {
        onOutfitSelected(outfits[index]);
      }
    }
  };

  if (!outfits || outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-lg text-white h-full" 
        style={{ background: backgroundColor }}>
        <div className="text-center">
          <p className="mb-4">لا توجد ملابس متاحة للتجربة</p>
        </div>
      </div>
    );
  }

  const currentOutfitData = outfits[currentOutfit];

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg text-white" 
      style={{ background: backgroundColor }}>
      {/* Header */}
      <div className="p-4 border-b border-yellow-400/20 flex justify-between items-center">
        <h2 className="text-xl font-bold">غرفة تبديل الملابس الافتراضية</h2>
        <div className="text-yellow-400 text-xs px-2 py-1 bg-blue-950 rounded">
          {currentOutfit + 1} / {outfits.length}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Avatar with outfit */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <motion.div
            key={currentOutfitData.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-full max-h-full"
          >
            {avatarImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={avatarImage} 
                  alt="Avatar Base" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <img 
                  src={currentOutfitData.image} 
                  alt={currentOutfitData.name} 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            ) : (
              <img 
                src={currentOutfitData.image} 
                alt={currentOutfitData.name} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                style={{ maxHeight: '60vh' }}
              />
            )}
          </motion.div>

          {/* Controls overlay */}
          {showControls && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-4 z-10">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/30 border-white/50 text-white hover:bg-black/50 hover:text-yellow-400"
                onClick={() => changeOutfit('prev')}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-black/30 border-white/50 text-white hover:bg-black/50 hover:text-yellow-400"
                onClick={() => changeOutfit('next')}
              >
                التالي
              </Button>
            </div>
          )}

          {/* Previous/Next arrows */}
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 z-10"
            onClick={() => changeOutfit('prev')}
          >
            &larr;
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 z-10"
            onClick={() => changeOutfit('next')}
          >
            &rarr;
          </button>
        </div>

        {/* Outfit details panel */}
        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-yellow-400/20 p-4 flex flex-col">
          <h3 className="text-lg font-bold mb-2">{currentOutfitData.name}</h3>
          
          {currentOutfitData.description && (
            <p className="text-sm text-white/80 mb-4">{currentOutfitData.description}</p>
          )}
          
          {currentOutfitData.price && (
            <div className="text-yellow-400 font-bold mb-4">
              {currentOutfitData.price} جنيه
            </div>
          )}

          {/* Outfit thumbnail selectors */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-2">
              {outfits.map((outfit, index) => (
                <div
                  key={outfit.id}
                  className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                    index === currentOutfit ? 'border-yellow-400' : 'border-transparent'
                  }`}
                  onClick={() => selectOutfit(index)}
                >
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 space-y-2">
            <Button className="w-full bg-yellow-400 text-blue-900 hover:bg-yellow-500">
              إضافة إلى السلة
            </Button>
            <Button variant="outline" className="w-full border-yellow-400 text-yellow-400 hover:bg-blue-900">
              مشاركة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}