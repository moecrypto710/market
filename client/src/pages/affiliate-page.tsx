import { useQuery } from "@tanstack/react-query";
import { Product, Affiliate } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import CopyLink from "@/components/copy-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SocialShare from "@/components/social-share";
import { useState } from "react";

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

export default function AffiliatePage() {
  const { user } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const { data: affiliate } = useQuery<Affiliate>({
    queryKey: ['/api/affiliate'],
  });
  
  const { data: promotedProducts } = useQuery<Product[]>({
    queryKey: ['/api/products/promoted'],
  });
  
  const earnings = affiliate?.earnings || 0;
  const conversions = affiliate?.conversions || 0;
  
  // تحديد المستوى الحالي والتالي
  const currentTier = affiliate?.tier || "basic";
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
  
  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">برنامج التسويق بالعمولة</h2>
        <Badge className="bg-gradient-to-r from-[#5e35b1] to-[#7c4dff] text-white">
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
            <Card className="bg-black border border-white/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white/70">الأرباح الإجمالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{earnings} <span className="text-sm">ج.م</span></div>
                <div className="mt-2 text-xs text-white/50">
                  تُدفع الأرباح شهرياً عند الوصول للحد الأدنى (500 ج.م)
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black border border-white/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white/70">إجمالي التحويلات</CardTitle>
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
          <Card className="mb-6 bg-black border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">التقدم للمستوى التالي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">المستوى الحالي: {currentTierInfo?.name}</span>
                <span className="text-white/70">المستوى التالي: {nextTierInfo?.name}</span>
              </div>
              <Progress value={progressToNextTier} className="h-2 mb-2" />
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
          <Card className="bg-black border border-white/10 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">رابط الإحالة الخاص بك</CardTitle>
            </CardHeader>
            <CardContent>
              <CopyLink affiliateCode={user?.affiliateCode || ''} />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <i className="fab fa-facebook-f ml-2"></i>
                  مشاركة على فيسبوك
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <i className="fab fa-twitter ml-2"></i>
                  مشاركة على تويتر
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
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
                <CardTitle className="text-base text-white">أدوات ترويج المنتج</CardTitle>
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
                      <Button size="sm">نسخ</Button>
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
                      value={`تسوقوا الآن من متجر "مول أمريكي" منتج "${selectedProduct.name}" بسعر ${selectedProduct.price} ج.م فقط! منتج أصلي 100% مع ضمان الجودة وخدمة التوصيل السريع لباب المنزل. استخدموا الرابط للطلب: https://amrikymall.com/product/${selectedProduct.id}?ref=${user?.affiliateCode}`}
                    />
                    <Button size="sm" className="mt-2">نسخ النص</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="resources">
          {/* موارد وأدوات التسويق بالعمولة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-black border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">استراتيجيات التسويق الناجحة</CardTitle>
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
            
            <Card className="bg-black border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">أفضل الممارسات للمسوقين بالعمولة</CardTitle>
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
          <Card className="bg-black border border-white/10 mb-4">
            <CardHeader>
              <CardTitle className="text-lg">أدوات تسويقية جاهزة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <i className="fas fa-image text-3xl mb-2 text-[#5e35b1]"></i>
                  <h4 className="font-bold mb-1">صور وبانرات</h4>
                  <p className="text-xs text-white/70 mb-2">بانرات وصور جاهزة بمقاسات مختلفة للترويج</p>
                  <Button size="sm" variant="outline" className="text-xs">تنزيل</Button>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <i className="fas fa-file-alt text-3xl mb-2 text-[#5e35b1]"></i>
                  <h4 className="font-bold mb-1">قوالب نصية</h4>
                  <p className="text-xs text-white/70 mb-2">نصوص إعلانية جاهزة للتعديل والاستخدام المباشر</p>
                  <Button size="sm" variant="outline" className="text-xs">تنزيل</Button>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <i className="fas fa-chart-bar text-3xl mb-2 text-[#5e35b1]"></i>
                  <h4 className="font-bold mb-1">تقارير الأداء</h4>
                  <p className="text-xs text-white/70 mb-2">إحصاءات تفصيلية ورؤى لتحسين استراتيجيتك</p>
                  <Button size="sm" variant="outline" className="text-xs">عرض التقارير</Button>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="font-bold mb-2">تحتاج مساعدة؟</h4>
                <p className="text-sm text-white/70 mb-3">فريق دعم المسوقين بالعمولة متاح للمساعدة في كل ما يخص البرنامج</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <i className="fas fa-question-circle ml-1"></i>
                    الأسئلة الشائعة
                  </Button>
                  <Button size="sm" className="text-xs bg-[#5e35b1] hover:bg-[#4527a0]">
                    <i className="fas fa-headset ml-1"></i>
                    طلب مساعدة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
