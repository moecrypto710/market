import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const storeLocationOptions = [
  { value: "standard", label: "موقع قياسي", description: "موقع عادي في المول الافتراضي", price: 500 },
  { value: "premium", label: "موقع مميز", description: "موقع في منطقة عالية الزيارة", price: 1000 },
  { value: "entrance", label: "موقع المدخل", description: "موقع بالقرب من مدخل المول الافتراضي", price: 1500 },
  { value: "central", label: "موقع مركزي", description: "موقع في قلب المول الافتراضي", price: 2000 },
];

const storeSizeOptions = [
  { value: "small", label: "متجر صغير", description: "مساحة صغيرة لعرض منتجاتك", price: 300 },
  { value: "medium", label: "متجر متوسط", description: "مساحة متوسطة لعرض مجموعة منتجات", price: 600 },
  { value: "large", label: "متجر كبير", description: "مساحة كبيرة لعرض مجموعات واسعة", price: 1200 },
  { value: "flagship", label: "متجر رئيسي", description: "أكبر مساحة متاحة مع ميزات حصرية", price: 2500 },
];

const designTemplateOptions = [
  { value: "standard", label: "تصميم قياسي", description: "تصميم بسيط وأنيق", price: 0 },
  { value: "modern", label: "تصميم عصري", description: "تصميم حديث بلمسات مستقبلية", price: 200 },
  { value: "luxury", label: "تصميم فاخر", description: "تصميم فاخر لعلامات تجارية راقية", price: 500 },
  { value: "arabic", label: "تصميم عربي", description: "تصميم بطابع عربي أصيل", price: 300 },
];

// Duration options in months
const durationOptions = [1, 3, 6, 12, 24];

