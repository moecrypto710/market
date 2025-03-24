import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useVR } from '@/hooks/use-vr';
import { useMovement } from '@/hooks/use-movement';
import { useToast } from '@/hooks/use-toast';
import AirplaneBuildingInterior from './airplane-building-interior';
import EnterBuilding from './enter-building';
import StoreInteraction from './store-interaction';
import GateControl from './gate-control';
import CarTraffic from './car-traffic';
import TrafficLight from './traffic-light';
import TouchControls from './touch-controls';
import VirtualFittingRoom from './virtual-fitting-room';
import DynamicPromotions from './dynamic-promotions';
import ThreeProductView from './three-product-view';
import ThreeBuildingModel from './three-building-model';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Interface for Building definition in virtual city
 */
interface Building {
  id: string;
  name: string;
  type: 'travel' | 'clothing' | 'electronics' | 'restaurant' | 'bank' | 'entertainment';
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: number;
  color: string;
  icon: string;
  description: string;
  interactionDistance: number;
  elevated?: boolean;
}

/**
 * Interface for road definitions
 */
interface Road {
  id: string;
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  width: number;
  type: 'main' | 'secondary' | 'pedestrian';
}

/**
 * Interface for decoration items
 */
interface Decoration {
  id: string;
  type: 'tree' | 'bench' | 'fountain' | 'lamppost' | 'statue' | 'sign';
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: number;
}

/**
 * مكون مدينة أمريكي الافتراضية المتكاملة
 * 
 * مدينة ثلاثية الأبعاد تتضمن مباني تفاعلية لوكالات السفر ومتاجر الملابس
 * ومتاجر الإلكترونيات ومزيد من المرافق الخدمية
 */
