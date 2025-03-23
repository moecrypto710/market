
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
      className="overflow-hidden transition-all duration-300 h-full flex flex-col border futuristic-border bg-black text-white group relative perspective-3d shadow-glow"
      style={{
        transform: vrEnabled ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : 'none',
        transition: 'transform 0.1s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card background decorative elements */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -top-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full filter blur-xl"></div>
        <div className="absolute -bottom-10 left-10 w-32 h-32 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-full filter blur-xl"></div>
      </div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br from-purple-600 to-pink-600"></div>
      
      {/* AI Insight Popup */}
      {showAIInsight && vrEnabled && (
        <div className="absolute top-0 right-0 z-30 glass-effect p-3 m-2 rounded-lg max-w-[80%] text-xs text-white shadow-glow animate-float-slow neon-text">
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">🔮</span>
            <div>
              <div className="font-bold mb-1 text-purple-300">تحليل ذكاء اصطناعي:</div>
              <p>{getAIInsight()}</p>
            </div>
          </div>
        </div>
      )}
      
      <Link href={`/product/${product.id}`}>
        <div className="relative pb-[80%] overflow-hidden cursor-pointer border-b border-white/10">
          {/* Image overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/70 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/30 z-10"></div>
          
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          
          {/* Price tag with enhanced styling */}
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-md shadow-lg font-bold text-sm tracking-wide z-20 transition-all duration-300 group-hover:border-purple-500/30">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
              {formattedPrice} جنيه
            </span>
          </div>
          
          {/* Sale badge with enhanced styling */}
          {product.commissionRate > 8 && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none py-1.5 shadow-lg group-hover:animate-pulse-slow">
                خصم {product.commissionRate}%
              </Badge>
            </div>
          )}
          
          {/* Amrikyy Mall logo watermark - updated from Style Echo */}
          <div className="absolute bottom-3 right-3 text-xs font-bold z-20 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              AMRIKYY MALL
            </span>
          </div>
        </div>
      </Link>
      
      <CardHeader className="p-4 pb-0 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <Badge 
            variant="outline" 
            className="text-xs bg-black/60 backdrop-blur-sm text-white/80 border-white/10 group-hover:border-purple-500/30 uppercase tracking-wide transition-all duration-300"
          >
            {getCategoryLabel(product.category)}
          </Badge>
          
          {product.inStock ? (
            <span className="text-xs text-white/90 px-2 py-1 bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/20 rounded-md">متوفر</span>
          ) : (
            <span className="text-xs text-white/50 px-2 py-1 bg-white/5 border border-white/10 rounded-md">غير متوفر</span>
          )}
        </div>
        
        <h3 className="font-bold text-lg mt-2 line-clamp-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300 tracking-wide">
          {product.name}
        </h3>
        
        <p className="text-sm text-white/60 group-hover:text-white/80 transition-all duration-300 mt-2 line-clamp-2">
          {product.description}
        </p>
      </CardHeader>
      
      <CardFooter className="p-4 mt-auto flex flex-col gap-3 relative z-10">
        <div className="flex justify-between items-center w-full">
          <div className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300 tracking-wider">
            {formattedPrice} ج.م
          </div>
          
          {/* Enhanced star rating with theme colors */}
          <div className="text-xs flex items-center">
            <span className="mr-1 text-white/50 text-xs">تقييم:</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">★★★★</span>
            <span className="text-white/30">☆</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {(product.category === 'clothing' || product.category === 'sports') && vrEnabled && (
            <Button 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-90 font-bold tracking-wide transition-all duration-300 py-4 relative overflow-hidden group/btn shadow-glow"
              onClick={() => {
                toast({
                  title: "جاري فتح تجربة المنتج",
                  description: "الآن يمكنك تجربة المنتج افتراضيًا باستخدام الكاميرا"
                });
                // In real app, this would open camera integration component
              }}
            >
              {/* Button holographic effect */}
              <div className="absolute inset-0 holographic-bg opacity-30"></div>
              
              <span className="relative z-10 flex items-center justify-center">
                <i className="fas fa-camera mr-2"></i>
                تجربة المنتج افتراضيًا
              </span>
            </Button>
          )}
        
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 font-bold tracking-wide transition-all duration-300 py-5 relative overflow-hidden group/btn"
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover/btn:translate-x-full transform transition-transform duration-1000"></div>
            
            <span className="relative z-10 flex items-center justify-center">
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
