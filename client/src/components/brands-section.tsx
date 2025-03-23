import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Brand {
  id: number;
  name: string;
  logo: string;
  category: string;
  featured: boolean;
  productCount: number;
  description: string;
}

const BRANDS: Brand[] = [
  {
    id: 1,
    name: "تك ستار",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=TechStar&backgroundColor=5e35b1",
    category: "electronics",
    featured: true,
    productCount: 24,
    description: "شركة رائدة في مجال الأجهزة الإلكترونية والتقنيات الحديثة"
  },
  {
    id: 2,
    name: "فاشن أرابيا",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=FashionArabia&backgroundColor=e91e63",
    category: "clothing",
    featured: true,
    productCount: 36,
    description: "علامة تجارية متخصصة في الأزياء العصرية بلمسة عربية أصيلة"
  },
  {
    id: 3,
    name: "الديار",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=HomeDeco&backgroundColor=4caf50",
    category: "home",
    featured: false,
    productCount: 18,
    description: "كل ما يخص المنزل العصري من ديكورات وأثاث بجودة عالية"
  },
  {
    id: 4,
    name: "الرياضي",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=SportsPro&backgroundColor=2196f3",
    category: "sports",
    featured: false,
    productCount: 15,
    description: "منتجات رياضية احترافية للاعبين المحترفين والهواة"
  },
  {
    id: 5,
    name: "سمارت ديفايس",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=SmartDevices&backgroundColor=ff9800",
    category: "electronics",
    featured: true,
    productCount: 21,
    description: "الأجهزة الذكية والمنزل المتصل من خلال أحدث التقنيات"
  },
  {
    id: 6,
    name: "هوم سمارت",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=HomeSmart&backgroundColor=795548",
    category: "home",
    featured: true,
    productCount: 27,
    description: "حلول ذكية للمنازل العصرية تجمع بين الراحة والتكنولوجيا"
  },
  {
    id: 7,
    name: "إليجانت",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=Elegant&backgroundColor=9c27b0",
    category: "clothing",
    featured: false,
    productCount: 32,
    description: "أزياء راقية للمناسبات والإطلالات المميزة"
  },
  {
    id: 8,
    name: "تريند",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=Trend&backgroundColor=009688",
    category: "clothing",
    featured: false,
    productCount: 29,
    description: "أحدث صيحات الموضة العالمية بأسعار مناسبة"
  }
];

// Brand categories
const CATEGORIES = [
  { id: "all", name: "جميع العلامات" },
  { id: "electronics", name: "إلكترونيات" },
  { id: "clothing", name: "ملابس" },
  { id: "home", name: "منزل" },
  { id: "sports", name: "رياضة" }
];

interface BrandsSectionProps {
  featuredOnly?: boolean;
  maxBrands?: number;
  showTitle?: boolean;
}

export default function BrandsSection({ 
  featuredOnly = false, 
  maxBrands = 8,
  showTitle = true 
}: BrandsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Filter brands based on active category and settings
  const filteredBrands = BRANDS.filter(brand => {
    if (featuredOnly && !brand.featured) return false;
    if (activeCategory !== "all" && brand.category !== activeCategory) return false;
    return true;
  }).slice(0, maxBrands);

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">العلامات التجارية المميزة</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نفخر بشراكتنا مع أفضل العلامات التجارية المحلية والعالمية لتقديم منتجات عالية الجودة
          </p>
        </div>
      )}
      
      <Tabs 
        defaultValue={activeCategory} 
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <div className="flex justify-center mb-8">
          <TabsList>
            {CATEGORIES.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredBrands.map(brand => (
                <Card key={brand.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`h-3 ${
                    brand.category === 'electronics' ? 'bg-[#5e35b1]' :
                    brand.category === 'clothing' ? 'bg-[#e91e63]' :
                    brand.category === 'home' ? 'bg-[#4caf50]' : 'bg-[#2196f3]'
                  }`}></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-100">
                        <img 
                          src={brand.logo} 
                          alt={brand.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <h3 className="font-bold text-lg mb-1">{brand.name}</h3>
                      
                      <div className="flex items-center mb-3">
                        <Badge variant="outline" className={`
                          ${brand.category === 'electronics' ? 'bg-[#5e35b1]/10 text-[#5e35b1]' :
                            brand.category === 'clothing' ? 'bg-[#e91e63]/10 text-[#e91e63]' :
                            brand.category === 'home' ? 'bg-[#4caf50]/10 text-[#4caf50]' : 
                            'bg-[#2196f3]/10 text-[#2196f3]'}
                        `}>
                          {brand.category === 'electronics' ? 'إلكترونيات' :
                           brand.category === 'clothing' ? 'ملابس' :
                           brand.category === 'home' ? 'منزل' : 'رياضة'}
                        </Badge>
                        
                        {brand.featured && (
                          <Badge className="mr-2 bg-amber-500 text-white">
                            مميز
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 h-12 overflow-hidden">
                        {brand.description}
                      </p>
                      
                      <div className="text-sm text-gray-500 mb-4">
                        <i className="fas fa-shopping-bag ml-1"></i>
                        {brand.productCount} منتج
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        عرض المنتجات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}