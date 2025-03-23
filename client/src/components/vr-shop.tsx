import { useState, useEffect, useRef } from "react";
import { useVR } from "@/hooks/use-vr";
import { Product } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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

  // Calculate store sections based on categories and add partnership mall structure
  const storeSections = [
    { id: 'electronics', name: 'إلكترونيات', x: 25, y: 30, width: 30, height: 30, type: 'category' },
    { id: 'clothing', name: 'ملابس', x: 65, y: 30, width: 30, height: 30, type: 'category' },
    { id: 'home', name: 'منزل', x: 25, y: 70, width: 30, height: 25, type: 'category' },
    { id: 'sports', name: 'رياضة', x: 65, y: 70, width: 30, height: 25, type: 'category' },
    { id: 'partnership-zone', name: 'منطقة الشراكات', x: 45, y: 50, width: 15, height: 15, type: 'special' },
    { id: 'food-court', name: 'المطاعم', x: 45, y: 90, width: 25, height: 10, type: 'special' },
    { id: 'entrance', name: 'المدخل', x: 45, y: 10, width: 25, height: 10, type: 'special' },
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
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&w=1600&blur=50")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
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
        
        {/* Avatar */}
        <div 
          className="avatar absolute w-16 h-16 cursor-move transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${avatarPosition.x}%`, 
            top: `${avatarPosition.y}%`,
            transition: gestureControlEnabled ? 'none' : 'left 0.3s ease, top 0.3s ease',
            zIndex: 10
          }}
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#ffeb3b] relative">
            <img 
              src={selectedAvatar.image} 
              alt={selectedAvatar.name} 
              className="w-full h-full object-cover"
            />
            
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
              </div>
            )}
          </div>
          
          {/* Shadow below avatar */}
          <div className="w-12 h-3 bg-black/30 rounded-full mx-auto -mt-1 blur-sm"></div>
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
      </div>
      
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
    </div>
  );
}