import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useVR } from "@/hooks/use-vr";
import { Button } from "@/components/ui/button";
import VRMallSimplified from "@/components/vr-mall-simplified";
import AIAssistant from "@/components/ai-assistant";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const { vrEnabled, toggleVR } = useVR();
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | undefined>();
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: rewards } = useQuery({
    queryKey: ['/api/rewards'],
  });
  
  const categories = [
    { id: 1, name: "إلكترونيات", icon: "laptop" },
    { id: 2, name: "ملابس", icon: "tshirt" },
    { id: 3, name: "منزل", icon: "home" },
    { id: 4, name: "رياضة", icon: "dumbbell" }
  ];
  
  // Calculate points progress
  const currentPoints = user?.points || 0;
  const nextRewardLevel = 1000;
  const progressPercentage = Math.min(100, (currentPoints / nextRewardLevel) * 100);
  
  // Set initial AI assistant question based on VR mode
  useEffect(() => {
    if (vrEnabled) {
      setAiInitialQuestion("كيف يمكنني استخدام مول الواقع الافتراضي؟");
    } else {
      setAiInitialQuestion(undefined);
    }
  }, [vrEnabled]);
  
  // Track viewed products for personalized recommendations
  useEffect(() => {
    if (products) {
      // Get random featured products to simulate viewed items
      const randomSelection = [...products]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setViewedProducts(randomSelection);
    }
  }, [products]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* AI Assistant - always available */}
      <AIAssistant 
        initialQuestion={aiInitialQuestion} 
        viewedProducts={viewedProducts}
        minimized={!vrEnabled} 
      />
      
      {/* VR Mall Experience */}
      {vrEnabled && products && <VRMallSimplified products={products} />}
      
      {/* Only show regular content when VR is disabled */}
      {!vrEnabled && (
        <>
          {/* Banner with advanced styling */}
          <div className="bg-black border border-white/10 rounded-lg mb-6 overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-purple-600/30 via-transparent to-transparent"></div>
              <div className="absolute -top-20 right-20 w-40 h-40 rounded-full bg-pink-600/10 filter blur-xl"></div>
              <div className="absolute -bottom-10 left-10 w-28 h-28 rounded-full bg-blue-600/10 filter blur-lg"></div>
              
              {/* Floating particles */}
              <div className="absolute top-10 left-[15%] w-2 h-2 bg-purple-500 rounded-full animate-float1"></div>
              <div className="absolute top-[40%] right-[20%] w-1 h-1 bg-blue-400 rounded-full animate-float2"></div>
              <div className="absolute bottom-10 left-[30%] w-1.5 h-1.5 bg-pink-400 rounded-full animate-float3"></div>
            </div>
            
            <div className="p-6 md:p-8 text-center relative z-10">
              <div className="inline-block px-4 py-1 mb-4 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20">
                <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">تجربة تسوق مستقبلية</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                أهلا بك في مول أمريكي
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mx-1">VR</span>
              </h1>
              
              <p className="text-white/70 text-lg max-w-2xl mx-auto mb-5">
                تسوق أحدث منتجات الماركات العالمية بتجربة واقع افتراضي حصرية وطريقة دخول بسيطة
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <Button 
                  onClick={() => {
                    // Toggle VR mode using the properly extracted toggleVR function
                    toggleVR();
                    
                    // Set AI question for guidance
                    setAiInitialQuestion("كيف أستخدم تجربة الواقع الافتراضي؟");
                    setTimeout(() => window.scrollTo(0, 0), 100);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold px-6 py-6 h-auto w-full sm:w-auto relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="flex items-center justify-center">
                    <i className="fas fa-vr-cardboard text-xl ml-3"></i>
                    <span>ابدأ تجربة الواقع الافتراضي</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-white/20 hover:bg-white hover:text-black font-medium px-6 py-6 h-auto w-full sm:w-auto relative overflow-hidden group"
                  onClick={() => window.location.href = '/auth'}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-center">
                    <i className="fas fa-user text-xl ml-3"></i>
                    <span>تسجيل دخول سريع</span>
                  </div>
                </Button>
              </div>
              
              <div className="mt-8 text-white/40 flex items-center justify-center text-sm">
                <div className="flex items-center mr-6">
                  <i className="fas fa-shield-alt mr-2"></i>
                  <span>تسجيل دخول آمن</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-bolt mr-2"></i>
                  <span>دخول بنقرة واحدة</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured Products */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">منتجات مميزة</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">تصفح حسب الفئة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
          
          {/* Rewards Simple Banner */}
          {user && (
            <div className="bg-black text-white border border-white/20 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold">نقاط المكافآت</h2>
                <span className="font-bold text-white">{currentPoints} نقطة</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-white/10" />
              <div className="flex justify-between text-sm mt-2 text-white/70">
                <span>{currentPoints} / {nextRewardLevel}</span>
                <span>المكافأة التالية: خصم 500 جنيه على منتجات نايكي</span>
              </div>
            </div>
          )}
          
          {/* Simple Promo */}
          <div className="bg-black text-white border border-white/20 rounded-lg p-4 mb-8 text-center">
            <h2 className="font-bold mb-2">خصم 20% على منتجات الماركات العالمية</h2>
            <p className="mb-3 text-white/70">استخدم الكود: AMRIKYY20</p>
            <Button className="bg-white text-black hover:bg-white/80">تسوق الآن</Button>
          </div>
        </>
      )}
    </div>
  );
}
