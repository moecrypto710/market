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
          <div className="h-6 bg-pink-800/30 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-pink-800/20 rounded border border-pink-500/20"></div>
            <div>
              <div className="h-8 bg-pink-800/30 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-pink-800/20 rounded w-1/2 mb-6"></div>
              <div className="h-24 bg-pink-800/20 rounded w-full mb-4"></div>
              <div className="h-10 bg-pink-600/30 rounded w-1/3 mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product || !('id' in product)) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-pink-400">خطأ في تحميل المنتج</h1>
        <p className="mb-6 text-white/70">لم نتمكن من العثور على المنتج المطلوب</p>
        <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => window.history.back()}>العودة للخلف</Button>
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
          <div className="aspect-square bg-gradient-to-br from-black to-pink-950 rounded-xl overflow-hidden relative border-2 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all duration-500 group hover:shadow-[0_0_25px_rgba(236,72,153,0.7)] animate-fadeIn">
            {validProduct.imageUrl && (
              <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700 ease-in-out">
                <img
                  src={validProduct.imageUrl}
                  alt={validProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Overlay with glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            
            {/* Holographic effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
            
            {/* Promotional badge */}
            {validProduct.commissionRate > 8 && (
              <Badge variant="secondary" className="absolute top-4 right-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-3 py-1 text-sm animate-pulse shadow-lg">
                عرض خاص
              </Badge>
            )}
            
            {/* Product name on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <h3 className="text-xl font-bold text-white">{validProduct.name}</h3>
              <p className="text-pink-300 text-sm">{getCategoryLabel(validProduct.category)}</p>
            </div>
          </div>
          
          {/* Add 3D rotation effect with CSS */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes float {
              0% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-5px) rotate(1deg); }
              100% { transform: translateY(0px) rotate(0deg); }
            }
            .animate-fadeIn {
              animation: float 6s ease-in-out infinite;
            }
          `}} />
          
          {/* AR and QR buttons below image */}
          <div className="mt-6 flex justify-between gap-4">
            <AugmentedReality product={validProduct} button size="default" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-pink-500/30 transition-all duration-300" />
            
            {validProduct.category === 'clothing' || validProduct.category === 'sports' && (
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                <i className="fas fa-tshirt mr-2"></i>
                جرب المنتج
              </Button>
            )}
            
            <SocialShare 
              productId={validProduct.id} 
              productName={validProduct.name} 
              imageUrl={validProduct.imageUrl}
              variant="outline"
              showLabel
              title={`تسوق ${validProduct.name} الآن!`}
              text={`وجدت هذا المنتج الرائع: ${validProduct.name} - ${validProduct.description}`}
              className="border-pink-500/50 hover:bg-pink-500/10 transition-colors duration-300"
            />
          </div>
        </div>
        
        {/* Product Info and Actions */}
        <div className="bg-gradient-to-br from-black/60 to-pink-950/30 p-6 rounded-xl backdrop-blur-sm border border-pink-500/20 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="mb-0 border-pink-500/50 bg-black/50 backdrop-blur-md text-xs px-3 py-1">
              {getCategoryLabel(validProduct.category)}
            </Badge>
            
            {validProduct.vrEnabled && (
              <Badge variant="outline" className="mb-0 border-purple-500/50 bg-purple-500/10 text-purple-300 text-xs px-3 py-1">
                <i className="fas fa-vr-cardboard mr-1"></i>
                دعم الواقع الافتراضي
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-white bg-gradient-to-r from-pink-400 via-purple-300 to-pink-400 inline-block text-transparent bg-clip-text">{validProduct.name}</h1>
          
          <div className="flex items-center mb-6">
            <div className="text-2xl font-bold text-pink-400">{formattedPrice}</div>
            <div className="mr-2 text-2xl font-bold text-pink-400">ج.م</div>
            {validProduct.commissionRate > 8 && (
              <div className="mr-3 bg-pink-500/10 text-pink-400 px-2 py-1 rounded-md text-sm border border-pink-500/20">
                <i className="fas fa-tag mr-1"></i>
                خصم {Math.round(validProduct.commissionRate)}%
              </div>
            )}
          </div>
          
          <div className="relative mb-8 overflow-hidden rounded-lg border border-pink-500/20 p-4 bg-black/30 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
            <p className="text-white/70">{validProduct.description}</p>
          </div>
          
          {/* Product Ratings & Reviews */}
          <div className="flex items-center justify-between mb-6 bg-black/40 p-3 rounded-lg border border-pink-500/10">
            <div className="flex items-center">
              <div className="text-yellow-400 mr-2">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
              <span className="text-white/70 text-sm">4.5 (120 تقييم)</span>
            </div>
            <Button variant="outline" size="sm" className="text-pink-400 border-pink-500/20 hover:bg-pink-500/10">
              <i className="fas fa-comment-alt mr-1"></i>
              اقرأ التعليقات
            </Button>
          </div>
          
          {/* Partnership offers section - with better styling */}
          {validProduct.commissionRate > 5 && (
            <Card className="mb-6 border border-pink-500/30 bg-gradient-to-r from-pink-900/40 to-purple-900/40 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000 pointer-events-none"></div>
              
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center mb-3">
                  <i className="fas fa-handshake text-pink-400 mr-2 text-xl"></i>
                  <h3 className="font-bold text-lg text-pink-400">عروض الشراكة</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-pink-500/10 border-pink-500/20 text-pink-400 backdrop-blur-sm">
                      <i className="fas fa-percentage mr-1"></i>
                      شراكة بنسبة {Math.round(validProduct.commissionRate * 2)}%
                    </Badge>
                    
                    {validProduct.commissionRate > 8 && (
                      <>
                        <Badge variant="outline" className="bg-pink-500/10 border-pink-500/20 text-pink-400 backdrop-blur-sm">
                          <i className="fas fa-truck mr-1"></i>
                          توصيل مجاني للشركاء
                        </Badge>
                        <Badge variant="outline" className="bg-pink-500/10 border-pink-500/20 text-pink-400 backdrop-blur-sm">
                          <i className="fas fa-medal mr-1"></i>
                          خدمة عملاء خاصة
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-white/70">
                    انضم لبرنامج الشراكة واحصل على عمولة حصرية عن كل عملية بيع تتم من خلال رابط الإحالة الخاص بك
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20">
                      <i className="fas fa-info-circle mr-1"></i>
                      المزيد عن الشراكة
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-pink-500/30 transition-all duration-300">
                      <i className="fas fa-handshake mr-1"></i>
                      اشترك الآن
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Features section */}
          <Card className="mb-6 bg-black/70 border border-pink-500/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-transparent rounded-br-full"></div>
            <CardContent className="pt-6 relative z-10">
              <h3 className="font-bold text-lg mb-3 text-pink-400 flex items-center">
                <i className="fas fa-star-of-life text-sm mr-2"></i>
                المميزات
              </h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-pink-400 mr-2"></i>
                  جودة ممتازة
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-pink-400 mr-2"></i>
                  ضمان لمدة عام
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-pink-400 mr-2"></i>
                  شحن سريع
                </li>
                {validProduct.vrEnabled && (
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-pink-400 mr-2"></i>
                    دعم الواقع الافتراضي
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
          
          {/* Add to cart button with animation */}
          <Button 
            className="w-full mb-6 h-12 text-lg relative overflow-hidden group bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300" 
            onClick={() => {
              toast({
                title: "تمت الإضافة للسلة",
                description: `تمت إضافة ${validProduct.name} إلى سلة التسوق.`,
              });
            }}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500/0 via-white/10 to-pink-500/0 transform -translate-x-full group-hover:animate-shine"></div>
            <i className="fas fa-shopping-cart ml-2"></i>
            إضافة للسلة
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes shine {
                100% {
                  transform: translateX(100%);
                }
              }
              .animate-shine {
                animation: shine 1.5s;
              }
            `}} />
          </Button>
          
          {/* Community QR Code - with purchase simulation */}
          <div className="mb-6 bg-gradient-to-br from-pink-900/30 to-black/50 rounded-xl p-4 border border-pink-500/20">
            <CommunityQRCode 
              buttonText="انضم إلى مجتمعنا للحصول على عروض حصرية" 
              buttonVariant="default"
              buttonSize="lg"
              whatsappUrl="https://chat.whatsapp.com/yourgroup" 
              telegramUrl="https://t.me/yourchannel"
              purchased={true} 
              productId={validProduct.id}
            />
            <p className="text-xs text-center mt-2 text-pink-400">
              <i className="fas fa-check-circle mr-1"></i>
              هذا المنتج مؤهل للوصول إلى مجتمعنا الحصري
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-full h-20 relative overflow-hidden my-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-pink-900/30 to-black"></div>
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-pink-500/20 to-transparent"></div>
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-pink-500/20 to-transparent"></div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
      </div>
      
      {/* Personalized Recommendations */}
      <div className="mb-12 relative">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-3">
            <i className="fas fa-magic text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-pink-400 via-purple-300 to-pink-400 inline-block text-transparent bg-clip-text">
            قد يعجبك أيضاً
          </h2>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-pink-500/0 opacity-30 blur-xl pointer-events-none"></div>
          <div className="relative z-10 p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-pink-500/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
            <PersonalizedRecommendations maxItems={4} viewedProducts={[validProduct.id]} />
          </div>
        </div>
      </div>
    </div>
  );
}