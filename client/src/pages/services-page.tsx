import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Sparkles, BarChart4, ShoppingBag, Calendar, Gift, Zap, Star, TrendingUp, Award } from "lucide-react";

// Service categories and offerings
const serviceCategories = [
  {
    id: "product-promotion",
    name: "خدمات ترويج المنتجات",
    description: "خدمات متخصصة لإبراز منتجاتك وزيادة مبيعاتك في بلدة الأمريكي الافتراضية"
  },
  {
    id: "vr-experience",
    name: "خدمات تصميم تجارب الواقع الافتراضي",
    description: "تصميم تجارب واقع افتراضي مخصصة لعلامتك التجارية"
  },
  {
    id: "analytics",
    name: "خدمات التحليلات والبيانات",
    description: "تحليلات متقدمة وبيانات عن سلوك المتسوقين واتجاهات السوق"
  },
  {
    id: "marketplace",
    name: "خدمات تكامل المتجر",
    description: "دمج متجرك الحالي مع منصتنا الافتراضية بسلاسة"
  },
  {
    id: "events",
    name: "استضافة الفعاليات الافتراضية",
    description: "تنظيم وإدارة الفعاليات الافتراضية المخصصة لعملائك"
  }
];

// Define services within each category
const productPromotionServices = [
  {
    id: "featured-products",
    name: "المنتجات المميزة",
    description: "عرض منتجاتك في مواقع بارزة عبر بلدة الأمريكي الافتراضية",
    price: 500,
    duration: "شهريًا",
    colorClass: "from-orange-500/80 to-amber-500/80",
    icon: Star,
    features: [
      "عرض في الصفحة الرئيسية لبلدة الأمريكي",
      "ظهور في قسم المنتجات المميزة",
      "ميزات تفاعلية متقدمة",
      "تحليلات أداء مفصلة"
    ]
  },
  {
    id: "interactive-showcase",
    name: "عرض تفاعلي للمنتجات",
    description: "تجربة ثلاثية الأبعاد تسمح للعملاء بتجربة منتجك افتراضيًا",
    price: 750,
    duration: "شهريًا",
    colorClass: "from-blue-500/80 to-cyan-500/80",
    icon: Zap,
    features: [
      "تصميم عرض ثلاثي الأبعاد",
      "خصائص تفاعلية متعددة",
      "دمج مع الواقع المعزز",
      "تحديثات فصلية للعرض"
    ]
  },
  {
    id: "seasonal-campaign",
    name: "حملة ترويجية موسمية",
    description: "حملة إعلانية شاملة لمنتجاتك خلال المواسم الرئيسية",
    price: 1200,
    duration: "لكل حملة",
    colorClass: "from-purple-500/80 to-pink-500/80",
    icon: Gift,
    features: [
      "تصميم حملة متكاملة",
      "ظهور في جميع أقسام بلدة الأمريكي",
      "إشعارات مخصصة للمستخدمين",
      "تقارير أداء مفصلة"
    ]
  }
];

const vrExperienceServices = [
  {
    id: "custom-vr-store",
    name: "تصميم متجر واقع افتراضي مخصص",
    description: "تصميم متجر فريد يعكس هوية علامتك التجارية",
    price: 5000,
    duration: "لمرة واحدة + 500 شهريًا للصيانة",
    colorClass: "from-green-500/80 to-emerald-500/80",
    icon: ShoppingBag,
    features: [
      "تصميم فريد بالكامل",
      "تجربة تفاعلية متقدمة",
      "تكامل مع منتجاتك الحالية",
      "تحديثات مجانية لمدة عام"
    ]
  },
  {
    id: "immersive-product-demo",
    name: "عروض توضيحية غامرة للمنتجات",
    description: "تجارب غامرة تسمح للعملاء باختبار منتجاتك في بيئة افتراضية",
    price: 2500,
    duration: "لكل منتج",
    colorClass: "from-red-500/80 to-orange-500/80",
    icon: Sparkles,
    features: [
      "برمجة تفاعلية متقدمة",
      "محاكاة واقعية للمنتج",
      "تخصيص كامل للتجربة",
      "تحديثات عند تغيير المنتج"
    ]
  }
];

