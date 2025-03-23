
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";
import AugmentedReality from './augmented-reality';
import SocialShare from './social-share';
import CommunityQRCode from './community-qrcode';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Link } from "wouter";

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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-[#5e35b1]/10 hover:border-[#5e35b1]/30">
      <div 
        className="relative pb-[60%] overflow-hidden bg-gradient-to-b from-black/0 to-black/5 cursor-pointer" 
        onClick={() => window.location.href = `/product/${product.id}`}
      >
        {product.imageUrl && (
          <>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        )}
        
        {/* Price tag with EGP */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 px-2 py-1 rounded-md shadow-md text-sm font-bold">
          {(product.price / 100).toFixed(2)} ج.م
        </div>
        
        {/* Promotion badge for special products */}
        {product.commissionRate > 8 && (
          <Badge variant="secondary" className="absolute top-3 right-3 bg-[#f44336] text-white px-2 py-1 font-medium shadow-md">
            عرض خاص
          </Badge>
        )}
        
        {/* AR button */}
        {showAR && (
          <div className="absolute bottom-3 left-3 transition-transform duration-300 transform group-hover:translate-y-0 translate-y-10">
            <AugmentedReality product={product} button size="sm" />
          </div>
        )}
        
        {/* Quick view button - appears on hover */}
        <div className="absolute left-1/2 bottom-4 -translate-x-1/2 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-white/90 text-[#5e35b1] hover:bg-white shadow-md backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/product/${product.id}`;
            }}
          >
            <i className="fas fa-eye mr-1"></i>
            عرض سريع
          </Button>
        </div>
      </div>
      
      <CardHeader className="py-3 px-4 pb-0">
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center w-full mb-1">
            <Badge variant="outline" className="text-xs capitalize bg-[#5e35b1]/10 hover:bg-[#5e35b1]/20 text-[#5e35b1]">
              {getCategoryLabel(product.category)}
            </Badge>
            {product.inStock ? (
              <span className="text-xs text-green-600 flex items-center">
                <i className="fas fa-check-circle mr-1"></i> متوفر
              </span>
            ) : (
              <span className="text-xs text-gray-500 flex items-center">
                <i className="fas fa-clock mr-1"></i> قريباً
              </span>
            )}
          </div>
          <h3 
            className="font-bold text-lg hover:text-[#5e35b1] cursor-pointer transition-colors duration-200" 
            onClick={() => window.location.href = `/product/${product.id}`}
          >
            {product.name}
          </h3>
          <div className="mt-1 mb-1 text-sm line-clamp-2 text-gray-600 min-h-[40px]">
            {product.description}
          </div>
        </div>
      </CardHeader>
      
      {detailed && (
        <CardContent className="px-4 py-0">
          <p className="text-sm text-gray-500 mb-3">{product.description}</p>
          
          {/* Features section - simplified for now */}
          <div className="mt-2">
            <h4 className="font-bold text-sm mb-1">المميزات:</h4>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>جودة ممتازة</li>
              <li>ضمان لمدة عام</li>
              <li>شحن سريع</li>
            </ul>
          </div>
        </CardContent>
      )}
      
      <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-3 border-t-0">
        {/* Pricing and Rating section */}
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center">
            <div className="font-bold text-xl text-[#5e35b1]">
              {formattedPrice} ج.م
            </div>
            {product.commissionRate > 0 && (
              <span className="text-xs ml-2 text-green-600">
                {product.commissionRate > 8 ? 'خصم 20%' : 'خصم 10%'}
              </span>
            )}
          </div>
          
          {/* Simulated star rating */}
          <div className="flex items-center text-xs text-yellow-500">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star-half-alt"></i>
            <span className="text-gray-600 mr-1">(4.5)</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center w-full">
          <Button 
            className="flex-1 mr-2 bg-[#5e35b1] hover:bg-[#4527a0]"
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
        </div>
        
        {/* Community QR code button - purchase gated */}
        <div className="w-full mt-1">
          <CommunityQRCode 
            whatsappUrl="https://chat.whatsapp.com/yourgroup" 
            telegramUrl="https://t.me/yourchannel"
            buttonText="انضم إلى مجتمعنا للحصول على عروض حصرية" 
            buttonVariant="secondary"
            buttonSize="default"
            purchased={false} // This would be set based on user purchase history
            productId={product.id}
          />
        </div>
        
        {/* Partnership offers - Display for products with partnership */}
        {product.commissionRate > 5 && (
          <div className="mt-2 p-2 bg-gradient-to-r from-[#5e35b1]/10 to-transparent rounded-md border border-[#5e35b1]/20">
            <div className="flex items-center text-xs">
              <i className="fas fa-handshake text-[#5e35b1] mr-2"></i>
              <div>
                <span className="font-bold text-[#5e35b1]">عروض الشراكة:</span>
                <div className="flex mt-1 flex-wrap gap-1">
                  {product.commissionRate > 8 ? (
                    <>
                      <Badge variant="outline" className="bg-[#5e35b1]/10 border-[#5e35b1]/20 text-[#5e35b1] text-xs">شراكة بنسبة {Math.round(product.commissionRate * 2)}%</Badge>
                      <Badge variant="outline" className="bg-green-100 border-green-200 text-green-700 text-xs">توصيل مجاني للشركاء</Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="bg-[#5e35b1]/10 border-[#5e35b1]/20 text-[#5e35b1] text-xs">شراكة بنسبة {Math.round(product.commissionRate * 2)}%</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
