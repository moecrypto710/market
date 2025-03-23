
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";
import { useToast } from '@/hooks/use-toast';
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

  return (
    <Card className="overflow-hidden transition-all duration-300 h-full flex flex-col hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-white/30 bg-black text-white group">
      <div 
        className="relative pb-[80%] overflow-hidden cursor-pointer border-b border-white/20" 
        onClick={() => window.location.href = `/product/${product.id}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10"></div>
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        {/* Price tag with improved styling */}
        <div className="absolute top-3 left-3 bg-black border border-white/70 px-3 py-1.5 rounded-sm shadow-md font-bold text-sm tracking-wide z-20">
          {formattedPrice} جنيه
        </div>
        
        {/* Sale badge with improved styling */}
        {product.commissionRate > 8 && (
          <Badge className="absolute top-3 right-3 bg-white text-black border-none py-1.5 z-20 shadow-md">
            خصم {product.commissionRate}%
          </Badge>
        )}
        
        {/* Style Echo logo watermark */}
        <div className="absolute bottom-3 right-3 text-xs text-white/80 font-bold z-20">
          STYLE ECHO
        </div>
      </div>
      
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="text-xs bg-black text-white border-white/70 uppercase tracking-wide">
            {getCategoryLabel(product.category)}
          </Badge>
          
          {product.inStock ? (
            <span className="text-xs text-white px-2 py-1 bg-white/10 rounded-sm">متوفر</span>
          ) : (
            <span className="text-xs text-white/50 px-2 py-1 bg-white/5 rounded-sm">غير متوفر</span>
          )}
        </div>
        
        <h3 className="font-bold text-lg mt-2 line-clamp-1 text-white tracking-wide">{product.name}</h3>
        
        <p className="text-sm text-white/70 mt-1.5 line-clamp-2">
          {product.description}
        </p>
      </CardHeader>
      
      <CardFooter className="p-4 mt-auto flex flex-col gap-3">
        <div className="flex justify-between items-center w-full">
          <div className="font-bold text-lg text-white tracking-wider">
            {formattedPrice} ج.م
          </div>
          
          {/* Enhanced star rating */}
          <div className="text-xs text-white flex items-center">
            <span className="mr-1 text-white/70 text-xs">تقييم:</span>
            <span className="text-white">★★★★</span><span className="text-white/30">☆</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wide transition-all duration-300 py-5"
          onClick={() => addToCartMutation.mutate()}
          disabled={addToCartMutation.isPending}
        >
          <i className="fas fa-shopping-cart mr-2"></i>
          {addToCartMutation.isPending ? 'جاري الإضافة...' : 'إضافة للسلة'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
