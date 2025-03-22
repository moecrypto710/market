import { useState } from "react";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import AugmentedReality from "@/components/augmented-reality";
import SocialShare from "@/components/social-share";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  
  // Format price in currency format (e.g., $299.00)
  const formattedPrice = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2
  }).format(product.price / 100);
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        "/api/cart", 
        { productId: product.id, quantity }
      );
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "تمت الإضافة",
        description: `تم إضافة ${product.name} إلى سلة التسوق`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive",
      });
    },
  });
  
  // Handle add to cart action
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };
  
  return (
    <div className="bg-black/20 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-xl">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden cursor-pointer">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.vrEnabled && (
              <Badge className="bg-[#673ab7] hover:bg-[#5e35b1]">
                <i className="fas fa-vr-cardboard ml-1 text-xs"></i>
                VR
              </Badge>
            )}
            
            {product.commissionRate >= 8 && (
              <Badge className="bg-[#ff9800] hover:bg-[#fb8c00]">
                <i className="fas fa-award ml-1 text-xs"></i>
                مميز
              </Badge>
            )}
            
            {!product.inStock && (
              <Badge variant="destructive">
                نفذت الكمية
              </Badge>
            )}
          </div>
        </div>
      </Link>
      
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-white text-sm sm:text-base truncate">{product.name}</h3>
          <span className="font-bold text-[#ffeb3b]">{formattedPrice}</span>
        </div>
        
        <p className="text-white/70 text-xs sm:text-sm line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mt-3 gap-2">
          <Button 
            size="sm"
            className="flex-1 bg-gradient-to-r from-[#673ab7] to-[#512da8] hover:from-[#5e35b1] hover:to-[#4527a0]"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || !product.inStock}
          >
            {addToCartMutation.isPending ? (
              <i className="fas fa-spinner fa-spin ml-1"></i>
            ) : (
              <i className="fas fa-cart-plus ml-1"></i>
            )}
            إضافة للسلة
          </Button>
          
          <div className="flex gap-1">
            {product.vrEnabled && (
              <AugmentedReality 
                product={product} 
                button={true} 
                size="sm"
                className="px-2"
              />
            )}
            
            <SocialShare 
              productId={product.id}
              productName={product.name}
              imageUrl={product.imageUrl}
              showLabel={false}
              variant="outline"
              size="sm"
              className="px-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}