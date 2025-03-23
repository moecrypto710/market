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

interface VRMallProps {
  products: Product[];
}

// Avatar selections with personality traits and special abilities
const AVATARS = [
  { 
    id: 1, 
    name: "عمر",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Omar&backgroundColor=b6e3f4",
    personality: "مهتم بالتكنولوجيا والإلكترونيات الحديثة",
    favoriteCategory: "electronics",
    personalStyle: "عصري تقني",
    benefits: [
      "تخفيضات إضافية 10% على الإلكترونيات",
      "وصول حصري لآخر التقنيات",
      "دليل تقني متخصص"
    ],
    color: "#5e35b1",
    specialFeature: "محلل المواصفات",
    specialFeatureDescription: "قدرة خاصة على تحليل مواصفات المنتجات التقنية ومقارنتها بسرعة"
  },
  { 
    id: 2, 
    name: "ليلى",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Laila&backgroundColor=ffdfbf",
    personality: "عاشقة للموضة والأزياء التقليدية والحديثة",
    favoriteCategory: "clothing",
    personalStyle: "أنيق عصري",
    benefits: [
      "نصائح أزياء شخصية",
      "وصول مبكر للتشكيلات الجديدة",
      "تجربة افتراضية للملابس"
    ],
    color: "#e91e63",
    specialFeature: "مستشار الأناقة",
    specialFeatureDescription: "قدرة خاصة على تنسيق الإطلالات المثالية وفقاً لشخصيتك ومناسباتك"
  },
  { 
    id: 3, 
    name: "سلمى",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Salma&backgroundColor=d1d4f9",
    personality: "مهتمة بالديكور المنزلي وتصميم المساحات",
    favoriteCategory: "home",
    personalStyle: "كلاسيكي أنيق",
    benefits: [
      "تصميم ثلاثي الأبعاد لمنزلك",
      "استشارات ديكور مجانية",
      "تخفيضات على الأثاث"
    ],
    color: "#4caf50",
    specialFeature: "مصمم المساحات",
    specialFeatureDescription: "قدرة خاصة على تصور المنتجات في مساحات منزلك قبل الشراء"
  },
  { 
    id: 4, 
    name: "محمد",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Mohamed&backgroundColor=c0aede",
    personality: "رياضي ومهتم باللياقة البدنية والأنشطة الحركية",
    favoriteCategory: "sports",
    personalStyle: "رياضي حيوي",
    benefits: [
      "اختبار المعدات الرياضية",
      "خطط تدريب شخصية",
      "عضوية في نادي الرياضيين"
    ],
    color: "#2196f3",
    specialFeature: "مدرب اللياقة",
    specialFeatureDescription: "قدرة خاصة على اختبار المعدات الرياضية وتقييم مناسبتها لأهدافك"
  },
  { 
    id: 5, 
    name: "نور",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Noor&backgroundColor=ffd1dc",
    personality: "مهتمة بالتسوق الذكي والعروض الحصرية",
    favoriteCategory: "vip-lounge",
    personalStyle: "فاخر عصري",
    benefits: [
      "وصول حصري لقسم كبار الزوار",
      "عروض خاصة على المنتجات الفاخرة",
      "خدمة مساعد تسوق شخصي"
    ],
    color: "#9c27b0",
    specialFeature: "صائد العروض",
    specialFeatureDescription: "قدرة خاصة على اكتشاف أفضل العروض والتخفيضات في المول"
  },
];

