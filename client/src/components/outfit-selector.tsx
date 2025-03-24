import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * OutfitSelector Component
 * 
 * React implementation of Unity's OutfitSelector.cs
 * Allows users to try different outfits/products in the virtual environment
 */
interface Outfit {
  id: number;
  name: string;
  image: string;
  color: string;
  description?: string;
  price?: number;
}

interface OutfitSelectorProps {
  outfits: Outfit[];
  onSelect?: (outfit: Outfit) => void;
  initialOutfitId?: number;
  showControls?: boolean;
  viewMode?: 'grid' | 'carousel' | 'list';
  className?: string;
}

export default function OutfitSelector({
  outfits,
  onSelect,
  initialOutfitId = 0,
  showControls = true,
  viewMode = 'carousel',
  className,
}: OutfitSelectorProps) {
  // State to track current outfit (analogous to currentIndex in Unity script)
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(
    outfits.findIndex(o => o.id === initialOutfitId) > -1 
      ? outfits.findIndex(o => o.id === initialOutfitId) 
      : 0
  );
  
  const currentOutfit = outfits[currentOutfitIndex];

  // Function to change outfit (similar to ChangeOutfit() in Unity)
  const changeOutfit = (direction: 'next' | 'prev') => {
    let newIndex;
    
    if (direction === 'next') {
      // This is equivalent to (currentIndex + 1) % outfits.Length in Unity
      newIndex = (currentOutfitIndex + 1) % outfits.length;
    } else {
      // Go to previous outfit, wrapping around to the end if needed
      newIndex = (currentOutfitIndex - 1 + outfits.length) % outfits.length;
    }
    
    setCurrentOutfitIndex(newIndex);
    onSelect?.(outfits[newIndex]);
  };
  
  // Handle direct selection of an outfit
  const selectOutfit = (index: number) => {
    setCurrentOutfitIndex(index);
    onSelect?.(outfits[index]);
  };

  // Render different view modes
  const renderOutfitView = () => {
    switch (viewMode) {
      case 'grid':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {outfits.map((outfit, index) => (
              <div 
                key={outfit.id}
                className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                  currentOutfitIndex === index ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                }`}
                onClick={() => selectOutfit(index)}
              >
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={outfit.image} 
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div 
                  className="p-2 text-center text-sm" 
                  style={{ backgroundColor: outfit.color, color: getLuminance(outfit.color) > 0.5 ? '#000' : '#fff' }}
                >
                  {outfit.name}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'list':
        return (
          <div className="divide-y">
            {outfits.map((outfit, index) => (
              <div 
                key={outfit.id}
                className={`flex items-center p-3 cursor-pointer ${
                  currentOutfitIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => selectOutfit(index)}
              >
                <div 
                  className="w-10 h-10 rounded-full mr-3" 
                  style={{ backgroundColor: outfit.color }}
                />
                <div className="flex-1">
                  <div className="font-medium">{outfit.name}</div>
                  {outfit.description && (
                    <div className="text-sm text-gray-500">{outfit.description}</div>
                  )}
                </div>
                {outfit.price && (
                  <div className="font-bold">{outfit.price.toLocaleString()} ر.س</div>
                )}
              </div>
            ))}
          </div>
        );
        
      case 'carousel':
      default:
        return (
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
              <motion.div
                key={currentOutfit.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="relative flex-1 bg-gray-100">
                  <img
                    src={currentOutfit.image}
                    alt={currentOutfit.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <div 
                  className="p-4 text-center"
                  style={{ backgroundColor: currentOutfit.color, color: getLuminance(currentOutfit.color) > 0.5 ? '#000' : '#fff' }}
                >
                  <h3 className="text-lg font-bold mb-1">{currentOutfit.name}</h3>
                  {currentOutfit.description && (
                    <p className="text-sm mb-2">{currentOutfit.description}</p>
                  )}
                  {currentOutfit.price && (
                    <div className="font-bold text-xl">{currentOutfit.price.toLocaleString()} ر.س</div>
                  )}
                </div>
              </motion.div>
            </div>
            
            {showControls && (
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => changeOutfit('prev')}
                  className="flex-1 mx-1"
                >
                  السابق
                </Button>
                <Button 
                  onClick={() => changeOutfit('next')}
                  className="flex-1 mx-1"
                >
                  التالي
                </Button>
              </div>
            )}
            
            {/* Outfit indicators */}
            <div className="flex justify-center mt-4">
              {outfits.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 mx-1 rounded-full cursor-pointer transition-all duration-300 ${
                    currentOutfitIndex === index ? 'bg-blue-500 w-4' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => selectOutfit(index)}
                />
              ))}
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className={`outfit-selector ${className || ''}`}>
      {renderOutfitView()}
    </div>
  );
}

// Helper function to calculate luminance for text color contrast
function getLuminance(hexColor: string): number {
  // Remove # if present
  const color = hexColor.charAt(0) === '#' ? hexColor.substring(1) : hexColor;
  
  // Convert to RGB
  const r = parseInt(color.substr(0,2), 16) / 255;
  const g = parseInt(color.substr(2,2), 16) / 255;
  const b = parseInt(color.substr(4,2), 16) / 255;
  
  // Calculate luminance using the formula for relative luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}