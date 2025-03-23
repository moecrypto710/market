import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useVR } from "@/hooks/use-vr";
import { Button } from "@/components/ui/button";
import VRMall from "@/components/vr-mall";
import AIAssistant from "@/components/ai-assistant";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const { vrEnabled } = useVR();
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
      {vrEnabled && products && <VRMall products={products} />}
      
      {/* Only show regular content when VR is disabled */}
      {!vrEnabled && (
        <>
          {/* Banner */}
          <div className="bg-black text-white border border-white/20 rounded-lg p-5 mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">أهلا بك في مول أمريكي</h1>
            <p>تسوق أحدث منتجات الماركات العالمية بتجربة واقع افتراضي حصرية</p>
            <Button 
              onClick={() => {
                setAiInitialQuestion("كيف أبدأ تجربة الواقع الافتراضي؟");
                setTimeout(() => window.scrollTo(0, 0), 100);
              }}
              className="mt-3 bg-gradient-to-r from-[#00ffcd] to-[#ff00aa] hover:opacity-90 text-black font-bold"
            >
              <i className="fas fa-vr-cardboard ml-2"></i>
              ابدأ تجربة الواقع الافتراضي بمساعدة الذكاء الاصطناعي
            </Button>
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
