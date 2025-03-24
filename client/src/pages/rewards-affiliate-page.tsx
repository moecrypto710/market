import { useQuery } from "@tanstack/react-query";
import { Reward, Product, Affiliate } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { RewardCard } from "@/components/reward-card";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from 'canvas-confetti';
import { 
  BrainCircuitIcon, 
  RocketIcon, 
  SparklesIcon, 
  Zap, 
  Trophy, 
  Gift, 
  ShoppingCart, 
  UserPlus, 
  Star, 
  Award, 
  TrendingUp, 
  BadgeCheck,
  ArrowUpRight,
  CheckCircle,
  Coins,
  HeartHandshake,
  CircleDollarSign
} from "lucide-react";
import CopyLink from "@/components/copy-link";
import SocialShare from "@/components/social-share";

// تعريف مستويات برنامج التسويق بالعمولة
const AFFILIATE_TIERS = [
  { 
    name: "مبتدئ", 
    required: 0, 
    commission: 5, 
    color: "bg-gradient-to-r from-white/20 to-white/10",
    textColor: "text-white"
  },
  { 
    name: "فضي", 
    required: 5, 
    commission: 10, 
    color: "bg-gradient-to-r from-slate-400 to-slate-500",
    textColor: "text-white"
  },
  { 
    name: "ذهبي", 
    required: 20, 
    commission: 15, 
    color: "bg-gradient-to-r from-amber-500 to-amber-600",
    textColor: "text-black"
  },
  { 
    name: "ماسي", 
    required: 50, 
    commission: 20, 
    color: "bg-gradient-to-r from-[#67e8f9] to-[#22d3ee]",
    textColor: "text-black"
  },
  { 
    name: "VIP", 
    required: 100, 
    commission: 25, 
    color: "bg-gradient-to-r from-[#5e35b1] to-[#7c4dff]",
    textColor: "text-white"
  }
];

