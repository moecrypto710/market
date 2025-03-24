import React, { useEffect, useState } from 'react';
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
  // State for current day and promotion
  const [currentPromotion, setCurrentPromotion] = useState({
    title: '',
    description: '',
    discount: '',
    code: '',
    expiryDays: 0,
    color: '',
    highlight: false
  });
  
  // Similar to Unity, get the current day to decide which promotion to show
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6 (Sunday-Saturday)
    
    // Arabic promotion content - similar to Unity's promotionTexts array
    const promotions = [
      {
        title: 'عرض نهاية الأسبوع',
        description: 'استمتع بخصم 20% على جميع منتجات الملابس',
        discount: '20%',
        code: 'WEEKEND20',
        expiryDays: 2,
        color: '#ef4444', // red-500
        highlight: true
      },
      {
        title: 'عرض الإثنين',
        description: 'خصم 15% على الإلكترونيات اليوم فقط',
        discount: '15%',
        code: 'MONDAY15',
        expiryDays: 1,
        color: '#3b82f6', // blue-500
        highlight: false
      },
      {
        title: 'عرض الثلاثاء',
        description: 'اشترِ قطعة واحصل على الثانية بنصف السعر',
        discount: '50%',
        code: 'BOGO50',
        expiryDays: 1,
        color: '#8b5cf6', // purple-500
        highlight: false
      },
      {
        title: 'عرض خاص - الأربعاء',
        description: 'خصم 10% إضافي على المنتجات المخفضة',
        discount: '10%',
        code: 'WEDNESDAYEXTRA',
        expiryDays: 1,
        color: '#10b981', // emerald-500
        highlight: false
      },
      {
        title: 'خميس التسوق',
        description: 'شحن مجاني على جميع الطلبات اليوم',
        discount: 'شحن مجاني',
        code: 'FREESHIP',
        expiryDays: 1,
        color: '#f59e0b', // amber-500
        highlight: true
      },
      {
        title: 'نهاية الأسبوع المبكرة',
        description: 'خصم 25% على منتجات مختارة',
        discount: '25%',
        code: 'FRIDAY25',
        expiryDays: 3,
        color: '#ec4899', // pink-500
        highlight: true
      },
      {
        title: 'عرض السبت',
        description: 'استبدل نقاطك بخصم إضافي 5%',
        discount: '5%',
        code: 'SATPOINTS',
        expiryDays: 1,
        color: '#6366f1', // indigo-500
        highlight: false
      }
    ];
    
    // Set promotion based on day of week (like Unity's SwitchPromotion method)
    // Using a hardcoded value for testing (Wednesday) to ensure we see a promotion
    const testDay = 3; // Wednesday (for testing)
    setCurrentPromotion(promotions[testDay]);
    
    // In production, use the actual day:
    // setCurrentPromotion(promotions[dayOfWeek]);
  }, []);
  
  // Format expiry date - similar to Unity's GetExpiryDate method
  const getExpiryDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + currentPromotion.expiryDays);
    
    // Format date in Arabic style
    const day = today.getDate();
    const month = today.toLocaleString('ar-SA', { month: 'long' });
    
    return `${day} ${month}`;
  };
  
  // Apply variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'highlight':
        return {
          background: `linear-gradient(135deg, ${currentPromotion.color}33, ${currentPromotion.color}66)`,
          border: `2px solid ${currentPromotion.color}`,
          padding: '16px'
        };
      case 'minimal':
        return {
          background: 'transparent',
          border: `1px solid ${currentPromotion.color}33`,
          padding: '8px'
        };
      default:
        return {
          background: `${currentPromotion.color}11`,
          border: `1px solid ${currentPromotion.color}33`,
          padding: '12px'
        };
    }
  };
  
  return (
    <motion.div 
      className={`dynamic-promotion rounded-lg overflow-hidden ${className}`}
      style={{
        ...getVariantStyles(),
        position: position ? 'absolute' : 'relative',
        top: position?.top,
        right: position?.right,
        bottom: position?.bottom,
        left: position?.left,
      }}
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { 
        opacity: 1, 
        y: 0,
        scale: currentPromotion.highlight ? [1, 1.02, 1] : 1
      } : {}}
      transition={animated ? { 
        duration: 0.5,
        scale: {
          repeat: currentPromotion.highlight ? Infinity : 0,
          repeatType: "reverse",
          duration: 2
        }
      } : {}}
    >
      {/* Discount badge - similar to Unity's discount tag */}
      {currentPromotion.discount && (
        <div 
          className="absolute top-0 right-0 py-1 px-3 text-sm font-bold text-white rounded-bl-lg"
          style={{ backgroundColor: currentPromotion.color }}
        >
          {currentPromotion.discount}
        </div>
      )}
      
      <div className="mt-2 text-right" style={{ direction: 'rtl' }}>
        {/* Title */}
        <h3 
          className="text-lg font-bold mb-1"
          style={{ color: currentPromotion.color }}
        >
          {currentPromotion.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-700 mb-3">{currentPromotion.description}</p>
        
        {/* Promotion code */}
        <div className="mb-2">
          <span className="text-xs text-gray-500 ml-1">رمز الخصم:</span>
          <span 
            className="inline-block bg-gray-100 px-2 py-1 text-sm rounded font-mono font-semibold"
            style={{ color: currentPromotion.color }}
          >
            {currentPromotion.code}
          </span>
        </div>
        
        {/* Expiry */}
        <div className="text-xs text-gray-500">
          ينتهي العرض: {getExpiryDate()}
        </div>
      </div>
      
      {/* Decorative elements */}
      {variant === 'highlight' && (
        <motion.div
          className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20"
          style={{ background: currentPromotion.color }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      )}
    </motion.div>
  );
}