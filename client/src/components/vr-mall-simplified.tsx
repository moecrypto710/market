import { useState, useEffect, useRef } from "react";
import { useVR } from "@/hooks/use-vr";
import { Product } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import CulturalTransition from "@/components/cultural-transition";
import confetti from 'canvas-confetti';
import AiShoppingAssistant from "./ai-shopping-assistant";
import CameraIntegration from "./camera-integration";

// Types
interface AvatarProps {
  id: number;
  name: string;
  image: string;
  personality: string;
  favoriteCategory: string;
  personalStyle: string;
  benefits: string[];
  color?: string;
  specialFeature?: string;
  specialFeatureDescription?: string;
}

interface VRMallProps {
  products: Product[];
}

// Avatar Selection Component
function AvatarSelectionScreen({ onSelect }: { onSelect: (avatar: AvatarProps) => void }) {
  // Simplified avatar options
  const avatars = [
    { 
      id: 1, 
      name: "أحمد",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Ahmed&backgroundColor=b6e3f4",
      personality: "مهتم بالتكنولوجيا والإلكترونيات الحديثة",
      favoriteCategory: "electronics",
      personalStyle: "عصري تقني",
      benefits: [
        "تخفيضات إضافية 10% على الإلكترونيات",
        "وصول حصري لآخر التقنيات"
      ],
      color: "#5e35b1",
      specialFeature: "محلل المواصفات",
      specialFeatureDescription: "قدرة خاصة على تحليل مواصفات المنتجات التقنية ومقارنتها بسرعة"
    },
    { 
      id: 2, 
      name: "سارة",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Sara&backgroundColor=ffdfbf",
      personality: "مهتمة بالموضة والأزياء العصرية",
      favoriteCategory: "clothing",
      personalStyle: "أنيق عصري",
      benefits: [
        "نصائح أزياء شخصية",
        "تجربة افتراضية للملابس"
      ],
      color: "#e91e63",
      specialFeature: "مستشارة الأناقة",
      specialFeatureDescription: "قدرة خاصة على تنسيق الإطلالات المثالية"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center">
      <div className="w-full max-w-4xl bg-black/60 border border-white/20 rounded-xl p-8 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold mb-2">اختر الشخصية الافتراضية</h2>
        <p className="text-white/70 mb-6">اختر شخصية للتسوق في مول أمريكي الافتراضي</p>
        
        <div className="flex gap-8 w-full justify-center">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="relative bg-gradient-to-b from-black/60 to-black/40 border border-white/10 hover:border-white/30 p-6 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 w-64"
              style={{ 
                boxShadow: `0 0 20px ${avatar.color}30`,
                borderColor: avatar.color 
              }}
              onClick={() => onSelect(avatar)}
            >
              <div className="mb-4 relative h-40 w-40 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-black/40 to-black/10 backdrop-blur-md border border-white/10"></div>
                <img 
                  src={avatar.image} 
                  alt={avatar.name} 
                  className="h-full w-full object-contain relative z-10" 
                />
                <div 
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{ 
                    background: `radial-gradient(circle, ${avatar.color} 0%, transparent 70%)`,
                    filter: "blur(8px)"
                  }}
                ></div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-center">{avatar.name}</h3>
              <p className="text-sm text-white/70 mb-4 text-center">{avatar.personality}</p>
              
              <div className="flex justify-center">
                <button 
                  className="px-4 py-2 rounded-lg text-white text-lg font-medium transition-all"
                  style={{ backgroundColor: avatar.color }}
                >
                  اختر {avatar.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main VR Mall Component
export default function VRMallSimplified({ products }: VRMallProps) {
  // Essential state
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProps | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState('default');
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 70 });
  const [currentSection, setCurrentSection] = useState<string>('entrance');
  const [ambientColor, setAmbientColor] = useState('#5e35b1');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [show3DView, setShow3DView] = useState(false);
  const [showSpecialEffect, setShowSpecialEffect] = useState(false);
  const [specialEffectType, setSpecialEffectType] = useState<'sparkle' | 'confetti' | 'hologram'>('sparkle');
  const [showAiAssistant, setShowAiAssistant] = useState(true);
  const [showCameraMode, setShowCameraMode] = useState(false);
  const [cameraMode, setCameraMode] = useState<'product-try-on' | 'avatar-creation' | 'ar-measure'>('product-try-on');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // References
  const mallRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { toast } = useToast();
  const { vrEnabled, toggleVR } = useVR();
  
  // Handle avatar selection
  function handleSelectAvatar(avatar: AvatarProps) {
    setSelectedAvatar(avatar);
    
    // Show welcome transition
    setTransitionStyle('modern');
    setShowTransition(true);
    
    // Update ambient color based on avatar preference
    switch (avatar.favoriteCategory) {
      case 'electronics':
        setAmbientColor('#5e35b1');
        break;
      case 'clothing':
        setAmbientColor('#e91e63');
        break;
      default:
        setAmbientColor('#9c27b0');
    }
    
    toast({
      title: `مرحبًا ${avatar.name}!`,
      description: "ابدأ تجربة التسوق الافتراضية باستخدام أسهم لوحة المفاتيح للتنقل"
    });
  }
  
  // Handle transition completion
  function handleTransitionFinish() {
    setShowTransition(false);
  }
  
  // Handle exit VR
  function exitVR() {
    toggleVR();
    setSelectedAvatar(null);
  }
  
  // Handle showing product in 3D view
  function handleShowProduct(product: Product) {
    setSelectedProduct(product);
    setShow3DView(true);
    setShowSpecialEffect(true);
    setSpecialEffectType('hologram');
    
    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  
  // Handle navigation between sections
  function handleSectionNavigation(section: string) {
    // Calculate new position based on section
    let newPosition = { ...avatarPosition };
    
    switch(section) {
      case 'entrance':
        newPosition = { x: 50, y: 15 };
        break;
      case 'electronics':
        newPosition = { x: 30, y: 40 };
        break;
      case 'clothing':
        newPosition = { x: 70, y: 40 };
        break;
      case 'food':
        newPosition = { x: 50, y: 80 };
        break;
      case 'plaza':
        newPosition = { x: 50, y: 50 };
        break;
    }
    
    setAvatarPosition(newPosition);
  }
  
  // Set up keyboard controls
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
  
  // Update section based on position
  useEffect(() => {
    if (!selectedAvatar || !vrEnabled) return;
    
    // Very simplified section detection
    const { x, y } = avatarPosition;
    
    let newSection = 'default';
    
    if (y < 20) {
      newSection = 'entrance';
      setAmbientColor('#9c27b0');
    } else if (x < 40 && y < 60) {
      newSection = 'electronics';
      setAmbientColor('#5e35b1');
    } else if (x > 60 && y < 60) {
      newSection = 'clothing';
      setAmbientColor('#e91e63');
    } else if (y > 70) {
      newSection = 'food';
      setAmbientColor('#ff9800');
    } else {
      newSection = 'plaza';
      setAmbientColor('#673ab7');
    }
    
    if (newSection !== currentSection) {
      setCurrentSection(newSection);
      setTransitionStyle(Math.random() > 0.5 ? 'modern' : 'cultural');
      setShowTransition(true);
      
      toast({
        title: `أهلاً بك في قسم ${getAreaName(newSection)}`,
        description: "استكشف المنتجات والميزات المتاحة في هذه المنطقة",
      });
    }
  }, [avatarPosition, selectedAvatar, vrEnabled, currentSection]);
  
  // Helper to get area name in Arabic
  function getAreaName(sectionId: string) {
    switch (sectionId) {
      case 'entrance': return 'المدخل الرئيسي';
      case 'electronics': return 'الإلكترونيات';
      case 'clothing': return 'الأزياء';
      case 'food': return 'المطاعم';
      case 'plaza': return 'الساحة المركزية';
      default: return 'المول';
    }
  }
  
  // Return avatar selection if no avatar selected
  if (!selectedAvatar) {
    return <AvatarSelectionScreen onSelect={handleSelectAvatar} />;
  }
  
  // Get products for current section
  const sectionProducts = products.filter(product => {
    if (currentSection === 'electronics') return product.category === 'electronics';
    if (currentSection === 'clothing') return product.category === 'clothing';
    if (currentSection === 'home') return product.category === 'home';
    if (currentSection === 'sports') return product.category === 'sports';
    return true; // Show all in other sections
  }).slice(0, 3);
  
  return (
    <>
      <CulturalTransition 
        show={showTransition} 
        style={transitionStyle as any} 
        onFinish={handleTransitionFinish} 
      />
      
      {/* 3D Product View Modal */}
      {selectedProduct && show3DView && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => {
              setShow3DView(false);
              setSelectedProduct(null);
              setShowSpecialEffect(false);
            }}
          ></div>
          
          <div className="relative w-[80%] h-[80%] max-w-4xl bg-[#0a0120]/90 border border-white/20 rounded-xl p-8 flex flex-col z-10">
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-white/60 hover:text-white text-xl"
              onClick={() => {
                setShow3DView(false);
                setSelectedProduct(null);
                setShowSpecialEffect(false);
              }}
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="flex flex-col md:flex-row h-full">
              {/* 3D Product View */}
              <div className="md:w-2/3 h-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* 3D Effect Container */}
                  <div className="relative w-80 h-80">
                    {/* 3D effect with moving shadows and highlights */}
                    <div 
                      className="absolute inset-0 rounded-full opacity-20"
                      style={{
                        background: `radial-gradient(circle, ${ambientColor} 0%, transparent 70%)`,
                        animation: 'pulse 3s infinite'
                      }}
                    ></div>
                    
                    {/* Hologram effect */}
                    {showSpecialEffect && specialEffectType === 'hologram' && (
                      <>
                        <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-pulse"></div>
                        <div className="absolute inset-4 border border-blue-400/20 rounded-full animate-spin-slow"></div>
                        
                        {/* Scanning lines */}
                        <div 
                          className="absolute inset-0 overflow-hidden rounded-full"
                          style={{ 
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(77, 213, 254, 0.1) 4px, rgba(77, 213, 254, 0.1) 8px)',
                            animation: 'scan 8s linear infinite'
                          }}
                        ></div>
                        
                        {/* Glowing dots */}
                        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-float1"></div>
                        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-float2"></div>
                      </>
                    )}
                    
                    {/* Floating product image */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center transform hover:scale-110 transition-transform"
                      style={{ animation: 'float 6s ease-in-out infinite' }}
                    >
                      <img 
                        src={selectedProduct.imageUrl || 'https://via.placeholder.com/300'} 
                        alt={selectedProduct.name}
                        className="max-w-full max-h-full object-contain z-10" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Interactive elements */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <button 
                    className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                    onClick={() => setSpecialEffectType('sparkle')}
                  >
                    <i className="fas fa-sparkles text-yellow-400"></i>
                  </button>
                  
                  <button 
                    className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                    onClick={() => setSpecialEffectType('hologram')}
                  >
                    <i className="fas fa-cube text-blue-400"></i>
                  </button>
                  
                  <button 
                    className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                    onClick={() => setSpecialEffectType('confetti')}
                  >
                    <i className="fas fa-bahai text-pink-400"></i>
                  </button>
                </div>
              </div>
              
              {/* Product information */}
              <div className="md:w-1/3 p-4 flex flex-col">
                <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-1 px-3 rounded-full mb-4 w-fit">
                  {selectedProduct.price} ج.م
                </div>
                
                <p className="text-white/70 mb-4 text-sm">{selectedProduct.description}</p>
                
                <div className="border border-white/10 rounded p-3 mb-4 bg-white/5">
                  <h3 className="font-bold mb-2">مميزات المنتج</h3>
                  <ul className="text-sm space-y-1 text-white/80">
                    <li className="flex items-center">
                      <i className="fas fa-check text-green-400 mr-2 text-xs"></i>
                      <span>ضمان لمدة عامين</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check text-green-400 mr-2 text-xs"></i>
                      <span>توصيل مجاني</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check text-green-400 mr-2 text-xs"></i>
                      <span>متوفر في المخزون</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto space-y-2">
                  {/* Try On button - only for clothing and shoes */}
                  {(selectedProduct.category === 'clothing' || selectedProduct.name.includes('حذاء')) && (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 mb-2"
                      onClick={() => {
                        setCameraMode('product-try-on');
                        setShowCameraMode(true);
                        setShow3DView(false);
                      }}
                    >
                      <i className="fas fa-camera mr-2"></i>
                      تجربة المنتج افتراضيًا
                    </Button>
                  )}
                  
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    <i className="fas fa-shopping-cart mr-2"></i>
                    إضافة إلى السلة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div 
        ref={mallRef}
        className="fixed inset-0 bg-[#070314]/95 backdrop-blur-md z-50 overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(94, 53, 177, 0.1) 0%, rgba(16, 6, 54, 0.2) 50%, rgba(7, 3, 20, 0.3) 100%)',
        }}
      >
        {/* Simplified atmosphere effects */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {/* Abstract grid lines - clean and minimal */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'linear-gradient(transparent 0%, transparent calc(100% - 1px), rgba(255, 255, 255, 0.1) 100%), linear-gradient(to right, transparent 0%, transparent calc(100% - 1px), rgba(255, 255, 255, 0.1) 100%)',
            backgroundSize: '60px 60px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center bottom',
          }}></div>
          
          {/* Subtle holographic overlay */}
          <div className="absolute inset-0 holographic-bg opacity-5"></div>
          
          {/* Just a few key particles for ambient effect */}
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-float2"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-amber-400 rounded-full animate-float3"></div>
        </div>
        
        {/* Simplified ambient mood lighting */}
        <div 
          className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-20 transition-all duration-1000"
          style={{ 
            backgroundImage: `linear-gradient(to top, ${ambientColor}20, transparent, transparent)` 
          }}
        ></div>
        
        {/* Controls interface */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/60 rounded-lg p-2 backdrop-blur-sm border border-white/10">
          <div className="rounded-full w-3 h-3 bg-green-500 animate-pulse"></div>
          <span className="text-xs text-white">جلسة الواقع الافتراضي نشطة</span>
          <div className="mr-4 border-r border-white/20 h-4"></div>
          <div className="flex items-center gap-1">
            <i className="fas fa-keyboard text-white/60 text-xs"></i>
            <span className="text-white/60 text-xs">أسهم التحكم للحركة</span>
          </div>
        </div>
        
        {/* Exit VR button */}
        <Button 
          variant="destructive"
          className="absolute top-4 right-4 z-50"
          onClick={exitVR}
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          خروج من الواقع الافتراضي
        </Button>
        
        {/* AI Assistant Toggle Button */}
        <Button
          variant="outline"
          className="absolute top-16 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 border-0"
          onClick={() => setShowAiAssistant(!showAiAssistant)}
        >
          <i className={`fas fa-${showAiAssistant ? 'eye-slash' : 'robot'} mr-2`}></i>
          {showAiAssistant ? 'إخفاء المساعد الذكي' : 'إظهار المساعد الذكي'}
        </Button>
        
        {/* Current location indicator */}
        <div className="absolute top-16 left-4 bg-black/70 px-3 py-1.5 rounded-full text-sm z-50 border border-white/10">
          <div className="flex items-center gap-2">
            <i className="fas fa-map-marker-alt text-white/60"></i>
            <span className="font-medium">{getAreaName(currentSection)}</span>
          </div>
        </div>
        
        {/* Avatar indicator */}
        <div 
          className="absolute w-8 h-8 bg-[#ffeb3b] rounded-full border-2 border-white shadow-glow z-40 avatar"
          style={{
            left: `${avatarPosition.x}%`,
            top: `${avatarPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 15px rgba(255, 235, 59, 0.5)',
          }}
        >
          <img 
            src={selectedAvatar.image} 
            alt={selectedAvatar.name}
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
        
        {/* Mall sections - simplified representation with minimal design */}
        <div className="absolute inset-10 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Electronics */}
            <div 
              className={`rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                currentSection === 'electronics' 
                  ? 'bg-blue-500/20 border-2 border-blue-500/30 shadow-glow' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
              onClick={() => handleSectionNavigation('electronics')}
            >
              <div className="text-center">
                <i className="fas fa-microchip text-3xl mb-1 text-blue-400"></i>
                <h3 className="text-lg font-bold">الإلكترونيات</h3>
              </div>
            </div>
            
            {/* Clothing */}
            <div 
              className={`rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                currentSection === 'clothing' 
                  ? 'bg-pink-500/20 border-2 border-pink-500/30 shadow-glow' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
              onClick={() => handleSectionNavigation('clothing')}
            >
              <div className="text-center">
                <i className="fas fa-tshirt text-3xl mb-1 text-pink-400"></i>
                <h3 className="text-lg font-bold">الأزياء</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product showcase for current section - simplified cards */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-50">
          {products
            .filter(product => {
              if (currentSection === 'electronics') return product.category === 'electronics';
              if (currentSection === 'clothing') return product.category === 'clothing';
              return true; // Show all in other sections
            })
            .slice(0, 3)
            .map(product => (
              <div 
                key={product.id} 
                className="w-40 h-56 bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 transition-all hover:scale-105 hover:border-white/40 cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setShow3DView(true);
                  setShowSpecialEffect(true);
                  setSpecialEffectType('hologram');
                }}
              >
                <div className="h-28 bg-gradient-to-b from-black/0 to-black/20 p-2 flex items-center justify-center">
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/150'} 
                    alt={product.name} 
                    className="h-full object-contain"
                  />
                </div>
                <div className="p-2">
                  <h3 className="font-bold text-sm">{product.name}</h3>
                  <p className="text-white/60 text-xs mb-1 line-clamp-1">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-400">{product.price} ج.م</span>
                    <div className="text-xs text-white/60">3D عرض</div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      {/* Camera Integration for product try-on */}
      {showCameraMode && selectedProduct && (
        <CameraIntegration
          onCapture={(imageSrc) => {
            setCapturedImage(imageSrc);
            setShowCameraMode(false);
            toast({
              title: "تم التقاط الصورة بنجاح",
              description: "يمكنك الآن استخدام الصورة في تجربة المنتج",
            });
          }}
          onClose={() => {
            setShowCameraMode(false);
            setShow3DView(true); // Return to product view
          }}
          mode={cameraMode}
          productImageUrl={selectedProduct.imageUrl}
        />
      )}
      
      {/* AI Shopping Assistant */}
      {showAiAssistant && selectedAvatar && (
        <AiShoppingAssistant
          currentSection={currentSection}
          products={products}
          onProductSelect={handleShowProduct}
          onNavigate={handleSectionNavigation}
          avatar={selectedAvatar}
          minimized={true} // Changed to true to make it smaller
        />
      )}
    </>
  );
}