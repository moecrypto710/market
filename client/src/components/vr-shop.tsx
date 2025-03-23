import { useState, useEffect, useRef } from "react";
import { useVR } from "@/hooks/use-vr";
import { Product } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

interface VRShopProps {
  products: Product[];
}

// Avatar selections with personality traits
const AVATARS = [
  { 
    id: 1, 
    name: "أحمد", 
    image: "https://api.dicebear.com/7.x/personas/svg?seed=John&backgroundColor=b6e3f4",
    personality: "محب للتكنولوجيا",
    favoriteCategory: "electronics"
  },
  { 
    id: 2, 
    name: "سارة", 
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Jane&backgroundColor=c0aede",
    personality: "أنيقة ومتابعة للموضة",
    favoriteCategory: "clothing"
  },
  { 
    id: 3, 
    name: "ياسين", 
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Kid&backgroundColor=d1d4f9",
    personality: "نشيط ورياضي",
    favoriteCategory: "sports"
  },
  { 
    id: 4, 
    name: "ليلى", 
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Lily&backgroundColor=f9d1d1",
    personality: "مهتمة بالديكور المنزلي",
    favoriteCategory: "home"
  },
];

export default function VRShop({ products }: VRShopProps) {
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<typeof AVATARS[0] | null>(null);
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 70 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<typeof brandPartners[0] | null>(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const shopRef = useRef<HTMLDivElement>(null);
  const { vrEnabled, gestureControlEnabled } = useVR();
  
  // Track if the user is dragging the avatar
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
  });
  
  // Handle keyboard movement
  useEffect(() => {
    if (!selectedAvatar || !vrEnabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const STEP = 5;
      
      switch (e.key) {
        case "ArrowUp":
          setAvatarPosition(prev => ({ ...prev, y: Math.max(10, prev.y - STEP) }));
          break;
        case "ArrowDown":
          setAvatarPosition(prev => ({ ...prev, y: Math.min(90, prev.y + STEP) }));
          break;
        case "ArrowLeft":
          setAvatarPosition(prev => ({ ...prev, x: Math.max(10, prev.x - STEP) }));
          break;
        case "ArrowRight":
          setAvatarPosition(prev => ({ ...prev, x: Math.min(90, prev.x + STEP) }));
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAvatar, vrEnabled]);
  
  // Handle avatar dragging
  useEffect(() => {
    if (!selectedAvatar || !vrEnabled || !shopRef.current) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && e.target.classList.contains('avatar')) {
        dragRef.current.isDragging = true;
        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      
      const shopRect = shopRef.current!.getBoundingClientRect();
      
      setAvatarPosition(prev => ({
        x: Math.min(90, Math.max(10, prev.x + (deltaX / shopRect.width) * 100)),
        y: Math.min(90, Math.max(10, prev.y + (deltaY / shopRect.height) * 100)),
      }));
    };
    
    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
    };
    
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [selectedAvatar, vrEnabled]);
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "تمت الإضافة للسلة",
        description: selectedProduct ? `تمت إضافة ${selectedProduct.name} إلى سلة التسوق.` : "تمت إضافة المنتج إلى سلة التسوق",
      });
      setSelectedProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Check if avatar is near a product
  useEffect(() => {
    if (!selectedAvatar || !vrEnabled) return;
    
    // Find product near avatar
    const nearbyProduct = products.find((product, index) => {
      const productX = 20 + (index % 3) * 30; // Distribute products in 3 columns
      const productY = 30 + Math.floor(index / 3) * 30; // And multiple rows
      
      const distance = Math.sqrt(
        Math.pow(productX - avatarPosition.x, 2) + 
        Math.pow(productY - avatarPosition.y, 2)
      );
      
      return distance < 15; // Proximity threshold
    });
    
    setSelectedProduct(nearbyProduct || null);
  }, [avatarPosition, products, selectedAvatar, vrEnabled]);
  
  if (!vrEnabled) {
    return null;
  }
  
  // If no avatar selected, show avatar selection
  if (!selectedAvatar) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-gradient-to-tr from-[#2a1f6f] to-[#5e35b1]/80 rounded-lg p-8 max-w-3xl w-full shadow-xl shadow-purple-900/20">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">اختر شخصيتك الافتراضية</h2>
          <p className="text-white/60 text-center mb-8">اختر الشخصية التي تفضلها لتجربة التسوق</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {AVATARS.map(avatar => (
              <div 
                key={avatar.id}
                className="bg-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 
                           hover:bg-white/20 hover:scale-105 hover:shadow-lg border border-white/10 
                           hover:border-[#ffeb3b]/50 flex flex-col items-center"
                onClick={() => setSelectedAvatar(avatar)}
              >
                <div className="w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                  <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg mb-1">{avatar.name}</h3>
                <p className="text-xs text-white/70 text-center">{avatar.personality}</p>
                
                <div className="mt-3 text-xs flex items-center">
                  <span className="px-2 py-1 bg-[#ffeb3b]/20 text-[#ffeb3b] rounded-full">
                    يفضل: {
                      avatar.favoriteCategory === 'electronics' ? 'إلكترونيات' :
                      avatar.favoriteCategory === 'clothing' ? 'ملابس' :
                      avatar.favoriteCategory === 'home' ? 'منزل' : 'رياضة'
                    }
                  </span>
                </div>
                
                <button className="mt-4 w-full py-2 bg-[#ffeb3b] text-[#2a1f6f] rounded-lg font-bold text-sm hover:bg-[#ffeb3b]/90 transition">
                  اختيار
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center text-sm text-white/60 mt-8">
            سيتم توجيهك إلى المتجر الافتراضي بعد اختيار الشخصية
          </div>
        </div>
      </div>
    );
  }
  
  // Group products by category
  const productsByCategory = products.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, Product[]>);
  
  // Brand partners with locations in the VR mall
  const brandPartners = [
    { 
      id: 1, 
      name: "تك ستار", 
      logo: "https://api.dicebear.com/7.x/identicon/svg?seed=TechStar&backgroundColor=5e35b1",
      category: "electronics",
      x: 20, 
      y: 25,
      featured: true,
      storeSize: "large",
      storeType: "premium",
      description: "متجر متخصص في أحدث المنتجات التكنولوجية والإلكترونيات الذكية",
      productCount: 24,
    },
    { 
      id: 2, 
      name: "فاشن أرابيا", 
      logo: "https://api.dicebear.com/7.x/identicon/svg?seed=FashionArabia&backgroundColor=e91e63",
      category: "clothing",
      x: 70, 
      y: 25,
      featured: true,
      storeSize: "large",
      storeType: "premium",
      description: "أحدث صيحات الموضة العربية والعالمية بتصاميم مميزة وحصرية",
      productCount: 42,
    },
    { 
      id: 3, 
      name: "الديار", 
      logo: "https://api.dicebear.com/7.x/identicon/svg?seed=HomeDeco&backgroundColor=4caf50",
      category: "home",
      x: 20, 
      y: 75,
      featured: false,
      storeSize: "medium",
      storeType: "standard",
      description: "كل ما تحتاجه لمنزلك من أثاث عصري وتجهيزات منزلية أنيقة",
      productCount: 18,
    },
    { 
      id: 4, 
      name: "الرياضي", 
      logo: "https://api.dicebear.com/7.x/identicon/svg?seed=SportsPro&backgroundColor=2196f3",
      category: "sports",
      x: 70, 
      y: 75,
      featured: false,
      storeSize: "medium",
      storeType: "standard",
      description: "كل ما يخص الرياضة من ملابس ومعدات وأدوات رياضية احترافية",
      productCount: 15,
    },
    { 
      id: 5, 
      name: "سمارت ديفايس", 
      logo: "https://api.dicebear.com/7.x/identicon/svg?seed=SmartDevices&backgroundColor=ff9800",
      category: "electronics",
      x: 30, 
      y: 35,
      featured: true,
      storeSize: "medium",
      storeType: "premium",
      description: "متخصصون في الأجهزة الذكية وإنترنت الأشياء وتقنيات المنزل الذكي",
      productCount: 29,
    },
    { 
      id: 6, 
      name: "لاكشري ستايل", 
      logo: "https://api.dicebear.com/7.x/identicon/svg?seed=LuxuryStyle&backgroundColor=9c27b0",
      category: "clothing",
      x: 80, 
      y: 40,
      featured: true,
      storeSize: "small",
      storeType: "entrance",
      description: "منتجات فاخرة وماركات عالمية حصرية للعملاء المميزين",
      productCount: 12,
    },
    { 
      id: 7, 
      name: "تك هب", 
      logo: "https://api.dicebear.com/7.x/identicon/svg?seed=TechHub&backgroundColor=03a9f4",
      category: "electronics",
      x: 45, 
      y: 15,
      featured: true,
      storeSize: "flagship",
      storeType: "entrance",
      description: "المتجر الرئيسي للتكنولوجيا الحديثة وأحدث المنتجات التقنية",
      productCount: 50,
    },
  ];

  // Mall floor plan with realistic store locations and experiences
  const storeSections = [
    // Main mall structure
    { id: 'main-entrance', name: 'المدخل الرئيسي', x: 50, y: 5, width: 30, height: 10, type: 'entrance', icon: 'door-open', backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.3)' },
    { id: 'central-plaza', name: 'الساحة المركزية', x: 50, y: 40, width: 20, height: 20, type: 'plaza', icon: 'compass', backgroundColor: 'rgba(94,53,177,0.1)', borderColor: 'rgba(94,53,177,0.3)' },
    { id: 'west-wing', name: 'الجناح الغربي', x: 25, y: 30, width: 40, height: 50, type: 'wing', backgroundColor: 'rgba(0,0,0,0.1)', borderColor: 'rgba(255,255,255,0.1)' },
    { id: 'east-wing', name: 'الجناح الشرقي', x: 75, y: 30, width: 40, height: 50, type: 'wing', backgroundColor: 'rgba(0,0,0,0.1)', borderColor: 'rgba(255,255,255,0.1)' },
    { id: 'food-court', name: 'منطقة المطاعم', x: 50, y: 85, width: 40, height: 15, type: 'special', icon: 'utensils', backgroundColor: 'rgba(244,114,182,0.1)', borderColor: 'rgba(244,114,182,0.2)' },
    { id: 'vr-experience', name: 'تجربة الواقع الافتراضي', x: 50, y: 60, width: 15, height: 15, type: 'special', icon: 'vr-cardboard', backgroundColor: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.2)' },
    
    // Category zones
    { id: 'electronics', name: 'منطقة الإلكترونيات', x: 25, y: 30, width: 25, height: 25, type: 'category', icon: 'laptop', backgroundColor: 'rgba(14,165,233,0.05)', borderColor: 'rgba(14,165,233,0.15)' },
    { id: 'clothing', name: 'منطقة الأزياء', x: 75, y: 30, width: 25, height: 25, type: 'category', icon: 'tshirt', backgroundColor: 'rgba(236,72,153,0.05)', borderColor: 'rgba(236,72,153,0.15)' },
    { id: 'home', name: 'منطقة المنزل', x: 25, y: 70, width: 25, height: 20, type: 'category', icon: 'couch', backgroundColor: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.15)' },
    { id: 'sports', name: 'منطقة الرياضة', x: 75, y: 70, width: 25, height: 20, type: 'category', icon: 'dumbbell', backgroundColor: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.15)' },
    
    // Premium stores with better positioning
    { id: 'tech-flagship', name: 'متجر التكنولوجيا الرئيسي', x: 50, y: 20, width: 12, height: 12, type: 'store', storeId: 7, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', isPremium: true },
    { id: 'fashion-premium', name: 'متجر الأزياء الفاخر', x: 65, y: 20, width: 10, height: 10, type: 'store', storeId: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', isPremium: true },
    { id: 'tech-star', name: 'تك ستار', x: 20, y: 25, width: 10, height: 10, type: 'store', storeId: 1, backgroundColor: 'rgba(94,53,177,0.1)', borderColor: 'rgba(94,53,177,0.2)' },
    { id: 'fashion-arabia', name: 'فاشن أرابيا', x: 80, y: 25, width: 10, height: 10, type: 'store', storeId: 2, backgroundColor: 'rgba(233,30,99,0.1)', borderColor: 'rgba(233,30,99,0.2)' },
    { id: 'smart-devices', name: 'سمارت ديفايس', x: 30, y: 35, width: 8, height: 8, type: 'store', storeId: 5, backgroundColor: 'rgba(255,152,0,0.1)', borderColor: 'rgba(255,152,0,0.2)' },
    { id: 'home-deco', name: 'الديار', x: 20, y: 75, width: 10, height: 10, type: 'store', storeId: 3, backgroundColor: 'rgba(76,175,80,0.1)', borderColor: 'rgba(76,175,80,0.2)' },
    { id: 'sports-pro', name: 'الرياضي', x: 80, y: 75, width: 10, height: 10, type: 'store', storeId: 4, backgroundColor: 'rgba(33,150,243,0.1)', borderColor: 'rgba(33,150,243,0.2)' },
  ];
  
  // Get current section based on avatar position
  const getCurrentSection = () => {
    return storeSections.find(section => {
      return (
        avatarPosition.x >= section.x - section.width/2 &&
        avatarPosition.x <= section.x + section.width/2 &&
        avatarPosition.y >= section.y - section.height/2 &&
        avatarPosition.y <= section.y + section.height/2
      );
    });
  };
  
  const currentSection = getCurrentSection();
  
  return (
    <div 
      ref={shopRef}
      className="fixed inset-0 bg-[#070314]/95 backdrop-blur-md z-50 overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(94, 53, 177, 0.1) 0%, rgba(16, 6, 54, 0.2) 50%, rgba(7, 3, 20, 0.3) 100%)',
      }}
    >
      {/* Dynamic atmosphere effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {/* Abstract grid lines */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(transparent 0%, transparent calc(100% - 1px), rgba(255, 255, 255, 0.1) 100%), linear-gradient(to right, transparent 0%, transparent calc(100% - 1px), rgba(255, 255, 255, 0.1) 100%)',
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center bottom',
        }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-purple-500 rounded-full animate-float1"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-float2"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-amber-400 rounded-full animate-float3"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-float4"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-float5"></div>
      </div>
      
      {/* Atmospheric fog/glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#5e35b1]/10 via-transparent to-transparent opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-1/2 h-1/4 bg-[#5e35b1]/5 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/5 bg-[#ff9800]/5 blur-3xl rounded-full"></div>
      {/* Immersive VR controls and status */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/60 rounded-lg p-2 backdrop-blur-sm border border-white/10">
        <div className="rounded-full w-3 h-3 bg-green-500 animate-pulse"></div>
        <span className="text-xs text-white">جلسة الواقع الافتراضي نشطة</span>
        <div className="mr-4 border-r border-white/20 h-4"></div>
        <div className="flex items-center gap-1">
          <i className="fas fa-keyboard text-white/60 text-xs"></i>
          <span className="text-white/60 text-xs">أسهم التحكم للحركة</span>
        </div>
        <div className="flex items-center gap-1 mr-2">
          <i className="fas fa-mouse text-white/60 text-xs"></i>
          <span className="text-white/60 text-xs">سحب للتحريك</span>
        </div>
      </div>
      {/* Shop map in corner */}
      <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-2 z-50">
        <div className="relative w-32 h-32 bg-white/10 rounded-lg overflow-hidden border border-white/20">
          {storeSections.map(section => (
            <div
              key={section.id}
              className="absolute border border-white/30 rounded bg-white/10"
              style={{
                left: `${section.x - section.width/2}%`,
                top: `${section.y - section.height/2}%`,
                width: `${section.width}%`,
                height: `${section.height}%`,
                opacity: currentSection?.id === section.id ? 0.8 : 0.4,
                backgroundColor: currentSection?.id === section.id ? '#5e35b1' : 'transparent'
              }}
            >
              <span className="absolute bottom-1 right-1 text-[6px] font-bold">
                {section.name}
              </span>
            </div>
          ))}
          
          {/* Avatar position on map */}
          <div 
            className="absolute w-3 h-3 bg-[#ffeb3b] rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${avatarPosition.x}%`,
              top: `${avatarPosition.y}%`,
              boxShadow: '0 0 0 2px rgba(255,235,59,0.3), 0 0 0 4px rgba(255,235,59,0.2)'
            }}
          />
        </div>
      </div>

      {/* Virtual shop floor */}
      <div className="absolute inset-10 bg-white/5 rounded-xl border border-white/10">
        {/* Store sections/zones */}
        {storeSections.map(section => (
          <div
            key={section.id}
            className="absolute border-2 border-white/10 rounded-xl bg-white/5"
            style={{
              left: `${section.x - section.width/2}%`,
              top: `${section.y - section.height/2}%`,
              width: `${section.width}%`,
              height: `${section.height}%`,
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 px-3 py-1 rounded-full text-sm">
              {section.name}
            </div>
            
            {/* Section-specific visuals */}
            {section.id === 'electronics' && (
              <div className="absolute top-4 left-4 text-4xl opacity-20">
                <i className="fas fa-laptop"></i>
              </div>
            )}
            {section.id === 'clothing' && (
              <div className="absolute top-4 left-4 text-4xl opacity-20">
                <i className="fas fa-tshirt"></i>
              </div>
            )}
            {section.id === 'home' && (
              <div className="absolute top-4 left-4 text-4xl opacity-20">
                <i className="fas fa-couch"></i>
              </div>
            )}
            {section.id === 'sports' && (
              <div className="absolute top-4 left-4 text-4xl opacity-20">
                <i className="fas fa-dumbbell"></i>
              </div>
            )}
          </div>
        ))}
        
        {/* Section dividers/walls */}
        <div className="absolute left-1/2 top-10 bottom-10 w-0.5 bg-white/10 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-white/10 -translate-y-1/2"></div>
        
        {/* Products displayed on shelves - For now, all products should be displayed as clothing */}
        {products.map((product, index) => {
          // Force all products to be displayed in the clothing section for now
          const section = storeSections[1]; // clothing section
          
          // Calculate position within the clothing section
          const productsCount = products.length;
          const rows = Math.ceil(productsCount / 4);
          const cols = Math.min(productsCount, 4);
          
          const rowIndex = Math.floor(index / 4);
          const colIndex = index % 4;
          
          // Calculate grid position within section with better distribution
          const gridX = section.x - section.width/2 + section.width * (colIndex + 0.5) / cols;
          const gridY = section.y - section.height/2 + section.height * (rowIndex + 0.5) / rows;
          
          // Add slight random offset for more natural look
          const randomOffsetX = (Math.random() - 0.5) * 5;
          const randomOffsetY = (Math.random() - 0.5) * 5;
          
          return (
            <div 
              key={product.id}
              className="absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
              style={{ 
                left: `${gridX + randomOffsetX}%`, 
                top: `${gridY + randomOffsetY}%`,
                zIndex: selectedProduct?.id === product.id ? 5 : 1
              }}
              onClick={() => setSelectedProduct(product)}
            >
              <div className={`w-16 h-16 rounded-md overflow-hidden shadow-lg ${selectedProduct?.id === product.id ? 'ring-2 ring-[#ffeb3b] scale-110' : ''}`}>
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs mt-1 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-full whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">
                {product.name}
              </div>
              
              {/* Price tag */}
              <div className="absolute -right-2 -top-2 bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full transform rotate-12 border border-amber-300">
                {(product.price / 100).toFixed(0)} ج.م
              </div>
            </div>
          );
        })}
        
        {/* Store decorations */}
        <div className="absolute left-[30%] top-[50%] w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <i className="fas fa-shopping-cart text-white/20 text-2xl"></i>
        </div>
        <div className="absolute right-[30%] top-[50%] w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <i className="fas fa-tag text-white/20 text-2xl"></i>
        </div>
        
        {/* Special mall areas */}
        <div className="absolute left-[45%] top-[50%] w-14 h-14 bg-[#5e35b1]/30 rounded-full flex items-center justify-center">
          <i className="fas fa-handshake text-white/50 text-2xl"></i>
        </div>
        <div className="absolute left-[45%] top-[90%] w-14 h-14 bg-[#4caf50]/30 rounded-full flex items-center justify-center">
          <i className="fas fa-utensils text-white/50 text-2xl"></i>
        </div>
        <div className="absolute left-[45%] top-[10%] w-14 h-14 bg-[#2196f3]/30 rounded-full flex items-center justify-center">
          <i className="fas fa-door-open text-white/50 text-2xl"></i>
        </div>
        
        {/* Brand partner stores */}
        {brandPartners.map(brand => (
          <div
            key={brand.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
            style={{ 
              left: `${brand.x}%`, 
              top: `${brand.y}%`,
            }}
            onClick={() => {
              setSelectedBrand(brand);
              setShowStoreDetails(true);
            }}
          >
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${brand.featured ? 'border-amber-400' : 'border-white/20'}`}>
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`mt-1 px-2 py-0.5 rounded-full text-xs bg-black/50 ${brand.featured ? 'border border-amber-400/50' : ''}`}>
              {brand.name}
            </div>
            {brand.featured && (
              <div className="mt-1 px-1 py-0.5 bg-amber-500/80 rounded-full text-[8px] text-black font-bold">
                شريك مميز
              </div>
            )}
            
            {/* Store type badge */}
            <div className={`
              absolute top-0 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[6px] font-bold
              ${brand.storeType === 'premium' ? 'bg-amber-500' : 
                brand.storeType === 'entrance' ? 'bg-red-500' : 'bg-blue-500'}
            `}>
              {brand.storeSize === 'large' ? 'L' : 
               brand.storeSize === 'medium' ? 'M' : 
               brand.storeSize === 'flagship' ? 'XL' : 'S'}
            </div>
          </div>
        ))}
        
        {/* Avatar with movement effects */}
        <div 
          className="avatar absolute cursor-move transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${avatarPosition.x}%`, 
            top: `${avatarPosition.y}%`,
            transition: gestureControlEnabled ? 'none' : 'left 0.3s ease, top 0.3s ease',
            zIndex: 10
          }}
        >
          {/* Glow effect around avatar (pulsing) */}
          <div 
            className="absolute inset-0 rounded-full bg-[#ffeb3b]/20 animate-pulse"
            style={{
              transform: 'scale(1.5)',
              filter: 'blur(8px)',
              opacity: 0.5
            }}
          ></div>
          
          {/* Movement indicator arrow */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-6 h-6 animate-bounce">
            <div className="h-3 w-6 bg-[#ffeb3b] clip-arrow opacity-60"></div>
          </div>
          
          {/* Avatar character */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-[#ffeb3b] relative shadow-lg shadow-[#ffeb3b]/20">
            <img 
              src={selectedAvatar.image} 
              alt={selectedAvatar.name} 
              className="w-full h-full object-cover"
            />
            
            {/* Name tag above avatar */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 px-2 py-1 rounded-full text-xs whitespace-nowrap">
              {selectedAvatar.name}
            </div>
            
            {/* If trying on a product, show it on the avatar */}
            {isTryingOn && selectedProduct && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  className="w-2/3 h-2/3 object-contain"
                  style={{ 
                    filter: 'brightness(1.2) contrast(0.8)',
                    mixBlendMode: 'overlay'
                  }}
                />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#5e35b1] px-2 py-1 rounded-full text-[10px] text-white whitespace-nowrap">
                  تجربة {selectedProduct.name}
                </div>
              </div>
            )}
          </div>
          
          {/* Shadow below avatar */}
          <div className="w-12 h-3 bg-black/30 rounded-full mx-auto -mt-1 blur-sm"></div>
          
          {/* Animation effects handled by global css */}
        </div>
        
        {/* Section indicator */}
        {currentSection && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            أنت في قسم: {currentSection.name}
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-lg p-3 flex items-center gap-4">
        <div className="text-sm text-white/80">
          {gestureControlEnabled 
            ? "اسحب الشخصية للتنقل" 
            : "استخدم الأسهم للتنقل"}
        </div>
        
        <div className="h-6 w-px bg-white/20"></div>
        
        <button 
          className="text-sm text-white/80 hover:text-white"
          onClick={() => setSelectedAvatar(null)}
        >
          <i className="fas fa-sync-alt mr-1"></i>
          تغيير الشخصية
        </button>
        
        <div className="h-6 w-px bg-white/20"></div>
        
        <button 
          className="text-sm text-white/80 hover:text-white"
          onClick={() => setShowHelpMenu(!showHelpMenu)}
        >
          <i className="fas fa-question-circle mr-1"></i>
          مساعدة
        </button>
      </div>
      
      {/* Help floating button - always visible with glow effect */}
      <button
        className="fixed bottom-20 right-6 z-50 bg-gradient-to-r from-[#5e35b1] to-[#3f1dcb] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_15px_rgba(94,53,177,0.6)] hover:shadow-[0_0_20px_rgba(94,53,177,0.8)] hover:scale-110 transition-all duration-300"
        onClick={() => setShowHelpMenu(!showHelpMenu)}
        style={{
          animation: showHelpMenu ? 'none' : 'pulse 2s infinite'
        }}
      >
        <i className="fas fa-question-circle text-2xl"></i>
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
      </button>
      
      {/* Help Menu Dialog */}
      {showHelpMenu && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] bg-black/60 backdrop-blur-md">
          <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-[#5e35b1]/40 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-[#5e35b1]/40 to-transparent blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-tr from-[#ff9800]/30 to-transparent blur-2xl"></div>
            
            <div className="flex items-start justify-between mb-6 relative">
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5e35b1] to-[#ff9800]">دليل التسوق الافتراضي</h2>
                <p className="text-white/60 mt-1">تجربة تسوق مع الواقع الافتراضي</p>
              </div>
              
              <button 
                className="text-white/60 hover:text-white rounded-full w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                onClick={() => setShowHelpMenu(false)}
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Tasks */}
              <div className="order-2 md:order-1">
                <h3 className="font-bold text-xl mb-4 flex items-center text-white">
                  <span className="w-8 h-8 rounded-full bg-[#5e35b1]/20 flex items-center justify-center mr-2">
                    <i className="fas fa-tasks text-[#5e35b1]"></i>
                  </span>
                  مهام التسوق الافتراضي
                </h3>
                
                <div className="space-y-3">
                  {[
                    { id: 'move', title: 'تحرك في المول الافتراضي', description: 'استخدم أسهم لوحة المفاتيح أو اسحب الشخصية للتنقل في المول' },
                    { id: 'viewProduct', title: 'استعرض منتج', description: 'اقترب من المنتجات لمشاهدة تفاصيلها' },
                    { id: 'tryOn', title: 'جرب منتج', description: 'اضغط على زر "تجربة المنتج" لتجربة المنتج افتراضياً' },
                    { id: 'visitStore', title: 'زر متجر', description: 'انقر على أي متجر من متاجر الشركاء للتعرف عليه' },
                    { id: 'addToCart', title: 'أضف للسلة', description: 'أضف منتج إلى سلة التسوق الخاصة بك' }
                  ].map(task => (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-lg flex items-start gap-3 transition-all
                      ${completedTasks.includes(task.id) 
                        ? 'bg-green-900/20 border border-green-500/30' 
                        : 'bg-white/5 border border-white/10 hover:border-[#5e35b1]/30 hover:bg-[#5e35b1]/10'}`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 border ${
                        completedTasks.includes(task.id) 
                          ? 'bg-green-500 border-green-500 text-black' 
                          : 'border-white/20'
                        } flex items-center justify-center`}
                      >
                        {completedTasks.includes(task.id) && (
                          <i className="fas fa-check text-[10px]"></i>
                        )}
                      </div>
                      <div>
                        <h4 className={`font-medium ${completedTasks.includes(task.id) ? 'text-green-400' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-white/60 mt-1">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 bg-[#0f172a] p-4 rounded-lg border border-[#5e35b1]/20">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <i className="fas fa-gift text-[#ff9800]"></i>
                    <span>تفتح المزيد من الميزات عند إكمال المهام</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#5e35b1] to-[#ff9800]" 
                      style={{ width: `${(completedTasks.length / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Tips and Controls */}
              <div className="order-1 md:order-2">
                <h3 className="font-bold text-xl mb-4 flex items-center text-white">
                  <span className="w-8 h-8 rounded-full bg-[#5e35b1]/20 flex items-center justify-center mr-2">
                    <i className="fas fa-lightbulb text-[#5e35b1]"></i>
                  </span>
                  نصائح وتحكم
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-[#0f172a] p-4 rounded-lg border border-[#5e35b1]/20">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <i className="fas fa-keyboard text-[#5e35b1]"></i>
                      التحكم بلوحة المفاتيح
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-white/10 px-2 py-1 rounded text-xs text-white">↑</span>
                        <span className="text-white/60 text-sm">للأعلى</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-white/10 px-2 py-1 rounded text-xs text-white">↓</span>
                        <span className="text-white/60 text-sm">للأسفل</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-white/10 px-2 py-1 rounded text-xs text-white">←</span>
                        <span className="text-white/60 text-sm">لليسار</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-white/10 px-2 py-1 rounded text-xs text-white">→</span>
                        <span className="text-white/60 text-sm">لليمين</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#0f172a] p-4 rounded-lg border border-[#5e35b1]/20">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <i className="fas fa-mouse text-[#5e35b1]"></i>
                      التحكم بالماوس
                    </h4>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-mouse-pointer text-white/40 w-5 text-center"></i>
                        <span className="text-white/60 text-sm">انقر على المتاجر للتفاصيل</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-hand-pointer text-white/40 w-5 text-center"></i>
                        <span className="text-white/60 text-sm">اسحب الشخصية للتنقل</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* VR Tips */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] to-[#1a124a] p-4 rounded-lg border border-[#5e35b1]/40">
                    <div className="absolute -right-10 -bottom-10 opacity-20">
                      <i className="fas fa-vr-cardboard text-8xl text-[#5e35b1]"></i>
                    </div>
                    
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <i className="fas fa-star text-[#ff9800]"></i>
                      نصائح للتسوق الافتراضي
                    </h4>
                    
                    <ul className="space-y-2 mt-3 relative z-10">
                      <li className="text-white/70 text-sm flex items-start gap-2">
                        <i className="fas fa-check-circle text-green-400 mt-1 w-4"></i>
                        <span>زيارة متاجر متعددة للحصول على تجربة أفضل</span>
                      </li>
                      <li className="text-white/70 text-sm flex items-start gap-2">
                        <i className="fas fa-check-circle text-green-400 mt-1 w-4"></i>
                        <span>تجربة المنتجات قبل إضافتها للسلة</span>
                      </li>
                      <li className="text-white/70 text-sm flex items-start gap-2">
                        <i className="fas fa-check-circle text-green-400 mt-1 w-4"></i>
                        <span>استكشاف عروض الشراكة مع العلامات التجارية</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                className="bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-lg transition-colors"
                onClick={() => setShowHelpMenu(false)}
              >
                إغلاق
              </button>
              
              <button
                className="bg-gradient-to-r from-[#5e35b1] to-[#3f1dcb] text-white py-2 px-6 rounded-lg hover:shadow-lg hover:shadow-[#5e35b1]/20 transition-all"
                onClick={() => {
                  // Reset tasks or start guided tour
                  setCompletedTasks([]);
                  setShowHelpMenu(false);
                  toast({
                    title: "بدء الجولة الافتراضية",
                    description: "تم إعادة ضبط المهام، استكشف المول الافتراضي الآن!",
                  });
                }}
              >
                <i className="fas fa-play mr-2"></i>
                بدء جولة إرشادية
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Product interaction panel when near a product */}
      {selectedProduct && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-lg p-4 max-w-md w-full">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={selectedProduct.imageUrl} 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
              <p className="text-sm text-white/70">{selectedProduct.description}</p>
              <div className="mt-1 font-bold text-[#fff59d] flex items-center">
                {(selectedProduct.price / 100).toFixed(2)} ج.م
                {selectedProduct.commissionRate > 5 && (
                  <Badge variant="outline" className="mr-2 bg-[#5e35b1]/20 border-[#5e35b1]/40 text-[#a48def] text-[10px]">
                    <i className="fas fa-handshake mr-1"></i>
                    شراكة {Math.round(selectedProduct.commissionRate * 2)}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
              className={`py-2 px-4 rounded-lg ${isTryingOn ? 'bg-white/20 text-white' : 'bg-[#5e35b1] text-white'}`}
              onClick={() => setIsTryingOn(!isTryingOn)}
            >
              <i className={`fas fa-${isTryingOn ? 'times' : 'tshirt'} mr-2`}></i>
              {isTryingOn ? 'إلغاء التجربة' : 'تجربة المنتج'}
            </button>
            
            <button 
              className="bg-[#ffeb3b] text-[#2a1f6f] py-2 px-4 rounded-lg"
              onClick={() => addToCartMutation.mutate(selectedProduct.id)}
              disabled={addToCartMutation.isPending}
            >
              <i className="fas fa-shopping-cart mr-2"></i>
              {addToCartMutation.isPending ? 'جاري الإضافة...' : 'إضافة للسلة'}
            </button>
          </div>
        </div>
      )}
      
      {/* Store details popup */}
      {showStoreDetails && selectedBrand && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/40 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-[#5e35b1]/20">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 mr-4">
                  <img src={selectedBrand.logo} alt={selectedBrand.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedBrand.name}</h2>
                  <div className="flex items-center mt-1 space-x-2 space-x-reverse">
                    <Badge variant="outline" className="bg-[#5e35b1]/10 text-[#a48def] border-[#5e35b1]/20">
                      {selectedBrand.category === 'electronics' ? 'إلكترونيات' :
                       selectedBrand.category === 'clothing' ? 'ملابس' :
                       selectedBrand.category === 'home' ? 'منزل' : 'رياضة'}
                    </Badge>
                    
                    {selectedBrand.featured && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                        <i className="fas fa-star mr-1 text-[10px]"></i>
                        شريك مميز
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className={`
                      ${selectedBrand.storeType === 'premium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        selectedBrand.storeType === 'entrance' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {selectedBrand.storeType === 'premium' ? 'متجر مميز' :
                       selectedBrand.storeType === 'entrance' ? 'بمدخل المول' : 'متجر عادي'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <button 
                className="text-white/60 hover:text-white rounded-full w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10"
                onClick={() => {
                  setShowStoreDetails(false);
                  setSelectedBrand(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg mb-6">
              <p className="text-white/80">{selectedBrand.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-lg flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center mb-2">
                  <i className="fas fa-store text-[#a48def]"></i>
                </div>
                <div className="text-lg font-bold">{selectedBrand.productCount}</div>
                <div className="text-sm text-white/60">منتج</div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center mb-2">
                  <i className="fas fa-ruler-combined text-[#a48def]"></i>
                </div>
                <div className="text-lg font-bold">
                  {selectedBrand.storeSize === 'large' ? 'كبير' :
                   selectedBrand.storeSize === 'medium' ? 'متوسط' :
                   selectedBrand.storeSize === 'flagship' ? 'رئيسي' : 'صغير'}
                </div>
                <div className="text-sm text-white/60">حجم المتجر</div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#5e35b1]/20 flex items-center justify-center mb-2">
                  <i className="fas fa-medal text-[#a48def]"></i>
                </div>
                <div className="text-lg font-bold">
                  {selectedBrand.featured ? 'ذهبي' : 'فضي'}
                </div>
                <div className="text-sm text-white/60">مستوى الشراكة</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#5e35b1]/20 to-transparent p-4 rounded-lg mb-6 border border-[#5e35b1]/10">
              <h3 className="font-bold mb-2 flex items-center">
                <i className="fas fa-handshake text-[#a48def] mr-2"></i>
                فرص الشراكة مع {selectedBrand.name}
              </h3>
              <p className="text-sm text-white/70">
                يمكنك الإنضمام لبرنامج الشراكة مع {selectedBrand.name} والحصول على عمولة بنسبة تصل إلى 15% على كل عملية بيع تتم من خلال رابط الإحالة الخاص بك. كما يمكنك الحصول على منتجات حصرية ومزايا إضافية.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-[#5e35b1] text-white py-2 px-4 rounded-lg">
                <i className="fas fa-shopping-bag mr-2"></i>
                تصفح المنتجات
              </button>
              
              <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 px-4 rounded-lg">
                <i className="fas fa-vr-cardboard mr-2"></i>
                زيارة المتجر الافتراضي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}