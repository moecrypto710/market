import { useState, useEffect, useRef } from "react";
import { useVR } from "@/hooks/use-vr";
import { Product } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CulturalTransition from "@/components/cultural-transition";
import confetti from 'canvas-confetti';
import AiShoppingAssistant from "./ai-shopping-assistant";
import CameraIntegration from "./camera-integration";
import AIVoiceControls from "./ai-voice-controls";
import { 
  Building, Phone, ShoppingBag, Plane, Map,
  Home, User, Settings, PanelTop, Compass, 
  MapPin, X, PlusCircle, PlayCircle, StoreIcon,
  ChevronDown, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft
} from "lucide-react";

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

interface VRTownProps {
  products: Product[];
  initialView?: 'map' | 'firstPerson' | 'aerial';
  highlightBusinessType?: 'electronics' | 'travel' | 'clothing' | null;
}

// Define store types for the town
interface Store {
  id: number;
  name: string;
  category: 'electronics' | 'clothing' | 'travel' | 'food' | 'luxury';
  position: { x: number; y: number; z: number };
  rotation: number;
  size: 'small' | 'medium' | 'large';
  style: 'modern' | 'traditional' | 'futuristic' | 'luxury';
  products: Product[];
  color: string;
  icon: string;
  description: string;
  isPopular?: boolean;
  brandLogo?: string; // URL to brand logo
  storeImage?: string; // URL to store front image
  storeType?: 'brand' | 'department' | 'specialty' | 'discount';
  isInternational?: boolean;
  openingHours?: string;
  hasSpecialEvent?: boolean;
  discount?: number; // percentage discount applied at this store
}

// Avatar Selection Component
// Define town stores data
const townStores: Store[] = [
  // Electronics District
  {
    id: 1,
    name: "Apple Store",
    category: "electronics",
    position: { x: -20, y: 0, z: -15 },
    rotation: 0,
    size: "large",
    style: "modern",
    products: [],
    color: "#ffffff",
    icon: "laptop",
    description: "Official Apple products and accessories",
    isPopular: true,
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    storeType: "brand",
    isInternational: true,
    openingHours: "10:00 AM - 10:00 PM"
  },
  {
    id: 2,
    name: "Samsung Experience",
    category: "electronics",
    position: { x: -15, y: 0, z: -10 },
    rotation: 15,
    size: "medium",
    style: "futuristic",
    products: [],
    color: "#1428a0",
    icon: "smartphone",
    description: "Samsung Galaxy smartphones, tablets and wearables",
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    storeType: "brand",
    isInternational: true
  },
  {
    id: 3,
    name: "Gaming World",
    category: "electronics",
    position: { x: -25, y: 0, z: -8 },
    rotation: -15,
    size: "medium",
    style: "futuristic",
    products: [],
    color: "#8b5cf6",
    icon: "gamepad",
    description: "Video games, consoles and gaming accessories",
    storeType: "specialty",
    hasSpecialEvent: true
  },
  
  // Fashion District - International Brands
  {
    id: 4,
    name: "Nike",
    category: "clothing",
    position: { x: 15, y: 0, z: -15 },
    rotation: 0,
    size: "large",
    style: "modern",
    products: [],
    color: "#000000",
    icon: "shoe",
    description: "Athletic footwear, apparel, and accessories",
    isPopular: true,
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    storeType: "brand",
    isInternational: true,
    openingHours: "9:00 AM - 9:00 PM"
  },
  {
    id: 5,
    name: "Adidas",
    category: "clothing",
    position: { x: 20, y: 0, z: -10 },
    rotation: -10,
    size: "medium",
    style: "modern",
    products: [],
    color: "#000000",
    icon: "shoe",
    description: "Sports shoes and athletic wear",
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    storeType: "brand",
    isInternational: true,
    discount: 15
  },
  {
    id: 6,
    name: "Zara",
    category: "clothing",
    position: { x: 12, y: 0, z: -8 },
    rotation: 10,
    size: "large",
    style: "luxury",
    products: [],
    color: "#000000",
    icon: "dress",
    description: "Fashion clothing and accessories for men and women",
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
    storeType: "brand",
    isInternational: true,
    hasSpecialEvent: true
  },
  {
    id: 13,
    name: "H&M",
    category: "clothing",
    position: { x: 18, y: 0, z: -12 },
    rotation: 5,
    size: "large",
    style: "modern",
    products: [],
    color: "#e50010",
    icon: "dress",
    description: "Affordable fashion for everyone",
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
    storeType: "brand",
    isInternational: true,
    discount: 20
  },
  
  // Travel District - Airlines
  {
    id: 7,
    name: "Emirates Airlines",
    category: "travel",
    position: { x: 0, y: 0, z: -20 },
    rotation: 0,
    size: "large",
    style: "luxury",
    products: [],
    color: "#d71a1d",
    icon: "plane",
    description: "Luxury air travel to global destinations",
    isPopular: true,
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg",
    storeType: "brand",
    isInternational: true,
    openingHours: "24/7 Service"
  },
  {
    id: 8,
    name: "Qatar Airways",
    category: "travel",
    position: { x: 5, y: 0, z: -18 },
    rotation: -5,
    size: "medium",
    style: "luxury",
    products: [],
    color: "#5c0632",
    icon: "plane",
    description: "Award-winning airline with worldwide destinations",
    brandLogo: "https://upload.wikimedia.org/wikipedia/en/9/9b/Qatar_Airways_Logo.svg",
    storeType: "brand",
    isInternational: true
  },
  {
    id: 9,
    name: "Booking.com",
    category: "travel",
    position: { x: -5, y: 0, z: -18 },
    rotation: 5,
    size: "medium",
    style: "modern",
    products: [],
    color: "#003580",
    icon: "hotel",
    description: "Hotel reservations and vacation rentals worldwide",
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Booking.com_Logo_2022.svg",
    storeType: "brand",
    isInternational: true
  },
  {
    id: 14,
    name: "Turkish Airlines",
    category: "travel",
    position: { x: -8, y: 0, z: -16 },
    rotation: 10,
    size: "medium",
    style: "modern",
    products: [],
    color: "#c70a0c",
    icon: "plane",
    description: "Connecting continents with quality service",
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Turkish_Airlines_Logo_2019.svg",
    storeType: "brand",
    isInternational: true,
    discount: 10
  },
  
  // Food District
  {
    id: 10,
    name: "Starbucks",
    category: "food",
    position: { x: 0, y: 0, z: 5 },
    rotation: 180,
    size: "medium",
    style: "modern",
    products: [],
    color: "#006241",
    icon: "coffee",
    description: "Premium coffee and light meals",
    brandLogo: "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    storeType: "brand",
    isInternational: true
  },
  {
    id: 11,
    name: "McDonald's",
    category: "food",
    position: { x: -8, y: 0, z: 10 },
    rotation: 160,
    size: "medium",
    style: "modern",
    products: [],
    color: "#FFC72C",
    icon: "utensils",
    description: "Fast food restaurant",
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
    storeType: "brand",
    isInternational: true
  },
  
  // Luxury District
  {
    id: 12,
    name: "Louis Vuitton",
    category: "luxury",
    position: { x: 8, y: 0, z: 10 },
    rotation: -160,
    size: "large",
    style: "luxury",
    products: [],
    color: "#964B00",
    icon: "shopping-bag",
    description: "Luxury fashion and leather goods",
    brandLogo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Louis_Vuitton_logo_and_wordmark.svg",
    storeType: "brand",
    isInternational: true,
    openingHours: "10:00 AM - 8:00 PM"
  }
];