export default function VRMall({ products }: VRMallProps) {
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<typeof AVATARS[0] | null>(null);
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 70 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<typeof brandPartners[0] | null>(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<any | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [showFeatureDetails, setShowFeatureDetails] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  // New avatar enhancement state variables
  const [isMoving, setIsMoving] = useState(false);
  const [moveDirection, setMoveDirection] = useState('شمال');
  const [userLevel, setUserLevel] = useState(1);
  const [interactionState, setInteractionState] = useState<string | null>(null);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  
  const mallRef = useRef<HTMLDivElement>(null);
  const { vrEnabled, gestureControlEnabled } = useVR();
  
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
  
  // If no avatar selected, show avatar selection
  if (!selectedAvatar) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-gradient-to-tr from-[#2a1f6f] to-[#5e35b1]/80 rounded-lg p-8 max-w-3xl w-full shadow-xl shadow-purple-900/20">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">اختر شخصيتك في مول أمريكي</h2>
          <p className="text-white/60 text-center mb-4">كل شخصية تمتلك قدرات وميزات فريدة تناسب أسلوبك في التسوق</p>
          
          {/* AI Assistant Tips */}
          <div className="mb-6 p-3 bg-gradient-to-r from-[#00ffcd]/10 to-[#ff00aa]/10 rounded-lg border border-[#00ffcd]/20 flex items-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00ffcd] to-[#ff00aa] flex-shrink-0 flex items-center justify-center mr-3 mt-1">
              <i className="fas fa-robot text-black"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#00ffcd] mb-1">نصائح المساعد الذكي</h3>
              <p className="text-xs text-white/80 leading-relaxed">
                اختر شخصية تناسب اهتماماتك للحصول على توصيات ومزايا مخصصة. كل شخصية لديها قدرة خاصة تساعدك في التسوق والاستمتاع بميزات المول بطريقة مختلفة. يمكنك التحرك باستخدام الأسهم أو سحب الشخصية بالماوس. للمساعدة، انقر على أيقونة المساعد الذكي.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {AVATARS.map(avatar => (
              <div 
                key={avatar.id}
                className="bg-black/30 rounded-xl p-4 cursor-pointer transition-all duration-300 
                           hover:bg-black/50 hover:scale-[1.03] hover:shadow-lg border border-white/5 
                           hover:border-[#ffeb3b]/30 flex flex-col items-center"
                style={{
                  boxShadow: avatar.color ? `0 4px 15px -4px ${avatar.color}20` : undefined
                }}
                onClick={() => {
                  setSelectedAvatar(avatar);
                  
                  // Show welcome toast with tips
                  toast({
                    title: `أهلاً ${avatar.name}!`,
                    description: avatar.specialFeature 
                      ? `استخدم قدرتك الخاصة "${avatar.specialFeature}" في تجربة التسوق! استخدم الأسهم للتنقل.` 
                      : "استخدم الأسهم للتنقل في المول، وانقر على المنتجات لاستعراضها. المساعد الذكي جاهز لمساعدتك!",
                    duration: 5000,
                  });
                }}
              >
                <div 
                  className="w-24 h-24 mb-3 rounded-full overflow-hidden shadow-lg"
                  style={{
                    background: avatar.color ? `linear-gradient(135deg, ${avatar.color}15, ${avatar.color}05)` : undefined,
                    border: avatar.color ? `2px solid ${avatar.color}30` : '2px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg mb-1">{avatar.name}</h3>
                <p className="text-xs text-white/70 text-center mb-2">{avatar.personality}</p>
                
                {avatar.specialFeature && (
                  <div 
                    className="w-full p-2 rounded-md mb-2 text-center text-xs"
                    style={{
                      background: avatar.color ? `${avatar.color}10` : 'rgba(255,255,255,0.05)',
                      color: avatar.color || '#00ffcd',
                      border: avatar.color ? `1px solid ${avatar.color}20` : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <strong>{avatar.specialFeature}</strong>
                  </div>
                )}
                
                <div className="mt-2 text-xs flex items-center">
                  <span 
                    className="px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      color: avatar.color || '#ffeb3b',
                      border: avatar.color ? `1px solid ${avatar.color}30` : '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    {avatar.favoriteCategory === 'electronics' ? 'الإلكترونيات 💻' :
                     avatar.favoriteCategory === 'clothing' ? 'الأزياء 👗' :
                     avatar.favoriteCategory === 'home' ? 'المنزل 🏠' :
                     avatar.favoriteCategory === 'sports' ? 'الرياضة 🏅' : 
                     avatar.favoriteCategory === 'vip-lounge' ? 'كبار الزوار 👑' :
                     'متنوع ✨'}
                  </span>
                </div>
                
                <button className="mt-4 w-full py-2 bg-[#ffeb3b] text-[#2a1f6f] rounded-lg font-bold text-sm hover:bg-[#ffeb3b]/90 transition">
                  اختيار
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center text-sm text-white/60 mt-8">
            سيتم توجيهك إلى المول الافتراضي بعد اختيار الشخصية
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
  
  // Update active section when avatar moves between sections
  useEffect(() => {
    if (!selectedAvatar || !vrEnabled) return;
    
    const newSection = getCurrentSection();
    
    // If entered a new section with features
    if (newSection && newSection !== activeSection && newSection.features) {
      setActiveSection(newSection);
      
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
    // If leaving a section
    else if (!newSection && activeSection) {
      setActiveSection(null);
      setSelectedFeature(null);
      setShowFeatureDetails(false);
    }
  }, [avatarPosition, storeSections, selectedAvatar, vrEnabled, activeSection, completedTasks]);
  
  return (
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
        
        {/* Virtual shop displays with product showcases */}
        {storeSections.filter(section => section.type === 'category').map(section => (
          <div key={section.id} className="absolute" style={{
            left: `${section.x - section.width/2}%`,
            top: `${section.y - section.height/2}%`,
            width: `${section.width}%`,
            height: `${section.height}%`,
          }}>
            {/* Modern floating shelves with holographic elements */}
            <div className="relative w-full h-full">
              {/* Virtual display shelves */}
              <div className="absolute left-1/4 top-1/4 w-1/2 h-1/2 border border-white/10 rounded-lg bg-black/30 backdrop-blur-sm"></div>
              <div className="absolute left-1/8 top-3/4 w-3/4 h-1/6 border border-white/10 rounded-lg bg-black/30 backdrop-blur-sm"></div>
              <div className="absolute right-1/8 top-1/8 w-1/4 h-2/3 border border-white/10 rounded-lg bg-black/30 backdrop-blur-sm"></div>
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
  );
}