export default function CityBuilder() {
  const { vrEnabled, gestureControlEnabled, walkSpeed } = useVR();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const cityRef = useRef<HTMLDivElement>(null);
  
  // Environment settings
  const [dayTime, setDayTime] = useState<'morning' | 'noon' | 'evening' | 'night'>('noon');
  const [weather, setWeather] = useState<'clear' | 'cloudy' | 'rain' | 'dusty'>('clear');
  const [trafficDensity, setTrafficDensity] = useState<'low' | 'medium' | 'high'>('medium');
  
  // City state
  const [showMap, setShowMap] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [notificationText, setNotificationText] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [insideBuilding, setInsideBuilding] = useState<string | null>(null);
  
  // Set up movement and collisions
  const movement = useMovement({
    initialPosition: { x: 0, y: 1.7, z: -40 }, // Start at city entrance
    initialRotation: { x: 0, y: 0, z: 0 },
    speed: walkSpeed || 5,
    enableCollisions: true
  });
  
  // Notifications system
  const showNotification = (text: string, duration = 3000) => {
    setNotificationText(text);
    setTimeout(() => setNotificationText(null), duration);
  };
  
  // Initialize city on mount
  useEffect(() => {
    // Reset player position
    movement.resetPosition();
    
    // Welcome notification
    showNotification('مرحباً بك في مدينة أمريكي الافتراضية المتكاملة');
    
    // Setup collision objects
    buildings.forEach(building => {
      movement.addCollisionObject({
        id: building.id,
        position: building.position,
        size: { width: 10, height: 15, depth: 10 },
        type: 'object'
      });
    });
    
    // Add boundary walls to keep player in city limits
    const cityBounds = 100;
    const walls = [
      // North wall
      { id: 'north-wall', position: { x: 0, y: 5, z: -cityBounds }, size: { width: cityBounds * 2, height: 10, depth: 1 } },
      // South wall
      { id: 'south-wall', position: { x: 0, y: 5, z: cityBounds }, size: { width: cityBounds * 2, height: 10, depth: 1 } },
      // East wall
      { id: 'east-wall', position: { x: cityBounds, y: 5, z: 0 }, size: { width: 1, height: 10, depth: cityBounds * 2 } },
      // West wall
      { id: 'west-wall', position: { x: -cityBounds, y: 5, z: 0 }, size: { width: 1, height: 10, depth: cityBounds * 2 } },
    ];
    
    walls.forEach(wall => {
      movement.addCollisionObject({
        id: wall.id,
        position: wall.position,
        size: wall.size,
        type: 'wall'
      });
    });
    
    // Add trigger zones for key areas
    movement.addCollisionObject({
      id: 'city-center-trigger',
      position: { x: 0, y: 0, z: 0 },
      size: { width: 20, height: 5, depth: 20 },
      type: 'trigger',
      onCollision: () => showNotification('أنت الآن في وسط المدينة')
    });
    
    // Add initial camera effects
    const fadeInCity = setTimeout(() => {
      if (cityRef.current) {
        cityRef.current.style.opacity = '1';
      }
    }, 500);
    
    return () => {
      clearTimeout(fadeInCity);
    };
  }, []);
  
  // Handle window keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key toggles map
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowMap(prev => !prev);
      }
      
      // M key toggles map (alternative)
      if (e.key === 'm' || e.key === 'M') {
        setShowMap(prev => !prev);
      }
      
      // Escape key exits building
      if (e.key === 'Escape' && insideBuilding) {
        setInsideBuilding(null);
        setSelectedBuilding(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [insideBuilding]);
  
  // Define main buildings in the city
  const buildings: Building[] = [
    // Travel Agency
    {
      id: 'travel-agency',
      name: 'وكالة السفر العربي',
      type: 'travel',
      position: { x: -30, y: 0, z: 20 },
      rotation: 15,
      scale: 1.2,
      color: '#3b82f6', // blue
      icon: 'plane-departure',
      description: 'وكالة السفر الرائدة في المدينة، تقدم عروض سفر محلية ودولية وتذاكر طيران وحجوزات فنادق',
      interactionDistance: 8
    },
    
    // Clothing Store
    {
      id: 'clothing-store',
      name: 'متجر الأزياء الفاخرة',
      type: 'clothing',
      position: { x: 20, y: 0, z: 15 },
      rotation: -10,
      scale: 1.1,
      color: '#f59e0b', // amber
      icon: 'tshirt',
      description: 'متجر متخصص في الأزياء العالمية والملابس الراقية للرجال والنساء والأطفال',
      interactionDistance: 8
    },
    
    // Electronics Store
    {
      id: 'electronics-store',
      name: 'متجر الإلكترونيات المتطورة',
      type: 'electronics',
      position: { x: 0, y: 0, z: 30 },
      rotation: 0,
      scale: 1.3,
      color: '#10b981', // emerald
      icon: 'laptop',
      description: 'متجر شامل للأجهزة الإلكترونية والهواتف الذكية والحواسيب وملحقاتها',
      interactionDistance: 8
    },
    
    // Restaurant
    {
      id: 'restaurant',
      name: 'مطعم النكهات العالمية',
      type: 'restaurant',
      position: { x: -20, y: 0, z: -10 },
      rotation: 30,
      scale: 1,
      color: '#ef4444', // red
      icon: 'utensils',
      description: 'مطعم يقدم مأكولات محلية وعالمية متنوعة في أجواء راقية',
      interactionDistance: 7
    },
    
    // Bank
    {
      id: 'bank',
      name: 'البنك المركزي',
      type: 'bank',
      position: { x: 35, y: 0, z: -20 },
      rotation: -20,
      scale: 1.4,
      color: '#6366f1', // indigo
      icon: 'university',
      description: 'خدمات مصرفية شاملة وحلول مالية متكاملة',
      interactionDistance: 8
    },
    
    // Entertainment Center
    {
      id: 'entertainment',
      name: 'مركز الترفيه العائلي',
      type: 'entertainment',
      position: { x: -40, y: 0, z: -25 },
      rotation: 45,
      scale: 1.5,
      color: '#8b5cf6', // violet
      icon: 'film',
      description: 'مركز ترفيهي متكامل للعائلة يضم سينما وألعاب وكافيهات',
      interactionDistance: 10,
      elevated: true
    }
  ];
  
  // Define roads network
  const roads: Road[] = [
    // Main roads
    { id: 'main-road-1', start: { x: -50, y: 0, z: 0 }, end: { x: 50, y: 0, z: 0 }, width: 10, type: 'main' },
    { id: 'main-road-2', start: { x: 0, y: 0, z: -50 }, end: { x: 0, y: 0, z: 50 }, width: 10, type: 'main' },
    
    // Secondary roads
    { id: 'sec-road-1', start: { x: -30, y: 0, z: -30 }, end: { x: 30, y: 0, z: -30 }, width: 6, type: 'secondary' },
    { id: 'sec-road-2', start: { x: -30, y: 0, z: 30 }, end: { x: 30, y: 0, z: 30 }, width: 6, type: 'secondary' },
    { id: 'sec-road-3', start: { x: -30, y: 0, z: -30 }, end: { x: -30, y: 0, z: 30 }, width: 6, type: 'secondary' },
    { id: 'sec-road-4', start: { x: 30, y: 0, z: -30 }, end: { x: 30, y: 0, z: 30 }, width: 6, type: 'secondary' },
    
    // Pedestrian paths
    { id: 'path-1', start: { x: -20, y: 0, z: -10 }, end: { x: 0, y: 0, z: 0 }, width: 3, type: 'pedestrian' },
    { id: 'path-2', start: { x: 20, y: 0, z: 15 }, end: { x: 0, y: 0, z: 0 }, width: 3, type: 'pedestrian' },
    { id: 'path-3', start: { x: -30, y: 0, z: 20 }, end: { x: 0, y: 0, z: 0 }, width: 3, type: 'pedestrian' },
    { id: 'path-4', start: { x: 0, y: 0, z: 30 }, end: { x: 0, y: 0, z: 0 }, width: 3, type: 'pedestrian' },
    { id: 'path-5', start: { x: 35, y: 0, z: -20 }, end: { x: 0, y: 0, z: 0 }, width: 3, type: 'pedestrian' },
    { id: 'path-6', start: { x: -40, y: 0, z: -25 }, end: { x: 0, y: 0, z: 0 }, width: 3, type: 'pedestrian' },
  ];
  
  // Define decorative elements
  const decorations: Decoration[] = [
    // Trees
    { id: 'tree-1', type: 'tree', position: { x: -5, y: 0, z: -5 }, rotation: 0, scale: 1 },
    { id: 'tree-2', type: 'tree', position: { x: 5, y: 0, z: -5 }, rotation: 0, scale: 0.8 },
    { id: 'tree-3', type: 'tree', position: { x: -5, y: 0, z: 5 }, rotation: 0, scale: 1.2 },
    { id: 'tree-4', type: 'tree', position: { x: 5, y: 0, z: 5 }, rotation: 0, scale: 0.9 },
    
    // Fountains
    { id: 'fountain-1', type: 'fountain', position: { x: 0, y: 0, z: 0 }, rotation: 0, scale: 1.5 },
    
    // Benches
    { id: 'bench-1', type: 'bench', position: { x: -8, y: 0, z: -3 }, rotation: 90, scale: 1 },
    { id: 'bench-2', type: 'bench', position: { x: 8, y: 0, z: -3 }, rotation: -90, scale: 1 },
    { id: 'bench-3', type: 'bench', position: { x: -8, y: 0, z: 3 }, rotation: 90, scale: 1 },
    { id: 'bench-4', type: 'bench', position: { x: 8, y: 0, z: 3 }, rotation: -90, scale: 1 },
    
    // Lampposts
    { id: 'lamp-1', type: 'lamppost', position: { x: -15, y: 0, z: -15 }, rotation: 0, scale: 1 },
    { id: 'lamp-2', type: 'lamppost', position: { x: 15, y: 0, z: -15 }, rotation: 0, scale: 1 },
    { id: 'lamp-3', type: 'lamppost', position: { x: -15, y: 0, z: 15 }, rotation: 0, scale: 1 },
    { id: 'lamp-4', type: 'lamppost', position: { x: 15, y: 0, z: 15 }, rotation: 0, scale: 1 },
    
    // Signs
    { id: 'sign-1', type: 'sign', position: { x: 0, y: 0, z: -35 }, rotation: 0, scale: 1.2 },
    { id: 'sign-2', type: 'sign', position: { x: -25, y: 0, z: 15 }, rotation: 30, scale: 1 },
    { id: 'sign-3', type: 'sign', position: { x: 25, y: 0, z: 5 }, rotation: -30, scale: 1 },
  ];
  
  // Get environment styles based on time and weather
  const getEnvironmentStyles = () => {
    let timeStyle = {};
    let weatherStyle = {};
    
    // Time of day settings
    switch (dayTime) {
      case 'morning':
        timeStyle = {
          background: 'linear-gradient(to bottom, #87CEEB, #E0F7FA)',
          filter: 'brightness(1.1) contrast(0.95) hue-rotate(10deg)'
        };
        break;
      case 'noon':
        timeStyle = {
          background: 'linear-gradient(to bottom, #56CCF2, #2F80ED)'
        };
        break;
      case 'evening':
        timeStyle = {
          background: 'linear-gradient(to bottom, #FF7E5F, #FEB47B)',
          filter: 'brightness(0.9) sepia(0.2) hue-rotate(-10deg)'
        };
        break;
      case 'night':
        timeStyle = {
          background: 'linear-gradient(to bottom, #0F2027, #203A43)',
          filter: 'brightness(0.4) contrast(1.2) saturate(0.8)'
        };
        break;
    }
    
    // Weather effects
    switch (weather) {
      case 'cloudy':
        weatherStyle = {
          filter: 'brightness(0.9)',
          background: 'linear-gradient(to bottom, #cccccc, #eeeeee)'
        };
        break;
      case 'rain':
        weatherStyle = {
          filter: 'brightness(0.7) contrast(1.1)',
          background: 'linear-gradient(to bottom, #333333, #666666)'
        };
        break;
      case 'dusty':
        weatherStyle = {
          filter: 'sepia(0.7) brightness(0.85) contrast(1.1)',
          background: 'linear-gradient(to bottom, #d4a76a, #e8c496)'
        };
        break;
    }
    
    return { ...timeStyle, ...weatherStyle };
  };
  
  // Building interior components based on type
  const getBuildingInterior = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return null;
    
    switch (building.type) {
      case 'travel':
        return (
          <div className="p-8 bg-gradient-to-b from-slate-900/90 to-blue-900/90 text-white h-full">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <i className="fas fa-plane-departure mr-3"></i>
              {building.name}
            </h2>
            <p className="mb-6 text-blue-200">{building.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-blue-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-blue-300">رحلات داخلية</h3>
                <div className="mb-4">
                  <AirplaneBuildingInterior />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 hover-jelly">
                  <i className="fas fa-ticket-alt mr-2"></i>
                  حجز تذكرة
                </Button>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-blue-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-blue-300">رحلات دولية</h3>
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>دبي</span>
                    <Badge className="bg-blue-600">900 ج.م</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>إسطنبول</span>
                    <Badge className="bg-blue-600">1200 ج.م</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>الرياض</span>
                    <Badge className="bg-blue-600">800 ج.م</Badge>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 hover-jelly">
                  <i className="fas fa-globe-americas mr-2"></i>
                  استكشاف الوجهات
                </Button>
              </div>
            </div>
            
            {/* Special offers section */}
            <div className="mt-10 bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center text-white">عروض خاصة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="hover-shimmer bg-black/20 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-300">باقة شهر العسل</h4>
                  <p className="text-sm text-white/80">عروض فاخرة للمتزوجين حديثاً</p>
                </div>
                <div className="hover-shimmer bg-black/20 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-300">رحلات عائلية</h4>
                  <p className="text-sm text-white/80">خصم 15% للعائلات بخدمات إضافية</p>
                </div>
                <div className="hover-shimmer bg-black/20 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-300">سفر الأعمال</h4>
                  <p className="text-sm text-white/80">خدمات متميزة لرجال الأعمال</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'clothing':
        return (
          <div className="p-8 bg-gradient-to-b from-slate-900/90 to-amber-900/90 text-white h-full">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <i className="fas fa-tshirt mr-3"></i>
              {building.name}
            </h2>
            <p className="mb-6 text-amber-200">{building.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-amber-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-amber-300">أزياء رجالية</h3>
                <VirtualFittingRoom 
                  outfits={[
                    { id: 1, name: 'بدلة رسمية', image: 'https://placehold.co/400x600?text=بدلة+رسمية', price: 1200 },
                    { id: 2, name: 'طقم كاجوال', image: 'https://placehold.co/400x600?text=طقم+كاجوال', price: 800 },
                  ]}
                  showControls={true}
                />
                <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700 hover-jelly">
                  <i className="fas fa-camera mr-2"></i>
                  تجربة الملابس افتراضياً
                </Button>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-amber-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-amber-300">أزياء نسائية</h3>
                <VirtualFittingRoom 
                  outfits={[
                    { id: 3, name: 'فستان سهرة', image: 'https://placehold.co/400x600?text=فستان+سهرة', price: 1500 },
                    { id: 4, name: 'تصميم عصري', image: 'https://placehold.co/400x600?text=تصميم+عصري', price: 900 },
                  ]}
                  showControls={true}
                />
                <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700 hover-jelly">
                  <i className="fas fa-shopping-bag mr-2"></i>
                  تصفح المجموعة
                </Button>
              </div>
            </div>
            
            {/* Season collection */}
            <div className="mt-10 bg-gradient-to-r from-amber-900/40 to-red-900/40 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center text-white">تشكيلات الموسم</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="hover-bounce bg-black/20 p-4 rounded-lg text-center">
                  <div className="mb-2 text-2xl"><i className="fas fa-tshirt"></i></div>
                  <h4 className="font-bold text-yellow-300">كاجوال</h4>
                </div>
                <div className="hover-bounce bg-black/20 p-4 rounded-lg text-center">
                  <div className="mb-2 text-2xl"><i className="fas fa-user-tie"></i></div>
                  <h4 className="font-bold text-yellow-300">رسمي</h4>
                </div>
                <div className="hover-bounce bg-black/20 p-4 rounded-lg text-center">
                  <div className="mb-2 text-2xl"><i className="fas fa-shoe-prints"></i></div>
                  <h4 className="font-bold text-yellow-300">أحذية</h4>
                </div>
                <div className="hover-bounce bg-black/20 p-4 rounded-lg text-center">
                  <div className="mb-2 text-2xl"><i className="fas fa-gem"></i></div>
                  <h4 className="font-bold text-yellow-300">اكسسوارات</h4>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'electronics':
        return (
          <div className="p-8 bg-gradient-to-b from-slate-900/90 to-emerald-900/90 text-white h-full">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <i className="fas fa-laptop mr-3"></i>
              {building.name}
            </h2>
            <p className="mb-6 text-emerald-200">{building.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-emerald-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-emerald-300">هواتف ذكية</h3>
                <div className="mb-4 relative h-48 bg-slate-900/50 rounded-lg overflow-hidden">
                  <ThreeProductView rotationSpeed={0.01} color="#10b981" height="100%" />
                  <Badge className="absolute top-2 right-2 bg-emerald-600">-15%</Badge>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>آي-فون 13 برو</span>
                    <Badge className="bg-emerald-600">4500 ج.م</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>سامسونج جالاكسي</span>
                    <Badge className="bg-emerald-600">3800 ج.م</Badge>
                  </div>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 hover-jelly">
                  <i className="fas fa-mobile-alt mr-2"></i>
                  استكشاف الهواتف
                </Button>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-emerald-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-emerald-300">أجهزة الكمبيوتر</h3>
                <div className="mb-4 relative h-48 bg-slate-900/50 rounded-lg overflow-hidden">
                  <ThreeProductView rotationSpeed={0.005} color="#0ea5e9" height="100%" />
                  <Badge className="absolute top-2 right-2 bg-emerald-600">جديد</Badge>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>ماك بوك برو</span>
                    <Badge className="bg-emerald-600">9500 ج.م</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>ديل XPS</span>
                    <Badge className="bg-emerald-600">7800 ج.م</Badge>
                  </div>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 hover-jelly">
                  <i className="fas fa-laptop mr-2"></i>
                  تصفح الحواسيب
                </Button>
              </div>
            </div>
            
            {/* Tech news */}
            <div className="mt-10 bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center text-white">أحدث التقنيات</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="hover-shadow-pulse bg-black/20 p-4 rounded-lg">
                  <h4 className="font-bold text-cyan-300">شاشات OLED جديدة</h4>
                  <p className="text-sm text-white/80">تقنية جديدة بألوان أكثر حيوية</p>
                </div>
                <div className="hover-shadow-pulse bg-black/20 p-4 rounded-lg">
                  <h4 className="font-bold text-cyan-300">معالجات آبل M2</h4>
                  <p className="text-sm text-white/80">أداء أسرع بـ 20% واستهلاك أقل للطاقة</p>
                </div>
                <div className="hover-shadow-pulse bg-black/20 p-4 rounded-lg">
                  <h4 className="font-bold text-cyan-300">سماعات بتقنية فريدة</h4>
                  <p className="text-sm text-white/80">تكنولوجيا إلغاء الضوضاء المتطورة</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'restaurant':
        return (
          <div className="p-8 bg-gradient-to-b from-slate-900/90 to-red-900/90 text-white h-full">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <i className="fas fa-utensils mr-3"></i>
              {building.name}
            </h2>
            <p className="mb-6 text-red-200">{building.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-red-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-red-300">المأكولات الشرقية</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between p-2 border-b border-white/10">
                    <span>كبسة لحم</span>
                    <Badge className="bg-red-600">85 ج.م</Badge>
                  </div>
                  <div className="flex justify-between p-2 border-b border-white/10">
                    <span>شاورما دجاج</span>
                    <Badge className="bg-red-600">65 ج.م</Badge>
                  </div>
                  <div className="flex justify-between p-2 border-b border-white/10">
                    <span>كشري مصري</span>
                    <Badge className="bg-red-600">40 ج.م</Badge>
                  </div>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 hover-jelly">
                  <i className="fas fa-clipboard-list mr-2"></i>
                  قائمة الطعام كاملة
                </Button>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-red-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-red-300">المأكولات العالمية</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between p-2 border-b border-white/10">
                    <span>بيتزا مشكلة</span>
                    <Badge className="bg-red-600">120 ج.م</Badge>
                  </div>
                  <div className="flex justify-between p-2 border-b border-white/10">
                    <span>باستا كاربونارا</span>
                    <Badge className="bg-red-600">90 ج.م</Badge>
                  </div>
                  <div className="flex justify-between p-2 border-b border-white/10">
                    <span>برجر لحم</span>
                    <Badge className="bg-red-600">75 ج.م</Badge>
                  </div>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 hover-jelly">
                  <i className="fas fa-concierge-bell mr-2"></i>
                  طلب الطعام
                </Button>
              </div>
            </div>
            
            {/* Chef recommendations */}
            <div className="mt-10 bg-gradient-to-r from-red-900/40 to-orange-900/40 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center text-white">توصيات الشيف</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="hover-wiggle bg-black/20 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-yellow-300">ريش ضأن مشوية</h4>
                  <p className="text-sm text-white/80">مع الأرز البسمتي وصلصة الروزماري</p>
                </div>
                <div className="hover-wiggle bg-black/20 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-yellow-300">سمك مشوي</h4>
                  <p className="text-sm text-white/80">مع صلصة الليمون والأعشاب الطازجة</p>
                </div>
                <div className="hover-wiggle bg-black/20 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-yellow-300">تيراميسو</h4>
                  <p className="text-sm text-white/80">حلو إيطالي كلاسيكي محضر في مطبخنا</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      // Bank interior
      case 'bank':
        return (
          <div className="p-8 bg-gradient-to-b from-slate-900/90 to-indigo-900/90 text-white h-full">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <i className="fas fa-university mr-3"></i>
              {building.name}
            </h2>
            <p className="mb-6 text-indigo-200">{building.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-indigo-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-indigo-300">الخدمات الشخصية</h3>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-credit-card mr-2 text-indigo-400"></i>
                    <span>فتح حساب جديد</span>
                  </li>
                  <li className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-money-bill-wave mr-2 text-indigo-400"></i>
                    <span>قروض شخصية</span>
                  </li>
                  <li className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-piggy-bank mr-2 text-indigo-400"></i>
                    <span>حسابات التوفير</span>
                  </li>
                </ul>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 hover-jelly">
                  <i className="fas fa-user-plus mr-2"></i>
                  فتح حساب الآن
                </Button>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-indigo-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-indigo-300">خدمات الشركات</h3>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-building mr-2 text-indigo-400"></i>
                    <span>حسابات للشركات</span>
                  </li>
                  <li className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-chart-line mr-2 text-indigo-400"></i>
                    <span>استثمارات تجارية</span>
                  </li>
                  <li className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-handshake mr-2 text-indigo-400"></i>
                    <span>تمويل المشاريع</span>
                  </li>
                </ul>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 hover-jelly">
                  <i className="fas fa-briefcase mr-2"></i>
                  خدمات تجارية
                </Button>
              </div>
            </div>
            
            {/* Current exchange rates */}
            <div className="mt-10 bg-gradient-to-r from-indigo-900/40 to-sky-900/40 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center text-white">أسعار العملات</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="hover-pulse bg-black/20 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-sky-300">
                    <i className="fas fa-dollar-sign mr-1"></i> دولار أمريكي
                  </h4>
                  <p className="text-lg text-white">30.90 ج.م</p>
                </div>
                <div className="hover-pulse bg-black/20 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-sky-300">
                    <i className="fas fa-euro-sign mr-1"></i> يورو
                  </h4>
                  <p className="text-lg text-white">33.75 ج.م</p>
                </div>
                <div className="hover-pulse bg-black/20 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-sky-300">
                    <i className="fas fa-pound-sign mr-1"></i> جنيه إسترليني
                  </h4>
                  <p className="text-lg text-white">39.25 ج.م</p>
                </div>
                <div className="hover-pulse bg-black/20 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-sky-300">
                    <i className="fas fa-yen-sign mr-1"></i> ين ياباني
                  </h4>
                  <p className="text-lg text-white">0.21 ج.م</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      // Entertainment center interior
      case 'entertainment':
        return (
          <div className="p-8 bg-gradient-to-b from-slate-900/90 to-violet-900/90 text-white h-full">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <i className="fas fa-film mr-3"></i>
              {building.name}
            </h2>
            <p className="mb-6 text-violet-200">{building.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-violet-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-violet-300">عروض سينما</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>فيلم الحركة</span>
                    <Badge className="bg-violet-600">4:30 م</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>الكوميديا الجديدة</span>
                    <Badge className="bg-violet-600">7:00 م</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>مغامرات فضائية</span>
                    <Badge className="bg-violet-600">9:30 م</Badge>
                  </div>
                </div>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 hover-jelly">
                  <i className="fas fa-ticket-alt mr-2"></i>
                  حجز تذاكر
                </Button>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-violet-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-violet-300">ألعاب إلكترونية</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-gamepad mr-2 text-violet-400"></i>
                    <span>ألعاب الواقع الافتراضي</span>
                  </div>
                  <div className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-car mr-2 text-violet-400"></i>
                    <span>سباق السيارات</span>
                  </div>
                  <div className="flex items-center p-2 border-b border-white/10">
                    <i className="fas fa-bowling-ball mr-2 text-violet-400"></i>
                    <span>البولينج</span>
                  </div>
                </div>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 hover-jelly">
                  <i className="fas fa-play mr-2"></i>
                  استكشاف الألعاب
                </Button>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-violet-500/20 hover-float hover-border-glow">
                <h3 className="font-bold text-xl mb-4 text-violet-300">كافيه ومطعم</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>قهوة مميزة</span>
                    <Badge className="bg-violet-600">25 ج.م</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>ميلك شيك</span>
                    <Badge className="bg-violet-600">35 ج.م</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span>وجبات خفيفة</span>
                    <Badge className="bg-violet-600">50 ج.م</Badge>
                  </div>
                </div>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 hover-jelly">
                  <i className="fas fa-coffee mr-2"></i>
                  قائمة الكافيه
                </Button>
              </div>
            </div>
            
            {/* Special events */}
            <div className="mt-10 bg-gradient-to-r from-violet-900/40 to-purple-900/40 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center text-white">فعاليات خاصة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="hover-shadow-pulse bg-black/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-fuchsia-300">ليلة الكوميديا</h4>
                    <Badge className="bg-fuchsia-800">الخميس</Badge>
                  </div>
                  <p className="text-sm text-white/80">عروض كوميدية حية مع ألمع نجوم الكوميديا</p>
                </div>
                <div className="hover-shadow-pulse bg-black/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-fuchsia-300">موسيقى حية</h4>
                    <Badge className="bg-fuchsia-800">الجمعة</Badge>
                  </div>
                  <p className="text-sm text-white/80">أمسية موسيقية مع فرقة الجاز المحلية</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-8 bg-gradient-to-b from-slate-900 to-gray-900 text-white h-full">
            <h2 className="text-3xl font-bold mb-4">{building.name}</h2>
            <p className="mb-4">{building.description}</p>
            <div className="bg-white/10 p-4 rounded-lg">
              <p>المحتوى قيد التطوير</p>
            </div>
          </div>
        );
    }
  };
  
  // Render building in the city
  const renderBuilding = (building: Building) => {
    const isSelected = selectedBuilding === building.id;
    const playerDistance = calcDistance(movement.position, building.position);
    const isNearby = playerDistance < building.interactionDistance;
    
    return (
      <div
        key={building.id}
        className={`absolute transform transition-all duration-300 ${isSelected ? 'z-20' : 'z-10'}`}
        style={{
          left: `calc(50% + ${building.position.x * 10}px)`,
          top: `calc(50% + ${building.position.z * 10}px)`,
          transform: `translate(-50%, -50%) rotateY(${building.rotation}deg) scale(${building.scale * (isSelected ? 1.05 : 1)})`,
        }}
      >
        {/* Building visualization with 3D model */}
        <div 
          className={`relative ${isNearby ? 'hover-shadow-pulse cursor-pointer' : ''} ${isSelected ? 'shadow-2xl' : 'shadow-xl'}`}
          onClick={() => {
            if (isNearby) {
              setSelectedBuilding(building.id);
              showNotification(`قريب من: ${building.name}`);
            } else if (playerDistance < building.interactionDistance * 2) {
              showNotification(`اقترب أكثر من ${building.name} للتفاعل معه`);
            }
          }}
        >
          <ThreeBuildingModel 
            type={building.type}
            color={building.color}
            modelHeight={building.elevated ? 200 : 150} 
            showControls={false}
            scale={building.scale}
          />
          
          {/* Building label */}
          <div 
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-black/80 px-3 py-1 rounded-full
                       text-white text-xs font-bold whitespace-nowrap border transition-all duration-300 ${
                         isSelected ? 'border-white scale-110' : 'border-white/30'
                       }`}
            style={{ borderColor: isNearby ? building.color : 'transparent' }}
          >
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <i className={`fas fa-${building.icon} mr-1`} style={{ color: building.color }}></i>
              <span>{building.name}</span>
            </div>
          </div>
        </div>
        
        {/* Building interaction */}
        {isNearby && (
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[150%] z-30 flex flex-col gap-2 items-center"
          >
            <Button
              size="sm"
              variant="outline"
              className="bg-black/50 border-white/10 text-white hover:bg-white/20 hover-pulse"
              onClick={() => setInsideBuilding(building.id)}
            >
              <i className="fas fa-door-open mr-2"></i>
              دخول
            </Button>
          </div>
        )}
        
        {/* Building dialog - shows when selected but not inside */}
        {isSelected && !insideBuilding && (
          <div 
            className="fixed inset-x-0 bottom-0 z-40 p-4 bg-black/80 backdrop-blur-sm border-t border-white/10 max-w-3xl mx-auto rounded-t-xl"
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-14 h-14 flex items-center justify-center rounded-full" 
                style={{ backgroundColor: `${building.color}30`, borderColor: building.color }}
              >
                <i className={`fas fa-${building.icon} text-2xl`} style={{ color: building.color }}></i>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-xl text-white mb-1">{building.name}</h3>
                <p className="text-white/80 text-sm mb-3">{building.description}</p>
                
                <div className="flex gap-3">
                  <Button
                    className="flex-1 hover-jelly"
                    style={{ backgroundColor: building.color, borderColor: building.color }}
                    onClick={() => {
                      if (isNearby) {
                        setInsideBuilding(building.id);
                      } else {
                        showNotification(`اقترب أكثر من ${building.name} للدخول`);
                        setSelectedBuilding(null);
                      }
                    }}
                    disabled={!isNearby}
                  >
                    <i className="fas fa-door-open mr-2"></i>
                    {isNearby ? 'دخول المبنى' : 'المبنى بعيد'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="hover-jelly"
                    onClick={() => setSelectedBuilding(null)}
                  >
                    <i className="fas fa-times mr-2"></i>
                    إغلاق
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Calculate distance between two points
  const calcDistance = (p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }): number => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };
  
  // Render road network
  const renderRoads = () => {
    return roads.map(road => {
      const length = calcDistance(road.start, road.end);
      const angle = Math.atan2(road.end.z - road.start.z, road.end.x - road.start.x) * (180 / Math.PI);
      
      // Determine road style based on type
      let roadColor = '';
      let borderStyle = '';
      
      switch (road.type) {
        case 'main':
          roadColor = 'bg-slate-700';
          borderStyle = 'border-yellow-500/50';
          break;
        case 'secondary':
          roadColor = 'bg-slate-800';
          borderStyle = 'border-white/20';
          break;
        case 'pedestrian':
          roadColor = 'bg-slate-900';
          borderStyle = 'border-white/10';
          break;
      }
      
      return (
        <div
          key={road.id}
          className={`absolute ${roadColor} border-x ${borderStyle}`}
          style={{
            left: `calc(50% + ${road.start.x * 10}px)`,
            top: `calc(50% + ${road.start.z * 10}px)`,
            width: `${length * 10}px`,
            height: `${road.width}px`,
            transformOrigin: 'left center',
            transform: `rotate(${angle}deg)`
          }}
        ></div>
      );
    });
  };
  
  // Render decorative elements
  const renderDecorations = () => {
    return decorations.map(decoration => {
      // Choose decoration appearance based on type
      let content = null;
      
      switch (decoration.type) {
        case 'tree':
          content = (
            <div className="w-10 h-10 flex flex-col items-center justify-center hover-float">
              <div className="w-6 h-6 rounded-full bg-green-600 shadow-lg"></div>
              <div className="w-1 h-3 bg-yellow-800"></div>
            </div>
          );
          break;
        case 'bench':
          content = (
            <div 
              className="w-8 h-3 bg-yellow-800 rounded-sm shadow-md hover-shimmer"
              style={{ transform: `rotate(${decoration.rotation}deg)` }}
            ></div>
          );
          break;
        case 'fountain':
          content = (
            <div className="relative hover-pulse">
              <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-500/50">
                <div className="w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500/80"></div>
                </div>
              </div>
              <div className="absolute inset-0 animate-pulse-slow rounded-full border border-blue-400/40 scale-110"></div>
            </div>
          );
          break;
        case 'lamppost':
          content = (
            <div className="flex flex-col items-center hover-shimmer">
              <div className="w-3 h-3 rounded-full bg-yellow-300 shadow-md shadow-yellow-200/50"></div>
              <div className="w-0.5 h-4 bg-gray-500"></div>
            </div>
          );
          break;
        case 'sign':
          content = (
            <div 
              className="w-6 h-4 bg-blue-700 rounded-sm shadow-sm flex items-center justify-center text-[8px] text-white hover-wiggle"
              style={{ transform: `rotate(${decoration.rotation}deg)` }}
            >
              <i className="fas fa-info"></i>
            </div>
          );
          break;
        default:
          content = <div className="w-2 h-2 bg-white rounded-full"></div>;
      }
      
      return (
        <div
          key={decoration.id}
          className="absolute transform"
          style={{
            left: `calc(50% + ${decoration.position.x * 10}px)`,
            top: `calc(50% + ${decoration.position.z * 10}px)`,
            transform: `translate(-50%, -50%) scale(${decoration.scale})`,
            zIndex: 5
          }}
        >
          {content}
        </div>
      );
    });
  };
  
  // Weather particle effects
  const renderWeatherEffects = () => {
    if (weather === 'rain') {
      return Array.from({ length: 100 }).map((_, i) => (
        <div 
          key={i}
          className="absolute w-0.5 bg-blue-200 opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            height: `${Math.random() * 20 + 10}px`,
            animationDuration: `${Math.random() * 1 + 0.5}s`,
            animation: 'falling-rain linear infinite',
          }}
        ></div>
      ));
    } else if (weather === 'dusty') {
      return Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-yellow-700/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 50 + 30}px`,
            height: `${Math.random() * 50 + 30}px`,
            filter: 'blur(8px)',
            opacity: Math.random() * 0.3 + 0.1,
            animation: `float${Math.floor(Math.random() * 3) + 1} ${Math.random() * 8 + 8}s infinite linear`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        ></div>
      ));
    } else if (weather === 'cloudy') {
      return Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            width: `${Math.random() * 200 + 100}px`,
            height: `${Math.random() * 50 + 60}px`,
            filter: 'blur(20px)',
            opacity: Math.random() * 0.4 + 0.1,
            animation: `float${Math.floor(Math.random() * 3) + 1} ${Math.random() * 60 + 30}s infinite linear`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        ></div>
      ));
    }
    
    return null;
  };
  
  // Main return - the entire city
  return (
    <div 
      ref={cityRef}
      className="w-full h-full absolute inset-0 transition-opacity duration-500 opacity-0"
      style={getEnvironmentStyles()}
    >
      {/* Sky and ground */}
      <div className="absolute inset-0 z-0"></div>
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-gray-900 to-transparent z-0"></div>
      
      {/* Weather effects */}
      <div className="absolute inset-0 pointer-events-none z-5">
        {renderWeatherEffects()}
      </div>
      
      {/* Main city area */}
      <div className="absolute inset-0 overflow-hidden" style={{ perspective: '1000px' }}>
        {/* Road network */}
        <div className="absolute inset-0 z-5">
          {renderRoads()}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 z-6">
          {renderDecorations()}
        </div>
        
        {/* Buildings */}
        <div className="absolute inset-0 z-10">
          {buildings.map(building => renderBuilding(building))}
        </div>
        
        {/* Traffic */}
        {trafficDensity !== 'low' && (
          <>
            <CarTraffic 
              direction="right-to-left" 
              speed={trafficDensity === 'high' ? 3 : 2} 
              laneOffset={5}
              initialDelay={0}
            />
            
            {trafficDensity === 'high' && (
              <>
                <CarTraffic 
                  carStyle="suv" 
                  direction="left-to-right" 
                  speed={2.5} 
                  laneOffset={-5}
                  initialDelay={1.5}
                />
                <CarTraffic 
                  carStyle="truck" 
                  direction="bottom-to-top" 
                  speed={1.8} 
                  laneOffset={15}
                  initialDelay={3}
                />
              </>
            )}
            
            <TrafficLight 
              position={{ x: 5, y: 0, z: -15 }}
              cycleTime={trafficDensity === 'high' ? 5 : 10}
            />
          </>
        )}
        
        {/* City entrance gate */}
        <GateControl
          playerPosition={movement.position}
          gatePosition={{ x: 0, y: 0, z: -35 }}
          gateWidth={30}
          gateHeight={20}
          gateColor="#d97706"
          triggerDistance={10}
        >
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <div className="text-center">
              <div className="text-amber-400 flex items-center justify-center text-4xl mb-2">
                <i className="fas fa-city mr-3"></i>
                <span>مدينة أمريكي</span>
              </div>
              <div className="text-lg text-white/90">
                مرحباً بك في المدينة التفاعلية المتكاملة
              </div>
            </div>
          </div>
        </GateControl>
      </div>
      
      {/* Building interior view - fullscreen overlay when inside a building */}
      {insideBuilding && (
        <div className="fixed inset-0 z-50 bg-black/90">
          {/* Interior close button */}
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-50 bg-black/50 border-white/20 hover:bg-white/10 hover-pulse"
            onClick={() => {
              setInsideBuilding(null);
              setSelectedBuilding(null);
            }}
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            خروج
          </Button>
          
          {/* Building interior content */}
          <div className="absolute inset-0 overflow-auto">
            {getBuildingInterior(insideBuilding)}
          </div>
        </div>
      )}
      
      {/* User interface overlay (HUD) */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* Environment controls */}
        <div className="absolute top-4 right-4 pointer-events-auto w-48 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover-border-glow">
          <h3 className="text-white text-sm font-bold mb-2">إعدادات البيئة</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white text-xs">الوقت</span>
              <Select 
                defaultValue={dayTime} 
                onValueChange={(value) => setDayTime(value as 'morning' | 'noon' | 'evening' | 'night')}
              >
                <SelectTrigger className="w-28 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">الصباح</SelectItem>
                  <SelectItem value="noon">الظهيرة</SelectItem>
                  <SelectItem value="evening">المساء</SelectItem>
                  <SelectItem value="night">الليل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white text-xs">الطقس</span>
              <Select 
                defaultValue={weather} 
                onValueChange={(value) => setWeather(value as 'clear' | 'cloudy' | 'rain' | 'dusty')}
              >
                <SelectTrigger className="w-28 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">صافي</SelectItem>
                  <SelectItem value="cloudy">غائم</SelectItem>
                  <SelectItem value="rain">ماطر</SelectItem>
                  <SelectItem value="dusty">غبار</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white text-xs">حركة المرور</span>
              <Select 
                defaultValue={trafficDensity} 
                onValueChange={(value) => setTrafficDensity(value as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger className="w-28 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">مرتفعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white text-xs">سرعة المشي</span>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => movement.setSpeed && movement.setSpeed(Math.max(1, 2 - 1))}
                  className="h-5 w-5 p-0 hover-jelly"
                >-</Button>
                <span className="text-white text-xs w-4 text-center">2</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => movement.setSpeed && movement.setSpeed(Math.min(10, 2 + 1))}
                  className="h-5 w-5 p-0 hover-jelly"
                >+</Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map toggle button */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <Button
            variant={showMap ? "default" : "outline"}
            size="sm"
            className="hover-pulse"
            onClick={() => setShowMap(!showMap)}
          >
            <i className="fas fa-map-marked-alt mr-2"></i>
            الخريطة
          </Button>
        </div>
        
        {/* Map view when expanded */}
        {showMap && (
          <div className="absolute top-16 left-4 w-80 h-80 bg-black/70 rounded-lg border border-white/10 pointer-events-auto p-2 shadow-xl overflow-hidden hover-shadow-pulse">
            <div className="relative w-full h-full rounded bg-slate-900/90">
              {/* Player marker */}
              <div 
                className="absolute w-3 h-3 bg-white rounded-full shadow-md shadow-white/50 z-30"
                style={{ 
                  left: `${((movement.position.x + 50) / 100) * 100}%`, 
                  top: `${((movement.position.z + 50) / 100) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
              
              {/* Buildings on map */}
              {buildings.map(building => (
                <div 
                  key={`map-${building.id}`}
                  className="absolute w-2 h-2 rounded-full shadow-sm z-20 hover:z-30 hover:scale-150 transition-all duration-300 cursor-pointer"
                  style={{ 
                    backgroundColor: building.color,
                    left: `${((building.position.x + 50) / 100) * 100}%`, 
                    top: `${((building.position.z + 50) / 100) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => {
                    setSelectedBuilding(building.id);
                    showNotification(`المبنى المحدد: ${building.name}`);
                  }}
                  title={building.name}
                ></div>
              ))}
              
              {/* Roads on map */}
              {roads.map(road => {
                const startX = ((road.start.x + 50) / 100) * 100;
                const startY = ((road.start.z + 50) / 100) * 100;
                const endX = ((road.end.x + 50) / 100) * 100;
                const endY = ((road.end.z + 50) / 100) * 100;
                
                const length = Math.sqrt(
                  Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
                );
                const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
                
                let roadColor = '';
                switch(road.type) {
                  case 'main': roadColor = 'bg-white/50'; break;
                  case 'secondary': roadColor = 'bg-white/30'; break;
                  case 'pedestrian': roadColor = 'bg-white/20'; break;
                }
                
                return (
                  <div
                    key={`map-${road.id}`}
                    className={`absolute h-0.5 ${roadColor} z-10`}
                    style={{
                      left: `${startX}%`,
                      top: `${startY}%`,
                      width: `${length}%`,
                      transformOrigin: 'left center',
                      transform: `rotate(${angle}deg)`
                    }}
                  ></div>
                );
              })}
              
              {/* Legend */}
              <div className="absolute bottom-2 right-2 bg-black/70 rounded p-1 text-white/90 text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <span>أنت</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>المباني</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notification area */}
        {notificationText && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg text-white shadow-lg border border-white/10 text-sm hover-shimmer">
            <div className="flex items-center">
              <i className="fas fa-info-circle mr-2 text-blue-400"></i>
              <span>{notificationText}</span>
            </div>
          </div>
        )}
        
        {/* Mobile controls */}
        {isMobile && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <TouchControls 
              onMove={(direction) => {
                // Map directions to movement
                switch(direction) {
                  case 'forward': movement.moveForward(); break;
                  case 'backward': movement.moveBackward(); break;
                  case 'left': movement.moveLeft(); break;
                  case 'right': movement.moveRight(); break;
                }
              }}
              onLook={movement.rotate}
              showControls={true}
            />
          </div>
        )}
        
        {/* Instructions card */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/10 text-white hover:bg-white/10 hover-jelly"
            onClick={() => showNotification(
              isMobile 
                ? 'استخدم أزرار التحكم للتنقل، واضغط على المباني للتفاعل'
                : 'استخدم الأسهم أو W A S D للتنقل، والماوس للدوران، وانقر على المباني للتفاعل'
            )}
          >
            <i className="fas fa-question-circle mr-2"></i>
            تعليمات
          </Button>
        </div>
        
        {/* Reset/teleport button */}
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/10 text-white hover:bg-white/10 hover-jelly"
            onClick={() => {
              movement.resetPosition();
              showNotification('تم العودة إلى نقطة البداية');
            }}
          >
            <i className="fas fa-sync-alt mr-2"></i>
            إعادة ضبط
          </Button>
        </div>
      </div>
      
      {/* Dynamic promotions panel */}
      <div className="absolute bottom-20 right-4 z-30 pointer-events-auto">
        <DynamicPromotions
          animated={true}
          variant="highlight"
        />
      </div>
    </div>
  );
}