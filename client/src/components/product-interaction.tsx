import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductInteractionProps {
  product: Product;
  position?: { x: number; y: number; z: number };
  rotation?: number;
  scale?: number;
  onClick?: (product: Product) => void;
  onHover?: (product: Product) => void;
  interactionMode?: 'click' | 'hover' | 'both';
  showDetails?: boolean;
  className?: string;
  style?: React.CSSProperties;
  inVR?: boolean;
}

/**
 * Product Interaction Component
 * 
 * React implementation of Unity's ProductInteraction.cs
 * Displays product information on interaction (click/hover)
 */
export default function ProductInteraction({
  product,
  position,
  rotation = 0,
  scale = 1,
  onClick,
  onHover,
  interactionMode = 'both',
  showDetails = false,
  className = '',
  style = {},
  inVR = false
}: ProductInteractionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showInfo, setShowInfo] = useState(showDetails);
  const { toast } = useToast();
  const productRef = useRef<HTMLDivElement>(null);
  
  // Show product info when selected or hovered based on interaction mode
  useEffect(() => {
    if (interactionMode === 'click') {
      setShowInfo(isSelected);
    } else if (interactionMode === 'hover') {
      setShowInfo(isHovered);
    } else if (interactionMode === 'both') {
      setShowInfo(isSelected || isHovered);
    }
  }, [isSelected, isHovered, interactionMode]);
  
  // Handle product click (equivalent to OnMouseDown in Unity)
  const handleProductClick = () => {
    setIsSelected(!isSelected);
    
    if (onClick) {
      onClick(product);
    } else {
      // Default behavior if no onClick handler provided
      toast({
        title: `اخترت: ${product.name}`,
        description: inVR ? "اضغط للمزيد من المعلومات" : product.description?.substring(0, 50) + "...",
        duration: 3000
      });
    }
  };
  
  // Handle mouse hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover(product);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  // VR-specific styling based on position and rotation
  const getVRStyle = () => {
    if (!inVR || !position) return {};
    
    // Calculate 3D transformation including depth (perspective)
    return {
      transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px) 
                   rotateY(${rotation}deg) scale(${scale})`,
      transformStyle: 'preserve-3d',
      ...style
    };
  };
  
  return (
    <div
      ref={productRef}
      className={`product-interaction relative ${className} ${inVR ? 'vr-object' : ''}`}
      style={getVRStyle()}
      onClick={handleProductClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* The product representation (image or 3D model) */}
      <div className={`product-visual cursor-pointer transition-transform duration-300 ${
        (isHovered || isSelected) ? 'scale-105' : ''
      }`}>
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-md flex items-center justify-center">
            <span className="text-4xl opacity-50">🛍️</span>
          </div>
        )}
        
        {/* Hover/Selection effect */}
        {(isHovered || isSelected) && (
          <div className="absolute inset-0 border-2 border-primary/50 rounded-md pulse-border"></div>
        )}
      </div>
      
      {/* Product information panel - shows on interaction */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="product-info absolute top-full left-0 w-full bg-black/80 backdrop-blur-sm rounded-md p-3 z-10 border border-primary/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
            
            {product.price && (
              <div className="text-primary font-bold mb-2">{product.price} جنيه</div>
            )}
            
            {product.description && (
              <p className="text-white/80 text-sm mb-2">{product.description.substring(0, 100)}{product.description.length > 100 ? '...' : ''}</p>
            )}
            
            <div className="flex justify-between items-center mt-2">
              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}
              
              <Button 
                size="sm" 
                variant="default" 
                onClick={(e) => {
                  e.stopPropagation();
                  toast({
                    title: `تمت إضافة ${product.name} إلى سلة التسوق`,
                    description: "يمكنك مواصلة التسوق أو الانتقال إلى السلة",
                  });
                }}
              >
                إضافة للسلة
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}