const analyticsServices = [
  {
    id: "shopper-insights",
    name: "تحليل سلوك المتسوقين",
    description: "تقارير مفصلة عن سلوك المتسوقين واهتماماتهم",
    price: 1500,
    duration: "فصليًا",
    colorClass: "from-indigo-500/80 to-blue-500/80",
    icon: BarChart4,
    features: [
      "تحليل مسارات التسوق",
      "تقرير اهتمامات العملاء",
      "مقارنة أداء المنتجات",
      "توصيات لتحسين المبيعات"
    ]
  },
  {
    id: "market-trends",
    name: "تحليل اتجاهات السوق",
    description: "دراسات معمقة عن اتجاهات السوق والمنافسين",
    price: 2000,
    duration: "نصف سنوي",
    colorClass: "from-pink-500/80 to-rose-500/80",
    icon: TrendingUp,
    features: [
      "تحليل اتجاهات الصناعة",
      "دراسة المنافسين",
      "تحليل الفجوات في السوق",
      "توقعات مستقبلية"
    ]
  }
];

const marketplaceServices = [
  {
    id: "ecommerce-integration",
    name: "تكامل متجرك الإلكتروني",
    description: "ربط متجرك الإلكتروني الحالي مع منصتنا الافتراضية",
    price: 3000,
    duration: "لمرة واحدة + 300 شهريًا",
    colorClass: "from-teal-500/80 to-green-500/80",
    icon: ShoppingBag,
    features: [
      "ربط كامل للمنتجات",
      "مزامنة أتوماتيكية للمخزون",
      "نظام دفع موحد",
      "دعم فني متواصل"
    ]
  }
];

const eventsServices = [
  {
    id: "virtual-product-launch",
    name: "إطلاق منتج افتراضي",
    description: "تنظيم حدث افتراضي مميز لإطلاق منتجك الجديد",
    price: 8000,
    duration: "لكل حدث",
    colorClass: "from-fuchsia-500/80 to-purple-500/80",
    icon: Calendar,
    features: [
      "تصميم مساحة افتراضية مخصصة",
      "دعوات خاصة للعملاء",
      "عروض تفاعلية للمنتج",
      "تسجيل الحدث للاستخدام اللاحق"
    ]
  },
  {
    id: "vip-virtual-gathering",
    name: "لقاء افتراضي للعملاء المميزين",
    description: "استضافة لقاء حصري للعملاء المميزين في بيئة افتراضية فاخرة",
    price: 5000,
    duration: "لكل حدث",
    colorClass: "from-amber-500/80 to-yellow-500/80",
    icon: Award,
    features: [
      "بيئة افتراضية فاخرة",
      "دعوات مخصصة",
      "هدايا افتراضية للحاضرين",
      "خدمة عملاء متميزة"
    ]
  }
];

// Map categories to service arrays
const servicesByCategory = {
  "product-promotion": productPromotionServices,
  "vr-experience": vrExperienceServices,
  "analytics": analyticsServices,
  "marketplace": marketplaceServices,
  "events": eventsServices
};

