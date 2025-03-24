
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";
import { useToast } from '@/hooks/use-toast';
import { useVR } from '@/hooks/use-vr';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
  detailed?: boolean;
}

function ProductCard({ 
  product, 
  detailed = false
}: ProductCardProps) {
  const { toast } = useToast();
  const { vrEnabled } = useVR();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [showAIInsight, setShowAIInsight] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !vrEnabled) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 10 degrees)
    const rotateY = ((x - centerX) / centerX) * 5;
    const rotateX = -((y - centerY) / centerY) * 5;
    
    setRotation({ x: rotateX, y: rotateY });
  };
  
  const handleMouseLeave = () => {
    // Reset rotation when mouse leaves
    setRotation({ x: 0, y: 0 });
  };
  
  // AI product insights
  const getAIInsight = () => {
    // Simulate AI-generated insights about the product
    const insights = [
      `هذا المنتج يناسب ${product.category === 'clothing' ? 'مقاس متوسط' : 'الاستخدام اليومي'}`,
      `${product.commissionRate > 8 ? 'ينصح بالشراء الآن للاستفادة من الخصم' : 'سعر مناسب مقارنة بالسوق'}`,
      `${product.category === 'electronics' ? 'مواصفات تقنية متميزة' : 'جودة عالية وتصميم أنيق'}`
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };
  
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", { productId: product.id, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "تمت الإضافة للسلة",
        description: `تمت إضافة ${product.name} إلى سلة التسوق.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format price in Egyptian Pounds (EGP)
  const formattedPrice = product.price.toLocaleString('ar-EG');
  
  // Get appropriate category label in Arabic
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'electronics': return 'إلكترونيات';
      case 'clothing': return 'ملابس';
      case 'home': return 'منزل';
      case 'sports': return 'رياضة';
      default: return category;
    }
  };

  // Effect for showing AI insight after component mounts
  useEffect(() => {
    if (vrEnabled) {
      const timer = setTimeout(() => {
        setShowAIInsight(true);
        
        // Hide after 5 seconds
        const hideTimer = setTimeout(() => {
          setShowAIInsight(false);
        }, 5000);
        
        return () => clearTimeout(hideTimer);
      }, 1000 + Math.random() * 3000); // Random delay between 1-4 seconds
      
      return () => clearTimeout(timer);
    }
  }, [vrEnabled]);

  return (
    <Card 
      ref={cardRef}
      className="overflow-hidden h-full flex flex-col bg-black text-white group relative border border-pink-500/30 shadow-md hover-shadow-pulse"
      style={{
        transform: vrEnabled ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : 'none',
        transition: 'transform 0.1s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* AI Insight Popup - Pink version */}
      {showAIInsight && vrEnabled && (
        <div className="absolute top-0 right-0 z-30 bg-pink-600/70 p-2 m-2 rounded-lg max-w-[80%] text-xs text-white">
          <div className="flex items-start gap-2">
            <span className="mt-1">💡</span>
            <div>
              <div className="font-bold mb-1">تحليل:</div>
              <p>{getAIInsight()}</p>
            </div>
          </div>
        </div>
      )}
      
      <Link href={`/product/${product.id}`}>
        <div className="relative pb-[80%] overflow-hidden cursor-pointer border-b border-pink-500/30">
          {/* Simple image overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/70 z-10"></div>
          
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          
          {/* Price tag - pink version */}
          <div className="absolute top-3 left-3 bg-black/80 border border-pink-500/30 px-2 py-1 rounded-md font-bold text-sm z-20">
            {formattedPrice} جنيه
          </div>
          
          {/* Sale badge - pink version */}
          {product.commissionRate > 8 && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className="bg-pink-600 text-white">
                خصم {product.commissionRate}%
              </Badge>
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="p-4 pb-0 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="text-xs border-pink-500/50">
            {getCategoryLabel(product.category)}
          </Badge>
          
          {product.inStock ? (
            <span className="text-xs text-green-400 px-2 py-1">متوفر</span>
          ) : (
            <span className="text-xs text-white/50 px-2 py-1">غير متوفر</span>
          )}
        </div>
        
        <h3 className="font-bold text-lg mt-2 line-clamp-1 text-pink-100">
          {product.name}
        </h3>
        
        <p className="text-sm text-white/60 mt-2 line-clamp-2">
          {product.description}
        </p>
      </CardHeader>
      
      <CardFooter className="p-4 mt-auto flex flex-col gap-3 relative z-10">
        <div className="flex justify-between items-center w-full">
          <div className="font-bold text-lg text-pink-200">
            {formattedPrice} ج.م
          </div>
          
          {/* Star rating with pink */}
          <div className="text-xs flex items-center">
            <span className="mr-1 text-white/50 text-xs">تقييم:</span>
            <span className="text-pink-400">★★★★</span>
            <span className="text-white/30">☆</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {(product.category === 'clothing' || product.category === 'travel') && vrEnabled && (
            <Button 
              className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold"
              onClick={() => {
                toast({
                  title: "جاري فتح تجربة المنتج",
                  description: "الآن يمكنك تجربة المنتج افتراضيًا باستخدام الكاميرا"
                });
              }}
            >
              <span className="flex items-center justify-center">
                <i className="fas fa-camera mr-2"></i>
                تجربة المنتج افتراضيًا
              </span>
            </Button>
          )}
        
          <Button 
            className="w-full bg-pink-600 text-white hover:bg-pink-700 font-bold hover-jelly"
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
          >
            <span className="flex items-center justify-center">
              <i className="fas fa-shopping-cart mr-2"></i>
              {addToCartMutation.isPending ? 'جاري الإضافة...' : 'إضافة للسلة'}
            </span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
