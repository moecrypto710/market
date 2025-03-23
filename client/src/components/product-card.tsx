
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";
import AugmentedReality from './augmented-reality';
import SocialShare from './social-share';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface ProductCardProps {
  product: Product;
  detailed?: boolean;
  showAR?: boolean;
  showSocial?: boolean;
}

function ProductCard({ 
  product, 
  detailed = false, 
  showAR = true, 
  showSocial = true 
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

  // Format price from cents to dollars
  const formattedPrice = (product.price / 100).toFixed(2);
  
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative pb-[60%] overflow-hidden bg-black/5">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Promotion badge if product is promoted */}
        {product.isPromoted && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-[#f44336] text-white">
            عرض خاص
          </Badge>
        )}
        
        {/* AR button */}
        {showAR && (
          <div className="absolute bottom-2 left-2">
            <AugmentedReality product={product} button size="sm" />
          </div>
        )}
      </div>
      
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg mb-1">{product.name}</h3>
            <Badge variant="outline" className="text-xs capitalize">
              {getCategoryLabel(product.category)}
            </Badge>
          </div>
          <div className="font-bold text-lg">
            ${formattedPrice}
          </div>
        </div>
      </CardHeader>
      
      {detailed && (
        <CardContent className="px-4 py-0">
          <p className="text-sm text-gray-500 mb-3">{product.description}</p>
          
          {product.features && product.features.length > 0 && (
            <div className="mt-2">
              <h4 className="font-bold text-sm mb-1">المميزات:</h4>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
      
      <CardFooter className="p-4 mt-auto flex justify-between items-center">
        <Button 
          className="flex-1 mr-2"
          onClick={() => addToCartMutation.mutate()}
          disabled={addToCartMutation.isPending}
        >
          <i className="fas fa-shopping-cart mr-2"></i>
          {addToCartMutation.isPending ? 'جاري الإضافة...' : 'إضافة للسلة'}
        </Button>
        
        {showSocial && (
          <SocialShare 
            productId={product.id} 
            productName={product.name} 
            imageUrl={product.imageUrl}
            variant="outline"
            size="icon"
          />
        )}
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
