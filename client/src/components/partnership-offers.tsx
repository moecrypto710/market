import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PartnershipPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  commissionRate: number;
  featuredPlacement: boolean;
  vrEnabled: boolean;
  arEnabled: boolean;
  storeIncluded?: boolean;
  storeSize?: 'small' | 'medium' | 'large';
  storeLocation?: 'standard' | 'premium' | 'entrance';
  price: number;
  popular?: boolean;
}

// Partnership plans for businesses
const partnershipPlans: PartnershipPlan[] = [
  {
    id: "basic",
    name: "الشراكة الأساسية",
    description: "بداية مثالية للشركات الصغيرة التي ترغب في عرض منتجاتها",
    features: [
      "عرض حتى 5 منتجات",
      "عمولة 10%",
      "دعم فني أساسي",
      "تقارير شهرية",
      "الدفع كل 30 يوم"
    ],
    commissionRate: 10,
    featuredPlacement: false,
    vrEnabled: false,
    arEnabled: false,
    price: 299
  },
  {
    id: "premium",
    name: "الشراكة المميزة",
    description: "للشركات المتوسطة التي تسعى لتوسيع نطاق وصولها",
    features: [
      "عرض حتى 20 منتج",
      "عمولة 15%",
      "مكان مميز في الصفحة الرئيسية",
      "متجر صغير في المول الافتراضي",
      "دعم فني متقدم",
      "تقارير أسبوعية",
      "دعم تقنية الواقع المعزز",
      "الدفع كل 15 يوم"
    ],
    commissionRate: 15,
    featuredPlacement: true,
    vrEnabled: false,
    arEnabled: true,
    storeIncluded: true,
    storeSize: 'small',
    storeLocation: 'standard',
    price: 599,
    popular: true
  },
  {
    id: "elite",
    name: "الشراكة النخبة",
    description: "للعلامات التجارية الكبيرة التي تريد تجربة تسوق متكاملة",
    features: [
      "عرض غير محدود للمنتجات",
      "عمولة 20%",
      "مكان مميز في جميع الصفحات",
      "متجر كبير في موقع مميز بالمول الافتراضي",
      "دعم فني متميز على مدار الساعة",
      "تقارير مفصلة يومية",
      "دعم تقنية الواقع المعزز",
      "دعم تقنية الواقع الافتراضي",
      "الدفع كل 7 أيام",
      "تحليلات مفصلة لسلوك المستخدم"
    ],
    commissionRate: 20,
    featuredPlacement: true,
    vrEnabled: true,
    arEnabled: true,
    storeIncluded: true,
    storeSize: 'large',
    storeLocation: 'premium',
    price: 999
  }
];

// Virtual store rental options
const storeRentalOptions = [
  {
    id: "small-standard",
    size: "small",
    location: "standard",
    name: "متجر صغير - موقع عادي",
    dimensions: "10م² افتراضية",
    price: 299,
    duration: "شهر",
    maxProducts: 10,
    features: [
      "مساحة عرض أساسية",
      "موقع في منطقة التسوق العامة",
      "لافتة بسيطة للمتجر",
      "إضاءة قياسية",
      "رف عرض واحد"
    ]
  },
  {
    id: "medium-standard",
    size: "medium",
    location: "standard",
    name: "متجر متوسط - موقع عادي",
    dimensions: "25م² افتراضية",
    price: 499,
    duration: "شهر",
    maxProducts: 25,
    features: [
      "مساحة عرض متوسطة",
      "موقع في منطقة التسوق العامة",
      "لافتة مميزة للمتجر",
      "إضاءة مخصصة",
      "3 أرفف عرض",
      "نقطة خدمة عملاء"
    ]
  },
  {
    id: "medium-premium",
    size: "medium",
    location: "premium",
    name: "متجر متوسط - موقع مميز",
    dimensions: "25م² افتراضية",
    price: 799,
    duration: "شهر",
    maxProducts: 25,
    features: [
      "مساحة عرض متوسطة",
      "موقع مميز قرب المدخل الرئيسي",
      "لافتة كبيرة ثلاثية الأبعاد",
      "إضاءة مخصصة فاخرة",
      "4 أرفف عرض",
      "نقطة خدمة عملاء",
      "مؤثرات صوتية خاصة"
    ]
  },
  {
    id: "large-premium",
    size: "large",
    location: "premium",
    name: "متجر كبير - موقع مميز",
    dimensions: "50م² افتراضية",
    price: 1299,
    duration: "شهر",
    maxProducts: 50,
    features: [
      "مساحة عرض كبيرة",
      "موقع مميز قرب المدخل الرئيسي",
      "واجهة متجر فاخرة قابلة للتخصيص",
      "إضاءة احترافية متغيرة الألوان",
      "عدد غير محدود من أرفف العرض",
      "نقطة خدمة عملاء مع مساعد افتراضي",
      "مؤثرات صوتية وبصرية خاصة",
      "تجارب تفاعلية للمنتجات"
    ]
  },
  {
    id: "flagship-entrance",
    size: "large",
    location: "entrance",
    name: "متجر رئيسي - عند المدخل",
    dimensions: "100م² افتراضية",
    price: 2499,
    duration: "شهر",
    maxProducts: 100,
    features: [
      "أكبر مساحة عرض متاحة",
      "موقع حصري عند مدخل المول",
      "واجهة متجر فاخرة مخصصة بالكامل",
      "نظام إضاءة متطور قابل للبرمجة",
      "تصميم داخلي من اختيارك",
      "فريق خدمة عملاء افتراضي كامل",
      "مؤثرات خاصة حصرية",
      "فعاليات دورية داخل المتجر",
      "إحصائيات زوار متقدمة"
    ]
  }
];

