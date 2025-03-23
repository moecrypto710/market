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
import AIVoiceControls from "./ai-voice-controls";

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
  // State for animation effects
  const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [selectionStarted, setSelectionStarted] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<AvatarProps | null>(null);
  
  // Enhanced avatar options with futuristic styles
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

  // Handle avatar selection with animation
  const handleSelect = (avatar: AvatarProps) => {
    setSelectedPreview(avatar);
    setSelectionStarted(true);
    
    // Delay actual selection to allow for animation
    setTimeout(() => {
      onSelect(avatar);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Ambient background with animated gradient */}
      <div className="fixed inset-0 bg-black z-0">
        <div className="absolute inset-0 bg-[#070314] opacity-90"></div>
        <div 
          className="absolute inset-0 opacity-30" 
          style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, rgba(94, 53, 177, 0.4) 0%, transparent 60%), 
                               radial-gradient(circle at 70% 60%, rgba(236, 64, 122, 0.4) 0%, transparent 60%)`,
            animation: 'pulse 8s infinite alternate'
          }}
        ></div>
        
        {/* Floating holographic particles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-float1"></div>
        <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-purple-400 rounded-full animate-float2"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float3"></div>
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-indigo-400 rounded-full animate-float2"></div>
        
        {/* Grid floor effect */}
        <div className="absolute inset-x-0 bottom-0 h-[30vh] perspective-[1000px]">
          <div 
            className="absolute inset-0 transform-gpu"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              transform: 'rotateX(60deg)',
              transformOrigin: 'center bottom',
            }}
          ></div>
        </div>
      </div>
      
      {/* Selection started overlay with transition effect */}
      {selectionStarted && selectedPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-0 animate-fade-in"></div>
          <div className="relative transform scale-150 animate-zoom-in">
            <img 
              src={selectedPreview.image} 
              alt={selectedPreview.name} 
              className="h-64 w-64 object-contain relative z-10" 
            />
            <div className="absolute -inset-8 rounded-full animate-pulse"
                 style={{background: `radial-gradient(circle, ${selectedPreview.color}80 0%, transparent 70%)`}}
            ></div>
          </div>
        </div>
      )}
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Header with futuristic design */}
        <div className="relative mb-8 text-center">
          <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            اختر الشخصية الافتراضية
          </h2>
          <p className="text-white/70 text-lg">
            اختر شخصية للتسوق في مول أمريكي الافتراضي
          </p>
          
          {/* Decorative elements */}
          <div className="absolute -left-4 top-1/2 h-0.5 w-12 bg-gradient-to-r from-transparent to-pink-500/80"></div>
          <div className="absolute -right-4 top-1/2 h-0.5 w-12 bg-gradient-to-l from-transparent to-purple-500/80"></div>
        </div>
        
        <div className="flex gap-12 w-full justify-center">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`
                relative bg-black border-2 border-${hoveredAvatar === avatar.id ? avatar.color : 'purple-800/30'} 
                p-8 rounded-xl cursor-pointer transition-all duration-500 
                hover:border-${avatar.color} w-[280px] h-[420px] transform perspective-[1200px] 
                backdrop-blur-sm overflow-hidden futuristic-border
                ${hoveredAvatar === avatar.id ? 'scale-105 shadow-lg shadow-' + avatar.color + '/40' : ''}
              `}
              style={{
                background: `radial-gradient(circle at ${hoveredAvatar === avatar.id ? '30%' : '50%'} ${hoveredAvatar === avatar.id ? '30%' : '50%'}, 
                rgba(${avatar.color === '#5e35b1' ? '94, 53, 177' : '217, 70, 239'}, 0.3) 0%, 
                rgba(0, 0, 0, 0.9) 70%)`,
                transform: hoveredAvatar === avatar.id ? 'rotateY(-8deg)' : 'rotateY(0deg)',
                boxShadow: hoveredAvatar === avatar.id ? `0 10px 40px -5px ${avatar.color}50` : 'none',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onClick={() => handleSelect(avatar)}
              onMouseEnter={() => {
                setHoveredAvatar(avatar.id);
                setShowDetails(avatar.id);
              }}
              onMouseLeave={() => {
                setHoveredAvatar(null);
                setShowDetails(null);
              }}
            >
              {/* Scanline effect for holographic feel */}
              <div 
                className="absolute inset-0 opacity-10 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(to bottom, transparent, transparent 50%, rgba(217, 70, 239, 0.2) 50%, transparent 50.5%)',
                  backgroundSize: '100% 8px',
                  animation: 'scanline 8s linear infinite',
                  pointerEvents: 'none'
                }}
              ></div>
              
              {/* Holographic background shimmer */}
              <div className="absolute inset-0 opacity-20 holographic-bg rounded-xl overflow-hidden"></div>
              
              {/* Enhanced decorative elements - geometric futuristic corners */}
              <div className="absolute top-3 left-3 h-10 w-10 border-t-2 border-l-2 border-white/40 rounded-tl-lg"></div>
              <div className="absolute bottom-3 right-3 h-10 w-10 border-b-2 border-r-2 border-white/40 rounded-br-lg"></div>
              
              {/* Data circuit lines - top right */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-30 pointer-events-none">
                <div className="absolute top-8 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-fuchsia-500/80 to-transparent"></div>
                <div className="absolute top-0 right-8 h-full w-[1px] bg-gradient-to-b from-transparent via-fuchsia-500/80 to-transparent"></div>
                <div className="absolute top-14 right-8 w-2 h-2 bg-fuchsia-500/80 rounded-full animate-pulse-slow"></div>
              </div>
              
              {/* Data circuit lines - bottom left */}
              <div className="absolute bottom-0 left-0 w-20 h-20 opacity-30 pointer-events-none">
                <div className="absolute bottom-8 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/80 to-transparent"></div>
                <div className="absolute bottom-0 left-8 h-full w-[1px] bg-gradient-to-t from-transparent via-purple-500/80 to-transparent"></div>
                <div className="absolute bottom-14 left-8 w-2 h-2 bg-purple-500/80 rounded-full animate-pulse-slow"></div>
              </div>
              
              {/* Avatar image with enhanced holographic effects */}
              <div className="mb-8 relative h-44 w-44 mx-auto perspective-3d">
                {/* Ambient glow */}
                <div className="absolute -inset-6 rounded-full" 
                     style={{
                       opacity: hoveredAvatar === avatar.id ? 0.5 : 0.2,
                       background: `radial-gradient(circle, ${avatar.color}60 0%, transparent 70%)`,
                       transition: 'opacity 0.5s ease',
                       filter: 'blur(10px)',
                       animation: 'pulse 3s infinite alternate'
                     }}>
                </div>
                
                {/* Multiple holographic rings */}
                <div className={`absolute inset-0 rounded-full border-2 border-${avatar.color}/40 
                                 ${hoveredAvatar === avatar.id ? 'animate-spin-slow' : ''}`}
                     style={{ transform: 'scale(1.1)' }}
                ></div>
                
                <div className={`absolute inset-0 rounded-full border border-${avatar.color}/20
                                 ${hoveredAvatar === avatar.id ? 'animate-spin-slow' : ''}`}
                     style={{ transform: 'scale(1.2)', animationDirection: 'reverse', animationDuration: '12s' }}
                ></div>
                
                {/* Floating particles around avatar */}
                <div className="absolute inset-0 scale-150">
                  <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-float1 opacity-70"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-float2 opacity-70"></div>
                  <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full animate-float3 opacity-70"></div>
                </div>
                
                {/* Avatar image with 3D hover effect */}
                <img 
                  src={avatar.image} 
                  alt={avatar.name} 
                  className="h-full w-full object-contain relative z-10 transition-all duration-500"
                  style={{
                    transform: hoveredAvatar === avatar.id ? 'scale(1.15) translateY(-8px) rotateY(5deg)' : 'scale(1)',
                    filter: hoveredAvatar === avatar.id ? `drop-shadow(0 0 12px ${avatar.color})` : 'none'
                  }}
                />
              </div>
              
              {/* Avatar details */}
              <h3 className="text-2xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${avatar.color}, white)`
                  }}
              >
                {avatar.name}
              </h3>
              
              <p className="text-sm text-white/70 mb-4 text-center">{avatar.personality}</p>
              
              {/* Special feature indicator */}
              <div className="absolute top-4 right-4 flex items-center">
                <div className="w-2 h-2 rounded-full animate-pulse" 
                     style={{backgroundColor: avatar.color}}></div>
                <span className="text-xs text-white/50 mr-1">{avatar.specialFeature}</span>
              </div>
              
              {/* Avatar benefits - show on hover */}
              <div className={`mt-2 overflow-hidden transition-all duration-500 ${showDetails === avatar.id ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                <h4 className="text-xs uppercase text-white/50 mb-2 tracking-wider">المميزات الخاصة</h4>
                <ul className="text-xs space-y-1 text-white/80 pr-2">
                  {avatar.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs text-pink-400">✦</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Enhanced futuristic selection button */}
              <div className="absolute bottom-6 inset-x-0 flex justify-center">
                <button 
                  className="px-6 py-2.5 rounded-full text-white text-sm font-medium relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(45deg, ${avatar.color}, ${
                      avatar.color === '#5e35b1' ? '#3f51b5' : '#d946ef'
                    })`,
                    boxShadow: `0 4px 20px ${avatar.color}60`
                  }}
                >
                  {/* Button glow effect */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                  
                  {/* Moving border light effect */}
                  <span className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-white/0 via-white/40 to-white/0 group-hover:animate-scan" style={{animationDuration: '1.5s'}}></span>
                  
                  {/* Inner blur glow */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        style={{
                          background: `radial-gradient(circle at center, ${avatar.color}70 0%, transparent 70%)`,
                          filter: 'blur(8px)'
                        }}>
                  </span>
                  
                  {/* Arabic text with gentle glow */}
                  <span className="relative z-10 flex items-center justify-center gap-2 text-glow">
                    <span>اختر شخصية {avatar.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  </span>
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
  
  // Enhanced VR features
  const [rotationAngle, setRotationAngle] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | '360' | 'ar'>('3d');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRotating, setIsRotating] = useState(false);
  const [gesturePositions, setGesturePositions] = useState<{x: number, y: number}[]>([]);
  const [mouseDown, setMouseDown] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [virtualHand, setVirtualHand] = useState({ x: 0, y: 0, visible: false });
  const [showRoomScale, setShowRoomScale] = useState(false);
  const [sectionAmbience, setSectionAmbience] = useState<{
    soundEffect?: string;
    particleEffect?: 'sparkles' | 'dust' | 'holograms' | 'none';
    lightIntensity: number;
    fogDensity: number;
  }>({
    soundEffect: undefined,
    particleEffect: 'none',
    lightIntensity: 0.5,
    fogDensity: 0.2
  });
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
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(true);
  
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
  
  // Handle voice commands
  function handleVoiceCommand(command: string, params?: any) {
    switch(command.toLowerCase()) {
      case 'move':
      case 'انتقل':
        if (params && typeof params === 'string') {
          const section = params.toLowerCase();
          if (['entrance', 'electronics', 'clothing', 'food', 'plaza', 'المدخل', 'الإلكترونيات', 'الأزياء', 'المطاعم', 'الساحة'].includes(section)) {
            let targetSection = section;
            if (section === 'المدخل') targetSection = 'entrance';
            if (section === 'الإلكترونيات') targetSection = 'electronics';
            if (section === 'الأزياء') targetSection = 'clothing';
            if (section === 'المطاعم') targetSection = 'food';
            if (section === 'الساحة') targetSection = 'plaza';
            
            handleSectionNavigation(targetSection);
            toast({
              title: "جاري التنقل",
              description: `التنقل إلى ${getAreaName(targetSection)}`
            });
          }
        }
        break;
      
      case 'show':
      case 'عرض':
        if (params === 'assistant' || params === 'المساعد') {
          setShowAiAssistant(true);
        }
        break;
        
      case 'hide':
      case 'إخفاء':
        if (params === 'assistant' || params === 'المساعد') {
          setShowAiAssistant(false);
        }
        break;
        
      case 'exit':
      case 'خروج':
        exitVR();
        break;
        
      case 'search':
      case 'بحث':
        if (params && typeof params === 'string') {
          const searchTerm = params.toLowerCase();
          const matchedProduct = products.find(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm)
          );
          
          if (matchedProduct) {
            handleShowProduct(matchedProduct);
            toast({
              title: "تم العثور على المنتج",
              description: `عرض ${matchedProduct.name}`
            });
          } else {
            toast({
              title: "عفواً",
              description: "لم يتم العثور على منتجات مطابقة"
            });
          }
        }
        break;
    }
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
          
          <div className="relative w-[80%] h-[80%] max-w-4xl bg-black/90 border border-pink-500/30 rounded-xl p-8 flex flex-col z-10"
               style={{
                 background: `radial-gradient(circle at top right, rgba(219, 39, 119, 0.3) 0%, rgba(0, 0, 0, 0.95) 70%)`,
                 boxShadow: '0 0 30px rgba(219, 39, 119, 0.3)'
               }}
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-pink-400/80 hover:text-pink-400 text-xl z-50"
              onClick={() => {
                setShow3DView(false);
                setSelectedProduct(null);
                setShowSpecialEffect(false);
              }}
            >
              <i className="fas fa-times"></i>
            </button>
            
            {/* View mode selector */}
            <div className="absolute top-4 left-4 flex space-x-2 z-50">
              <button 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${viewMode === '3d' ? 'bg-pink-600 text-white' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}
                onClick={() => setViewMode('3d')}
              >
                3D
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${viewMode === '360' ? 'bg-pink-600 text-white' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}
                onClick={() => setViewMode('360')}
              >
                360°
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${viewMode === 'ar' ? 'bg-pink-600 text-white' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}
                onClick={() => {
                  setViewMode('ar');
                  setShowCameraMode(true);
                  setCameraMode('product-try-on');
                }}
              >
                AR
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row h-full">
              {/* 3D Product View */}
              <div className="md:w-2/3 h-full relative overflow-hidden rounded-lg">
                {/* Ambient background effect based on product category */}
                <div className="absolute inset-0 opacity-30"
                     style={{
                       background: `radial-gradient(circle at center, ${
                         selectedProduct?.category === 'electronics' ? '#5e35b1' :
                         selectedProduct?.category === 'clothing' ? '#e91e63' : '#9c27b0'
                       } 0%, transparent 70%)`
                     }}
                ></div>
                
                {/* Grid floor effect */}
                <div className="absolute inset-0 perspective-[1000px]">
                  <div className="absolute bottom-0 left-0 right-0 h-[400px] transform-gpu"
                       style={{
                         background: `linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 90%, rgba(${
                           selectedProduct?.category === 'electronics' ? '94, 53, 177' :
                           selectedProduct?.category === 'clothing' ? '233, 30, 99' : '156, 39, 176'
                         }, 0.3) 100%)`,
                         backgroundSize: '30px 30px',
                         backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), 
                                           linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                         transform: 'rotateX(60deg)',
                         transformOrigin: 'bottom'
                       }}
                  >
                  </div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* 3D Effect Container */}
                  <div className="relative w-80 h-80" 
                       style={{
                         transform: viewMode === '360' ? `rotateY(${rotationAngle}deg)` : 'rotateY(0deg)',
                         transition: isRotating ? 'none' : 'transform 0.3s ease-out'
                       }}
                       onMouseDown={(e) => {
                         if (viewMode === '360') {
                           setMouseDown(true);
                           setLastMousePosition({ x: e.clientX, y: e.clientY });
                         }
                       }}
                       onMouseMove={(e) => {
                         if (mouseDown && viewMode === '360') {
                           setIsRotating(true);
                           const deltaX = e.clientX - lastMousePosition.x;
                           setRotationAngle(prev => prev + deltaX * 0.5);
                           setLastMousePosition({ x: e.clientX, y: e.clientY });
                         }
                       }}
                       onMouseUp={() => {
                         setMouseDown(false);
                         setTimeout(() => setIsRotating(false), 100);
                       }}
                       onMouseLeave={() => {
                         setMouseDown(false);
                         setTimeout(() => setIsRotating(false), 100);
                       }}
                  >
                    {/* Product platform/shadow */}
                    <div className="absolute bottom-[-40px] w-64 h-10 left-1/2 transform -translate-x-1/2 rounded-full bg-black"
                         style={{
                           boxShadow: `0 0 20px 5px rgba(${
                             selectedProduct?.category === 'electronics' ? '94, 53, 177' :
                             selectedProduct?.category === 'clothing' ? '233, 30, 99' : '156, 39, 176'
                           }, 0.3)`
                         }}
                    ></div>
                    
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
          className="absolute top-16 right-4 z-50 bg-purple-800 border border-purple-700/50"
          onClick={() => setShowAiAssistant(!showAiAssistant)}
        >
          <i className={`fas fa-${showAiAssistant ? 'eye-slash' : 'robot'} mr-2`}></i>
          {showAiAssistant ? 'إخفاء المساعد' : 'إظهار المساعد'}
        </Button>

        {/* Voice Control Toggle Button */}
        <Button
          variant="outline"
          className="absolute top-28 right-4 z-50 bg-purple-800 border border-purple-700/50"
          onClick={() => setVoiceControlEnabled(!voiceControlEnabled)}
        >
          <i className={`fas fa-${voiceControlEnabled ? 'microphone-slash' : 'microphone'} mr-2`}></i>
          {voiceControlEnabled ? 'تعطيل الصوت' : 'تفعيل الصوت'}
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
      
      {/* AI Voice Controls */}
      {voiceControlEnabled && (
        <AIVoiceControls
          onCommand={handleVoiceCommand}
          enabled={voiceControlEnabled}
          minimized={true}
        />
      )}
    </>
  );
}