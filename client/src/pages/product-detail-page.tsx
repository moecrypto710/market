import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getQueryFn } from '@/lib/queryClient';
import ProductCard from '@/components/product-card';
import PersonalizedRecommendations from '@/components/personalized-recommendations';
import AugmentedReality from '@/components/augmented-reality';
import CommunityQRCode from '@/components/community-qrcode';
import { useToast } from '@/hooks/use-toast';
import SocialShare from '@/components/social-share';
import { Product } from '@shared/schema';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { toast } = useToast();
  const id = parseInt(productId || '0');

  // Fetch product details
  const { data: product, error, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', id],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-24 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product || !('id' in product)) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">خطأ في تحميل المنتج</h1>
        <p className="mb-6">لم نتمكن من العثور على المنتج المطلوب</p>
        <Button onClick={() => window.history.back()}>العودة للخلف</Button>
      </div>
    );
  }
  
  // At this point we know product is a valid Product type with all required fields
  const validProduct = product as Product;

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

  // Format price from cents to dollars
  const formattedPrice = (validProduct.price / 100).toFixed(2);

  return (
    <div className="container mx-auto py-8 px-4 rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image with AR and QR */}
        <div className="relative">
          <div className="aspect-square bg-black/5 rounded-lg overflow-hidden relative">
            {validProduct.imageUrl && (
              <img
                src={validProduct.imageUrl}
                alt={validProduct.name}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Promotional badge */}
            {validProduct.commissionRate > 8 && (
              <Badge variant="secondary" className="absolute top-4 right-4 bg-[#f44336] text-white px-3 py-1 text-sm">
                عرض خاص
              </Badge>
            )}
          </div>
          
          {/* AR and QR buttons below image */}
          <div className="mt-4 flex justify-between">
            <AugmentedReality product={validProduct} button size="default" />
            
            <SocialShare 
              productId={validProduct.id} 
              productName={validProduct.name} 
              imageUrl={validProduct.imageUrl}
              variant="outline"
              showLabel
              title={`تسوق ${validProduct.name} الآن!`}
              text={`وجدت هذا المنتج الرائع: ${validProduct.name} - ${validProduct.description}`}
            />
          </div>
        </div>
        
        {/* Product Info and Actions */}
        <div>
          <Badge variant="outline" className="mb-2">
            {getCategoryLabel(validProduct.category)}
          </Badge>
          
          <h1 className="text-3xl font-bold mb-2">{validProduct.name}</h1>
          
          <div className="text-2xl font-bold mb-6 text-[#5e35b1]">{formattedPrice} ج.م</div>
          
          <p className="mb-6 text-gray-700">{validProduct.description}</p>
          
          {/* Partnership offers section - if available */}
          {validProduct.commissionRate > 5 && (
            <Card className="mb-6 border border-[#5e35b1]/20 bg-gradient-to-r from-[#5e35b1]/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <i className="fas fa-handshake text-[#5e35b1] mr-2 text-xl"></i>
                  <h3 className="font-bold text-lg text-[#5e35b1]">عروض الشراكة</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-[#5e35b1]/10 border-[#5e35b1]/20 text-[#5e35b1]">
                      <i className="fas fa-percentage mr-1"></i>
                      شراكة بنسبة {Math.round(validProduct.commissionRate * 2)}%
                    </Badge>
                    
                    {validProduct.commissionRate > 8 && (
                      <>
                        <Badge variant="outline" className="bg-green-100 border-green-200 text-green-700">
                          <i className="fas fa-truck mr-1"></i>
                          توصيل مجاني للشركاء
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">
                          <i className="fas fa-medal mr-1"></i>
                          خدمة عملاء خاصة
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    انضم لبرنامج الشراكة واحصل على عمولة حصرية عن كل عملية بيع تتم من خلال رابط الإحالة الخاص بك
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="bg-[#5e35b1]/10 hover:bg-[#5e35b1]/20 text-[#5e35b1] border-[#5e35b1]/20">
                      <i className="fas fa-info-circle mr-1"></i>
                      المزيد عن الشراكة
                    </Button>
                    <Button variant="secondary" size="sm">
                      <i className="fas fa-handshake mr-1"></i>
                      اشترك الآن
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Features section */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-3">المميزات</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>جودة ممتازة</li>
                <li>ضمان لمدة عام</li>
                <li>شحن سريع</li>
                {validProduct.vrEnabled && <li>دعم الواقع الافتراضي</li>}
              </ul>
            </CardContent>
          </Card>
          
          {/* Add to cart button */}
          <Button className="w-full mb-4 h-12 text-lg" onClick={() => {
            toast({
              title: "تمت الإضافة للسلة",
              description: `تمت إضافة ${validProduct.name} إلى سلة التسوق.`,
            });
          }}>
            <i className="fas fa-shopping-cart ml-2"></i>
            إضافة للسلة
          </Button>
          
          {/* Community QR Code - with purchase simulation */}
          <div className="mb-6">
            <CommunityQRCode 
              buttonText="انضم إلى مجتمعنا للحصول على عروض حصرية" 
              buttonVariant="secondary"
              buttonSize="lg"
              whatsappUrl="https://chat.whatsapp.com/yourgroup" 
              telegramUrl="https://t.me/yourchannel"
              purchased={true} // Simulating that the product is purchased on the detail page
              productId={validProduct.id}
            />
            <p className="text-xs text-center mt-2 text-green-500">
              <i className="fas fa-check-circle mr-1"></i>
              هذا المنتج مؤهل للوصول إلى مجتمعنا الحصري
            </p>
          </div>
        </div>
      </div>
      
      <Separator className="my-12" />
      
      {/* Personalized Recommendations */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">قد يعجبك أيضاً</h2>
        <PersonalizedRecommendations maxItems={4} viewedProducts={[validProduct.id]} />
      </div>
    </div>
  );
}