// Types of partnerships
type PartnershipType = "brand" | "influencer" | "retailer";

interface PartnershipOffersProps {
  type?: PartnershipType;
  showContactForm?: boolean;
}

export default function PartnershipOffers({ 
  type = "brand", 
  showContactForm = true 
}: PartnershipOffersProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<PartnershipType>(type);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
    planId: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanSelection = (planId: string) => {
    setFormData(prev => ({ ...prev, planId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.companyName || !formData.email || !formData.message) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // Success message
    toast({
      title: "تم إرسال طلبك بنجاح",
      description: "سيتواصل فريقنا معك قريباً لمناقشة تفاصيل الشراكة",
    });

    // Reset form
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      message: "",
      planId: ""
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">برنامج الشراكات للشركات</h2>
        <div className="bg-[#5e35b1]/10 p-5 rounded-lg mb-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-3">
            <i className="fas fa-building text-[#5e35b1] text-3xl mr-3"></i>
            <h3 className="text-xl font-bold text-[#5e35b1]">فرص الشراكة الحصرية للشركات</h3>
          </div>
          <p className="text-gray-700">
            نقدم برامج شراكة مصممة خصيصًا للشركات والعلامات التجارية لتوسيع انتشارها وزيادة مبيعاتها من خلال منصتنا المتطورة والمميزة بتقنيات الواقع الافتراضي والمعزز.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#5e35b1]/20 flex items-center justify-center mb-3">
              <i className="fas fa-store text-[#5e35b1] text-xl"></i>
            </div>
            <h3 className="font-bold mb-2">متاجر افتراضية</h3>
            <p className="text-sm text-gray-600 text-center">
              احصل على متجر خاص بك في المول الافتراضي لعرض منتجاتك بتقنية ثلاثية الأبعاد
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#5e35b1]/20 flex items-center justify-center mb-3">
              <i className="fas fa-handshake text-[#5e35b1] text-xl"></i>
            </div>
            <h3 className="font-bold mb-2">عمولات تنافسية</h3>
            <p className="text-sm text-gray-600 text-center">
              استفد من برنامج العمولات للشركاء مع معدلات أعلى وتسويات مالية سريعة
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#5e35b1]/20 flex items-center justify-center mb-3">
              <i className="fas fa-chart-bar text-[#5e35b1] text-xl"></i>
            </div>
            <h3 className="font-bold mb-2">تحليلات متقدمة</h3>
            <p className="text-sm text-gray-600 text-center">
              تقارير تفصيلية عن أداء منتجاتك ومتجرك الافتراضي وسلوك المستخدمين
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 max-w-3xl mx-auto">
          انضم إلى مجموعة من أفضل العلامات التجارية واستفد من فرص النمو الهائلة في سوق التسوق الافتراضي
        </p>
      </div>

      <Tabs 
        defaultValue={activeTab} 
        onValueChange={(value) => setActiveTab(value as PartnershipType)}
        className="w-full mb-10"
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="brand">العلامات التجارية</TabsTrigger>
          <TabsTrigger value="store">استئجار متجر افتراضي</TabsTrigger>
          <TabsTrigger value="influencer">المؤثرين</TabsTrigger>
          <TabsTrigger value="retailer">تجار التجزئة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="brand">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnershipPlans.map((plan) => (
              <Card key={plan.id} className={`border ${plan.popular ? 'border-[#5e35b1] shadow-lg' : 'border-gray-200'} h-full flex flex-col`}>
                {plan.popular && (
                  <div className="bg-[#5e35b1] text-white text-center py-1 text-sm font-medium">
                    الأكثر شعبية
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                    </div>
                    {plan.featuredPlacement && (
                      <Badge variant="outline" className="bg-[#5e35b1]/10 text-[#5e35b1] border-[#5e35b1]/20">
                        مكان مميز
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-[#5e35b1]">{plan.price}</span>
                    <span className="text-xl mr-1 text-[#5e35b1]">ج.م</span>
                    <span className="text-gray-500 text-sm">/شهرياً</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mt-4">
                    <div className="flex items-center mb-3">
                      <Badge className="mr-2 bg-[#5e35b1]">عمولة {plan.commissionRate}%</Badge>
                      {plan.vrEnabled && (
                        <Badge variant="outline" className="mr-2 border-green-200 bg-green-100 text-green-800">
                          دعم VR
                        </Badge>
                      )}
                      {plan.arEnabled && (
                        <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                          دعم AR
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mb-2">المميزات:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <i className="fas fa-check text-[#5e35b1] mt-1 ml-2"></i>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handlePlanSelection(plan.id)} 
                    className={`w-full ${plan.popular ? 'bg-[#5e35b1] hover:bg-[#4527a0]' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    اختيار هذه الباقة
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="store">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#ff9800]/20 to-transparent p-6 rounded-lg border border-[#ff9800]/20 mb-8">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <i className="fas fa-store text-[#ff9800] ml-2"></i>
                  استئجار متجر افتراضي
                </h3>
                <p className="mb-4">
                  احصل على متجرك الخاص في المول الافتراضي واعرض منتجاتك في بيئة ثلاثية الأبعاد تفاعلية. يمكن للعملاء زيارة متجرك والتجول فيه واستكشاف منتجاتك بتجربة مميزة.
                </p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-info-circle text-[#ff9800]"></i>
                  <p className="text-sm text-gray-600">
                    جميع عقود الإيجار تجدد شهرياً ويمكنك إلغاء الاشتراك في أي وقت.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeRentalOptions.map((option) => (
                <Card key={option.id} className="flex flex-col overflow-hidden border border-gray-200">
                  <div className={`h-2 ${option.location === 'premium' ? 'bg-amber-500' : option.location === 'entrance' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{option.name}</h3>
                        <p className="text-sm text-gray-500">{option.dimensions}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${option.location === 'premium' 
                            ? 'bg-amber-100 text-amber-800 border-amber-200' 
                            : option.location === 'entrance'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }
                        `}
                      >
                        {option.location === 'premium' 
                          ? 'موقع مميز' 
                          : option.location === 'entrance'
                            ? 'عند المدخل'
                            : 'موقع عادي'
                        }
                      </Badge>
                    </div>
                    
                    <div className="mt-4 flex items-end">
                      <span className="text-3xl font-bold text-gray-800">{option.price}</span>
                      <span className="text-xl ml-1 text-gray-800">ج.م</span>
                      <span className="text-gray-500 text-sm">/{option.duration}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow pb-2">
                    <div className="flex items-center mb-3 text-sm">
                      <div className="bg-gray-100 px-2 py-1 rounded-full flex items-center">
                        <i className="fas fa-box ml-1 text-gray-600"></i>
                        <span>حتى {option.maxProducts} منتج</span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-sm mb-2">مميزات المتجر:</h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <i className="fas fa-check text-green-500 mt-1 ml-2"></i>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <div className="p-4 bg-gray-50 mt-2">
                    <div className="flex space-x-4 space-x-reverse">
                      <Button 
                        className={`flex-1 ${
                          option.location === 'premium' 
                            ? 'bg-amber-500 hover:bg-amber-600' 
                            : option.location === 'entrance'
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        onClick={() => handlePlanSelection(option.id)}
                      >
                        استئجار الآن
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center"
                      >
                        <i className="fas fa-vr-cardboard"></i>
                        <span className="mr-2">معاينة</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-bold mb-4">متطلبات المتجر الافتراضي</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2 flex items-center">
                    <i className="fas fa-images text-blue-500 ml-2"></i>
                    المواد المطلوبة
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                      <span>صور عالية الدقة للمنتجات (1200×1200 بكسل أو أعلى)</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                      <span>شعار الشركة بخلفية شفافة (PNG)</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                      <span>وصف تفصيلي للمنتجات</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                      <span>مواد تسويقية للعرض داخل المتجر</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center">
                    <i className="fas fa-cogs text-purple-500 ml-2"></i>
                    ما نوفره لك
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                      <span>تصميم وتنفيذ المتجر الافتراضي في غضون 7 أيام عمل</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                      <span>دعم فني على مدار الأسبوع</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                      <span>تقارير أسبوعية عن زيارات المتجر</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                      <span>تحديثات مجانية للتصميم كل 3 أشهر</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="influencer">
          <div className="bg-gradient-to-r from-[#5e35b1]/10 to-transparent p-8 rounded-lg border border-[#5e35b1]/20">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">برنامج المؤثرين</h3>
              <p className="mb-6">
                برنامج خاص للمؤثرين على وسائل التواصل الاجتماعي. انضم إلينا وابدأ بالترويج لمنتجاتنا واكسب عمولات مجزية على كل عملية بيع.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center ml-3">
                      <i className="fas fa-comments text-[#5e35b1]"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">محتوى مخصص</h4>
                      <p className="text-sm text-gray-600">محتوى ترويجي مخصص حسب جمهورك</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center ml-3">
                      <i className="fas fa-hand-holding-usd text-[#5e35b1]"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">عمولات مرتفعة</h4>
                      <p className="text-sm text-gray-600">عمولات تصل إلى 25% لكل عملية بيع</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center ml-3">
                      <i className="fas fa-gift text-[#5e35b1]"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">منتجات مجانية</h4>
                      <p className="text-sm text-gray-600">منتجات مجانية للمراجعة والترويج</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center ml-3">
                      <i className="fas fa-chart-line text-[#5e35b1]"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">تحليلات متقدمة</h4>
                      <p className="text-sm text-gray-600">تتبع أداء حملاتك بدقة</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button className="bg-[#5e35b1] hover:bg-[#4527a0]">
                  التسجيل كمؤثر
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="retailer">
          <div className="bg-gradient-to-r from-[#03a9f4]/10 to-transparent p-8 rounded-lg border border-[#03a9f4]/20">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">برنامج تجار التجزئة</h3>
              <p className="mb-6">
                فرصة لتجار التجزئة للوصول إلى قاعدة عملاء أكبر من خلال منصتنا. وسع نطاق عملك وزد مبيعاتك معنا.
              </p>
              
              <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h4 className="text-xl font-bold mb-4">مميزات البرنامج</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex">
                    <i className="fas fa-check-circle text-[#03a9f4] mt-1 ml-2"></i>
                    <span>الوصول إلى قاعدة عملاء واسعة</span>
                  </div>
                  <div className="flex">
                    <i className="fas fa-check-circle text-[#03a9f4] mt-1 ml-2"></i>
                    <span>نظام إدارة مخزون متقدم</span>
                  </div>
                  <div className="flex">
                    <i className="fas fa-check-circle text-[#03a9f4] mt-1 ml-2"></i>
                    <span>معالجة طلبات آلية</span>
                  </div>
                  <div className="flex">
                    <i className="fas fa-check-circle text-[#03a9f4] mt-1 ml-2"></i>
                    <span>خدمة شحن متكاملة</span>
                  </div>
                  <div className="flex">
                    <i className="fas fa-check-circle text-[#03a9f4] mt-1 ml-2"></i>
                    <span>تسويات مالية أسبوعية</span>
                  </div>
                  <div className="flex">
                    <i className="fas fa-check-circle text-[#03a9f4] mt-1 ml-2"></i>
                    <span>دعم فني على مدار الساعة</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button className="bg-[#03a9f4] hover:bg-[#0288d1]">
                  التسجيل كتاجر تجزئة
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {showContactForm && (
        <div className="mt-16 bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">تواصل معنا للشراكة</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium mb-1">اسم الشركة *</label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="اسم الشركة أو العلامة التجارية"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium mb-1">اسم المسؤول</label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="اسم الشخص المسؤول"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">البريد الإلكتروني *</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@company.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">رقم الهاتف</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="رقم الهاتف للتواصل"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium mb-1">تفاصيل طلب الشراكة *</label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="اكتب تفاصيل عن منتجاتك والباقة التي تهمك"
                  rows={5}
                  required
                />
              </div>
              
              <div className="text-center">
                <Button type="submit" className="bg-[#5e35b1] hover:bg-[#4527a0] px-8">
                  إرسال طلب الشراكة
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}