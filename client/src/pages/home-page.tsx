import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useVR } from "@/hooks/use-vr";
import VRShop from "@/components/vr-shop";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const { vrEnabled, toggleVR } = useVR();
  const [isCheckingDevice, setIsCheckingDevice] = useState(false);
  
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
  
  // Calculate progress to next reward level
  const currentPoints = user?.points || 0;
  const nextRewardLevel = 1000;
  const progressPercentage = Math.min(100, (currentPoints / nextRewardLevel) * 100);
  
  // Handle enabling VR mode with device detection simulation
  const handleEnableVR = () => {
    setIsCheckingDevice(true);
    // Simulate device check
    setTimeout(() => {
      toggleVR();
      setIsCheckingDevice(false);
    }, 1500);
  };
  
  return (
    <>
      {/* VR Shop Component */}
      {vrEnabled && products && <VRShop products={products} />}
      
      <div className="px-4 py-6">
        {/* VR Shop Banner when not in VR mode */}
        {!vrEnabled && (
          <div className="bg-gradient-to-l from-[#2a1f6f] to-[#5e35b1] rounded-lg p-6 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center mb-2">
                <i className="fas fa-vr-cardboard text-[#ffeb3b] text-2xl mr-2"></i>
                <h2 className="text-xl font-bold">تجربة تسوق افتراضية</h2>
              </div>
              <p className="mb-4 text-white/80">استخدم وضع الواقع الافتراضي للمشي في المتجر وتجربة المنتجات</p>
              <Button 
                variant="default" 
                className="bg-[#ffeb3b] text-[#2a1f6f] hover:bg-[#fdd835]"
                onClick={handleEnableVR}
                disabled={isCheckingDevice}
              >
                {isCheckingDevice ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    جاري التحقق من الجهاز...
                  </>
                ) : (
                  <>
                    <i className="fas fa-vr-cardboard mr-2"></i>
                    تمكين وضع VR
                  </>
                )}
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 transform rotate-12">
                <path d="M13.5 2a1.5 1.5 0 0 0-3 0v.947h-2.839A2.25 2.25 0 0 0 5.500 5.333a1.5 1.5 0 0 0 0 3 2.25 2.25 0 0 0 2.161 2.386h2.839v3.774a3.001 3.001 0 0 0-2.5 2.957a3 3 0 1 0 6 0 3.001 3.001 0 0 0-2.5-2.957V10.72h2.839a2.25 2.25 0 0 0 2.161-2.386 1.5 1.5 0 0 0 0-3 2.25 2.25 0 0 0-2.161-2.386H13.5V2ZM7.750 7.333a.75.75 0 0 1-.75-.75.75.75 0 0 1 .75-.75.75.75 0 0 1 .75.75.75.75 0 0 1-.75.75Zm8.5 0a.75.75 0 0 1-.75-.75.75.75 0 0 1 .75-.75.75.75 0 0 1 .75.75.75.75 0 0 1-.75.75ZM12 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
              </svg>
            </div>
          </div>
        )}
      
        {/* Featured Products */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">منتجات مميزة</h2>
            <a href="#" className="text-[#fff59d] text-sm">عرض الكل</a>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4 space-x-reverse">
              {products?.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">تصفح حسب الفئة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
        
        {/* Promotional Banner */}
        <div className="bg-gradient-to-l from-[#3b2fa3] to-[#7e57c2] rounded-lg p-6 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">خصم 20% على المنتجات الجديدة</h2>
            <p className="mb-4 text-white/80">احصل على أحدث المنتجات بخصم خاص</p>
            <button className="bg-[#ffeb3b] text-[#2a1f6f] font-bold py-2 px-4 rounded-lg hover:bg-[#fdd835] transition duration-300">
              تسوق الآن
            </button>
          </div>
          <div className="absolute left-0 bottom-0 h-full w-1/3 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 transform -rotate-12 absolute bottom-4 left-4">
              <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.75 3.75 0 0 1 12 2.753a3.75 3.75 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 21.75h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9v9Z" />
            </svg>
          </div>
        </div>
        
        {/* Rewards Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold">مكافآتك</h2>
            <span className="text-[#ffeb3b] font-bold">{currentPoints} نقطة</span>
          </div>
          <div className="mb-3">
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
          </div>
          <div className="flex justify-between text-sm text-white/70">
            <span>{currentPoints} / {nextRewardLevel} نقطة</span>
            <span>خصم $10</span>
          </div>
        </div>
      </div>
    </>
  );
}