export default function StoreRentalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formStep, setFormStep] = useState<'start' | 'details' | 'payment' | 'success'>('start');
  
  // Store rental form state
  const [storeDetails, setStoreDetails] = useState({
    name: "",
    description: "",
    size: "medium",
    location: "standard",
    designTemplate: "standard",
    durationMonths: 3,
    customThemeColor: "#5e35b1",
    brandLogo: null as File | null,
    agree3DTerms: false,
    agreePaymentTerms: false,
  });
  
  // Store rental mock data for display
  const [myStores, setMyStores] = useState([
    {
      id: 1,
      name: "متجر الأزياء العصرية",
      location: "premium",
      size: "large",
      status: "active",
      startDate: "2025-03-01",
      endDate: "2025-09-01",
      visitorCount: 1245,
      conversionRate: 3.2,
    },
  ]);
  
  const calculateRentalPrice = () => {
    const sizePrice = storeSizeOptions.find(o => o.value === storeDetails.size)?.price || 0;
    const locationPrice = storeLocationOptions.find(o => o.value === storeDetails.location)?.price || 0;
    const templatePrice = designTemplateOptions.find(o => o.value === storeDetails.designTemplate)?.price || 0;
    
    const monthlyPrice = sizePrice + locationPrice + templatePrice;
    const totalPrice = monthlyPrice * storeDetails.durationMonths;
    
    return {
      monthly: monthlyPrice,
      total: totalPrice,
      currency: "ج.م" // Egyptian Pounds
    };
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStoreDetails({
      ...storeDetails,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setStoreDetails({
      ...storeDetails,
      [name]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 'start') {
      setFormStep('details');
    } else if (formStep === 'details') {
      // Validate required fields
      if (!storeDetails.name || !storeDetails.description || !storeDetails.agree3DTerms) {
        toast({
          title: "يرجى ملء جميع الحقول المطلوبة",
          description: "جميع الحقول المميزة بعلامة * مطلوبة",
          variant: "destructive",
        });
        return;
      }
      setFormStep('payment');
    } else if (formStep === 'payment') {
      // Process payment and submit the form
      if (!storeDetails.agreePaymentTerms) {
        toast({
          title: "يرجى الموافقة على شروط الدفع",
          description: "يجب الموافقة على شروط الدفع للمتابعة",
          variant: "destructive",
        });
        return;
      }
      
      // Simulate successful store creation
      setTimeout(() => {
        setFormStep('success');
        // Add new store to myStores
        const newStore = {
          id: myStores.length + 1,
          name: storeDetails.name,
          location: storeDetails.location,
          size: storeDetails.size,
          status: "active",
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + storeDetails.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          visitorCount: 0,
          conversionRate: 0,
        };
        setMyStores([...myStores, newStore]);
        
        toast({
          title: "تم إنشاء المتجر بنجاح",
          description: "سيتم تفعيل متجرك خلال 24 ساعة",
        });
      }, 1500);
    }
  };
  
  const resetForm = () => {
    setFormStep('start');
    setStoreDetails({
      name: "",
      description: "",
      size: "medium",
      location: "standard",
      designTemplate: "standard",
      durationMonths: 3,
      customThemeColor: "#5e35b1",
      brandLogo: null,
      agree3DTerms: false,
      agreePaymentTerms: false,
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Price calculation
  const price = calculateRentalPrice();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-white flex flex-col">
        <span>إيجار المتاجر الافتراضية</span>
        <span className="text-base font-normal text-white/60">أنشئ متجرك الخاص في المول الافتراضي</span>
      </h1>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 bg-white/5">
          <TabsTrigger value="browse">المتاجر المتاحة</TabsTrigger>
          <TabsTrigger value="my-stores">متاجري</TabsTrigger>
          <TabsTrigger value="rent">استئجار متجر جديد</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Premium Locations */}
            <Card className="bg-gradient-to-br from-[#e65c00]/80 to-[#f9d423]/80 border-0 overflow-hidden relative">
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/90 text-[#e65c00] hover:bg-white">موقع مميز</Badge>
              </div>
              <CardHeader>
                <CardTitle>مواقع المدخل الرئيسي</CardTitle>
                <CardDescription className="text-white/90">رؤية مضمونة من جميع الزوار</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-black/40 flex items-center justify-center mb-4">
                  <i className="fas fa-store text-6xl text-white/70"></i>
                </div>
                <div className="text-lg font-bold">1,500 ج.م / شهرياً</div>
                <div className="text-sm text-white/80">موقع بالقرب من المدخل الرئيسي للمول</div>
                <ul className="mt-3 space-y-1 text-sm">
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> زيارات مضمونة عالية</li>
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> رؤية من جميع نقاط المول</li>
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> دعم فني متميز</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-white text-[#e65c00] hover:bg-white/90">استأجر الآن</Button>
              </CardFooter>
            </Card>
            
            {/* Central Locations */}
            <Card className="bg-gradient-to-br from-[#5e35b1]/80 to-[#7e57c2]/80 border-0 overflow-hidden relative">
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/90 text-[#5e35b1] hover:bg-white">موقع مركزي</Badge>
              </div>
              <CardHeader>
                <CardTitle>مواقع مركزية</CardTitle>
                <CardDescription className="text-white/90">في قلب نشاط المول الافتراضي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-black/40 flex items-center justify-center mb-4">
                  <i className="fas fa-building text-6xl text-white/70"></i>
                </div>
                <div className="text-lg font-bold">2,000 ج.م / شهرياً</div>
                <div className="text-sm text-white/80">موقع في مركز المول مع حركة عالية</div>
                <ul className="mt-3 space-y-1 text-sm">
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> مساحة أكبر للعرض</li>
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> إمكانية تصميم خاص</li>
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> تحليلات متقدمة للزوار</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-white text-[#5e35b1] hover:bg-white/90">استأجر الآن</Button>
              </CardFooter>
            </Card>
            
            {/* Standard Locations */}
            <Card className="bg-gradient-to-br from-[#1e88e5]/80 to-[#64b5f6]/80 border-0 overflow-hidden relative">
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/90 text-[#1e88e5] hover:bg-white">موقع قياسي</Badge>
              </div>
              <CardHeader>
                <CardTitle>مواقع قياسية</CardTitle>
                <CardDescription className="text-white/90">مواقع بأسعار معقولة للشركات الناشئة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md bg-black/40 flex items-center justify-center mb-4">
                  <i className="fas fa-shopping-bag text-6xl text-white/70"></i>
                </div>
                <div className="text-lg font-bold">500 ج.م / شهرياً</div>
                <div className="text-sm text-white/80">موقع بسعر اقتصادي لبدء تواجدك الافتراضي</div>
                <ul className="mt-3 space-y-1 text-sm">
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> سهولة البدء</li>
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> تدريب وتوجيه</li>
                  <li className="flex items-center"><i className="fas fa-check ml-2 text-white/80"></i> إمكانية الترقية</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-white text-[#1e88e5] hover:bg-white/90">استأجر الآن</Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Store Size Options */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-6">اختر حجم المتجر المناسب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storeSizeOptions.map((size) => (
              <Card key={size.value} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardHeader>
                  <CardTitle>{size.label}</CardTitle>
                  <CardDescription>{size.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{size.price} <span className="text-sm">ج.م / شهرياً</span></div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">اختر هذا الحجم</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Benefits */}
          <div className="mt-12 px-4 py-8 bg-white/5 rounded-lg">
            <h2 className="text-2xl font-bold text-white text-center mb-8">مميزات إيجار المتاجر الافتراضية</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#5e35b1] rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">زيادة المبيعات</h3>
                <p className="text-white/70">توسيع نطاق وصولك إلى العملاء من خلال وجود افتراضي جذاب</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#5e35b1] rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-vr-cardboard text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">تجربة تفاعلية</h3>
                <p className="text-white/70">منح العملاء تجربة تسوق فريدة وجذابة تزيد من تفاعلهم</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#5e35b1] rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-analytics text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">بيانات وتحليلات</h3>
                <p className="text-white/70">اكتساب رؤى قيمة حول سلوك العملاء وتفضيلاتهم</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="my-stores" className="space-y-6">
          {myStores.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-store-slash text-3xl text-white/70"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">لا توجد متاجر حالياً</h3>
              <p className="text-white/70 mb-6">لم تقم بإنشاء أي متاجر افتراضية بعد</p>
              <Button>استئجار متجر جديد</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myStores.map((store) => (
                  <Card key={store.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors overflow-hidden">
                    <div className={`h-1.5 w-full ${getStatusColor(store.status)}`}></div>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle>{store.name}</CardTitle>
                        <CardDescription>
                          {storeSizeOptions.find(s => s.value === store.size)?.label} - {' '}
                          {storeLocationOptions.find(l => l.value === store.location)?.label}
                        </CardDescription>
                      </div>
                      <Badge variant={store.status === 'active' ? 'default' : 'outline'}>
                        {store.status === 'active' ? 'نشط' : store.status === 'pending' ? 'قيد المراجعة' : 'منتهي'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">تاريخ البدء:</span>
                        <span>{store.startDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">تاريخ الانتهاء:</span>
                        <span>{store.endDate}</span>
                      </div>
                      
                      <Separator className="my-2 bg-white/10" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold">{store.visitorCount.toLocaleString()}</div>
                          <div className="text-xs text-white/70">عدد الزيارات</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold">{store.conversionRate}%</div>
                          <div className="text-xs text-white/70">معدل التحويل</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit ml-2"></i>
                        تعديل
                      </Button>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-chart-pie ml-2"></i>
                        التحليلات
                      </Button>
                      <Button size="sm">
                        <i className="fas fa-eye ml-2"></i>
                        زيارة المتجر
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-white/5 border-white/10 p-4">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-[#5e35b1]/30 to-[#7e57c2]/30 p-4 rounded-lg">
                      <h3 className="text-lg font-bold mb-1">إجمالي المتاجر</h3>
                      <div className="text-3xl font-bold">{myStores.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#4caf50]/30 to-[#81c784]/30 p-4 rounded-lg">
                      <h3 className="text-lg font-bold mb-1">إجمالي الزيارات</h3>
                      <div className="text-3xl font-bold">{myStores.reduce((sum, store) => sum + store.visitorCount, 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#ff9800]/30 to-[#ffb74d]/30 p-4 rounded-lg">
                      <h3 className="text-lg font-bold mb-1">متوسط معدل التحويل</h3>
                      <div className="text-3xl font-bold">
                        {(myStores.reduce((sum, store) => sum + store.conversionRate, 0) / myStores.length).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="rent">
          {formStep === 'success' ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 mx-auto bg-[#4caf50]/20 text-[#4caf50] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-check text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">تم استئجار المتجر بنجاح</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                تم استلام طلبك بنجاح. سيتم مراجعة معلومات المتجر وتفعيله خلال 24 ساعة. يمكنك متابعة حالة المتجر في قسم "متاجري".
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={resetForm}>
                  <i className="fas fa-plus ml-2"></i>
                  استئجار متجر آخر
                </Button>
                <Button>
                  <i className="fas fa-store ml-2"></i>
                  عرض متاجري
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>
                    {formStep === 'start' ? 'استئجار متجر افتراضي جديد' : 
                     formStep === 'details' ? 'تفاصيل المتجر الافتراضي' : 'إتمام عملية الدفع'}
                  </CardTitle>
                  <CardDescription>
                    {formStep === 'start' ? 'اختر خصائص متجرك الافتراضي في المول' : 
                     formStep === 'details' ? 'أدخل المعلومات التفصيلية للمتجر' : 'إكمال عملية استئجار المتجر'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formStep === 'start' && (
                    <>
                      <div className="space-y-4">
                        <Label>موقع المتجر</Label>
                        <RadioGroup 
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          value={storeDetails.location}
                          onValueChange={(value) => handleSelectChange('location', value)}
                        >
                          {storeLocationOptions.map((option) => (
                            <Label
                              key={option.value}
                              htmlFor={`location-${option.value}`}
                              className="flex flex-col items-start space-y-2 border border-white/10 rounded-md p-4 cursor-pointer hover:bg-white/5"
                            >
                              <div className="flex items-center space-x-2 w-full justify-between">
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`location-${option.value}`}
                                  />
                                  <span className="font-medium">{option.label}</span>
                                </div>
                                <span className="text-sm font-bold">{option.price} ج.م</span>
                              </div>
                              <p className="text-white/70 text-sm">{option.description}</p>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-4 pt-6">
                        <Label>حجم المتجر</Label>
                        <RadioGroup 
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          value={storeDetails.size}
                          onValueChange={(value) => handleSelectChange('size', value)}
                        >
                          {storeSizeOptions.map((option) => (
                            <Label
                              key={option.value}
                              htmlFor={`size-${option.value}`}
                              className="flex flex-col items-start space-y-2 border border-white/10 rounded-md p-4 cursor-pointer hover:bg-white/5"
                            >
                              <div className="flex items-center space-x-2 w-full justify-between">
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`size-${option.value}`}
                                  />
                                  <span className="font-medium">{option.label}</span>
                                </div>
                                <span className="text-sm font-bold">{option.price} ج.م</span>
                              </div>
                              <p className="text-white/70 text-sm">{option.description}</p>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-4 pt-6">
                        <Label htmlFor="duration">مدة الإيجار</Label>
                        <Select 
                          value={storeDetails.durationMonths.toString()} 
                          onValueChange={(value) => handleSelectChange('durationMonths', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المدة" />
                          </SelectTrigger>
                          <SelectContent>
                            {durationOptions.map((months) => (
                              <SelectItem key={months} value={months.toString()}>
                                {months} {months === 1 ? 'شهر' : months < 11 ? 'أشهر' : 'شهر'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="mt-8 p-4 bg-[#5e35b1]/10 rounded-lg">
                        <div className="text-lg font-bold mb-2">ملخص التكلفة</div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>التكلفة الشهرية:</span>
                          <span>{price.monthly} {price.currency}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>مدة الإيجار:</span>
                          <span>{storeDetails.durationMonths} {storeDetails.durationMonths === 1 ? 'شهر' : storeDetails.durationMonths < 11 ? 'أشهر' : 'شهر'}</span>
                        </div>
                        <Separator className="my-2 bg-white/20" />
                        <div className="flex justify-between font-bold">
                          <span>الإجمالي:</span>
                          <span>{price.total} {price.currency}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {formStep === 'details' && (
                    <>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">اسم المتجر *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={storeDetails.name}
                            onChange={handleInputChange}
                            placeholder="أدخل اسم المتجر الافتراضي"
                            className="bg-white/5 border-white/10"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">وصف المتجر *</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={storeDetails.description}
                            onChange={handleInputChange}
                            placeholder="وصف مختصر للمتجر ومنتجاته"
                            className="bg-white/5 border-white/10 min-h-24"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label>قالب التصميم</Label>
                          <RadioGroup 
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                            value={storeDetails.designTemplate}
                            onValueChange={(value) => handleSelectChange('designTemplate', value)}
                          >
                            {designTemplateOptions.map((option) => (
                              <Label
                                key={option.value}
                                htmlFor={`template-${option.value}`}
                                className="flex flex-col items-start space-y-2 border border-white/10 rounded-md p-4 cursor-pointer hover:bg-white/5"
                              >
                                <div className="flex items-center space-x-2 w-full justify-between">
                                  <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                      value={option.value}
                                      id={`template-${option.value}`}
                                    />
                                    <span className="font-medium">{option.label}</span>
                                  </div>
                                  <span className="text-sm font-bold">{option.price > 0 ? `${option.price} ج.م` : 'مجاناً'}</span>
                                </div>
                                <p className="text-white/70 text-sm">{option.description}</p>
                              </Label>
                            ))}
                          </RadioGroup>
                        </div>
                        
                        <div>
                          <Label htmlFor="customThemeColor">لون السمة المخصص</Label>
                          <div className="flex gap-3 mt-2">
                            <Input
                              type="color"
                              id="customThemeColor"
                              name="customThemeColor"
                              value={storeDetails.customThemeColor}
                              onChange={handleInputChange}
                              className="w-12 h-10 p-1 bg-white/5 border-white/10"
                            />
                            <Input
                              type="text"
                              value={storeDetails.customThemeColor}
                              onChange={handleInputChange}
                              name="customThemeColor"
                              className="bg-white/5 border-white/10 flex-1"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="agree3DTerms"
                              checked={storeDetails.agree3DTerms}
                              onCheckedChange={(checked) => setStoreDetails({...storeDetails, agree3DTerms: checked})}
                            />
                            <Label htmlFor="agree3DTerms" className="text-sm cursor-pointer">
                              أوافق على شروط استخدام المحتوى ثلاثي الأبعاد وسياسة العرض الافتراضي *
                            </Label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {formStep === 'payment' && (
                    <>
                      <div className="p-4 bg-[#5e35b1]/10 rounded-lg mb-6">
                        <div className="text-lg font-bold mb-2">ملخص الطلب</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>اسم المتجر:</span>
                            <span>{storeDetails.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الموقع:</span>
                            <span>{storeLocationOptions.find(o => o.value === storeDetails.location)?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الحجم:</span>
                            <span>{storeSizeOptions.find(o => o.value === storeDetails.size)?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>قالب التصميم:</span>
                            <span>{designTemplateOptions.find(o => o.value === storeDetails.designTemplate)?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>المدة:</span>
                            <span>{storeDetails.durationMonths} {storeDetails.durationMonths === 1 ? 'شهر' : storeDetails.durationMonths < 11 ? 'أشهر' : 'شهر'}</span>
                          </div>
                          <Separator className="my-2 bg-white/20" />
                          <div className="flex justify-between font-bold text-base">
                            <span>الإجمالي:</span>
                            <span>{price.total} {price.currency}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>اختر طريقة الدفع</Label>
                        <RadioGroup defaultValue="credit_card" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Label
                            htmlFor="payment-cc"
                            className="flex flex-col items-start space-y-2 border border-white/10 rounded-md p-4 cursor-pointer hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                value="credit_card"
                                id="payment-cc"
                              />
                              <span className="font-medium">بطاقة ائتمان</span>
                              <div className="mr-auto flex gap-1">
                                <i className="fab fa-cc-visa text-lg"></i>
                                <i className="fab fa-cc-mastercard text-lg"></i>
                              </div>
                            </div>
                          </Label>
                          <Label
                            htmlFor="payment-bank"
                            className="flex flex-col items-start space-y-2 border border-white/10 rounded-md p-4 cursor-pointer hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                value="bank_transfer"
                                id="payment-bank"
                              />
                              <span className="font-medium">تحويل بنكي</span>
                              <i className="fas fa-university mr-auto text-lg"></i>
                            </div>
                          </Label>
                        </RadioGroup>
                        
                        {/* Payment form fields would go here */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="col-span-2">
                            <Label htmlFor="cardNumber">رقم البطاقة</Label>
                            <Input 
                              id="cardNumber" 
                              placeholder="0000 0000 0000 0000" 
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                            <Input 
                              id="expiry" 
                              placeholder="MM/YY" 
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">رمز التحقق</Label>
                            <Input 
                              id="cvv" 
                              placeholder="123" 
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="cardName">الاسم على البطاقة</Label>
                            <Input 
                              id="cardName" 
                              placeholder="الاسم كما هو مكتوب على البطاقة" 
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="agreePaymentTerms"
                              checked={storeDetails.agreePaymentTerms}
                              onCheckedChange={(checked) => setStoreDetails({...storeDetails, agreePaymentTerms: checked})}
                            />
                            <Label htmlFor="agreePaymentTerms" className="text-sm cursor-pointer">
                              أوافق على شروط الدفع وسياسة الاسترجاع
                            </Label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {formStep !== 'start' && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setFormStep(formStep === 'details' ? 'start' : 'details')}
                    >
                      <i className="fas fa-arrow-right ml-2"></i>
                      الخطوة السابقة
                    </Button>
                  )}
                  
                  <Button type="submit" className="ml-auto">
                    {formStep === 'start' ? 'المتابعة للتفاصيل' : 
                     formStep === 'details' ? 'المتابعة للدفع' : 'تأكيد وإتمام الدفع'}
                    {formStep !== 'payment' && <i className="fas fa-arrow-left mr-2"></i>}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}