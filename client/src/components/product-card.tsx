
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
    <Card className="overflow-hidden transition-shadow duration-300 h-full flex flex-col hover:shadow-lg border border-gray-200">
      <div 
        className="relative pb-[80%] overflow-hidden cursor-pointer" 
        onClick={() => window.location.href = `/product/${product.id}`}
      >
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        )}
        
        {/* Price tag */}
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded shadow-sm font-bold text-sm">
          {formattedPrice} جنيه
        </div>
        
        {/* Sale badge */}
        {product.commissionRate > 8 && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
            خصم
          </Badge>
        )}
      </div>
      
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-center mb-1">
          <Badge variant="outline" className="text-xs">
            {getCategoryLabel(product.category)}
          </Badge>
          
          {product.inStock ? (
            <span className="text-xs text-green-600">متوفر</span>
          ) : (
            <span className="text-xs text-gray-500">غير متوفر</span>
          )}
        </div>
        
        <h3 className="font-bold text-lg mt-1 line-clamp-1">{product.name}</h3>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {product.description}
        </p>
      </CardHeader>
      
      <CardFooter className="p-3 mt-auto flex flex-col gap-2">
        <div className="flex justify-between items-center w-full">
          <div className="font-bold text-lg text-[#5e35b1]">
            {formattedPrice} ج.م
          </div>
          
          {/* Simple star rating */}
          <div className="text-xs text-yellow-500">
            ★★★★☆
          </div>
        </div>
        
        <Button 
          className="w-full bg-[#5e35b1] hover:bg-[#4527a0]"
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