export default function ServicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("product-promotion");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
    startDate: "",
    serviceType: ""
  });

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setFormData({
      ...formData,
      serviceType: service.name
    });
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we would normally submit the form to a backend API
    // For now, we'll just show a success toast
    toast({
      title: "تم استلام طلبك",
      description: `سنتواصل معك قريبًا بخصوص خدمة "${selectedService?.name}"`,
    });
    
    setIsDialogOpen(false);
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      message: "",
      startDate: "",
      serviceType: ""
    });
  };

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-pink-500">
          خدماتنا للشركات والعلامات التجارية
        </h1>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          نقدم مجموعة متكاملة من الخدمات المصممة خصيصًا للشركات والعلامات التجارية لتعزيز تواجدها في عالم التسوق الافتراضي
        </p>
      </div>

      {/* Services Category Tabs */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-5 mb-8 bg-white/5">
          {serviceCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs md:text-sm">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {serviceCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <p className="text-white/70">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesByCategory[category.id as keyof typeof servicesByCategory].map(service => (
                <Card key={service.id} className={`bg-gradient-to-br ${service.colorClass} border-0 overflow-hidden relative h-full`}>
                  <CardHeader>
                    <div className="absolute top-3 right-3 bg-white/20 p-2 rounded-full">
                      <service.icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription className="text-white/90">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 font-bold text-xl">
                      {service.price} <span className="text-base font-normal">ج.م {service.duration}</span>
                    </div>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="ml-2 h-4 w-4" />
                          <span className="text-white/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleServiceSelect(service)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    >
                      طلب الخدمة
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Custom Business Solutions */}
      <div className="mt-16 py-12 px-6 bg-gradient-to-r from-purple-900/40 to-fuchsia-900/40 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDEwMGMwLTUwIDUwLTUwIDUwIDBzLTUwIDUwLTUwIDAgNTAtNTAgNTAgMC01MCA1MC01MCAwIDUwLTUwIDUwIDBNMCAwaDIwMHYyMDBIMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-10"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center mb-6">حلول أعمال مخصصة</h2>
          <p className="text-lg text-white/80 text-center max-w-3xl mx-auto mb-8">
            نقدم حلولًا مخصصة تمامًا لاحتياجات عملك الفريدة. تواصل مع فريقنا لبناء استراتيجية متكاملة تناسب أهداف علامتك التجارية.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 p-6 rounded-xl hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 rounded-full bg-fuchsia-500/30 flex items-center justify-center mb-4">
                <i className="fas fa-handshake text-xl text-fuchsia-300"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">شراكات استراتيجية</h3>
              <p className="text-white/70">شراكات استراتيجية طويلة المدى مع علامات تجارية رائدة</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-xl hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 rounded-full bg-fuchsia-500/30 flex items-center justify-center mb-4">
                <i className="fas fa-drafting-compass text-xl text-fuchsia-300"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">حلول مخصصة</h3>
              <p className="text-white/70">تطوير حلول تقنية وتسويقية مخصصة تمامًا لاحتياجاتك</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-xl hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 rounded-full bg-fuchsia-500/30 flex items-center justify-center mb-4">
                <i className="fas fa-chart-pie text-xl text-fuchsia-300"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">استشارات استراتيجية</h3>
              <p className="text-white/70">خدمات استشارية متكاملة للتسويق في عالم الواقع الافتراضي</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-8 py-6 text-lg">
              تواصل مع فريق المبيعات
            </Button>
          </div>
        </div>
      </div>
      
      {/* Success Stories */}
      {/* Partnership Programs */}
      <div className="mt-16 py-10 px-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full filter blur-3xl -mr-20 -mt-20 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full filter blur-3xl -ml-20 -mb-20 opacity-20"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">برامج الشراكة والعمولة</h2>
          <p className="text-lg text-white/80 text-center max-w-3xl mx-auto mb-10">
            انضم إلى شبكة شركائنا وكن جزءًا من أكبر مشروع واقع افتراضي للأعمال في المنطقة
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Partnership Program */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 transform transition-all hover:scale-[1.02] hover:border-white/30">
              <div className="mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 flex items-center justify-center mb-4">
                  <Handshake className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">برنامج الشراكات</h3>
                <p className="text-white/70 mb-6">
                  انضم إلى شركائنا وكن جزءًا من أكبر مشروع واقع افتراضي للأعمال في المنطقة
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-fuchsia-400" />
                  <span className="text-white/80">عرض متجرك لآلاف الزوار يوميًا</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-fuchsia-400" />
                  <span className="text-white/80">دعم فني واستشاري متكامل</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-fuchsia-400" />
                  <span className="text-white/80">فرص تسويقية حصرية للشركاء</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-fuchsia-400" />
                  <span className="text-white/80">إحصائيات وتحليلات متقدمة</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
                onClick={() => handleServiceSelect({
                  id: "partnership-program",
                  name: "برنامج الشراكات",
                  price: "يختلف حسب الباقة"
                })}
              >
                قدم طلب شراكة
              </Button>
            </div>
            
            {/* Affiliate Program */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 transform transition-all hover:scale-[1.02] hover:border-white/30">
              <div className="mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center mb-4">
                  <CircleDollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">برنامج التسويق بالعمولة</h3>
                <p className="text-white/70 mb-6">
                  اربح من خلال تسويق بلدة الأمريكي واحصل على عمولات مجزية لكل اشتراك جديد
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400" />
                  <span className="text-white/80">عمولة تصل إلى 20% من اشتراكات العملاء الجدد</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400" />
                  <span className="text-white/80">روابط تسويقية خاصة بك</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400" />
                  <span className="text-white/80">لوحة تحكم لمتابعة الأرباح والعمولات</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400" />
                  <span className="text-white/80">دفعات شهرية مباشرة إلى حسابك</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                onClick={() => handleServiceSelect({
                  id: "affiliate-program",
                  name: "برنامج التسويق بالعمولة",
                  price: "بدون رسوم اشتراك"
                })}
              >
                اشترك في البرنامج
              </Button>
            </div>
          </div>
          
          {/* CTA for Partnership Details */}
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => window.open("/partnership-details.pdf", "_blank")}
            >
              تحميل دليل الشراكات والعمولات
              <i className="fas fa-download mr-2 text-xs"></i>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-12">قصص نجاح شركائنا</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 relative">
            <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-xl font-bold">S</span>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">سامسونج</h3>
              <p className="text-white/70 mb-4">
                "حققنا زيادة بنسبة 40% في مبيعات سلسلة Galaxy الجديدة من خلال إطلاقها في بلدة الأمريكي الافتراضية. تجربة مذهلة!"
              </p>
              <div className="text-sm text-white/50">مدير التسويق الرقمي</div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 relative">
            <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <span className="text-xl font-bold">A</span>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">أديداس</h3>
              <p className="text-white/70 mb-4">
                "المتجر الافتراضي ثلاثي الأبعاد الخاص بنا يتيح للعملاء تجربة الأحذية قبل الشراء، مما قلل معدلات الإرجاع بنسبة 35%."
              </p>
              <div className="text-sm text-white/50">رئيس قسم التجارة الإلكترونية</div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 relative">
            <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <span className="text-xl font-bold">L</span>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">لوريال</h3>
              <p className="text-white/70 mb-4">
                "تجربة تجريب المكياج افتراضيًا كانت نقلة نوعية لمبيعاتنا. مشاركة المستخدمين زادت بنسبة 120% مع خدمة الواقع المعزز."
              </p>
              <div className="text-sm text-white/50">مدير الابتكار الرقمي</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">طلب خدمة {selectedService?.name}</DialogTitle>
            <DialogDescription>
              يرجى تعبئة النموذج التالي وسيتواصل معك فريق المبيعات خلال 24 ساعة.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">اسم الشركة *</Label>
                <Input 
                  id="companyName" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">اسم المسؤول *</Label>
                <Input 
                  id="contactName" 
                  name="contactName" 
                  value={formData.contactName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">التاريخ المفضل للبدء</Label>
              <Input 
                id="startDate" 
                name="startDate" 
                type="date" 
                value={formData.startDate} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">تفاصيل إضافية</Label>
              <Textarea 
                id="message" 
                name="message" 
                value={formData.message} 
                onChange={handleInputChange} 
                rows={4} 
                placeholder="يرجى ذكر أي متطلبات أو استفسارات خاصة" 
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" className="w-full">إرسال الطلب</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}