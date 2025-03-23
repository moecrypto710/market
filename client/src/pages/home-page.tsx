import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useVR } from "@/hooks/use-vr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VRMallSimplified from "@/components/vr-mall-simplified";
import AIAssistant from "@/components/ai-assistant";
import CulturalTransition from "@/components/cultural-transition";
import BrandsSection from "@/components/brands-section";
import confetti from 'canvas-confetti';
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export default function HomePage() {
  const { user } = useAuth();
  const { vrEnabled, toggleVR } = useVR();
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | undefined>();
  const [showTransition, setShowTransition] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque'>('arabesque');
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: promotedProducts } = useQuery<Product[]>({
    queryKey: ['/api/products/promoted'],
  });
  
  const { data: rewards } = useQuery({
    queryKey: ['/api/rewards'],
  });
  
  const categories = [
    { id: 1, name: "إلكترونيات", icon: "laptop", color: "bg-blue-500", gradientFrom: "from-blue-900/40", gradientTo: "to-blue-700/40", borderColor: "border-blue-500/20" },
    { id: 2, name: "ملابس", icon: "tshirt", color: "bg-pink-500", gradientFrom: "from-pink-900/40", gradientTo: "to-pink-700/40", borderColor: "border-pink-500/20" },
    { id: 3, name: "منزل", icon: "home", color: "bg-cyan-500", gradientFrom: "from-cyan-900/40", gradientTo: "to-cyan-700/40", borderColor: "border-cyan-500/20" },
    { id: 4, name: "رياضة", icon: "dumbbell", color: "bg-lime-500", gradientFrom: "from-lime-900/40", gradientTo: "to-lime-700/40", borderColor: "border-lime-500/20" }
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
  
  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.backgroundPositionY = `${scrollY * 0.5}px`;
        
        // Apply opacity based on scroll
        const opacity = Math.max(0, Math.min(1, 1 - scrollY / 500));
        const heroElements = heroRef.current.querySelectorAll('.hero-element');
        heroElements.forEach(el => {
          (el as HTMLElement).style.opacity = opacity.toString();
          (el as HTMLElement).style.transform = `translateY(${scrollY * 0.2}px)`;
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Function to trigger cultural transition
  const triggerTransition = (style: 'modern' | 'futuristic' | 'cultural' | 'geometric' | 'calligraphy' | 'arabesque', destination?: string) => {
    setTransitionStyle(style);
    setShowTransition(true);
    
    // If destination provided, navigate after transition finishes
    if (destination) {
      setTimeout(() => {
        setLocation(destination);
      }, 1200);
    }
  };
  
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
          {/* Pink Banner */}
          <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/20 rounded-lg mb-6 overflow-hidden shadow-lg">
            <div className="p-6 md:p-8 text-center">              
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                أهلا بك في مول أمريكي
                <span className="text-pink-400 mx-1">VR</span>
              </h1>
              
              <p className="text-white/70 text-lg max-w-2xl mx-auto mb-5">
                تسوق أحدث منتجات الماركات العالمية بتجربة واقع افتراضي حصرية
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <Button 
                  onClick={() => {
                    toggleVR();
                    setAiInitialQuestion("كيف أستخدم تجربة الواقع الافتراضي؟");
                    setTimeout(() => window.scrollTo(0, 0), 100);
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 h-auto w-full sm:w-auto"
                >
                  <div className="flex items-center justify-center">
                    <i className="fas fa-vr-cardboard text-xl ml-3"></i>
                    <span>ابدأ تجربة الواقع الافتراضي</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-pink-500/40 hover:bg-pink-600/80 px-6 py-3 h-auto w-full sm:w-auto"
                  onClick={() => window.location.href = '/auth'}
                >
                  <div className="flex items-center justify-center">
                    <i className="fas fa-user text-xl ml-3"></i>
                    <span>تسجيل دخول</span>
                  </div>
                </Button>
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
          
          {/* Rewards Pink Banner */}
          {user && (
            <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/20 rounded-lg p-4 mb-8 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold">نقاط المكافآت</h2>
                <span className="font-bold text-white">{currentPoints} نقطة</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-pink-700/30" />
              <div className="flex justify-between text-sm mt-2 text-white/70">
                <span>{currentPoints} / {nextRewardLevel}</span>
                <span>المكافأة التالية: خصم 500 جنيه على منتجات نايكي</span>
              </div>
            </div>
          )}
          
          {/* Pink Promo */}
          <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/20 rounded-lg p-4 mb-8 text-center shadow-lg">
            <h2 className="font-bold mb-2">خصم 20% على منتجات الماركات العالمية</h2>
            <p className="mb-3 text-white/70">استخدم الكود: AMRIKYY20</p>
            <Button className="bg-pink-600 text-white hover:bg-pink-700">تسوق الآن</Button>
          </div>
        </>
      )}
    </div>
  );
}
