import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVR } from "@/hooks/use-vr";
import { useToast } from "@/hooks/use-toast";
import PartnershipOffers from "@/components/partnership-offers";
import { 
  Plane, Building, Phone, ShoppingBag, MapPin, ChevronRight, 
  Star, CreditCard, Calendar, Users, BriefcaseBusiness, Handshake, 
  GraduationCap, Video, Lightbulb, Globe, CircleDollarSign, Rocket,
  LifeBuoy, LucideProps, AreaChart, LineChart, BarChart, PieChart
} from "lucide-react";
import confetti from 'canvas-confetti';

// Virtual Town Component
export default function BusinessWorldPage() {
  const { user } = useAuth() || { user: null };
  const isMobile = useIsMobile();
  const { vrEnabled, toggleVR } = useVR() || { vrEnabled: false, toggleVR: () => {} };
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  // Fetch products
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: true,
  });

  // Business categories
  const businessCategories = [
    { id: "all", name: "جميع الأعمال", icon: <Building className="h-5 w-5" /> },
    { id: "retail", name: "متاجر التجزئة", icon: <ShoppingBag className="h-5 w-5" /> },
    { id: "travel", name: "وكالات السفر", icon: <Plane className="h-5 w-5" /> },
    { id: "devices", name: "متاجر الأجهزة", icon: <Phone className="h-5 w-5" /> },
  ];

  // Sample business data (in a real app, this would come from an API)
  const businessData = [
    {
      id: 1,
      name: "متجر الأزياء الراقية",
      category: "retail",
      description: "متجر متخصص في الأزياء الراقية والعصرية",
      location: "الطابق الأول، بلوك A",
      price: 5000,
      rating: 4.8,
      popular: true,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000",
      customShape: "store"
    },
    {
      id: 2,
      name: "وكالة السفر العربية",
      category: "travel",
      description: "وكالة سفر متخصصة في الرحلات السياحية داخل وخارج البلاد",
      location: "الطابق الثاني، بلوك B",
      price: 7500,
      rating: 4.9,
      popular: true,
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000",
      customShape: "airplane"
    },
    {
      id: 3,
      name: "المتجر الذكي للأجهزة",
      category: "devices",
      description: "متجر متخصص في بيع أحدث الأجهزة الإلكترونية والهواتف الذكية",
      location: "الطابق الأول، بلوك C",
      price: 6500,
      rating: 4.7,
      popular: false,
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1000",
      customShape: "phone"
    },
    {
      id: 4,
      name: "متجر الأحذية الرياضية",
      category: "retail",
      description: "متجر متخصص في بيع الأحذية الرياضية من أشهر الماركات العالمية",
      location: "الطابق الأول، بلوك D",
      price: 4800,
      rating: 4.6,
      popular: false,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000",
      customShape: "store"
    },
    {
      id: 5,
      name: "سفريات العالم الجديد",
      category: "travel",
      description: "وكالة سفر متخصصة في الرحلات الجوية والبحرية",
      location: "الطابق الثاني، بلوك E",
      price: 7200,
      rating: 4.5,
      popular: true,
      image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=1000",
      customShape: "airplane"
    },
    {
      id: 6,
      name: "متجر الجوالات المتطورة",
      category: "devices",
      description: "متجر متخصص في بيع أحدث الهواتف الذكية والأجهزة اللوحية",
      location: "الطابق الأول، بلوك F",
      price: 6800,
      rating: 4.4,
      popular: false,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
      customShape: "phone"
    }
  ];

  // Filter businesses based on selected category
  const filteredBusinesses = selectedCategory === "all" 
    ? businessData 
    : businessData.filter(business => business.category === selectedCategory);

  // Handle VR tour
  const startVirtualTour = () => {
    toggleVR();
    setShowVirtualTour(true);
  };

  // Features of Amrikyy Town
  const features = [
    {
      title: "تصميم عربي أصيل",
      description: "مستوحى من العمارة العربية التقليدية مع لمسات عصرية",
      icon: <Star className="h-6 w-6 text-primary" />
    },
    {
      title: "موقع استراتيجي",
      description: "موقع متميز يجذب آلاف الزوار يومياً",
      icon: <MapPin className="h-6 w-6 text-primary" />
    },
    {
      title: "خيارات متنوعة",
      description: "متاجر، وكالات سفر، أجهزة إلكترونية وأكثر",
      icon: <ShoppingBag className="h-6 w-6 text-primary" />
    },
    {
      title: "أسعار تنافسية",
      description: "خطط أسعار مرنة تناسب جميع أنواع الأعمال",
      icon: <CreditCard className="h-6 w-6 text-primary" />
    }
  ];

  // Business shape component
  const BusinessShape = ({ type, children }: { type: string, children: React.ReactNode }) => {
    switch(type) {
      case "airplane":
        return (
          <div className="relative">
            {/* Airplane shape with CSS */}
            <div className="relative w-full h-48 bg-primary/10 rounded-t-3xl overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-6 bg-primary/20 rounded-full"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-24 bg-primary/20 transform -rotate-45 origin-bottom"></div>
              <div className="absolute top-0 right-1/2 translate-x-1/2 w-10 h-24 bg-primary/20 transform rotate-45 origin-bottom"></div>
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-primary/30 rounded-t-lg"></div>
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-400"></div>
              <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-primary" />
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-md">
              {children}
            </div>
          </div>
        );
      case "phone":
        return (
          <div className="relative">
            {/* Phone shape with CSS */}
            <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-3xl overflow-hidden border-8 border-gray-800">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full px-4 py-8 flex items-center justify-center">
                <Phone className="h-12 w-12 text-white/70" />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700 rounded-full"></div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-md">
              {children}
            </div>
          </div>
        );
      case "store":
      default:
        return (
          <div className="relative">
            {/* Store shape with CSS */}
            <div className="relative w-full h-48 bg-gradient-to-b from-indigo-100 to-white rounded-t-lg overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-10 bg-primary/80 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">متجر</span>
              </div>
              <div className="absolute top-10 left-0 right-0 bottom-0 flex">
                <div className="w-1/3 h-full border-r border-gray-200 flex items-center justify-center">
                  <div className="w-8 h-20 bg-primary/20 rounded"></div>
                </div>
                <div className="w-1/3 h-full border-r border-gray-200 flex items-center justify-center">
                  <div className="w-8 h-16 bg-primary/30 rounded"></div>
                </div>
                <div className="w-1/3 h-full flex items-center justify-center">
                  <div className="w-8 h-12 bg-primary/40 rounded"></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-800"></div>
              <ShoppingBag className="absolute top-20 left-1/2 -translate-x-1/2 h-12 w-12 text-primary" />
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-md">
              {children}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-purple-600 text-white mb-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555529771-7888783a18d3?q=80&w=2000')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-700/80"></div>
        
        {/* Arabic pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSJub25lIj48L3JlY3Q+CjxwYXRoIGQ9Ik0yOCAwTDAgMTAwTDU2IDEwMEwyOCAwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPgo8L3N2Zz4=')] opacity-20 bg-repeat"></div>
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-right">
                بلدة الأمريكي
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-6 text-right">
                عالم افتراضي متكامل للأعمال بتصميم عربي أصيل وتقنيات حديثة
              </p>
              <div className="flex flex-wrap gap-3 justify-end">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="backdrop-blur-sm bg-white/10 hover:bg-white/20"
                  onClick={startVirtualTour}
                >
                  <span className="ml-2">جولة افتراضية</span> 
                  <Building className="h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/40"
                >
                  <span className="ml-2">احجز مكانك الآن</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="relative h-60 w-60">
                <motion.div 
                  className="absolute inset-0"
                  animate={{ 
                    rotateY: [0, 360], 
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="h-full w-full rounded-full border-8 border-white/30 flex items-center justify-center">
                    <div className="h-5/6 w-5/6 rounded-full border-4 border-white/20 flex items-center justify-center">
                      <div className="h-4/6 w-4/6 rounded-full bg-white/10 flex items-center justify-center">
                        <Building className="h-16 w-16 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,165.3C672,171,768,149,864,149.3C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Features section */}
      <div className="mb-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">لماذا تختار بلدة الأمريكي؟</h2>
          <p className="text-gray-600">اكتشف ميزات مشروعنا المبتكر للأعمال</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-center text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Categories Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">استكشف الأعمال المتاحة</h2>
          <div className="flex space-x-2">
            {businessCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2 ml-2"
              >
                {category.icon}
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <BusinessShape type={business.customShape}>
                <div className="flex flex-col h-full">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    {business.popular && (
                      <Badge variant="default" className="bg-primary text-white">شائع</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{business.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 ml-1" />
                    <span>{business.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Star className="h-4 w-4 ml-1 text-amber-500" />
                    <span>{business.rating} تقييم</span>
                  </div>
                  <div className="mt-auto border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold">{business.price.toLocaleString()} ريال / سنة</span>
                      <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    </div>
                  </div>
                </div>
              </BusinessShape>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mb-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">خطط الأسعار</h2>
          <p className="text-gray-600">اختر الخطة التي تناسب احتياجات عملك</p>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="monthly">شهري</TabsTrigger>
              <TabsTrigger value="yearly">سنوي</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle>الباقة الأساسية</CardTitle>
                  <CardDescription>مناسبة للشركات الناشئة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">500</span>
                    <span className="text-gray-500 ml-1">ريال/شهر</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي صغير
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع قياسي
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني أساسي
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="h-4 w-4 ml-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      خدمات الواقع الافتراضي
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">اختر الباقة</Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="border-2 border-primary relative">
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs rounded-bl-lg">الأكثر شعبية</div>
                <CardHeader>
                  <CardTitle>الباقة المميزة</CardTitle>
                  <CardDescription>للشركات المتوسطة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">1200</span>
                    <span className="text-gray-500 ml-1">ريال/شهر</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي متوسط
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع متميز
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      خدمات واقع افتراضي أساسية
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني على مدار الساعة
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90">اختر الباقة</Button>
                </CardFooter>
              </Card>

              {/* VIP Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle>الباقة الذهبية</CardTitle>
                  <CardDescription>للشركات الكبيرة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">2500</span>
                    <span className="text-gray-500 ml-1">ريال/شهر</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي كبير
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع بالقرب من المدخل
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      خدمات واقع افتراضي متكاملة
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني وتسويقي متخصص
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">اختر الباقة</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle>الباقة الأساسية</CardTitle>
                  <CardDescription>مناسبة للشركات الناشئة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">5000</span>
                    <span className="text-gray-500 ml-1">ريال/سنة</span>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200 font-normal">
                    وفر 1000 ريال
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي صغير
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع قياسي
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني أساسي
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="h-4 w-4 ml-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      خدمات الواقع الافتراضي
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">اختر الباقة</Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="border-2 border-primary relative">
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs rounded-bl-lg">الأكثر شعبية</div>
                <CardHeader>
                  <CardTitle>الباقة المميزة</CardTitle>
                  <CardDescription>للشركات المتوسطة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">12000</span>
                    <span className="text-gray-500 ml-1">ريال/سنة</span>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200 font-normal">
                    وفر 2400 ريال
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي متوسط
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع متميز
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      خدمات واقع افتراضي أساسية
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني على مدار الساعة
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90">اختر الباقة</Button>
                </CardFooter>
              </Card>

              {/* VIP Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle>الباقة الذهبية</CardTitle>
                  <CardDescription>للشركات الكبيرة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">25000</span>
                    <span className="text-gray-500 ml-1">ريال/سنة</span>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200 font-normal">
                    وفر 5000 ريال
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي كبير
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع بالقرب من المدخل
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      خدمات واقع افتراضي متكاملة
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني وتسويقي متخصص
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">اختر الباقة</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-100 rounded-xl p-8 text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">ابدأ رحلتك الآن في بلدة الأمريكي</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          انضم إلى مجتمع الأعمال المزدهر في البلدة الافتراضية الأكثر ابتكاراً في العالم العربي
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          تواصل معنا للحجز
        </Button>
      </div>
    </div>
  );
}