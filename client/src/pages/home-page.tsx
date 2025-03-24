import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BuildingShowcase from "@/components/building-showcase";
import BrandsSection from "@/components/brands-section";
import DynamicPromotions from "@/components/dynamic-promotions";
import PersonalizedRecommendations from "@/components/personalized-recommendations";

// Icons
import { Building2, ShoppingBag, Users, Map, Trophy, ArrowRight, Zap, LucideIcon } from "lucide-react";

// تعريف أنواع البيانات
interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  suffix: string;
  color: string;
}

interface SectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  bgClass: string;
  delay?: number;
}

interface CityStats {
  buildings: number;
  shops: number;
  visitors: number;
  products: number;
  events: number;
}

/**
 * الصفحة الرئيسية - مدينة أمريكي المتكاملة
 * 
 * صفحة الترحيب الرئيسية التي تقدم نظرة عامة على المدينة الافتراضية
 * وتوفر وصولاً سريعاً للميزات الرئيسية والمباني والمتاجر
 */
export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<CityStats>({
    buildings: 24,
    shops: 42,
    visitors: 5783,
    products: 219,
    events: 8
  });
  
  // القسم الإحصائي مع أرقام متحركة
  const StatsCard = ({ icon: Icon, title, value, suffix, color }: StatsCardProps) => (
    <Card className="bg-opacity-20 backdrop-blur-sm border border-slate-700">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">
            {value.toLocaleString()}{suffix}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // بطاقة قسم مع خلفية متدرجة
  const SectionCard = ({ title, description, icon: Icon, to, bgClass, delay = 0 }: SectionCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
    >
      <Link href={to}>
        <Card className={`h-full cursor-pointer transition-all hover:translate-y-[-5px] hover:shadow-lg ${bgClass} bg-opacity-90 backdrop-blur-sm`}>
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-2">
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            <CardDescription className="text-sm opacity-90">{description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" className="gap-1 p-0">
              استكشاف <ArrowRight className="h-4 w-4 mr-1" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* قسم الترويج الرئيسي */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-2xl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 p-8 bg-gradient-to-r from-black/70 via-black/60 to-transparent"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 font-arabic">
                مدينة أمريكي المتكاملة
              </h1>
              <p className="text-xl text-gray-300 mb-6 max-w-lg">
                تجربة تسوق افتراضية ثلاثية الأبعاد بتقنيات متقدمة. اكتشف المتاجر والمطاعم والفعاليات في مدينة رقمية متكاملة.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setLocation("/city")} 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
                >
                  دخول المدينة <Zap className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => setLocation("/auth")} 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 hover:bg-white/10"
                >
                  تسجيل الدخول
                </Button>
              </div>
            </motion.div>
          </motion.div>
          
          {/* خلفية متحركة للقسم الرئيسي */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
            <div className="absolute inset-0 bg-[url('/images/city-bg.jpg')] bg-cover bg-center opacity-40"></div>
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* تأثيرات خلفية متحركة */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-float1"
                    style={{
                      width: `${Math.random() * 10 + 5}px`,
                      height: `${Math.random() * 10 + 5}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* أقسام رئيسية للتنقل السريع */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-arabic">استكشف مدينة أمريكي</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SectionCard 
            title="المتاجر والتسوق"
            description="تصفح أحدث المنتجات والعروض من متاجر مختلفة"
            icon={ShoppingBag}
            to="/city"
            bgClass="bg-gradient-to-br from-blue-800 to-blue-600"
            delay={0}
          />
          <SectionCard 
            title="المرافق العامة"
            description="اكتشف البنوك والمطاعم ومراكز الخدمات"
            icon={Building2}
            to="/city"
            bgClass="bg-gradient-to-br from-purple-800 to-purple-600"
            delay={1}
          />
          <SectionCard 
            title="نظام المكافآت"
            description="اكسب النقاط واستبدلها بهدايا وعروض حصرية"
            icon={Trophy}
            to="/rewards"
            bgClass="bg-gradient-to-br from-amber-700 to-amber-500"
            delay={2}
          />
          <SectionCard 
            title="خريطة المدينة"
            description="استكشف المدينة بخريطة ثلاثية الأبعاد تفاعلية"
            icon={Map}
            to="/city"
            bgClass="bg-gradient-to-br from-emerald-800 to-emerald-600"
            delay={3}
          />
          <SectionCard 
            title="المجتمع"
            description="تواصل مع المستخدمين وشارك تجاربك"
            icon={Users}
            to="/auth"
            bgClass="bg-gradient-to-br from-pink-800 to-pink-600"
            delay={4}
          />
          <SectionCard 
            title="الفعاليات"
            description="احضر أحدث العروض والفعاليات الحصرية"
            icon={Building2}
            to="/city"
            bgClass="bg-gradient-to-br from-indigo-800 to-indigo-600"
            delay={5}
          />
        </div>
      </section>

      {/* إحصائيات المدينة */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-arabic">إحصائيات المدينة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard 
            icon={Building2} 
            title="المباني" 
            value={stats.buildings} 
            suffix="" 
            color="bg-blue-600/50"
          />
          <StatsCard 
            icon={ShoppingBag} 
            title="المتاجر" 
            value={stats.shops} 
            suffix="" 
            color="bg-purple-600/50"
          />
          <StatsCard 
            icon={Users} 
            title="الزوار" 
            value={stats.visitors} 
            suffix="+" 
            color="bg-green-600/50"
          />
          <StatsCard 
            icon={ShoppingBag} 
            title="المنتجات" 
            value={stats.products} 
            suffix="+" 
            color="bg-amber-600/50"
          />
          <StatsCard 
            icon={Trophy} 
            title="الفعاليات" 
            value={stats.events} 
            suffix="" 
            color="bg-pink-600/50"
          />
        </div>
      </section>

      {/* عرض أبرز المباني */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-arabic">أبرز المباني</h2>
        <BuildingShowcase />
      </section>

      {/* عروض وتوصيات */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-arabic">العروض والتوصيات</h2>
        <Tabs defaultValue="promotions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="promotions">العروض الحالية</TabsTrigger>
            <TabsTrigger value="recommendations">توصيات لك</TabsTrigger>
          </TabsList>
          <TabsContent value="promotions" className="mt-0">
            <DynamicPromotions animated variant="highlight" />
          </TabsContent>
          <TabsContent value="recommendations" className="mt-0">
            <PersonalizedRecommendations maxItems={4} />
          </TabsContent>
        </Tabs>
      </section>

      {/* الماركات المميزة */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-arabic">الماركات المميزة</h2>
        <BrandsSection featuredOnly maxBrands={5} />
      </section>

      {/* باقي التفاصيل */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 font-arabic">ابدأ التجربة الآن</h2>
          <p className="text-lg text-gray-300 mb-6">
            مدينة أمريكي المتكاملة تجمع بين تجربة التسوق وتقنيات الواقع الافتراضي والمعزز لتقديم تجربة فريدة ومبتكرة.
            استكشف المدينة الآن واستمتع بتجربة تسوق رقمية متميزة.
          </p>
          <Button 
            onClick={() => setLocation("/city")} 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
          >
            دخول المدينة الافتراضية <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}