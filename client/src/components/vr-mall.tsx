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
import AvatarSelection, { AvatarProps } from "@/components/avatar-selection";
import CulturalTransition from "@/components/cultural-transition";

interface VRMallProps {
  products: Product[];
}

// Simplified avatar selections - just boy and girl options
const AVATARS = [
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

// Avatar Selection component directly within the VR Mall component
function AvatarSelectionScreen({ onSelect }: { onSelect: (avatar: AvatarProps) => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center">
      <div className="w-full max-w-4xl bg-black/60 border border-white/20 rounded-xl p-8 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold mb-2">اختر الشخصية الافتراضية</h2>
        <p className="text-white/70 mb-6">اختر شخصية للتسوق في مول أمريكي الافتراضي</p>
        
        <div className="flex gap-8 w-full justify-center">
          {AVATARS.map((avatar) => (
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

// Main component
export default function VRMall({ products }: VRMallProps) {
  const { toast } = useToast();
  
  // All state variables in the correct order to match previous render
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProps | null>(null);
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 70 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<any | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [showFeatureDetails, setShowFeatureDetails] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [moveDirection, setMoveDirection] = useState('شمال');
  const [userLevel, setUserLevel] = useState(1);
  const [interactionState, setInteractionState] = useState<string | null>(null);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<string>('default');
  const [previousSection, setPreviousSection] = useState<any | null>(null);
  const [ambientLighting, setAmbientLighting] = useState({
    primaryColor: '#5e35b1',
    secondaryColor: '#ff9800',
    intensity: 0.2,
    pulseRate: 'slow'
  });
  
  const mallRef = useRef<HTMLDivElement>(null);
  const { vrEnabled, gestureControlEnabled, toggleVR } = useVR();
  
  // Track if the user is dragging the avatar
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
  });
  
  // Handle keyboard movement with movement visualization
  useEffect(() => {
    if (!selectedAvatar || !vrEnabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const STEP = 5;
      const now = Date.now();
      
      // Set moving state and direction based on key
      switch (e.key) {
        case "ArrowUp":
          setAvatarPosition(prev => ({ ...prev, y: Math.max(10, prev.y - STEP) }));
          setIsMoving(true);
          setMoveDirection("للأمام");
          break;
        case "ArrowDown":
          setAvatarPosition(prev => ({ ...prev, y: Math.min(90, prev.y + STEP) }));
          setIsMoving(true);
          setMoveDirection("للخلف");
          break;
        case "ArrowLeft":
          setAvatarPosition(prev => ({ ...prev, x: Math.max(10, prev.x - STEP) }));
          setIsMoving(true);
          setMoveDirection("لليسار");
          break;
        case "ArrowRight":
          setAvatarPosition(prev => ({ ...prev, x: Math.min(90, prev.x + STEP) }));
          setIsMoving(true);
          setMoveDirection("لليمين");
          break;
        default:
          return; // Not a movement key
      }
      
      // Show interaction state
      setInteractionState("يتحرك");
      setLastMoveTime(now);
      
      // Mark 'move' task as complete if not already
      if (!completedTasks.includes('move')) {
        setCompletedTasks(prev => [...prev, 'move']);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        // Small delay before setting isMoving to false for smoother animation
        setTimeout(() => {
          setIsMoving(false);
          setInteractionState(null);
        }, 150);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedAvatar, vrEnabled, completedTasks]);
  
  // Handle avatar dragging with gesture controls
  useEffect(() => {
    if (!selectedAvatar || !vrEnabled || !mallRef.current) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && e.target.classList.contains('avatar')) {
        dragRef.current.isDragging = true;
        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        
        // Indicate dragging has started
        setIsMoving(true);
        setInteractionState("يتم السحب");
        
        // Mark 'move' task as complete if not already
        if (!completedTasks.includes('move')) {
          setCompletedTasks(prev => [...prev, 'move']);
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      // Determine movement direction for better visual feedback
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal movement is dominant
        setMoveDirection(deltaX > 0 ? "لليمين" : "لليسار");
      } else {
        // Vertical movement is dominant
        setMoveDirection(deltaY > 0 ? "للأسفل" : "للأعلى");
      }
      
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      
      const mallRect = mallRef.current!.getBoundingClientRect();
      
      setAvatarPosition(prev => ({
        x: Math.min(90, Math.max(10, prev.x + (deltaX / mallRect.width) * 100)),
        y: Math.min(90, Math.max(10, prev.y + (deltaY / mallRect.height) * 100)),
      }));
      
      // Update last move time
      setLastMoveTime(Date.now());
    };
    
    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      
      // Small delay before stopping the moving state for smoother animation
      setTimeout(() => {
        setIsMoving(false);
        setInteractionState(null);
      }, 150);
    };
    
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [selectedAvatar, vrEnabled, completedTasks]);
  
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
  
  // Add category-specific color schemes for ambient lighting
  const categoryColors = {
    electronics: {
      primary: '#5e35b1',      // Deep purple for tech
      secondary: '#03a9f4',    // Light blue accent
      ambient: 'rgba(94, 53, 177, 0.15)',
      particles: ['#5e35b1', '#03a9f4', '#651fff', '#3d5afe'],
      fogGradient: 'radial-gradient(circle at 50% 50%, rgba(94, 53, 177, 0.1) 0%, rgba(3, 169, 244, 0.05) 70%, transparent 100%)'
    },
    clothing: {
      primary: '#e91e63',      // Pink for fashion
      secondary: '#ff9800',    // Orange accent
      ambient: 'rgba(233, 30, 99, 0.15)',
      particles: ['#e91e63', '#ff9800', '#f50057', '#ff3d00'],
      fogGradient: 'radial-gradient(circle at 50% 50%, rgba(233, 30, 99, 0.1) 0%, rgba(255, 152, 0, 0.05) 70%, transparent 100%)'
    },
    home: {
      primary: '#4caf50',      // Green for home decor
      secondary: '#8bc34a',    // Light green accent
      ambient: 'rgba(76, 175, 80, 0.15)',
      particles: ['#4caf50', '#8bc34a', '#00c853', '#64dd17'],
      fogGradient: 'radial-gradient(circle at 50% 50%, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.05) 70%, transparent 100%)'
    },
    sports: {
      primary: '#2196f3',      // Blue for sports
      secondary: '#00bcd4',    // Teal accent
      ambient: 'rgba(33, 150, 243, 0.15)',
      particles: ['#2196f3', '#00bcd4', '#0091ea', '#00b8d4'],
      fogGradient: 'radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.1) 0%, rgba(0, 188, 212, 0.05) 70%, transparent 100%)'
    },
    default: {
      primary: '#9c27b0',      // Purple for general areas
      secondary: '#673ab7',    // Deep purple accent
      ambient: 'rgba(156, 39, 176, 0.15)',
      particles: ['#9c27b0', '#673ab7', '#aa00ff', '#6200ea'],
      fogGradient: 'radial-gradient(circle at 50% 50%, rgba(156, 39, 176, 0.1) 0%, rgba(103, 58, 183, 0.05) 70%, transparent 100%)'
    }
  };

  // Mall layout sections definition - stores, categories, and navigation points
  const storeSections = [
    // Main mall structure
    { 
      id: 'main-entrance', 
      name: 'المدخل الرئيسي', 
      x: 50, y: 5, width: 30, height: 10, 
      type: 'entrance', 
      icon: 'door-open', 
      backgroundColor: 'rgba(0,0,0,0.3)', 
      borderColor: 'rgba(255,255,255,0.3)',
      category: 'default',
      features: [
        {
          id: 'ai-welcome',
          name: 'استقبال ذكي',
          description: 'مرحباً بك في مول أمريكي! سأكون مرشدك الافتراضي اليوم',
          icon: 'robot'
        },
        {
          id: 'hologram-map',
          name: 'خريطة هولوجرام',
          description: 'خريطة ثلاثية الأبعاد تفاعلية للمول بتقنية الهولوجرام',
          icon: 'map-3d'
        }
      ]
    },
    { 
      id: 'central-plaza', 
      name: 'الساحة المركزية', 
      x: 50, y: 40, width: 20, height: 20, 
      type: 'plaza', 
      icon: 'compass', 
      backgroundColor: 'rgba(94,53,177,0.1)', 
      borderColor: 'rgba(94,53,177,0.3)',
      features: [
        {
          id: 'interactive-fountain',
          name: 'نافورة تفاعلية',
          description: 'نافورة رقمية تتفاعل مع حركة المتسوقين وتعرض العروض الخاصة',
          icon: 'tint'
        },
        {
          id: 'product-showcase',
          name: 'عروض المنتجات',
          description: 'منصة عرض دائرية تستعرض أحدث المنتجات بتقنية ثلاثية الأبعاد',
          icon: 'cube'
        },
        {
          id: 'social-zone',
          name: 'منطقة اجتماعية',
          description: 'تفاعل مع متسوقين آخرين وشارك تجربتك في المول الافتراضي',
          icon: 'users'
        }
      ]
    },
    { 
      id: 'west-wing', 
      name: 'الجناح الغربي', 
      x: 25, y: 30, width: 40, height: 50, 
      type: 'wing', 
      backgroundColor: 'rgba(0,0,0,0.1)', 
      borderColor: 'rgba(255,255,255,0.1)'
    },
    { 
      id: 'east-wing', 
      name: 'الجناح الشرقي', 
      x: 75, y: 30, width: 40, height: 50, 
      type: 'wing', 
      backgroundColor: 'rgba(0,0,0,0.1)', 
      borderColor: 'rgba(255,255,255,0.1)'
    },
    { 
      id: 'food-court', 
      name: 'منطقة المطاعم', 
      x: 50, y: 85, width: 40, height: 15, 
      type: 'special', 
      icon: 'utensils', 
      backgroundColor: 'rgba(244,114,182,0.1)', 
      borderColor: 'rgba(244,114,182,0.2)',
      features: [
        {
          id: 'virtual-tasting',
          name: 'تذوق افتراضي',
          description: 'تجربة تذوق افتراضية للأطعمة المختلفة مع تأثيرات حسية',
          icon: 'cookie-bite'
        },
        {
          id: 'chef-holograms',
          name: 'طهاة افتراضيون',
          description: 'عروض طهي حية من طهاة عالميين بتقنية الهولوجرام',
          icon: 'hat-chef'
        }
      ]
    },
    { 
      id: 'vr-experience', 
      name: 'تجربة الواقع الافتراضي', 
      x: 50, y: 60, width: 15, height: 15, 
      type: 'special', 
      icon: 'vr-cardboard', 
      backgroundColor: 'rgba(234,179,8,0.1)', 
      borderColor: 'rgba(234,179,8,0.2)',
      features: [
        {
          id: 'product-simulation',
          name: 'محاكاة المنتجات',
          description: 'جرب المنتجات في بيئات واقعية مختلفة قبل الشراء',
          icon: 'vr-cardboard'
        },
        {
          id: 'virtual-runway',
          name: 'منصة عرض افتراضية',
          description: 'شاهد عروض أزياء حية للماركات العالمية على منصة افتراضية',
          icon: 'person-walking'
        }
      ]
    },
    
    // Category zones with interactive features
    { 
      id: 'electronics', 
      name: 'منطقة الإلكترونيات', 
      x: 25, y: 30, width: 25, height: 25, 
      type: 'category', 
      icon: 'laptop', 
      backgroundColor: 'rgba(14,165,233,0.05)', 
      borderColor: 'rgba(14,165,233,0.15)',
      features: [
        {
          id: 'virtual-demo',
          name: 'العروض الافتراضية',
          description: 'تجربة حية للمنتجات الإلكترونية قبل الشراء',
          icon: 'vr-cardboard'
        },
        {
          id: 'tech-comparison',
          name: 'مقارنة المنتجات',
          description: 'مقارنة مواصفات الأجهزة الحديثة بتقنية هولوجرام',
          icon: 'balance-scale'
        },
        {
          id: 'future-tech',
          name: 'تقنيات المستقبل',
          description: 'استعراض أحدث التقنيات المستقبلية والابتكارات',
          icon: 'atom'
        }
      ]
    },
    { 
      id: 'clothing', 
      name: 'منطقة الملابس', 
      x: 75, y: 30, width: 25, height: 25, 
      type: 'category', 
      icon: 'shirt', 
      backgroundColor: 'rgba(236,72,153,0.05)', 
      borderColor: 'rgba(236,72,153,0.15)',
      features: [
        {
          id: 'virtual-fitting',
          name: 'قياس افتراضي',
          description: 'تجربة الملابس افتراضياً على صورتك الشخصية',
          icon: 'user-check'
        },
        {
          id: 'fashion-show',
          name: 'عرض أزياء',
          description: 'مشاهدة عروض أزياء حية للتشكيلات الجديدة',
          icon: 'walking'
        },
        {
          id: 'personal-stylist',
          name: 'مصمم شخصي',
          description: 'الحصول على نصائح أزياء من مصمم افتراضي ذكي',
          icon: 'user-tie'
        }
      ]
    },
    { 
      id: 'home', 
      name: 'منطقة المنزل', 
      x: 25, y: 70, width: 25, height: 25, 
      type: 'category', 
      icon: 'home', 
      backgroundColor: 'rgba(34,197,94,0.05)', 
      borderColor: 'rgba(34,197,94,0.15)',
      features: [
        {
          id: 'room-design',
          name: 'تصميم الغرف',
          description: 'صمم غرفتك باستخدام منتجاتنا بتقنية ثلاثية الأبعاد',
          icon: 'pencil-ruler'
        },
        {
          id: 'smart-home',
          name: 'المنزل الذكي',
          description: 'تجربة حية لأنظمة المنزل الذكي المتكاملة',
          icon: 'home'
        },
        {
          id: 'furniture-preview',
          name: 'معاينة الأثاث',
          description: 'شاهد الأثاث في منزلك بتقنية الواقع المعزز قبل الشراء',
          icon: 'couch'
        }
      ]
    },
    { 
      id: 'sports', 
      name: 'منطقة الرياضة', 
      x: 75, y: 70, width: 25, height: 25, 
      type: 'category', 
      icon: 'dumbbell', 
      backgroundColor: 'rgba(168,85,247,0.05)', 
      borderColor: 'rgba(168,85,247,0.15)',
      features: [
        {
          id: 'fitness-test',
          name: 'اختبار اللياقة',
          description: 'تجربة معدات اللياقة البدنية في بيئة افتراضية',
          icon: 'heartbeat'
        },
        {
          id: 'sports-game',
          name: 'ألعاب رياضية',
          description: 'تجربة الألعاب الرياضية الافتراضية باستخدام معداتنا',
          icon: 'futbol'
        },
        {
          id: 'athlete-avatar',
          name: 'لقاء الرياضيين',
          description: 'تفاعل مع نجوم الرياضة الشهيرة في تجربة افتراضية',
          icon: 'medal'
        }
      ]
    },
    // New exclusive zone
    { 
      id: 'vip-lounge', 
      name: 'صالة كبار الزوار', 
      x: 85, y: 15, width: 15, height: 15, 
      type: 'special', 
      icon: 'crown', 
      backgroundColor: 'rgba(156,39,176,0.1)', 
      borderColor: 'rgba(156,39,176,0.2)',
      features: [
        {
          id: 'exclusive-products',
          name: 'منتجات حصرية',
          description: 'تشكيلة من المنتجات الحصرية لكبار العملاء',
          icon: 'gem'
        },
        {
          id: 'personal-concierge',
          name: 'خدمة شخصية',
          description: 'مساعد تسوق شخصي لتلبية احتياجاتك',
          icon: 'user-tie'
        }
      ]
    },
    // Innovation hub
    { 
      id: 'innovation-hub', 
      name: 'مركز الابتكار', 
      x: 15, y: 15, width: 15, height: 15, 
      type: 'special', 
      icon: 'lightbulb', 
      backgroundColor: 'rgba(3,169,244,0.1)', 
      borderColor: 'rgba(3,169,244,0.2)',
      features: [
        {
          id: 'concept-products',
          name: 'منتجات مفاهيمية',
          description: 'استكشاف المنتجات المستقبلية التي لم تصل للأسواق بعد',
          icon: 'flask'
        },
        {
          id: 'tech-demos',
          name: 'عروض تقنية',
          description: 'تجارب حية لأحدث التقنيات والابتكارات',
          icon: 'microchip'
        }
      ]
    }
  ];

  // Check if avatar is near a product with enhanced interaction
  useEffect(() => {
    if (!selectedAvatar || !vrEnabled) return;
    
    // Find product near avatar using improved product positioning
    const nearbyProduct = products.find((product, index) => {
      // Get product section (or default to clothing section)
      const productCategory = product.category || 'clothing';
      const section = storeSections.find(s => 
        s.id === productCategory || 
        (s.type === 'category' && productCategory.includes(s.id))
      ) || storeSections.find(s => s.id === 'clothing');
      
      if (!section) return false;
      
      // Calculate grid position within the section
      const productsInCategory = products.filter(p => p.category === productCategory).length;
      const productsPerRow = Math.min(productsInCategory, 4);
      const rowIndex = Math.floor(index / productsPerRow);
      const colIndex = index % productsPerRow;
      
      const gridX = section.x - section.width/2 + section.width * (colIndex + 0.5) / productsPerRow;
      const gridY = section.y - section.height/2 + section.height * (rowIndex + 0.5) / Math.ceil(productsInCategory / productsPerRow);
      
      const distance = Math.sqrt(
        Math.pow(gridX - avatarPosition.x, 2) + 
        Math.pow(gridY - avatarPosition.y, 2)
      );
      
      return distance < 20; // Enhanced proximity threshold
    });
    
    // If we found a nearby product and it's different from currently selected
    if (nearbyProduct && nearbyProduct.id !== selectedProduct?.id) {
      // Show interaction state
      setInteractionState("قريب من منتج");
      
      // Mark 'viewProduct' task as complete if not already
      if (!completedTasks.includes('viewProduct')) {
        setCompletedTasks(prev => [...prev, 'viewProduct']);
      }
    } 
    // If we lose proximity to a product
    else if (!nearbyProduct && selectedProduct) {
      setInteractionState(null);
    }
    
    setSelectedProduct(nearbyProduct || null);
  }, [avatarPosition, products, selectedAvatar, vrEnabled, selectedProduct, completedTasks]);
  
  // Handle product interaction - selecting/clicking a product
  const handleProductClick = (product: Product) => {
    // Set interaction state based on action
    setInteractionState("يستعرض المنتج");
    
    // Mark view product task as complete if not already 
    if (!completedTasks.includes('viewProduct')) {
      setCompletedTasks(prev => [...prev, 'viewProduct']);
      
      // Display AI helper tip for first-time product interaction
      toast({
        title: "تلميح من المساعد الذكي",
        description: "يمكنك التفاعل مع المنتج بالنقر على الأزرار أدناه لمزيد من التفاصيل أو إضافته للسلة",
        duration: 5000,
      });
    }
    
    // Increase user level for interaction with products
    setUserLevel(prevLevel => Math.min(10, prevLevel + 1));
    
    // Set the selected product
    setSelectedProduct(product);
  };
  
  if (!vrEnabled) {
    return null;
  }
  
  // Avatar selection handler - defined early to avoid hooks ordering issues
  const handleSelectAvatar = (avatar: AvatarProps) => {
    setSelectedAvatar(avatar);
    toast({
      title: `مرحبا ${avatar.name}!`,
      description: `لقد اخترت ${avatar.name} - ${avatar.personality}`,
    });
  };
  
  // If no avatar selected, show avatar selection UI
  if (!selectedAvatar) {
    return <AvatarSelectionScreen onSelect={handleSelectAvatar} />;
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
  
  // Brand partners with locations in the VR mall - with cyberpunk style 3D logo designs
  const brandPartners = [
    { 
      id: 1, 
      name: "تك ستار", 
      logo: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323590/tech-star-logo_gdxvf2.png",
      category: "electronics",
      x: 20, 
      y: 25,
      featured: true,
      storeSize: "large",
      storeType: "premium",
      description: "متجر متخصص في أحدث المنتجات التكنولوجية والإلكترونيات الذكية مع تجربة تسوق مستقبلية",
      productCount: 24,
      color: "#5e35b1",
      storeImage: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323600/tech-store-cyberpunk_ymcvml.jpg",
      vrFeatures: ["عروض ثلاثية الأبعاد", "تجربة المنتجات افتراضياً", "خدمة عملاء بالواقع المعزز"]
    },
    { 
      id: 2, 
      name: "فاشن أرابيا", 
      logo: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323590/fashion-arabia-logo_qwnlga.png",
      category: "clothing",
      x: 70, 
      y: 25,
      featured: true,
      storeSize: "large",
      storeType: "premium",
      description: "أحدث صيحات الموضة العربية والعالمية بتصاميم مميزة وحصرية مع غرف تبديل ملابس افتراضية",
      productCount: 42,
      color: "#e91e63",
      storeImage: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323600/fashion-store-cyberpunk_jnmgxx.jpg",
      vrFeatures: ["تجربة الملابس افتراضياً", "استشارة مصممين عبر الواقع المعزز", "عروض أزياء ثلاثية الأبعاد"]
    },
    { 
      id: 3, 
      name: "الديار", 
      logo: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323590/home-deco-logo_ovbehk.png",
      category: "home",
      x: 20, 
      y: 75,
      featured: false,
      storeSize: "medium",
      storeType: "standard",
      description: "كل ما تحتاجه لمنزلك من أثاث عصري وتجهيزات منزلية أنيقة مع إمكانية تصور منزلك بالكامل",
      productCount: 18,
      color: "#4caf50",
      storeImage: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323600/home-store-cyberpunk_lfipw0.jpg",
      vrFeatures: ["تصميم المنزل ثلاثي الأبعاد", "وضع الأثاث في بيتك افتراضياً"]
    },
    { 
      id: 4, 
      name: "الرياضي", 
      logo: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323590/sports-logo_vlexe1.png",
      category: "sports",
      x: 70, 
      y: 75,
      featured: false,
      storeSize: "medium",
      storeType: "standard",
      description: "كل ما يخص الرياضة من ملابس ومعدات وأدوات رياضية احترافية مع تجارب رياضية افتراضية",
      productCount: 15,
      color: "#2196f3",
      storeImage: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323600/sports-store-cyberpunk_ehxwlf.jpg",
      vrFeatures: ["تجربة المعدات الرياضية افتراضياً", "لعب رياضات افتراضية"]
    },
    { 
      id: 5, 
      name: "سمارت ديفايس", 
      logo: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323590/smart-devices-logo_pgiwbm.png",
      category: "electronics",
      x: 30, 
      y: 35,
      featured: true,
      storeSize: "medium",
      storeType: "premium",
      description: "متخصصون في الأجهزة الذكية وإنترنت الأشياء وتقنيات المنزل الذكي مع تجارب تفاعلية",
      productCount: 29,
      color: "#ff9800",
      storeImage: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323599/smart-devices-store_fjjuug.jpg",
      vrFeatures: ["تجربة المنزل الذكي", "التحكم بالأجهزة افتراضياً"]
    },
    { 
      id: 6, 
      name: "لاكشري ستايل", 
      logo: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323590/luxury-logo_o8wgzq.png",
      category: "clothing",
      x: 80, 
      y: 40,
      featured: true,
      storeSize: "small",
      storeType: "entrance",
      description: "منتجات فاخرة وماركات عالمية حصرية للعملاء المميزين مع تجربة تسوق استثنائية",
      productCount: 12,
      color: "#9c27b0",
      storeImage: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323599/luxury-store-cyberpunk_mttxib.jpg",
      vrFeatures: ["تجربة خاصة للمنتجات الفاخرة", "استشارة ستايل شخصية"]
    },
    { 
      id: 7, 
      name: "تك هب", 
      logo: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323590/tech-hub-logo_a1uyqn.png",
      category: "electronics",
      x: 45, 
      y: 15,
      featured: true,
      storeSize: "flagship",
      storeType: "entrance",
      description: "المتجر الرئيسي للتكنولوجيا الحديثة وأحدث المنتجات التقنية مع تجارب تفاعلية غامرة",
      productCount: 50,
      color: "#03a9f4",
      storeImage: "https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323599/tech-hub-store_tzcnld.jpg",
      vrFeatures: ["مختبر تجارب الواقع الافتراضي", "تجربة الجيل القادم من التقنيات"]
    },
  ];

  // Mall floor plan with realistic store locations and experiences - already defined above
  
  // Get current section based on avatar position
  // Category to lighting color mapping
  const categoryLighting = {
    'electronics': {
      primaryColor: '#03a9f4', // Blue
      secondaryColor: '#0ea5e9',
      intensity: 0.25,
      pulseRate: 'fast'
    },
    'clothing': {
      primaryColor: '#e91e63', // Pink
      secondaryColor: '#ec4899',
      intensity: 0.2,
      pulseRate: 'medium'
    },
    'home': {
      primaryColor: '#4caf50', // Green
      secondaryColor: '#22c55e',
      intensity: 0.15,
      pulseRate: 'slow'
    },
    'sports': {
      primaryColor: '#2196f3', // Blue
      secondaryColor: '#a855f7', 
      intensity: 0.3,
      pulseRate: 'fast'
    },
    'entrance': {
      primaryColor: '#5e35b1', // Purple
      secondaryColor: '#7c3aed',
      intensity: 0.2,
      pulseRate: 'medium'
    },
    'plaza': {
      primaryColor: '#9c27b0', // Purple
      secondaryColor: '#d946ef',
      intensity: 0.25,
      pulseRate: 'medium'
    },
    'special': {
      primaryColor: '#ff9800', // Orange
      secondaryColor: '#f59e0b',
      intensity: 0.3,
      pulseRate: 'slow'
    },
    'vip': {
      primaryColor: '#9333ea', // Purple
      secondaryColor: '#c026d3',
      intensity: 0.4,
      pulseRate: 'slow'
    }
  };

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
  
  // Get ambient color scheme based on current section
  const getCurrentColors = () => {
    if (!currentSection) return categoryColors.default;
    
    // If section has an explicit category, use it
    if (currentSection.category && 
        Object.prototype.hasOwnProperty.call(categoryColors, currentSection.category)) {
      return categoryColors[currentSection.category as keyof typeof categoryColors];
    }
    
    // For category sections, use their id
    if (currentSection.type === 'category' && 
        Object.prototype.hasOwnProperty.call(categoryColors, currentSection.id)) {
      return categoryColors[currentSection.id as keyof typeof categoryColors];
    }
    
    // Fallback to default colors
    return categoryColors.default;
  }
  
  const currentColors = getCurrentColors();
  
  // Handle transition completion - defined inline to avoid hooks ordering issues
  const handleTransitionFinish = () => {
    setShowTransition(false);
  };
  
  // Update active section when avatar moves between sections

  useEffect(() => {
    if (!selectedAvatar || !vrEnabled) return;
    
    const newSection = getCurrentSection();
    
    // If entered a new section that's different from the current active section
    if (newSection && newSection !== activeSection) {
      // Store the previous section before updating active section
      setPreviousSection(activeSection);
      setActiveSection(newSection);
      
      // Update ambient lighting based on section type or id
      const sectionType = newSection.type;
      const sectionId = newSection.id;
      
      // Choose lighting based on section type or specific id
      let newLighting;
      
      // First check if the section id matches a specific category
      if (categoryLighting[sectionId]) {
        newLighting = categoryLighting[sectionId];
      } 
      // Otherwise use the section type
      else if (categoryLighting[sectionType]) {
        newLighting = categoryLighting[sectionType];
      } 
      // Default lighting
      else {
        newLighting = {
          primaryColor: '#5e35b1',
          secondaryColor: '#7c3aed',
          intensity: 0.2,
          pulseRate: 'medium'
        };
      }
      
      // Apply new ambient lighting with animation
      setAmbientLighting(newLighting);
      
      // Only show transition animation if moving between different section types
      if (activeSection && newSection.type !== activeSection.type) {
        // Determine the transition style based on the sections involved
        const transitionMap: Record<string, string> = {
          'entrance_category': 'modern',
          'category_special': 'futuristic',
          'special_category': 'cultural',
          'plaza_category': 'geometric',
          'category_plaza': 'calligraphy',
          'wing_category': 'arabesque',
          'default': 'fade'
        };
        
        const transitionKey = activeSection && newSection
          ? `${activeSection.type}_${newSection.type}`
          : 'default';
          
        setTransitionStyle(transitionMap[transitionKey] || 'fade');
        setShowTransition(true);
      }
      
      // Only show notification for sections with features
      if (newSection.features) {
        // Show notification about section features
        toast({
          title: `أهلاً بك في ${newSection.name}!`,
          description: `اكتشف الميزات المتاحة في هذه المنطقة: ${newSection.features.map(f => f.name).join('، ')}`,
          duration: 5000,
        });
        
        // If this is a first-time visit to any section with features
        if (!completedTasks.includes('visitSection')) {
          setCompletedTasks(prev => [...prev, 'visitSection']);
          
          toast({
            title: "تلميح من المساعد الذكي",
            description: "انقر على أيقونات الميزات المتوفرة في المنطقة للتفاعل معها وتجربة مزايا المول الافتراضي",
            duration: 6000,
          });
        }
      }
    } 
    // If leaving a section
    else if (!newSection && activeSection) {
      setActiveSection(null);
      setSelectedFeature(null);
      setShowFeatureDetails(false);
      
      // Reset to default lighting
      setAmbientLighting({
        primaryColor: '#5e35b1',
        secondaryColor: '#ff9800',
        intensity: 0.2,
        pulseRate: 'slow'
      });
    }
  }, [avatarPosition, storeSections, selectedAvatar, vrEnabled, activeSection, completedTasks]);

  return (
    <>
      {/* Cultural transition animation between sections */}
      <CulturalTransition 
        show={showTransition} 
        style={transitionStyle as any} 
        onFinish={handleTransitionFinish} 
      />
      
      <div 
        ref={mallRef}
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
      
      {/* Dynamic Ambient Mood Lighting */}
      <div 
        className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-30 transition-all duration-1000"
        style={{ 
          backgroundImage: `linear-gradient(to top, ${ambientLighting.primaryColor}20, transparent, transparent)` 
        }}
      ></div>
      
      {/* Primary ambient glow - top */}
      <div 
        className="absolute top-0 left-1/4 w-1/2 h-1/3 blur-3xl rounded-full transition-all duration-1000"
        style={{ 
          backgroundColor: `${ambientLighting.primaryColor}10`,
          opacity: ambientLighting.intensity,
          animation: ambientLighting.pulseRate === 'fast' ? 'pulse-fast 4s infinite' : 
                    ambientLighting.pulseRate === 'medium' ? 'pulse 6s infinite' : 
                    'pulse-slow 8s infinite'
        }}
      ></div>
      
      {/* Secondary ambient glow - bottom */}
      <div 
        className="absolute bottom-0 right-1/4 w-1/2 h-1/4 blur-3xl rounded-full transition-all duration-1000"
        style={{ 
          backgroundColor: `${ambientLighting.secondaryColor}10`,
          opacity: ambientLighting.intensity * 0.7,
          animation: ambientLighting.pulseRate === 'fast' ? 'pulse-fast 5s infinite' : 
                    ambientLighting.pulseRate === 'medium' ? 'pulse 7s infinite' : 
                    'pulse-slow 9s infinite'
        }}
      ></div>
      
      {/* Additional ambient accent light */}
      <div 
        className="absolute top-1/3 right-1/4 w-1/4 h-1/4 blur-3xl rounded-full transition-all duration-1000"
        style={{ 
          backgroundColor: `${ambientLighting.secondaryColor}08`,
          opacity: ambientLighting.intensity * 0.5,
          animation: 'float3 15s infinite'
        }}
      ></div>
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
        
        {/* Virtual shop displays with product showcases */}
        {storeSections.filter(section => section.type === 'category').map(section => (
          <div key={section.id} className="absolute" style={{
            left: `${section.x - section.width/2}%`,
            top: `${section.y - section.height/2}%`,
            width: `${section.width}%`,
            height: `${section.height}%`,
          }}>
            {/* Enhanced shopping area with Arabic styling and modern tech elements */}
            <div className="relative w-full h-full group">
              {/* Decorative Arabic-inspired patterns */}
              <div className="absolute inset-0 opacity-10" 
                style={{
                  backgroundImage: 'url("https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323599/arabic-pattern_wqcgvr.png")',
                  backgroundSize: '120px',
                  backgroundBlendMode: 'soft-light',
                  mixBlendMode: 'overlay'
                }}>
              </div>
                
              {/* Virtual display shelves with improved styling */}
              <div className="absolute left-1/4 top-1/4 w-1/2 h-1/2 
                            border border-white/20 rounded-lg 
                            bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-sm
                            transition-all duration-300 transform group-hover:scale-105"
                  style={{
                    boxShadow: `0 0 20px ${
                      section.id === 'electronics' ? '#03a9f415' : 
                      section.id === 'clothing' ? '#e91e6315' : 
                      section.id === 'home' ? '#4caf5015' : 
                      section.id === 'sports' ? '#2196f315' : '#5e35b115'
                    }`
                  }}>
                {/* Product showcase hologram effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-4/5 w-4/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute w-full h-full bg-gradient-to-t from-transparent via-white/5 to-transparent 
                                   animate-scanner rounded-lg"></div>
                    <i className={`text-6xl opacity-30 ${
                      section.id === 'electronics' ? 'fas fa-laptop text-blue-400' : 
                      section.id === 'clothing' ? 'fas fa-tshirt text-pink-400' : 
                      section.id === 'home' ? 'fas fa-couch text-green-400' : 
                      section.id === 'sports' ? 'fas fa-dumbbell text-purple-400' : 
                      'fas fa-shopping-bag text-amber-400'
                    }`}></i>
                  </div>
                </div>
              </div>
              
              {/* Modern interactive signage with Arabic calligraphy */}
              <div className="absolute left-0 top-0 w-2/5 h-1/5 
                            border border-white/10 rounded-lg 
                            bg-black/30 backdrop-blur-sm overflow-hidden"
                style={{
                  backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)',
                  backgroundSize: '8px 8px'
                }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold">{section.name}</div>
                    <div className="text-[8px] opacity-70">تسوق الآن</div>
                  </div>
                </div>
                {/* Animated dots */}
                <div className="absolute bottom-1 right-1 flex">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping delay-100"></div>
                  <div className="w-1 h-1 bg-pink-400 rounded-full animate-ping delay-200 ml-0.5"></div>
                  <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping delay-300 ml-0.5"></div>
                </div>
              </div>
              
              {/* Digital product display stands */}
              <div className="absolute right-1/8 bottom-1/8 w-1/5 h-2/5 
                            border border-white/20 rounded-lg 
                            bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm">
                {/* Digital price tag */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 
                               text-[8px] px-2 py-0.5 bg-black/60 rounded-full border border-white/10">
                  عروض خاصة
                </div>
                {/* Holographic floating effect */}
                <div className="absolute inset-4 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent 
                                   animate-float4 rounded-full" 
                        style={{
                          boxShadow: `0 0 15px ${
                            section.id === 'electronics' ? '#03a9f410' : 
                            section.id === 'clothing' ? '#e91e6310' : 
                            section.id === 'home' ? '#4caf5010' : 
                            section.id === 'sports' ? '#2196f310' : '#5e35b110'
                          }`
                        }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Products displayed with cyberpunk styling and 3D-like effects */}
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
          
          // Calculate distance from avatar to this product for effects
          const distance = Math.sqrt(
            Math.pow(avatarPosition.x - gridX, 2) + 
            Math.pow(avatarPosition.y - gridY, 2)
          );
          
          // Apply proximity effects based on avatar distance
          const isNearby = distance < 15;
          const isSelected = selectedProduct?.id === product.id;
          
          return (
            <div 
              key={product.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 cursor-pointer
                        ${isSelected ? 'scale-125 z-30' : isNearby ? 'scale-110 z-20' : 'scale-100 z-10'}`}
              style={{ 
                left: `${gridX + randomOffsetX}%`, 
                top: `${gridY + randomOffsetY}%`,
                // Slight 3D perspective tilt
                transform: `translate(-50%, -50%) ${isNearby ? 'perspective(1000px) rotateY(10deg)' : ''}`,
                filter: isSelected ? 'brightness(1.3)' : isNearby ? 'brightness(1.1)' : 'brightness(1)',
              }}
              onClick={() => setSelectedProduct(product)}
            >
              {/* Product display with holographic effect */}
              <div className={`relative w-24 h-24 mb-2 rounded-lg overflow-hidden shadow-xl
                            transition-all duration-300 ease-out
                            ${isSelected ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 
                               isNearby ? 'ring-1 ring-white/50 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 
                               'border border-white/20'}`}
              >
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent"></div>
                
                {/* Main product image */}
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className={`w-full h-full object-cover transition-transform duration-500 
                              ${isNearby ? 'scale-110' : 'scale-100'}`}
                />
                
                {/* Holographic scan line effect */}
                <div className={`absolute inset-x-0 h-[1px] bg-white/60 shadow-[0_0_5px_rgba(255,255,255,0.5)] 
                                top-0 animate-scan-slow ${isNearby ? 'opacity-100' : 'opacity-40'}`}></div>
                
                {/* Overlay effect */}
                <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30 
                                ${isSelected ? 'opacity-20' : 'opacity-40'}`}></div>
                
                {/* VR indicator */}
                {product.vrEnabled && (
                  <div className="absolute bottom-1 right-1 bg-[#5e35b1]/80 rounded-full w-5 h-5 flex items-center justify-center">
                    <i className="fas fa-vr-cardboard text-[8px] text-white"></i>
                  </div>
                )}
              </div>
              
              {/* Product info with cyberpunk style */}
              <div className={`flex flex-col items-center transition-all duration-300 
                              ${isNearby ? 'opacity-100' : 'opacity-80'}`}>
                {/* Product name */}
                <div className={`text-xs text-center px-2 py-1 rounded-md backdrop-blur-sm whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis
                              bg-gradient-to-r ${isSelected ? 'from-black/90 to-black/80' : 'from-black/80 to-black/60'}
                              border ${isSelected ? 'border-white/30' : 'border-white/10'}`}>
                  <span className={`font-bold ${isSelected ? 'text-white' : 'text-white/90'}`}>{product.name}</span>
                </div>
                
                {/* Price with glowing effect */}
                <div className={`mt-1 px-3 py-0.5 text-xs font-bold rounded-full 
                              ${isSelected ? 
                                'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 
                                'bg-black/70 text-white border border-white/20'}`}>
                  {product.price.toLocaleString()} ج.م
                </div>
              </div>
              
              {/* Interaction prompt - only when nearby and not selected */}
              {isNearby && !isSelected && (
                <div className="absolute -bottom-5 animate-bounce opacity-80 text-[10px] bg-black/50 px-2 py-0.5 rounded-full">
                  <i className="fas fa-hand-pointer mr-1 text-[8px]"></i>
                  اضغط للعرض
                </div>
              )}
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
        
        {/* VR Avatar with enhanced cyberpunk effects */}
        <div 
          className={`avatar absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 
                    ${isMoving ? 'scale-105' : 'scale-100'} transition-transform`}
          style={{ 
            left: `${avatarPosition.x}%`, 
            top: `${avatarPosition.y}%`,
            transition: gestureControlEnabled ? 'none' : 'left 0.4s ease-out, top 0.4s ease-out',
            zIndex: 100
          }}
        >
          {/* Holographic floor projection - only visible when moving */}
          {isMoving && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-3 rounded-full blur-lg opacity-30"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(94,53,177,0.3) 50%, transparent 70%)',
                  animation: 'pulse 1.5s ease-in-out infinite alternate'
                }}>
            </div>
          )}
          
          {/* Movement path trail effect */}
          <div className="absolute inset-0 z-[-1]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-full h-full rounded-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  transform: `scale(${1 + i * 0.15})`,
                  opacity: isMoving ? (0.7 - i * 0.15) : 0,
                  transition: 'opacity 0.3s ease',
                  filter: 'blur(1px)'
                }}
              ></div>
            ))}
          </div>
          
          {/* Futuristic targeting reticle */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-24 h-24 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={`opacity-${isMoving ? '80' : '30'} transition-opacity duration-500`}>
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="6,4" className="animate-pattern-rotate" />
              <line x1="10" y1="50" x2="30" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="70" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50" y1="10" x2="50" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="50" y1="70" x2="50" y2="90" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            </svg>
          </div>
          
          {/* Navigation direction indicator */}
          {isMoving && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <div className="h-5 w-10 clip-arrow bg-gradient-to-b from-white to-transparent opacity-70"></div>
              <div className="text-[10px] text-white/70 whitespace-nowrap bg-black/40 px-2 py-0.5 rounded-full mt-1">
                {moveDirection}
              </div>
            </div>
          )}
          
          {/* Avatar character with cyberpunk styling */}
          <div className="relative">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {/* Holographic scan effect */}
              <div className="absolute inset-x-0 h-[1px] bg-white/60 animate-scan-slow z-30"></div>
              
              {/* Digital interference effect for cyber look */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#5e35b1]/10 to-transparent opacity-70 z-20 mix-blend-overlay"></div>
              
              {/* Avatar image */}
              <img 
                src={selectedAvatar.image} 
                alt={selectedAvatar.name} 
                className={`w-full h-full object-cover transition-all duration-300 ${isTryingOn ? 'opacity-80' : 'opacity-100'}`}
              />
              
              {/* Cyberpunk overlay frame */}
              <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border border-white/5 rounded-full" style={{ transform: 'scale(0.9)' }}></div>
              
              {/* Avatar status indicators */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center border border-white/30" 
                   title="VR Mode Active">
                <i className="fas fa-vr-cardboard text-[8px] text-white"></i>
              </div>
              
              <div className="absolute bottom-1 left-1 w-5 h-5 bg-green-500/80 rounded-full flex items-center justify-center border border-white/30 animate-pulse"
                   title="Online Status">
                <i className="fas fa-signal text-[8px] text-white"></i>
              </div>
            </div>
            
            {/* Floating user info panel */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 min-w-[120px]">
              <div className="relative bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                {/* Username with level */}
                <div className="text-center">
                  <span className="text-white font-medium text-sm">{selectedAvatar.name}</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-[10px] text-white/70">المستوى</span>
                    <span className="bg-[#5e35b1] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {userLevel}
                    </span>
                  </div>
                </div>
                
                {/* Status chip */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-black/80 text-[10px] text-white/80 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                  {isMoving ? 'يتحرك...' : 'متصل'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Virtual try-on overlay */}
          {isTryingOn && selectedProduct && (
            <div className="absolute top-0 left-0 w-full">
              <div className="relative">
                {/* Product visualization */}
                <div className="absolute top-2 -left-24 w-20 h-20 bg-black/50 backdrop-blur-md rounded-lg border border-white/20 p-1.5 flex flex-col items-center">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-14 h-14 object-contain animate-float-slow"
                  />
                  <div className="text-[9px] text-white/80 text-center mt-1 line-clamp-1">
                    {selectedProduct.name}
                  </div>
                </div>
                
                {/* Try-on status */}
                <div className="absolute -right-32 top-6 bg-[#5e35b1]/80 text-white text-[10px] px-2 py-1 rounded-full border border-white/20 whitespace-nowrap animate-pulse">
                  <i className="fas fa-tshirt mr-1 text-[8px]"></i>
                  تجربة افتراضية
                </div>
                
                {/* Simulated product on avatar - overlay effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-16 h-16 object-contain absolute z-20"
                    style={{ 
                      filter: 'brightness(1.2) contrast(0.9)',
                      mixBlendMode: 'overlay'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Interaction state indicators */}
          {interactionState && (
            <div className="absolute -left-32 top-0 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/10">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>{interactionState}</span>
              </div>
            </div>
          )}
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
        
        <div className="h-6 w-px bg-white/20"></div>
        
        <button 
          className="text-sm text-white/80 hover:text-white bg-red-500/30 hover:bg-red-500/50 px-2 py-1 rounded-md"
          onClick={toggleVR}
        >
          <i className="fas fa-door-open mr-1"></i>
          خروج من الواقع الافتراضي
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
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-md">
          <div className="bg-black relative rounded-xl p-0 max-w-4xl w-full mx-4 shadow-2xl border border-white/20 overflow-hidden">
            {/* Store header background image */}
            <div className="absolute inset-0 opacity-20 z-0">
              <img 
                src={selectedBrand.storeImage} 
                alt={`${selectedBrand.name} store`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>
            
            {/* Store content */}
            <div className="relative z-10 p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Store logo with glowing border */}
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 border-2 mx-auto md:mx-0"
                    style={{ 
                      borderColor: selectedBrand.color,
                      boxShadow: `0 0 20px ${selectedBrand.color}40`
                    }}
                  >
                    <img src={selectedBrand.logo} alt={selectedBrand.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="text-center md:text-right">
                    <h2 className="text-3xl font-bold mb-2 text-white tracking-wide">{selectedBrand.name}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className="border rounded-full py-1 px-3 text-xs tracking-wide"
                        style={{ 
                          backgroundColor: `${selectedBrand.color}20`, 
                          color: selectedBrand.color, 
                          borderColor: `${selectedBrand.color}40`
                        }}
                      >
                        {selectedBrand.category === 'electronics' ? 'إلكترونيات' :
                         selectedBrand.category === 'clothing' ? 'ملابس' :
                         selectedBrand.category === 'home' ? 'منزل' : 'رياضة'}
                      </Badge>
                      
                      {selectedBrand.featured && (
                        <Badge variant="outline" className="bg-white/10 text-white border-white/30 rounded-full py-1 px-3 text-xs tracking-wide">
                          <i className="fas fa-star mr-1 text-[10px] text-amber-400"></i>
                          شريك مميز
                        </Badge>
                      )}
                      
                      <Badge 
                        variant="outline" 
                        className="rounded-full py-1 px-3 text-xs tracking-wide border"
                        style={{ 
                          backgroundColor: `${selectedBrand.storeType === 'premium' ? '#f59e0b' : 
                            selectedBrand.storeType === 'entrance' ? '#ef4444' : '#3b82f6'}20`,
                          color: `${selectedBrand.storeType === 'premium' ? '#f59e0b' : 
                            selectedBrand.storeType === 'entrance' ? '#ef4444' : '#3b82f6'}`,
                          borderColor: `${selectedBrand.storeType === 'premium' ? '#f59e0b' : 
                            selectedBrand.storeType === 'entrance' ? '#ef4444' : '#3b82f6'}40`
                        }}
                      >
                        {selectedBrand.storeType === 'premium' ? 'متجر مميز' :
                         selectedBrand.storeType === 'entrance' ? 'بمدخل المول' : 'متجر عادي'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="absolute top-2 right-2 text-white/60 hover:text-white rounded-full w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-black/80 border border-white/10"
                  onClick={() => {
                    setShowStoreDetails(false);
                    setSelectedBrand(null);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              {/* Store interior image */}
              <div className="rounded-lg overflow-hidden mb-6 h-56 relative">
                <img 
                  src={selectedBrand.storeImage} 
                  alt={`${selectedBrand.name} interior`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-white/90 text-sm md:text-base leading-relaxed">
                    {selectedBrand.description}
                  </p>
                </div>
              </div>
              
              {/* Store stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div 
                  className="p-4 rounded-lg flex flex-col items-center border"
                  style={{ 
                    backgroundColor: `${selectedBrand.color}10`,
                    borderColor: `${selectedBrand.color}30`
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ 
                      backgroundColor: `${selectedBrand.color}20`
                    }}
                  >
                    <i className="fas fa-store" style={{ color: selectedBrand.color }}></i>
                  </div>
                  <div className="text-lg font-bold text-white">{selectedBrand.productCount}</div>
                  <div className="text-sm text-white/60">منتج</div>
                </div>
                
                <div 
                  className="p-4 rounded-lg flex flex-col items-center border"
                  style={{ 
                    backgroundColor: `${selectedBrand.color}10`,
                    borderColor: `${selectedBrand.color}30`
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ 
                      backgroundColor: `${selectedBrand.color}20`
                    }}
                  >
                    <i className="fas fa-ruler-combined" style={{ color: selectedBrand.color }}></i>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedBrand.storeSize === 'large' ? 'كبير' :
                     selectedBrand.storeSize === 'medium' ? 'متوسط' :
                     selectedBrand.storeSize === 'flagship' ? 'رئيسي' : 'صغير'}
                  </div>
                  <div className="text-sm text-white/60">حجم المتجر</div>
                </div>
                
                <div 
                  className="p-4 rounded-lg flex flex-col items-center border"
                  style={{ 
                    backgroundColor: `${selectedBrand.color}10`,
                    borderColor: `${selectedBrand.color}30`
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ 
                      backgroundColor: `${selectedBrand.color}20`
                    }}
                  >
                    <i className="fas fa-medal" style={{ color: selectedBrand.color }}></i>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedBrand.featured ? 'ذهبي' : 'فضي'}
                  </div>
                  <div className="text-sm text-white/60">مستوى الشراكة</div>
                </div>
              </div>
              
              {/* VR Features Section */}
              <div className="p-5 rounded-lg mb-6 border" style={{ 
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderColor: 'rgba(255,255,255,0.2)',
                background: 'linear-gradient(to right, rgba(0,0,0,0.8), transparent), url(https://res.cloudinary.com/dvu0agxjg/image/upload/v1711323599/vr-grid-pattern_txbqxu.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <h3 className="font-bold mb-4 flex items-center text-lg text-white">
                  <i className="fas fa-vr-cardboard text-white mr-3"></i>
                  تجارب الواقع الافتراضي في {selectedBrand.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  {selectedBrand.vrFeatures?.map((feature, index) => (
                    <div key={index} className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 flex items-center">
                      <i className="fas fa-check-circle text-white mr-2"></i>
                      <span className="text-white/90 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Partnership Section */}
              <div className="p-5 rounded-lg mb-6 border" style={{ 
                backgroundColor: `${selectedBrand.color}10`, 
                borderColor: `${selectedBrand.color}30`,
                backgroundImage: `linear-gradient(to right, ${selectedBrand.color}20, transparent)`
              }}>
                <h3 className="font-bold mb-3 flex items-center text-lg text-white">
                  <i className="fas fa-handshake mr-3" style={{ color: selectedBrand.color }}></i>
                  فرص الشراكة مع {selectedBrand.name}
                </h3>
                <p className="text-white/80 mb-2">
                  يمكنك الإنضمام لبرنامج الشراكة مع {selectedBrand.name} والحصول على عمولة بنسبة تصل إلى 15% على كل عملية بيع تتم من خلال رابط الإحالة الخاص بك.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                  <div className="flex items-center"><i className="fas fa-percentage text-xs mr-1" style={{ color: selectedBrand.color }}></i> نسب عمولة مرتفعة</div>
                  <div className="flex items-center"><i className="fas fa-gift text-xs mr-1" style={{ color: selectedBrand.color }}></i> منتجات حصرية</div>
                  <div className="flex items-center"><i className="fas fa-tag text-xs mr-1" style={{ color: selectedBrand.color }}></i> خصومات خاصة</div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-white/90 transition flex items-center justify-center"
                  onClick={() => {
                    setShowStoreDetails(false);
                    setSelectedBrand(null);
                    // Navigate to partnership page
                    window.location.href = '/partnership';
                  }}
                >
                  <i className="fas fa-handshake mr-2"></i>
                  انضم كشريك
                </button>
                
                <button 
                  className="bg-transparent border border-white/20 text-white font-bold py-3 px-4 rounded-lg hover:bg-white/10 transition flex items-center justify-center"
                  onClick={() => {
                    setShowStoreDetails(false);
                    setSelectedBrand(null);
                  }}
                >
                  <i className="fas fa-shopping-bag mr-2"></i>
                  تصفح المنتجات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}