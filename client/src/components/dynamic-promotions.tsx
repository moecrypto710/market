import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

/**
 * Dynamic Promotions Component
 * 
 * React implementation of Unity's DynamicPromotions.cs script
 * Shows a different promotion based on the current day
 */
interface DynamicPromotionsProps {
  className?: string;
  position?: { top?: string; right?: string; bottom?: string; left?: string };
  animated?: boolean;
  variant?: 'default' | 'highlight' | 'minimal';
}

export default function DynamicPromotions({
  className = '',
  position,
  animated = true,
  variant = 'default'
}: DynamicPromotionsProps) {
  // Promotions array from the Unity script
  const promotions = [
    "خصم 20% على الهواتف!",
    "اشترِ ساعة ذكية واحصل على سماعات مجانية!",
    "عرض حصري: لابتوب بأرخص سعر!"
  ];

  // State to hold current promotion
  const [currentPromotion, setCurrentPromotion] = useState('');
  
  // ShowDailyPromotion function from Unity script
  useEffect(() => {
    const today = new Date();
    const index = today.getDate() % promotions.length;
    setCurrentPromotion(promotions[index]);
  }, []);
  
  // Choose styling based on variant
  const cardStyles = {
    default: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg',
    highlight: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg',
    minimal: 'bg-white border border-gray-200 text-gray-800'
  };
  
  // Position styling
  const positionStyles = position ? {
    position: 'absolute',
    ...position
  } as React.CSSProperties : {};
  
  return (
    <div 
      className={`max-w-md ${className}`} 
      style={positionStyles}
    >
      {animated ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={cardStyles[variant]}>
            <CardContent className="pt-4 flex items-center">
              <div className="mr-3 text-2xl">🎁</div>
              <div className="text-xl font-bold" style={{ direction: 'rtl' }}>
                {currentPromotion}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className={cardStyles[variant]}>
          <CardContent className="pt-4 flex items-center">
            <div className="mr-3 text-2xl">🎁</div>
            <div className="text-xl font-bold" style={{ direction: 'rtl' }}>
              {currentPromotion}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}