import { useState, useEffect, useRef } from "react";
import { useVR } from "@/hooks/use-vr";
import { Product } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VRShopProps {
  products: Product[];
}

// Avatar selections
const AVATARS = [
  { id: 1, name: "رجل", image: "https://api.dicebear.com/7.x/personas/svg?seed=John&backgroundColor=b6e3f4" },
  { id: 2, name: "امرأة", image: "https://api.dicebear.com/7.x/personas/svg?seed=Jane&backgroundColor=c0aede" },
  { id: 3, name: "طفل", image: "https://api.dicebear.com/7.x/personas/svg?seed=Kid&backgroundColor=d1d4f9" },
];

export default function VRShop({ products }: VRShopProps) {
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<typeof AVATARS[0] | null>(null);
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 70 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-white/10 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">اختر شخصيتك الافتراضية</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {AVATARS.map(avatar => (
              <div 
                key={avatar.id}
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition duration-200"
                onClick={() => setSelectedAvatar(avatar)}
              >
                <div className="w-20 h-20 mb-2 rounded-full overflow-hidden border-2 border-transparent hover:border-[#ffeb3b]">
                  <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm">{avatar.name}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center text-sm text-white/60 mt-6">
            اختر شخصية افتراضية لتتجول في المتجر
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
  
  // Calculate store sections based on categories
  const storeSections = [
    { id: 'electronics', name: 'إلكترونيات', x: 25, y: 30, width: 30, height: 30 },
    { id: 'clothing', name: 'ملابس', x: 65, y: 30, width: 30, height: 30 },
    { id: 'home', name: 'منزل', x: 25, y: 70, width: 30, height: 25 },
    { id: 'sports', name: 'رياضة', x: 65, y: 70, width: 30, height: 25 },
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
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&w=1600&blur=50")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
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
        
        {/* Products displayed on shelves */}
        {products.map((product, index) => {
          // Determine which section to place the product in
          const sectionIndex = ['electronics', 'clothing', 'home', 'sports'].indexOf(product.category);
          const section = storeSections[sectionIndex === -1 ? index % 4 : sectionIndex];
          
          // Calculate position within the section
          const productsInSection = productsByCategory[product.category]?.length || 1;
          const productIndexInSection = productsByCategory[product.category]?.indexOf(product) || 0;
          
          const rows = Math.ceil(productsInSection / 3);
          const cols = Math.min(productsInSection, 3);
          
          const rowIndex = Math.floor(productIndexInSection / 3);
          const colIndex = productIndexInSection % 3;
          
          // Calculate grid position within section
          const gridX = section.x - section.width/2 + section.width * (colIndex + 0.5) / cols;
          const gridY = section.y - section.height/2 + section.height * (rowIndex + 0.5) / rows;
          
          return (
            <div 
              key={product.id}
              className="absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ 
                left: `${gridX}%`, 
                top: `${gridY}%`,
                transition: 'transform 0.3s ease'
              }}
            >
              <div className={`w-16 h-16 rounded-md overflow-hidden ${selectedProduct?.id === product.id ? 'ring-2 ring-[#ffeb3b]' : ''}`}>
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs mt-1 px-1 py-0.5 bg-black/50 rounded-full whitespace-nowrap">
                {product.name}
              </span>
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
              <div className="mt-1 font-bold text-[#fff59d]">
                ${(selectedProduct.price / 100).toFixed(2)}
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