export default function RewardsAffiliatePage() {
  const { user } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("rewards");
  
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
  
  const { data: affiliate } = useQuery<Affiliate>({
    queryKey: ['/api/affiliate'],
  });
  
  const { data: promotedProducts } = useQuery<Product[]>({
    queryKey: ['/api/products/promoted'],
  });
  
  const currentPoints = user?.points || 0;
  const nextRewardLevel = 1000;
  const progressPercentage = Math.min(100, (currentPoints / nextRewardLevel) * 100);
  
  const earnings = affiliate?.earnings || 0;
  const conversions = affiliate?.conversions || 0;
  
  // تحديد المستوى الحالي والتالي للتسويق بالعمولة
  const currentTierIndex = AFFILIATE_TIERS.findIndex(t => 
    t.required <= conversions
  );
  
  const nextTierIndex = Math.min(currentTierIndex + 1, AFFILIATE_TIERS.length - 1);
  const currentTierInfo = AFFILIATE_TIERS[currentTierIndex];
  const nextTierInfo = AFFILIATE_TIERS[nextTierIndex];
  
  // حساب نسبة التقدم للمستوى التالي
  const progressToNextTier = currentTierIndex === AFFILIATE_TIERS.length - 1 
    ? 100 
    : Math.min(100, ((conversions - currentTierInfo.required) / (nextTierInfo.required - currentTierInfo.required)) * 100);
  
  // الحصول على المنتج المحدد للترويج
  const selectedProduct = promotedProducts?.find(p => p.id === selectedProductId);
  
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
      icon: ShoppingCart,
      aiBoost: "زيادة بنسبة 15% هذا الأسبوع"
    },
    {
      id: 2,
      title: "دعوة أصدقاء",
      description: "200 نقطة لكل صديق",
      icon: UserPlus,
      aiBoost: "مكافأة خاصة: 500 نقطة لكل 3 أصدقاء"
    },
    {
      id: 3,
      title: "تقييم المنتجات",
      description: "50 نقطة لكل تقييم",
      icon: Star,
      aiBoost: "نقاط مضاعفة على منتجات معينة"
    },
    {
      id: 4,
      title: "التسويق بالعمولة",
      description: "500 نقطة لكل 5 تحويلات",
      icon: HeartHandshake,
      aiBoost: "احصل على 30% نقاط إضافية عند الترويج للمنتجات الإلكترونية"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          برنامج الولاء والتسويق بالعمولة
        </h1>
        <p className="text-xl text-white/70">
          اكسب النقاط وشارك في برنامج التسويق بالعمولة واحصل على مكافآت حصرية
        </p>
      </div>
      
      {/* Main Tab Navigation */}
      <Tabs defaultValue="rewards" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 w-full mb-8">
          <TabsTrigger value="rewards" className="text-base py-3">
            <Trophy className="ml-2 h-5 w-5" />
            برنامج المكافآت
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="text-base py-3">
            <HeartHandshake className="ml-2 h-5 w-5" />
            التسويق بالعمولة
          </TabsTrigger>
        </TabsList>
        
        {/* Rewards Tab Content */}
        <TabsContent value="rewards" className="animate-in fade-in-50 duration-500">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Current Points - Enhanced with our theme */}
            <Card className="bg-black border border-white/10 text-white overflow-hidden relative">
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
                <div className="text-center mb-6">
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
            
            {/* AI Recommendations */}
            <Card className="bg-black border border-white/10 text-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full filter blur-3xl -ml-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-full filter blur-3xl -mr-20 -mb-20"></div>
              </div>
              
              <CardHeader className="pb-0 relative z-10">
                <CardTitle className="flex items-center">
                  <BrainCircuitIcon className="ml-2 h-5 w-5 text-blue-400" />
                  توصيات ذكية
                </CardTitle>
                <CardDescription>طرق مخصصة لزيادة نقاطك بسرعة</CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-3 mt-4">
                  {aiRecommendations.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-lg p-3 flex items-start hover:border-blue-500/30 transition-all cursor-pointer"
                    >
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 h-10 w-10 rounded-full flex items-center justify-center ml-3 mt-1">
                        <rec.icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">{rec.title}</div>
                        <p className="text-sm text-white/70 mb-2">{rec.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-none">
                            +{rec.points} نقطة
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-xs p-0 h-auto flex items-center text-blue-400 hover:text-blue-300">
                            {rec.actionText}
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Available Rewards */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {rewards?.map((reward, index) => (
                <div key={reward.id} className={`animate-float${index % 5 + 1}`} style={{animationDelay: `${index * 0.1}s`}}>
                  <RewardCard reward={reward} userPoints={currentPoints} />
                </div>
              ))}
            </div>
          </div>
          
          {/* How to Earn */}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <method.icon className="h-7 w-7 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400" />
                      </div>
                      <h4 className="font-bold mb-3 text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">{method.title}</h4>
                      <p className="text-sm text-white/60 group-hover:text-white/80 transition-all duration-300">{method.description}</p>
                      <div className="mt-3 text-xs px-2 py-1 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full inline-block">
                        <span className="text-white/70">{method.aiBoost}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Affiliate Tab Content */}
        <TabsContent value="affiliate" className="animate-in fade-in-50 duration-500">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <HeartHandshake className="h-8 w-8 text-[#5e35b1]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">برنامج التسويق بالعمولة</h2>
                <p className="text-white/70">اربح من خلال مشاركة منتجات بلدة الأمريكي واحصل على عمولات مجزية</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-[#5e35b1] to-[#7c4dff] text-white h-8">
              <span className="ml-1 text-xs">المستوى:</span>
              <span className="font-bold">{currentTierInfo?.name || "مبتدئ"}</span>
            </Badge>
          </div>
          
          <Tabs defaultValue="dashboard" className="mb-8">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
              <TabsTrigger value="promote">ترويج المنتجات</TabsTrigger>
              <TabsTrigger value="resources">الأدوات والموارد</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              {/* بطاقات الإحصائيات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-black border border-[#5e35b1]/30 bg-gradient-to-br from-[#5e35b1]/5 to-[#7c4dff]/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white/70 flex items-center">
                      <CircleDollarSign className="ml-2 h-5 w-5 text-[#7c4dff]" />
                      الأرباح الإجمالية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{earnings} <span className="text-sm">ج.م</span></div>
                    <div className="mt-2 text-xs text-white/50">
                      تُدفع الأرباح شهرياً عند الوصول للحد الأدنى (500 ج.م)
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-black border border-[#5e35b1]/30 bg-gradient-to-br from-[#5e35b1]/5 to-[#7c4dff]/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white/70 flex items-center">
                      <CheckCircle className="ml-2 h-5 w-5 text-[#7c4dff]" />
                      إجمالي التحويلات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{conversions}</div>
                    <div className="mt-2 text-xs text-white/50">
                      تزيد نسبة العمولة بزيادة عدد التحويلات الناجحة
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* مقياس التقدم للمستوى التالي */}
              <Card className="mb-6 bg-black border border-[#5e35b1]/30 bg-gradient-to-br from-[#5e35b1]/5 to-[#7c4dff]/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white flex items-center">
                    <Star className="ml-2 h-5 w-5 text-[#7c4dff]" />
                    التقدم للمستوى التالي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">المستوى الحالي: {currentTierInfo?.name}</span>
                    <span className="text-white/70">المستوى التالي: {nextTierInfo?.name}</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full p-[1px] border border-white/10">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#5e35b1] to-[#7c4dff] transition-all duration-1000 relative"
                      style={{ width: `${progressToNextTier}%` }}
                    >
                      {progressToNextTier > 10 && (
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-white opacity-20 rounded-full animate-pulse-slow"></div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {currentTierIndex === AFFILIATE_TIERS.length - 1
                      ? "أنت في أعلى مستوى!"
                      : `تحتاج إلى ${nextTierInfo.required - conversions} تحويل إضافي للترقية`
                    }
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-sm font-bold mb-2">مزايا المستوى الحالي:</div>
                    <ul className="text-sm text-white/70 list-disc list-inside space-y-1">
                      <li>نسبة عمولة {currentTierInfo?.commission || 5}% على كل عملية شراء</li>
                      <li>دعم أولوية عبر البريد الإلكتروني</li>
                      {currentTierIndex >= 1 && <li>إمكانية الوصول إلى المنتجات الحصرية للترويج</li>}
                      {currentTierIndex >= 2 && <li>عمولة إضافية 2% على المنتجات الموسمية</li>}
                      {currentTierIndex >= 3 && <li>لوحة تحكم تحليلية متقدمة مع توصيات مخصصة</li>}
                      {currentTierIndex >= 4 && <li>مدير حساب شخصي ودعم على مدار الساعة</li>}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {/* رابط الإحالة الخاص */}
              <Card className="bg-black border border-[#5e35b1]/30 bg-gradient-to-br from-[#5e35b1]/5 to-[#7c4dff]/5 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white flex items-center">
                    <HeartHandshake className="ml-2 h-5 w-5 text-[#7c4dff]" />
                    رابط الإحالة الخاص بك
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CopyLink affiliateCode={user?.affiliateCode || ''} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs border-[#5e35b1]/30 hover:bg-[#5e35b1]/10 hover:text-white">
                      <i className="fab fa-facebook-f ml-2"></i>
                      مشاركة على فيسبوك
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs border-[#5e35b1]/30 hover:bg-[#5e35b1]/10 hover:text-white">
                      <i className="fab fa-twitter ml-2"></i>
                      مشاركة على تويتر
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs border-[#5e35b1]/30 hover:bg-[#5e35b1]/10 hover:text-white">
                      <i className="fab fa-whatsapp ml-2"></i>
                      مشاركة على واتساب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="promote">
              {/* المنتجات الرائجة للترويج */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {promotedProducts?.map((product) => (
                  <Card 
                    key={product.id} 
                    className={`bg-black border transition-all duration-300 cursor-pointer
                      ${selectedProductId === product.id ? 'border-[#5e35b1]' : 'border-white/10 hover:border-white/30'}`}
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    <div className="flex p-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-20 h-20 object-cover rounded-lg ml-4" 
                      />
                      <div className="flex-1">
                        <h4 className="font-bold">{product.name}</h4>
                        <div className="mt-1 mb-2 text-sm text-white/70 line-clamp-2">
                          {product.description.slice(0, 80)}...
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge className="bg-[#5e35b1] text-white">
                            عمولة {product.commissionRate}%
                          </Badge>
                          <div className="text-xs text-white/70">
                            السعر: {product.price.toLocaleString()} ج.م
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* تفاصيل المنتج المختار وأدوات الترويج */}
              {selectedProduct && (
                <Card className="bg-black border border-[#5e35b1]/50 mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white flex items-center">
                      <SparklesIcon className="ml-2 h-5 w-5 text-[#7c4dff]" />
                      أدوات ترويج المنتج
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4 pb-4 border-b border-white/10">
                      <img 
                        src={selectedProduct.imageUrl} 
                        alt={selectedProduct.name} 
                        className="w-16 h-16 object-cover rounded ml-3" 
                      />
                      <div>
                        <div className="font-bold">{selectedProduct.name}</div>
                        <div className="flex mt-1">
                          <Badge className="bg-[#5e35b1] text-white ml-2">
                            عمولة {selectedProduct.commissionRate}%
                          </Badge>
                          <div className="text-xs text-white/70">
                            العمولة المتوقعة: {Math.round(selectedProduct.price * selectedProduct.commissionRate / 100)} ج.م
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold mb-1 block">رابط المنتج مع كود الإحالة</label>
                        <div className="flex">
                          <input 
                            type="text" 
                            readOnly 
                            value={`https://amrikymall.com/product/${selectedProduct.id}?ref=${user?.affiliateCode}`}
                            className="bg-black border border-white/20 rounded py-1 px-3 text-sm flex-1 ml-2"
                          />
                          <Button size="sm" className="bg-[#5e35b1] hover:bg-[#4c2b96]">نسخ</Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-bold mb-1 block">مشاركة مخصصة</label>
                        <div className="flex flex-wrap gap-2">
                          <SocialShare 
                            productId={selectedProduct.id} 
                            productName={selectedProduct.name}
                            imageUrl={selectedProduct.imageUrl}
                            showLabel={true}
                            variant="outline"
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-bold mb-1 block">نص مقترح للترويج</label>
                        <textarea 
                          readOnly
                          className="bg-black border border-white/20 rounded py-2 px-3 text-sm w-full h-24 mt-1"
                          value={`تسوقوا الآن من بلدة الأمريكي منتج "${selectedProduct.name}" بسعر ${selectedProduct.price} ج.م فقط! منتج أصلي 100% مع ضمان الجودة وخدمة التوصيل السريع لباب المنزل. استخدموا الرابط للطلب: https://amrikymall.com/product/${selectedProduct.id}?ref=${user?.affiliateCode}`}
                        />
                        <Button size="sm" className="mt-2 bg-[#5e35b1] hover:bg-[#4c2b96]">نسخ النص</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="resources">
              {/* موارد وأدوات التسويق بالعمولة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-black border border-[#5e35b1]/30 bg-gradient-to-br from-[#5e35b1]/5 to-[#7c4dff]/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Award className="ml-2 h-5 w-5 text-[#7c4dff]" />
                      استراتيجيات التسويق الناجحة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 list-disc list-inside text-white/80">
                      <li>قم بإنشاء محتوى مراجعة تفصيلي للمنتجات الأكثر مبيعاً</li>
                      <li>استخدم وسائل التواصل الاجتماعي مع استهداف دقيق للفئات المهتمة</li>
                      <li>ابنِ قائمة بريدية واستخدمها للترويج للمنتجات الجديدة والعروض</li>
                      <li>استغل المناسبات والمواسم للترويج للمنتجات المناسبة لها</li>
                      <li>قم بإنشاء دليل مقارنة بين المنتجات المتشابهة لمساعدة المتسوقين</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-black border border-[#5e35b1]/30 bg-gradient-to-br from-[#5e35b1]/5 to-[#7c4dff]/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BadgeCheck className="ml-2 h-5 w-5 text-[#7c4dff]" />
                      أفضل الممارسات للمسوقين بالعمولة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 list-disc list-inside text-white/80">
                      <li>كن صادقاً وشفافاً مع جمهورك حول الروابط التسويقية</li>
                      <li>روج فقط للمنتجات التي تثق بها وتعتقد أنها ستفيد جمهورك</li>
                      <li>قدم معلومات قيمة وليس فقط روابط تسويقية</li>
                      <li>تابع الإحصائيات وركز جهودك على ما يحقق أفضل النتائج</li>
                      <li>حافظ على اطلاعك بالمنتجات الجديدة والعروض المميزة</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              {/* أدوات تسويقية جاهزة */}
              <Card className="bg-black border border-[#5e35b1]/30 bg-gradient-to-br from-[#5e35b1]/5 to-[#7c4dff]/5 mb-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="ml-2 h-5 w-5 text-[#7c4dff]" />
                    أدوات تسويقية جاهزة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center border border-[#5e35b1]/20 hover:border-[#5e35b1]/40 transition-all">
                      <i className="fas fa-image text-3xl mb-2 text-[#7c4dff]"></i>
                      <h4 className="font-bold mb-1">صور وبانرات</h4>
                      <p className="text-xs text-white/70 mb-2">بانرات وصور جاهزة بمقاسات مختلفة للترويج</p>
                      <Button size="sm" variant="outline" className="text-xs border-[#5e35b1]/30 hover:bg-[#5e35b1]/10 hover:text-white">تنزيل</Button>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 text-center border border-[#5e35b1]/20 hover:border-[#5e35b1]/40 transition-all">
                      <i className="fas fa-file-alt text-3xl mb-2 text-[#7c4dff]"></i>
                      <h4 className="font-bold mb-1">قوالب نصية</h4>
                      <p className="text-xs text-white/70 mb-2">نصوص إعلانية جاهزة للتعديل والاستخدام المباشر</p>
                      <Button size="sm" variant="outline" className="text-xs border-[#5e35b1]/30 hover:bg-[#5e35b1]/10 hover:text-white">تنزيل</Button>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 text-center border border-[#5e35b1]/20 hover:border-[#5e35b1]/40 transition-all">
                      <i className="fas fa-chart-bar text-3xl mb-2 text-[#7c4dff]"></i>
                      <h4 className="font-bold mb-1">تقارير الأداء</h4>
                      <p className="text-xs text-white/70 mb-2">إحصاءات تفصيلية ورؤى لتحسين استراتيجيتك</p>
                      <Button size="sm" variant="outline" className="text-xs border-[#5e35b1]/30 hover:bg-[#5e35b1]/10 hover:text-white">عرض</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Cross-Promotion Section - Linking Rewards and Affiliate */}
          <div className="bg-gradient-to-br from-[#5e35b1]/20 to-[#7c4dff]/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 mt-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Gift className="ml-2 h-5 w-5 text-[#7c4dff]" />
              مكافآت خاصة للمسوقين بالعمولة
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center ml-3">
                    <Coins className="h-5 w-5 text-[#7c4dff]" />
                  </div>
                  <div>
                    <h4 className="font-bold">نقاط إضافية عند التحويل</h4>
                    <p className="text-sm text-white/70">احصل على 50 نقطة إضافية لكل عملية تحويل ناجحة</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-[#5e35b1]/30 hover:bg-[#5e35b1]/10 hover:text-white"
                  onClick={() => setActiveTab("rewards")}
                >
                  استعرض نقاطك الحالية
                </Button>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center ml-3">
                    <Trophy className="h-5 w-5 text-[#7c4dff]" />
                  </div>
                  <div>
                    <h4 className="font-bold">مكافآت حصرية للمستويات المتقدمة</h4>
                    <p className="text-sm text-white/70">ترقية تلقائية لعضوية VIP عند الوصول للمستوى الذهبي</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-[#5e35b1]/30 hover:bg-[#5e35b1]/10 hover:text-white"
                  onClick={() => {}}
                >
                  عرض المزايا الحصرية
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}