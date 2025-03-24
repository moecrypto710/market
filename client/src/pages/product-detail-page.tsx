import React, { useEffect, useState } from 'react';
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
import CulturalHeritageStory from '@/components/cultural-heritage-story';
import { useToast } from '@/hooks/use-toast';
import SocialShare from '@/components/social-share';
import Product360View from '@/components/product-360-view';
import { Product } from '@shared/schema';
import { getProduct } from '@/lib/api';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { toast } = useToast();
  const id = parseInt(productId || '0');
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [showHologram, setShowHologram] = useState(false);
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(0);
  
  // Activate hologram effect on mount with a delay for cooler appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHologram(true);
    }, 800);
    
    // Ambient light effect fades in
    const ambientTimer = setTimeout(() => {
      setAmbientLightIntensity(1);
    }, 300);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(ambientTimer);
    };
  }, []);
  
  // Get ambient mood lighting color based on product category
  const getAmbientColor = (category: string) => {
    switch(category) {
      case 'electronics': return {
        primary: 'rgba(58, 134, 255, 0.12)',  // Blue
        secondary: 'rgba(33, 150, 243, 0.08)',
        glow: '#3a86ff'
      };
      case 'clothing': return {
        primary: 'rgba(236, 72, 153, 0.12)', // Pink
        secondary: 'rgba(219, 39, 119, 0.08)',
        glow: '#ec4899'
      };
      case 'home': return {
        primary: 'rgba(6, 182, 212, 0.12)', // Cyan
        secondary: 'rgba(14, 165, 233, 0.08)',
        glow: '#06b6d4'
      };
      case 'sports': return {
        primary: 'rgba(132, 204, 22, 0.12)', // Lime
        secondary: 'rgba(101, 163, 13, 0.08)',
        glow: '#84cc16'
      };
      default: return {
        primary: 'rgba(236, 72, 153, 0.12)', // Default pink
        secondary: 'rgba(219, 39, 119, 0.08)',
        glow: '#ec4899'
      };
    }
  };

  // Fetch product details
  const { data: product, error, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID provided');
      return getProduct(id);
    },
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

  // Get ambient lighting colors
  const ambientColors = getAmbientColor(validProduct.category);
  
  return (
    <div className="container mx-auto py-8 px-4 rtl relative">
      {/* Ambient lighting effect */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000" 
        style={{ 
          opacity: ambientLightIntensity * 0.8,
          background: `radial-gradient(circle at 50% 50%, ${ambientColors.primary} 0%, ${ambientColors.secondary} 50%, transparent 80%)` 
        }}
      />
      
      {/* Ambient corner lights */}
      <div 
        className="absolute top-0 left-1/4 w-1/2 h-1/2 pointer-events-none blur-3xl rounded-full transition-opacity duration-1000" 
        style={{ 
          opacity: ambientLightIntensity * 0.4,
          background: `radial-gradient(circle at center, ${ambientColors.glow}20 0%, transparent 70%)` 
        }}
      />
      
      <div 
        className="absolute bottom-20 right-20 w-96 h-96 pointer-events-none blur-3xl rounded-full transition-opacity duration-1000" 
        style={{ 
          opacity: ambientLightIntensity * 0.3,
          background: `radial-gradient(circle at center, ${ambientColors.glow}15 0%, transparent 70%)` 
        }}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Product Image with AR and QR */}
        <div className="relative">
          <div 
            className="aspect-square rounded-xl overflow-hidden relative border-2 transition-all duration-500 group animate-fadeIn"
            style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d',
              background: `linear-gradient(to bottom right, black, rgba(0,0,0,0.8))`,
              borderColor: `${ambientColors.glow}50`,
              boxShadow: showHologram 
                ? `0 0 15px ${ambientColors.glow}80, 0 0 30px ${ambientColors.glow}40` 
                : `0 0 15px ${ambientColors.glow}80`,
              transition: 'all 0.5s ease',
            }}
            onMouseMove={(e) => {
              if (!isRotating) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                setRotateX((y - centerY) / 20);
                setRotateY(-(x - centerX) / 20);
              }
            }}
            onMouseEnter={() => setIsRotating(false)}
            onMouseLeave={() => {
              setIsRotating(true);
              setTimeout(() => {
                setRotateX(0);
                setRotateY(0);
              }, 1000);
            }}
          >
            {validProduct.imageUrl && (
              <div 
                className="absolute inset-0 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: isRotating ? 'transform 1s ease-out' : 'transform 0.2s ease-out',
                }}
              >
                <img
                  src={validProduct.imageUrl}
                  alt={validProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Overlay with glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            
            {/* Holographic scanning line effect */}
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{opacity: showHologram ? 1 : 0, transition: 'opacity 0.5s ease-in'}}
            >
              <div 
                className="absolute inset-x-0 h-[2px]" 
                style={{
                  background: `linear-gradient(to right, transparent, ${ambientColors.glow}, transparent)`,
                  animation: 'scan 2s ease-in-out infinite',
                  top: '0%',
                  opacity: 0.7,
                }}
              ></div>
            </div>
            
            {/* Holographic effect */}
            <div 
              className={`absolute inset-0 transition-opacity duration-700 ${showHologram ? 'opacity-30' : 'opacity-0'} group-hover:opacity-40`}
              style={{
                background: `linear-gradient(to right, ${ambientColors.glow}10, ${ambientColors.glow}20)`,
                backgroundSize: '200% 200%',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            ></div>
            
            {/* Prism light effect on corners */}
            <div 
              className="absolute top-0 left-0 w-20 h-20 rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `linear-gradient(to bottom right, ${ambientColors.glow}30, transparent)`,
              }}
            ></div>
            <div 
              className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `linear-gradient(to top left, ${ambientColors.glow}30, transparent)`,
              }}
            ></div>
            
            {/* Promotional badge */}
            {validProduct.commissionRate > 8 && (
              <Badge 
                variant="secondary" 
                className="absolute top-4 right-4 text-white px-3 py-1 text-sm animate-pulse shadow-lg z-10"
                style={{
                  background: `linear-gradient(to right, ${ambientColors.glow}CC, ${ambientColors.glow}99)`,
                }}
              >
                عرض خاص
              </Badge>
            )}
            
            {/* 3D rotation indicator */}
            <div 
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                borderColor: `${ambientColors.glow}30`,
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <i 
                className="fas fa-cube text-xs"
                style={{ color: ambientColors.glow }}
              ></i>
            </div>
            
            {/* Product name on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
              <h3 className="text-xl font-bold text-white">{validProduct.name}</h3>
              <p 
                className="text-sm"
                style={{ color: ambientColors.glow }}
              >
                {getCategoryLabel(validProduct.category)}
              </p>
            </div>
            
            {/* Scan animation and shimmer effects */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes scan {
                0%, 100% { top: 0%; }
                50% { top: 100%; }
              }
              @keyframes shimmer {
                0% { background-position: 0% 0%; }
                50% { background-position: 100% 100%; }
                100% { background-position: 0% 0%; }
              }
            `}} />
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
            <AugmentedReality 
              product={validProduct} 
              button 
              size="default" 
              className="text-white shadow-lg transition-all duration-300" 
              style={{
                background: `linear-gradient(to right, ${ambientColors.glow}CC, ${ambientColors.glow}99)`,
                boxShadow: `0 4px 12px -2px ${ambientColors.glow}30`,
              }}
            />
            
            {(validProduct.category === 'clothing' || validProduct.category === 'travel') && (
              <Button 
                className="text-white shadow-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${ambientColors.glow}CC, ${ambientColors.glow}99)`,
                  boxShadow: `0 4px 12px -2px ${ambientColors.glow}30`,
                }}
              >
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
              className="hover:bg-black/30 transition-colors duration-300"
              style={{
                borderColor: `${ambientColors.glow}50`,
                color: ambientColors.glow
              }}
            />
          </div>
        </div>
        
        {/* Product Info and Actions */}
        <div 
          className="p-6 rounded-xl backdrop-blur-sm border shadow-lg relative overflow-hidden"
          style={{
            background: `linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.4))`,
            borderColor: `${ambientColors.glow}20`,
            boxShadow: `0 8px 32px -4px ${ambientColors.glow}10`,
          }}
        >
          {/* Ambient glow effects */}
          <div 
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl opacity-20 transition-opacity duration-1000"
            style={{ 
              background: `radial-gradient(circle at center, ${ambientColors.glow} 0%, transparent 70%)`,
              opacity: ambientLightIntensity * 0.3,
            }}
          ></div>
          <div 
            className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-2xl opacity-10 transition-opacity duration-1000"
            style={{ 
              background: `radial-gradient(circle at center, ${ambientColors.glow} 0%, transparent 70%)`,
              opacity: ambientLightIntensity * 0.2,
            }}
          ></div>
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant="outline" 
              className="mb-0 bg-black/50 backdrop-blur-md text-xs px-3 py-1"
              style={{ 
                borderColor: `${ambientColors.glow}50`,
                color: ambientColors.glow
              }}
            >
              {getCategoryLabel(validProduct.category)}
            </Badge>
            
            {validProduct.vrEnabled && (
              <Badge 
                variant="outline" 
                className="mb-0 bg-black/50 backdrop-blur-md text-xs px-3 py-1"
                style={{ 
                  borderColor: `${ambientColors.glow}30`,
                  background: `${ambientColors.glow}10`,
                  color: ambientColors.glow
                }}
              >
                <i className="fas fa-vr-cardboard mr-1"></i>
                دعم الواقع الافتراضي
              </Badge>
            )}
          </div>
          
          <h1 
            className="text-3xl font-bold mb-2 text-transparent bg-clip-text inline-block"
            style={{
              backgroundImage: `linear-gradient(to right, ${ambientColors.glow}, #fafafa, ${ambientColors.glow})`
            }}
          >
            {validProduct.name}
          </h1>
          
          <div className="flex items-center mb-6">
            <div 
              className="text-2xl font-bold"
              style={{ color: ambientColors.glow }}
            >
              {formattedPrice}
            </div>
            <div 
              className="mr-2 text-2xl font-bold"
              style={{ color: ambientColors.glow }}
            >
              ج.م
            </div>
            {validProduct.commissionRate > 8 && (
              <div 
                className="mr-3 px-2 py-1 rounded-md text-sm border"
                style={{ 
                  background: `${ambientColors.glow}10`,
                  borderColor: `${ambientColors.glow}20`,
                  color: ambientColors.glow
                }}
              >
                <i className="fas fa-tag mr-1"></i>
                خصم {Math.round(validProduct.commissionRate)}%
              </div>
            )}
          </div>
          
          <div 
            className="relative mb-8 overflow-hidden rounded-lg p-4 bg-black/30 backdrop-blur-sm"
            style={{ 
              borderColor: `${ambientColors.glow}20`,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ 
                background: `linear-gradient(to right, transparent, ${ambientColors.glow} 50%, transparent)` 
              }}
            ></div>
            <p className="text-white/70">{validProduct.description}</p>
            
            {/* Cultural Heritage Story */}
            {validProduct.culturalHeritageTitle && validProduct.culturalHeritageStory && (
              <div className="mt-4">
                <CulturalHeritageStory product={validProduct} />
              </div>
            )}
          </div>
          
          {/* Product Ratings & Reviews */}
          <div 
            className="flex items-center justify-between mb-6 bg-black/40 p-3 rounded-lg"
            style={{ 
              borderColor: `${ambientColors.glow}10`,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
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
            <Button 
              variant="outline" 
              size="sm"
              style={{ 
                color: ambientColors.glow,
                borderColor: `${ambientColors.glow}20`,
              }}
              className="hover:bg-black/30"
            >
              <i className="fas fa-comment-alt mr-1"></i>
              اقرأ التعليقات
            </Button>
          </div>
          
          {/* Partnership offers section - with better styling */}
          {validProduct.commissionRate > 5 && (
            <Card 
              className="mb-6 overflow-hidden relative group"
              style={{
                background: `linear-gradient(to right, rgba(0,0,0,0.7), ${ambientColors.glow}15)`,
                borderColor: `${ambientColors.glow}30`,
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, ${ambientColors.glow}05, transparent)`,
                }}
              ></div>
              <div 
                className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, ${ambientColors.glow}20, transparent)`,
                }}
              ></div>
              
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center mb-3">
                  <i 
                    className="fas fa-handshake mr-2 text-xl"
                    style={{ color: ambientColors.glow }}
                  ></i>
                  <h3 
                    className="font-bold text-lg"
                    style={{ color: ambientColors.glow }}
                  >
                    عروض الشراكة
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline" 
                      className="backdrop-blur-sm"
                      style={{
                        background: `${ambientColors.glow}10`,
                        borderColor: `${ambientColors.glow}20`,
                        color: ambientColors.glow,
                      }}
                    >
                      <i className="fas fa-percentage mr-1"></i>
                      شراكة بنسبة {Math.round(validProduct.commissionRate * 2)}%
                    </Badge>
                    
                    {validProduct.commissionRate > 8 && (
                      <>
                        <Badge 
                          variant="outline" 
                          className="backdrop-blur-sm"
                          style={{
                            background: `${ambientColors.glow}10`,
                            borderColor: `${ambientColors.glow}20`,
                            color: ambientColors.glow,
                          }}
                        >
                          <i className="fas fa-truck mr-1"></i>
                          توصيل مجاني للشركاء
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="backdrop-blur-sm"
                          style={{
                            background: `${ambientColors.glow}10`,
                            borderColor: `${ambientColors.glow}20`,
                            color: ambientColors.glow,
                          }}
                        >
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
                    <Button 
                      variant="outline" 
                      size="sm"  
                      style={{
                        background: `${ambientColors.glow}10`,
                        borderColor: `${ambientColors.glow}20`,
                        color: ambientColors.glow,
                      }}
                      className="hover:bg-black/30"
                    >
                      <i className="fas fa-info-circle mr-1"></i>
                      المزيد عن الشراكة
                    </Button>
                    <Button 
                      size="sm"
                      className="text-white shadow-lg transition-all duration-300" 
                      style={{
                        background: `linear-gradient(to right, ${ambientColors.glow}CC, ${ambientColors.glow}99)`,
                      }}
                    >
                      <i className="fas fa-handshake mr-1"></i>
                      اشترك الآن
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Features section */}
          <Card 
            className="mb-6 overflow-hidden relative"
            style={{
              background: 'rgba(0,0,0,0.7)',
              borderColor: `${ambientColors.glow}20`,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <div 
              className="absolute top-0 left-0 w-20 h-20 rounded-br-full"
              style={{
                background: `radial-gradient(circle at top left, ${ambientColors.glow}20, transparent)`,
              }}
            ></div>
            <CardContent className="pt-6 relative z-10">
              <h3 
                className="font-bold text-lg mb-3 flex items-center"
                style={{ color: ambientColors.glow }}
              >
                <i className="fas fa-star-of-life text-sm mr-2"></i>
                المميزات
              </h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center">
                  <i 
                    className="fas fa-check-circle mr-2"
                    style={{ color: ambientColors.glow }}
                  ></i>
                  جودة ممتازة
                </li>
                <li className="flex items-center">
                  <i 
                    className="fas fa-check-circle mr-2"
                    style={{ color: ambientColors.glow }}
                  ></i>
                  ضمان لمدة عام
                </li>
                <li className="flex items-center">
                  <i 
                    className="fas fa-check-circle mr-2"
                    style={{ color: ambientColors.glow }}
                  ></i>
                  شحن سريع
                </li>
                {validProduct.vrEnabled && (
                  <li className="flex items-center">
                    <i 
                      className="fas fa-check-circle mr-2"
                      style={{ color: ambientColors.glow }}
                    ></i>
                    دعم الواقع الافتراضي
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
          
          {/* Add to cart button with animation */}
          <Button 
            className="w-full mb-6 h-12 text-lg relative overflow-hidden group text-white shadow-lg transition-all duration-300" 
            style={{
              background: `linear-gradient(to right, ${ambientColors.glow}CC, ${ambientColors.glow}99)`,
            }}
            onClick={() => {
              toast({
                title: "تمت الإضافة للسلة",
                description: `تمت إضافة ${validProduct.name} إلى سلة التسوق.`,
              });
            }}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:animate-shine"></div>
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
          <div 
            className="mb-6 rounded-xl p-4"
            style={{ 
              background: `linear-gradient(to bottom right, ${ambientColors.glow}20, rgba(0,0,0,0.5))`,
              borderColor: `${ambientColors.glow}20`, 
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <CommunityQRCode 
              buttonText="انضم إلى مجتمعنا للحصول على عروض حصرية" 
              buttonVariant="default"
              buttonSize="lg"
              whatsappUrl="https://chat.whatsapp.com/yourgroup" 
              telegramUrl="https://t.me/yourchannel"
              purchased={true} 
              productId={validProduct.id}
            />
            <p 
              className="text-xs text-center mt-2"
              style={{ color: ambientColors.glow }}
            >
              <i className="fas fa-check-circle mr-1"></i>
              هذا المنتج مؤهل للوصول إلى مجتمعنا الحصري
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-full h-20 relative overflow-hidden my-8">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to right, rgb(0,0,0), ${ambientColors.glow}30, rgb(0,0,0))` 
          }}
        ></div>
        <div 
          className="absolute inset-y-0 left-0 w-1/4"
          style={{ 
            background: `linear-gradient(to right, ${ambientColors.glow}20, transparent)` 
          }}
        ></div>
        <div 
          className="absolute inset-y-0 right-0 w-1/4"
          style={{ 
            background: `linear-gradient(to left, ${ambientColors.glow}20, transparent)` 
          }}
        ></div>
        <div 
          className="absolute inset-x-0 top-0 h-px"
          style={{ 
            background: `linear-gradient(to right, transparent, ${ambientColors.glow}50, transparent)` 
          }}
        ></div>
        <div 
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ 
            background: `linear-gradient(to right, transparent, ${ambientColors.glow}50, transparent)` 
          }}
        ></div>
      </div>
      
      {/* Personalized Recommendations */}
      <div className="mb-12 relative">
        <div className="flex items-center mb-8">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{
              background: `linear-gradient(to bottom right, ${ambientColors.glow}, ${ambientColors.glow}80)`,
            }}
          >
            <i className="fas fa-magic text-white"></i>
          </div>
          <h2 
            className="text-2xl font-bold text-transparent bg-clip-text inline-block"
            style={{
              backgroundImage: `linear-gradient(to right, ${ambientColors.glow}, #fafafa, ${ambientColors.glow})`
            }}
          >
            قد يعجبك أيضاً
          </h2>
        </div>
        
        <div className="relative">
          <div 
            className="absolute -inset-1 rounded-xl opacity-30 blur-xl pointer-events-none"
            style={{
              background: `linear-gradient(to right, transparent, ${ambientColors.glow}30, transparent)`,
            }}
          ></div>
          <div 
            className="relative z-10 p-6 rounded-xl bg-black/40 backdrop-blur-sm"
            style={{
              borderColor: `${ambientColors.glow}20`,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{
                background: `linear-gradient(to right, transparent, ${ambientColors.glow}, transparent)`,
              }}
            ></div>
            <PersonalizedRecommendations maxItems={4} viewedProducts={[validProduct.id]} />
          </div>
        </div>
      </div>
    </div>
  );
}