function AvatarSelectionScreen({ onSelect }: { onSelect: (avatar: AvatarProps) => void }) {
  // State for animation effects
  const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [selectionStarted, setSelectionStarted] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<AvatarProps | null>(null);
  
  // Enhanced avatar options with futuristic styles and more variety
  const avatars = [
    { 
      id: 1, 
      name: "أحمد",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Ahmed&backgroundColor=b6e3f4",
      personality: "مهتم بالتكنولوجيا والإلكترونيات المتطورة",
      favoriteCategory: "electronics",
      personalStyle: "عصري تقني",
      benefits: [
        "تخفيضات إضافية 15% على الإلكترونيات",
        "وصول حصري لآخر التقنيات",
        "تحليلات متقدمة للمنتجات"
      ],
      color: "#5e35b1",
      specialFeature: "محلل المواصفات التقنية",
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
        "نصائح أزياء شخصية مخصصة",
        "تجربة افتراضية متطورة للملابس",
        "إخطارات حصرية للتخفيضات"
      ],
      color: "#d946ef",
      specialFeature: "مستشارة الأناقة الرقمية",
      specialFeatureDescription: "قدرة خاصة على تنسيق الإطلالات المثالية عبر تقنية الذكاء الاصطناعي"
    },
    { 
      id: 3, 
      name: "فهد",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Fahad&backgroundColor=c8f7dc",
      personality: "عاشق للرياضة والنشاط البدني",
      favoriteCategory: "sports",
      personalStyle: "رياضي حيوي",
      benefits: [
        "توصيات مخصصة للمنتجات الرياضية",
        "تحليل رقمي للأداء الرياضي",
        "دعوات حصرية لفعاليات رياضية"
      ],
      color: "#0ea5e9",
      specialFeature: "مدرب اللياقة الافتراضي",
      specialFeatureDescription: "يقدم نصائح متخصصة لاختيار المعدات الرياضية المناسبة لأهدافك"
    },
    { 
      id: 4, 
      name: "نورا",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Noura&backgroundColor=ffd5dc",
      personality: "مبدعة في تصميم وديكور المنازل",
      favoriteCategory: "home",
      personalStyle: "عصري أنيق",
      benefits: [
        "رؤية ثلاثية الأبعاد للديكورات المنزلية",
        "تنسيقات مخصصة للمساحات",
        "اكتشاف القطع النادرة والمميزة"
      ],
      color: "#f97316",
      specialFeature: "محاكي الديكور الذكي",
      specialFeatureDescription: "يمكنها إنشاء تصور ثلاثي الأبعاد للمنتجات في منزلك باستخدام الواقع المعزز"
    },
    { 
      id: 5, 
      name: "عمر",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Omar&backgroundColor=e0f2fe",
      personality: "محب للتكنولوجيا والواقع الافتراضي",
      favoriteCategory: "electronics",
      personalStyle: "مستقبلي",
      benefits: [
        "تجارب واقع افتراضي حصرية",
        "تحليلات متقدمة للمنتجات التقنية",
        "ميزات تجريبية للتكنولوجيا الحديثة"
      ],
      color: "#3b82f6",
      specialFeature: "استكشاف الواقع الافتراضي",
      specialFeatureDescription: "يتيح لك استكشاف مناطق خاصة في البلدة باستخدام تقنيات الواقع الافتراضي المتقدمة"
    },
    { 
      id: 6, 
      name: "ليلى",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Layla&backgroundColor=feedcb",
      personality: "خبيرة في المجوهرات والإكسسوارات الفاخرة",
      favoriteCategory: "luxury",
      personalStyle: "راقي فاخر",
      benefits: [
        "عروض خاصة على المنتجات الفاخرة",
        "دعوات لفعاليات حصرية",
        "خدمة استشارية شخصية للهدايا الفاخرة"
      ],
      color: "#eab308",
      specialFeature: "استشاري الهدايا الفاخرة",
      specialFeatureDescription: "يقدم توصيات مخصصة للهدايا والمنتجات الفاخرة بناءً على مناسبتك وميزانيتك"
    },
    { 
      id: 7, 
      name: "زياد",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Ziad&backgroundColor=d1fae5",
      personality: "مهتم بالمنتجات المستدامة والصديقة للبيئة",
      favoriteCategory: "eco",
      personalStyle: "مستدام طبيعي",
      benefits: [
        "اكتشاف المنتجات الصديقة للبيئة",
        "تقارير عن الاستدامة للمنتجات",
        "مكافآت للاختيارات المستدامة"
      ],
      color: "#10b981",
      specialFeature: "مرشد الاستدامة",
      specialFeatureDescription: "يساعدك على تحديد المنتجات الصديقة للبيئة والمستدامة في جميع أقسام البلدة"
    },
    { 
      id: 8, 
      name: "ياسمين",
      image: "https://api.dicebear.com/7.x/personas/svg?seed=Yasmin&backgroundColor=ffe4e6",
      personality: "شغوفة بالموسيقى والترفيه",
      favoriteCategory: "entertainment",
      personalStyle: "عصري فني",
      benefits: [
        "اكتشاف الإصدارات الحصرية",
        "تخفيضات على منتجات الترفيه",
        "وصول مبكر للفعاليات الموسيقية"
      ],
      color: "#ec4899",
      specialFeature: "مستشار الترفيه",
      specialFeatureDescription: "يقدم توصيات مخصصة للمنتجات الترفيهية والموسيقية المناسبة لذوقك"
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
        {/* Enhanced header with advanced futuristic design */}
        <div className="relative mb-10 text-center">
          {/* Background decorative elements */}
          <div className="absolute -inset-10 -z-10">
            <div className="absolute inset-0 opacity-10 circuit-overlay"></div>
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/70 to-transparent"></div>
            <div className="absolute left-1/4 right-1/4 top-[52%] h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent"></div>
          </div>
          
          {/* Header text with enhanced gradient and animation */}
          <div className="relative">
            {/* Floating particles around header */}
            <div className="absolute -top-4 left-1/4 w-1 h-1 bg-fuchsia-300 rounded-full animate-float1 opacity-70"></div>
            <div className="absolute -bottom-2 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-float2 opacity-70"></div>
            
            {/* Main title with animated gradient */}
            <h2 className="text-5xl font-bold mb-3 text-transparent bg-clip-text holographic-bg text-glow"
                style={{
                  backgroundImage: 'linear-gradient(to right, #d946ef, #ffffff, #d946ef)',
                  backgroundSize: '200% auto',
                  animation: 'holographic-move 6s linear infinite'
                }}>
              اختر الشخصية الافتراضية
            </h2>
            
            {/* Ornamental divider */}
            <div className="w-24 h-1 mx-auto mb-3 rounded-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"></div>
            
            {/* Subtitle with shimmer effect */}
            <p className="text-white/80 text-lg relative inline-block">
              اختر شخصية للتسوق في بلدة أمريكي الافتراضية
              
              {/* Shine animation */}
              <span className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-scan"
                    style={{
                      animationDuration: '3s',
                      animationIterationCount: 'infinite'
                    }}>
              </span>
            </p>
          </div>
          
          {/* Advanced decorative elements */}
          <div className="absolute -left-16 top-1/2 flex items-center">
            <div className="w-3 h-3 rounded-full bg-fuchsia-500/70 animate-pulse-slow"></div>
            <div className="h-[1px] w-12 bg-gradient-to-r from-fuchsia-500/80 to-transparent"></div>
          </div>
          
          <div className="absolute -right-16 top-1/2 flex items-center">
            <div className="h-[1px] w-12 bg-gradient-to-l from-fuchsia-500/80 to-transparent"></div>
            <div className="w-3 h-3 rounded-full bg-fuchsia-500/70 animate-pulse-slow"></div>
          </div>
        </div>
        
        <div className="flex gap-12 w-full justify-center">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`
                relative bg-black border-2 p-8 rounded-xl cursor-pointer transition-all duration-500 
                w-[280px] h-[420px] transform perspective-[1200px] 
                backdrop-blur-sm overflow-hidden futuristic-border
                ${hoveredAvatar === avatar.id ? 'scale-105' : ''}
              `}
              style={{
                borderColor: hoveredAvatar === avatar.id ? avatar.color : 'rgba(107, 33, 168, 0.3)',
                boxShadow: hoveredAvatar === avatar.id ? `0 10px 30px -10px ${avatar.color}40` : 'none',
                background: `radial-gradient(circle at ${hoveredAvatar === avatar.id ? '30%' : '50%'} ${hoveredAvatar === avatar.id ? '30%' : '50%'}, 
                rgba(${avatar.color === '#5e35b1' ? '94, 53, 177' : '217, 70, 239'}, 0.3) 0%, 
                rgba(0, 0, 0, 0.9) 70%)`,
                transform: hoveredAvatar === avatar.id ? 'rotateY(-8deg)' : 'rotateY(0deg)',
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
export default function VRTown({ 
  products, 
  initialView = 'firstPerson', 
  highlightBusinessType = null 
}: VRTownProps) {
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
  
  // Helper to get area name in global format
  function getAreaName(sectionId: string) {
    switch (sectionId) {
      case 'entrance': return 'Main Entrance 🚪';
      case 'electronics': return 'Electronics District 💻';
      case 'clothing': return 'Fashion Avenue 👗';
      case 'food': return 'Food Court 🍔';
      case 'plaza': return 'Central Plaza ✨';
      case 'luxury': return 'Luxury Boutiques 💎';
      case 'sports': return 'Sports Arena 🏅';
      case 'eco': return 'Eco-Friendly Zone 🌱';
      case 'entertainment': return 'Entertainment Hub 🎮';
      default: return 'Amrikyy Town 🏙️';
    }
  }
  
  // Return avatar selection if no avatar selected
  if (!selectedAvatar) {
    return <AvatarSelectionScreen onSelect={handleSelectAvatar} />;
  }
  
  // Temporarily removed products to create a clean area
  const sectionProducts: Product[] = [];
  
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
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.1) 0%, rgba(16, 6, 54, 0.2) 50%, rgba(7, 3, 20, 0.3) 100%)',
        }}
      >
        {/* Advanced atmosphere effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Digital circuit background pattern */}
          <div className="absolute inset-0 circuit-overlay opacity-30"></div>
          
          {/* Futuristic global city pattern */}
          <div className="absolute inset-0 mix-blend-overlay opacity-30"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                 backgroundSize: '80px 80px'
               }}
          ></div>
          
          {/* Advanced 3D grid with depth effect - more futuristic */}
          <div className="absolute inset-0 perspective-3d" style={{ 
            backgroundImage: 'linear-gradient(transparent 0%, transparent calc(100% - 1px), rgba(59, 130, 246, 0.2) 100%), linear-gradient(to right, transparent 0%, transparent calc(100% - 1px), rgba(59, 130, 246, 0.2) 100%)',
            backgroundSize: '60px 60px',
            transform: 'perspective(800px) rotateX(60deg)',
            transformOrigin: 'center bottom',
            animation: 'pulse 10s infinite alternate'
          }}></div>
          
          {/* Scanline effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'linear-gradient(to bottom, transparent, transparent 49.9%, rgba(217, 70, 239, 0.5) 50%, transparent 50.1%)',
              backgroundSize: '100% 8px',
              animation: 'scanline 8s linear infinite',
              pointerEvents: 'none'
            }}
          ></div>
          
          {/* Advanced holographic overlay */}
          <div className="absolute inset-0 holographic-bg opacity-10"></div>
          
          {/* Floating holographic particles */}
          <div className="absolute inset-0">
            {/* Top section particles */}
            <div className="absolute top-1/5 left-1/4 w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-float1 opacity-80"></div>
            <div className="absolute top-1/6 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-float2 opacity-70"></div>
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-indigo-300 rounded-full animate-float3 opacity-60"></div>
            
            {/* Middle section particles */}
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-float3 opacity-80"></div>
            <div className="absolute top-1/2 right-1/5 w-1.5 h-1.5 bg-blue-300 rounded-full animate-float1 opacity-70"></div>
            
            {/* Bottom section particles */}
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-fuchsia-300 rounded-full animate-float2 opacity-80"></div>
            <div className="absolute bottom-1/5 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-float1 opacity-70"></div>
          </div>
        </div>
        
        {/* Ambient glow points */}
        <div className="absolute top-1/3 left-1/4 w-40 h-40 opacity-30 radial-pulse" style={{
          background: `radial-gradient(circle, ${ambientColor}50 0%, transparent 70%)`,
          filter: 'blur(30px)',
        }}></div>
        
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 opacity-20 radial-pulse" style={{
          background: `radial-gradient(circle, ${ambientColor}40 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animationDelay: '2s'
        }}></div>
        
        {/* Enhanced ambient mood lighting with section-specific coloring */}
        <div 
          className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-30 transition-all duration-1000"
          style={{ 
            backgroundImage: `linear-gradient(to top, ${ambientColor}30, transparent 70%, ${ambientColor}10 100%)` 
          }}
        ></div>
        
        {/* Digital glitch effect - random artifacts */}
        <div className="absolute inset-0 digital-glitch"></div>
        
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
        <div className="absolute top-16 left-4 bg-gradient-to-r from-black/80 to-purple-900/50 px-4 py-2 rounded-xl text-sm z-50 border border-purple-500/30 shadow-glow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-glow">
              <i className="fas fa-map-marker-alt text-xs text-white"></i>
            </div>
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-200">{getAreaName(currentSection)}</span>
          </div>
        </div>
        
        {/* Enhanced Avatar indicator with holographic effect */}
        <div 
          className="absolute w-10 h-10 z-40 avatar"
          style={{
            left: `${avatarPosition.x}%`,
            top: `${avatarPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Glow rings */}
          <div className="absolute -inset-2 rounded-full animate-pulse" 
              style={{
                background: `radial-gradient(circle, ${ambientColor}50 0%, transparent 70%)`,
                opacity: 0.7,
                filter: 'blur(8px)'
              }}>
          </div>
          
          {/* Spinning holographic ring */}
          <div className="absolute -inset-1 rounded-full border border-fuchsia-400/50 animate-spin-slow"></div>
          <div className="absolute -inset-2 rounded-full border border-fuchsia-400/30 animate-spin-slow" style={{animationDirection: 'reverse', animationDuration: '12s'}}></div>
          
          {/* Position indicator beam */}
          <div className="absolute w-[1px] h-[100vh] bg-gradient-to-b from-fuchsia-400/50 via-fuchsia-400/10 to-transparent left-1/2 -translate-x-1/2 -bottom-4 z-0 pointer-events-none"></div>
          
          {/* Floating particles */}
          <div className="absolute -inset-4">
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-fuchsia-300 rounded-full animate-float1 opacity-70"></div>
            <div className="absolute bottom-1/2 right-1/3 w-1 h-1 bg-fuchsia-200 rounded-full animate-float2 opacity-70"></div>
          </div>
          
          {/* Avatar image container */}
          <div className="relative w-full h-full rounded-full border-2 border-fuchsia-400 overflow-hidden shadow-glow" 
               style={{
                 boxShadow: `0 0 15px ${ambientColor}80, inset 0 0 8px ${ambientColor}60`,
               }}>
            {/* Holographic overlay */}
            <div className="absolute inset-0 holographic-bg opacity-20 z-10 pointer-events-none"></div>
            
            {/* Scanline effect */}
            <div className="absolute inset-0 z-20 pointer-events-none"
                 style={{
                   background: 'linear-gradient(to bottom, transparent, transparent 49.9%, rgba(217, 70, 239, 0.3) 50%, transparent 50.1%)',
                   backgroundSize: '100% 4px',
                   animation: 'scanline 4s linear infinite',
                 }}></div>
            
            {/* Avatar image */}
            <img 
              src={selectedAvatar.image} 
              alt={selectedAvatar.name}
              className="w-full h-full object-cover z-0" 
            />
          </div>
          
          {/* Direction indicator - subtle arrow pointing in movement direction */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-fuchsia-400/70 text-xs">
            <i className="fas fa-chevron-down animate-pulse"></i>
          </div>
        </div>
        
        {/* 3D Mall Environment with Realistic Layout */}
        <div className="absolute inset-0 perspective-3d overflow-hidden">
          {/* 3D Mall Structure - Ground Floor */}
          <div className="mall-floor"></div>
          <div className="mall-ceiling"></div>
          <div className="mall-wall mall-wall-left"></div>
          <div className="mall-wall mall-wall-right"></div>
          
          {/* Spotlights */}
          <div className="mall-spotlights">
            <div className="mall-spotlight"></div>
            <div className="mall-spotlight"></div>
            <div className="mall-spotlight"></div>
            <div className="mall-spotlight"></div>
            <div className="mall-spotlight"></div>
          </div>
          
          {/* Second Floor Structure */}
          <div className="mall-second-floor">
            <div className="mall-balcony"></div>
            <div className="mall-balcony-front"></div>
            
            {/* Railings */}
            <div className="mall-railing">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="mall-railing-post"></div>
              ))}
            </div>
            
            {/* Second Floor Stores with Modern International Design */}
            <div className="absolute top-0 left-[20%] transform -translate-x-1/2">
              <div className="modern-storefront"></div>
              <div className="store-brand-logo nike-style">NIKE</div>
            </div>
            
            <div className="absolute top-0 left-[50%] transform -translate-x-1/2">
              <div className="tech-storefront"></div>
              <div className="store-brand-logo apple-style">APPLE</div>
            </div>
            
            <div className="absolute top-0 right-[20%] transform translate-x-1/2">
              <div className="sports-storefront"></div>
              <div className="store-brand-logo adidas-style">ADIDAS</div>
            </div>
            
            {/* Central Dome */}
            <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2">
              <div className="mall-dome"></div>
              <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2 w-1 h-5 bg-fuchsia-500"></div>
            </div>
          </div>
          
          {/* Virtual Mall People */}
          <div className="absolute bottom-20 left-[30%] mall-person mall-person-walking" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-40 left-[40%] mall-person mall-person-walking" style={{ animationDelay: '-2s' }}></div>
          <div className="absolute bottom-30 left-[60%] mall-person mall-person-walking" style={{ animationDelay: '-4s' }}></div>
          <div className="absolute bottom-50 left-[10%] mall-person mall-person-walking" style={{ animationDelay: '-6s' }}></div>
          
          {/* Futuristic Central Plaza with Digital Fountain */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
            <div className="digital-fountain"></div>
            <div className="digital-grid absolute inset-0 opacity-20"></div>
            <div className="text-xs text-center mt-2 text-white/70 font-futuristic">CENTRAL PLAZA</div>
          </div>
          
          {/* Mall Directory Sign - Holographic with Modern Design */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-20">
            <div className="holographic-container p-4 rounded-lg shadow-glow-sm futuristic-border">
              <h3 className="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 mb-2">
                AMRIKYY TOWN
              </h3>
              <div className="text-xs text-center text-white/70 mb-1">Tap any section to visit</div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent my-1"></div>
              <div className="text-center text-sm text-blue-300 mt-1">
                {`You are in: ${getAreaName(currentSection)}`}
              </div>
              
              {/* Futuristic geometric decoration */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-5 opacity-30">
                <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,50 L50,10 L100,50" stroke="#3b82f6" fill="none" strokeWidth="2" />
                  <path d="M25,50 L50,25 L75,50" stroke="#3b82f6" fill="none" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Navigation Escalators */}
          <div className="absolute bottom-40 left-[20%] mall-escalator">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] text-white/70 transform -rotate-60">↑</span>
            </div>
          </div>
          <div className="absolute bottom-40 right-[20%] mall-escalator">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] text-white/70 transform -rotate-60">↓</span>
            </div>
          </div>
          
          {/* Mall Storefront Sections - Now with Branded Stores */}
          <div className="absolute inset-10 grid grid-cols-3 grid-rows-3 gap-4 z-10">
            {/* First Row */}
            <div 
              className={`rounded-xl flex items-center justify-center cursor-pointer transition-all duration-500 group perspective-3d relative overflow-hidden backdrop-blur-sm ${
                currentSection === 'electronics' 
                  ? 'bg-fuchsia-600/20 futuristic-border neon-border shadow-glow' 
                  : 'bg-black/30 border border-fuchsia-500/10 hover:border-fuchsia-500/30 hover:bg-black/40'
              }`}
              style={{
                boxShadow: currentSection === 'electronics' 
                  ? '0 0 30px rgba(217, 70, 239, 0.3)' 
                  : 'none'
              }}
              onClick={() => handleSectionNavigation('electronics')}
            >
              {/* Background circuit pattern for electronics */}
              <div className="absolute inset-0 opacity-10 circuit-overlay"></div>
              
              {/* Holographic effect on hover/active */}
              <div className={`absolute inset-0 opacity-0 ${
                currentSection === 'electronics' ? 'opacity-20' : 'group-hover:opacity-10'
              } transition-opacity duration-300 holographic-bg`}></div>
              
              {/* Animated glow orb */}
              <div className={`absolute bottom-4 right-4 w-16 h-16 rounded-full 
                ${currentSection === 'electronics' ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'} 
                transition-all duration-500 radial-pulse`}
                style={{
                  background: 'radial-gradient(circle, rgba(217, 70, 239, 0.8) 0%, transparent 70%)',
                  filter: 'blur(10px)'
                }}
              ></div>
              
              {/* Content with 3D hover effect */}
              <div className="text-center transform transition-transform duration-500 group-hover:scale-105 relative z-10">
                {/* Icon with glow effect */}
                <div className="relative inline-block mb-3">
                  <i className={`fas fa-microchip text-4xl ${
                    currentSection === 'electronics' ? 'text-fuchsia-400 text-glow' : 'text-fuchsia-400/80'
                  } transition-all duration-500 group-hover:text-glow`}></i>
                  
                  {/* Floating particles around icon */}
                  <div className={`absolute -inset-2 ${
                    currentSection === 'electronics' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity duration-500`}>
                    <div className="absolute top-0 left-1/4 w-1 h-1 bg-fuchsia-300 rounded-full animate-float1"></div>
                    <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-float2"></div>
                  </div>
                </div>
                
                {/* Title with glow effect */}
                <h3 className={`text-xl font-bold ${
                  currentSection === 'electronics' ? 'text-white text-glow' : 'text-white/90'
                } transition-all duration-500 group-hover:text-glow`}>الإلكترونيات</h3>
                
                {/* Subtle description on hover/active */}
                <p className={`mt-2 text-xs max-w-[80%] mx-auto ${
                  currentSection === 'electronics' ? 'opacity-80' : 'opacity-0 group-hover:opacity-60'
                } transition-all duration-500 text-white/80`}>
                  أحدث المنتجات التقنية والإلكترونيات المتطورة بتصميمات مستقبلية
                </p>
              </div>
            </div>
            
            {/* Clothing Section */}
            <div 
              className={`rounded-xl flex items-center justify-center cursor-pointer transition-all duration-500 group perspective-3d relative overflow-hidden backdrop-blur-sm ${
                currentSection === 'clothing' 
                  ? 'bg-fuchsia-600/20 futuristic-border neon-border shadow-glow' 
                  : 'bg-black/30 border border-fuchsia-500/10 hover:border-fuchsia-500/30 hover:bg-black/40'
              }`}
              style={{
                boxShadow: currentSection === 'clothing' 
                  ? '0 0 30px rgba(217, 70, 239, 0.3)' 
                  : 'none'
              }}
              onClick={() => handleSectionNavigation('clothing')}
            >
              {/* Background arabesque pattern for clothing */}
              <div className="absolute inset-0 opacity-10 arabesque-pattern"></div>
              
              {/* Holographic effect on hover/active */}
              <div className={`absolute inset-0 opacity-0 ${
                currentSection === 'clothing' ? 'opacity-20' : 'group-hover:opacity-10'
              } transition-opacity duration-300 holographic-bg`}></div>
              
              {/* Animated glow orb */}
              <div className={`absolute top-4 left-4 w-16 h-16 rounded-full 
                ${currentSection === 'clothing' ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'} 
                transition-all duration-500 radial-pulse`}
                style={{
                  background: 'radial-gradient(circle, rgba(217, 70, 239, 0.8) 0%, transparent 70%)',
                  filter: 'blur(10px)'
                }}
              ></div>
              
              {/* Content with 3D hover effect */}
              <div className="text-center transform transition-transform duration-500 group-hover:scale-105 relative z-10">
                {/* Icon with glow effect */}
                <div className="relative inline-block mb-3">
                  <i className={`fas fa-tshirt text-4xl ${
                    currentSection === 'clothing' ? 'text-fuchsia-400 text-glow' : 'text-fuchsia-400/80'
                  } transition-all duration-500 group-hover:text-glow`}></i>
                  
                  {/* Floating particles around icon */}
                  <div className={`absolute -inset-2 ${
                    currentSection === 'clothing' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity duration-500`}>
                    <div className="absolute top-0 right-1/4 w-1 h-1 bg-fuchsia-300 rounded-full animate-float1"></div>
                    <div className="absolute bottom-0 left-1/4 w-1 h-1 bg-pink-300 rounded-full animate-float2"></div>
                  </div>
                </div>
                
                {/* Title with glow effect */}
                <h3 className={`text-xl font-bold ${
                  currentSection === 'clothing' ? 'text-white text-glow' : 'text-white/90'
                } transition-all duration-500 group-hover:text-glow`}>الأزياء</h3>
                
                {/* Subtle description on hover/active */}
                <p className={`mt-2 text-xs max-w-[80%] mx-auto ${
                  currentSection === 'clothing' ? 'opacity-80' : 'opacity-0 group-hover:opacity-60'
                } transition-all duration-500 text-white/80`}>
                  أحدث تصميمات الأزياء العالمية بلمسة عربية أصيلة وتقنيات متطورة
                </p>
              </div>
            </div>
            
            {/* Additional Section Buttons */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
              {/* Home Section Button */}
              <button
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all relative overflow-hidden group ${
                  currentSection === 'home' 
                    ? 'bg-fuchsia-600/80 text-white shadow-glow' 
                    : 'bg-black/40 text-white/70 hover:bg-black/60 border border-fuchsia-500/20'
                }`}
                onClick={() => handleSectionNavigation('home')}
              >
                {/* Button shine effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                
                <span className="relative z-10 flex items-center gap-2">
                  <i className="fas fa-home"></i>
                  <span>المنزل</span>
                </span>
              </button>
              
              {/* Plaza Section Button */}
              <button
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all relative overflow-hidden group ${
                  currentSection === 'plaza' 
                    ? 'bg-fuchsia-600/80 text-white shadow-glow' 
                    : 'bg-black/40 text-white/70 hover:bg-black/60 border border-fuchsia-500/20'
                }`}
                onClick={() => handleSectionNavigation('plaza')}
              >
                {/* Button shine effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                
                <span className="relative z-10 flex items-center gap-2">
                  <i className="fas fa-map-marked-alt"></i>
                  <span>الساحة</span>
                </span>
              </button>
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
                className="w-44 h-64 bg-black/60 backdrop-blur-sm rounded-xl overflow-hidden futuristic-border transition-all hover:scale-105 cursor-pointer group"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(217, 70, 239, 0.15) 0%, rgba(0, 0, 0, 0.8) 70%)`,
                  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)'
                }}
                onClick={() => {
                  setSelectedProduct(product);
                  setShow3DView(true);
                  setShowSpecialEffect(true);
                  setSpecialEffectType('hologram');
                }}
              >
                {/* Decorative corner elements */}
                <div className="absolute top-2 left-2 h-8 w-8 border-t border-l border-fuchsia-500/40 rounded-tl-lg"></div>
                <div className="absolute bottom-2 right-2 h-8 w-8 border-b border-r border-fuchsia-500/40 rounded-br-lg"></div>
                
                {/* Holographic overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 holographic-bg"></div>
                
                {/* Scanline effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, transparent 49.9%, rgba(217, 70, 239, 0.5) 50%, transparent 50.1%)',
                    backgroundSize: '100% 8px',
                    animation: 'scanline 8s linear infinite',
                    pointerEvents: 'none'
                  }}
                ></div>
                
                {/* Product image with enhanced hover effect */}
                <div className="h-36 p-3 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-600/5 to-transparent"></div>
                  <div className="absolute bottom-0 w-full h-20" style={{
                    background: 'linear-gradient(to top, rgba(217, 70, 239, 0.1), transparent)'
                  }}></div>
                  
                  {/* Product platform - disk light effect */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 rounded-full bg-fuchsia-500/30 blur-sm group-hover:bg-fuchsia-500/50 transition-all duration-500"></div>
                  
                  {/* Product image with float effect */}
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/150'} 
                    alt={product.name} 
                    className="h-full object-contain relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:translate-y-[-5px]"
                    style={{
                      filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.5))'
                    }}
                  />
                </div>
                
                {/* Product info with enhanced styling */}
                <div className="p-3 relative">
                  {/* Highlight line */}
                  <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent"></div>
                  
                  {/* Product name with glow effect */}
                  <h3 className="font-bold text-sm text-white group-hover:text-glow transition-all duration-300">{product.name}</h3>
                  
                  {/* Product description */}
                  <p className="text-white/70 text-xs mt-1 line-clamp-2 group-hover:text-white/90 transition-all duration-300">{product.description.substring(0, 60)}...</p>
                  
                  {/* Price with highlight */}
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-fuchsia-400 font-bold">{product.price.toLocaleString('ar-SA')} ر.س</span>
                    <span className="text-xs text-white/50 group-hover:text-white/70">اضغط للعرض</span>
                  </div>
                  
                  {/* 3D View indicator */}
                  <div className="absolute right-3 top-3 text-xs flex items-center gap-1">
                    <span className="text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors">3D</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse-slow"></div>
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
          productImageUrl={selectedProduct?.imageUrl || ''}
        />
      )}
      
      {/* AI Shopping Assistant */}
      {showAiAssistant && selectedAvatar && (
        <AiShoppingAssistant
          currentSection={currentSection}
          products={products}
          onProductSelect={handleShowProduct}
          onNavigate={handleSectionNavigation}
          avatar={selectedAvatar ? {
            name: selectedAvatar.name,
            favoriteCategory: selectedAvatar.favoriteCategory
          } : undefined}
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