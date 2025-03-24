import { useQuery } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { RewardCard } from "@/components/reward-card";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from 'canvas-confetti';
import { BrainCircuitIcon, RocketIcon, SparklesIcon, Zap, Trophy, Gift, ShoppingCart, UserPlus, Star, Award, TrendingUp, BadgeCheck } from "lucide-react";

export default function RewardsPage() {
  const { user } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<{
    title: string;
    description: string;
    actionText: string;
    points: number;
    icon: any;
  }[]>([]);
  
  const { data: rewards } = useQuery<Reward[]>({
    queryKey: ['/api/rewards'],
  });
  
  const currentPoints = user?.points || 0;
  const nextRewardLevel = 1000;
  const progressPercentage = Math.min(100, (currentPoints / nextRewardLevel) * 100);
  
  // Generate AI personalized recommendations based on user points
  useEffect(() => {
    // Simulate AI recommendations based on user points and activity
    const recommendations = [
      {
        title: "متجر الإلكترونيات",
        description: "زيارة متجر الإلكترونيات ستمنحك فرصة كسب 100 نقطة إضافية هذا الأسبوع",
        actionText: "زيارة المتجر",
        points: 100,
        icon: ShoppingCart
      },
      {
        title: "دعوة 3 أصدقاء",
        description: "احصل على مكافأة خاصة من 500 نقطة عند دعوة 3 أصدقاء جدد",
        actionText: "دعوة الأصدقاء",
        points: 500,
        icon: UserPlus
      },
      {
        title: "تقييمات منتجات الملابس",
        description: "نقاط مضاعفة عند تقييم منتجات قسم الملابس خلال الأسبوع الحالي",
        actionText: "تقييم المنتجات",
        points: 100,
        icon: Star
      }
    ];
    
    setAiRecommendations(recommendations);
  }, [currentPoints]);
  
  // Celebration effect when reaching certain milestones
  useEffect(() => {
    if (progressPercentage >= 95 && !showCelebration) {
      setShowCelebration(true);
      triggerCelebration();
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [progressPercentage, showCelebration]);
  
  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  const earningMethods = [
    {
      id: 1,
      title: "عمليات الشراء",
      description: "10 نقاط لكل 100 جنيه",
      icon: "shopping-cart",
      aiBoost: "زيادة بنسبة 15% هذا الأسبوع"
    },
    {
      id: 2,
      title: "دعوة أصدقاء",
      description: "200 نقطة لكل صديق",
      icon: "user-plus",
      aiBoost: "مكافأة خاصة: 500 نقطة لكل 3 أصدقاء"
    },
    {
      id: 3,
      title: "تقييم المنتجات",
      description: "50 نقطة لكل تقييم",
      icon: "star",
      aiBoost: "نقاط مضاعفة على منتجات معينة"
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-white">برنامج المكافآت</h2>
      
      {/* Current Points - Enhanced with our theme */}
      <Card className="mb-6 bg-black border border-white/10 text-white overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full filter blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full filter blur-3xl -ml-20 -mb-20"></div>
          
          {/* Floating particles */}
          <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-purple-400 rounded-full animate-float1"></div>
          <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-pink-400 rounded-full animate-float3"></div>
          <div className="absolute bottom-[20%] left-[30%] w-1 h-1 bg-blue-400 rounded-full animate-float2"></div>
        </div>
        
        <CardContent className="pt-8 pb-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1 mb-3 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20">
              <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">VIP مكافآت</span>
            </div>
            <span className="text-6xl font-bold block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 tracking-wider">{currentPoints}</span>
            <p className="text-sm text-white/70 mt-3">نقاط المكافآت الحالية</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2 text-white/70">
              <span>0 نقطة</span>
              <span>المستوى التالي: {nextRewardLevel} نقطة</span>
            </div>
            <div className="w-full h-3 bg-black/70 rounded-full p-[1px] border border-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 10 && (
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white opacity-20 rounded-full animate-pulse-slow"></div>
                )}
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-white/10 rounded-full text-xs">
                {progressPercentage >= 100 
                  ? "لقد وصلت إلى المستوى التالي! 🎉" 
                  : `${Math.round(nextRewardLevel - currentPoints)} نقطة متبقية للمستوى التالي`
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Available Rewards - Enhanced Grid Layout */}
      <div className="mb-10 relative">
        {/* Decorative elements */}
        <div className="absolute top-20 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-40 left-1/3 w-80 h-80 bg-gradient-to-br from-purple-600/5 to-pink-600/5 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="border-b-2 border-purple-500 pb-1">المكافآت المتاحة</span>
          </h3>
          <div className="px-3 py-1 text-xs border border-white/10 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10">
            <span className="text-white/70">استبدل نقاطك</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {rewards?.map((reward, index) => (
            <div key={reward.id} className={`animate-float${index % 5 + 1}`} style={{animationDelay: `${index * 0.1}s`}}>
              <RewardCard reward={reward} userPoints={currentPoints} />
            </div>
          ))}
        </div>
      </div>
      
      {/* How to Earn - Enhanced with new theme */}
      <div className="bg-black border border-white/10 rounded-lg p-6 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-600/10 rounded-full filter blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              <span className="border-b-2 border-purple-500 pb-1">كيف تكسب النقاط</span>
            </h3>
            <div className="px-3 py-1 text-xs border border-white/10 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10">
              <span className="text-white/70">ترقية بسرعة</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earningMethods.map((method, index) => (
              <Card 
                key={method.id} 
                className="bg-black/40 backdrop-blur-sm border border-white/10 text-white overflow-hidden relative group transition-all duration-300 hover:border-purple-500/30"
              >
                {/* Card decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800/5 to-pink-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/10 to-pink-600/10 filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <CardContent className="pt-6 text-center relative z-10">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mx-auto mb-5 border border-white/10 group-hover:border-purple-500/30 transition-all duration-300 animate-float${index % 5 + 1}`}>
                    <i className={`fas fa-${method.icon} text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-xl`}></i>
                  </div>
                  <h4 className="font-bold mb-3 text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">{method.title}</h4>
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-all duration-300">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
