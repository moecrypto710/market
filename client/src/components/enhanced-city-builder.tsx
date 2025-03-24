import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMovement } from '@/hooks/use-movement';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface Building {
  id: string;
  name: string;
  type: string; // Allow any building type
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: number;
  color: string;
  icon: string;
  description?: string;
  style?: 'modern' | 'traditional' | 'futuristic' | 'arabic';
  floors?: number;
  animated?: boolean;
  hasInterior?: boolean;
  interiorComponent?: React.ReactNode;
}

interface EnvironmentSettings {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weatherCondition: 'clear' | 'cloudy' | 'rainy' | 'sandstorm';
  trafficDensity: 'low' | 'medium' | 'high';
  ambientSound: 'city' | 'market' | 'quiet' | 'nature' | 'none';
  soundVolume: number;
  shader: 'standard' | 'enhanced' | 'realistic';
  renderQuality: 'low' | 'medium' | 'high';
  shadowsEnabled: boolean;
  reflectionsEnabled: boolean;
  postProcessingEnabled: boolean;
}

/**
 * EnhancedCityBuilder Component
 * 
 * An immersive virtual city experience with realistic buildings, lighting,
 * sound effects, and interactive elements designed for regular devices
 * (without requiring VR hardware) to simulate a VR-like experience.
 * 
 * This component uses modern web technologies to create a 3D-like environment
 * that works on all devices from mobile to desktop.
 */
export default function EnhancedCityBuilder() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundSourcesRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  // Environment state
  const [environment, setEnvironment] = useState<EnvironmentSettings>({
    timeOfDay: 'day',
    weatherCondition: 'clear',
    trafficDensity: 'medium',
    ambientSound: 'city',
    soundVolume: 0.5,
    shader: isMobile ? 'standard' : 'enhanced',
    renderQuality: isMobile ? 'medium' : 'high',
    shadowsEnabled: !isMobile,
    reflectionsEnabled: !isMobile,
    postProcessingEnabled: !isMobile
  });
  
  // User interaction state
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  const [isInteriorView, setIsInteriorView] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: -10 });
  
  // Movement setup with enhanced parameters
  const { 
    position, rotation, isMoving, 
    moveForward, moveBackward, moveLeft, moveRight, 
    rotate, resetPosition, setSpeed, addCollisionObject, removeCollisionObject
  } = useMovement({
    initialPosition: { x: 0, y: 1.7, z: -12 }, // Eye level height for a more realistic view
    initialRotation: { x: 0, y: 0, z: 0 },
    speed: 3.2, // سرعة معتدلة للحصول على تجربة أكثر واقعية
    sensitivity: 0.25, // حساسية أفضل للكاميرا
    enableCollisions: true
  });
  
  // Effect to update player position for other components
  useEffect(() => {
    setPlayerPosition(position);
  }, [position]);

  // Define enhanced Arabic-style buildings
  const buildings: Building[] = [
    // Main district - Downtown/Central Plaza
    {
      id: 'centralPlaza',
      name: 'الساحة المركزية',
      type: 'entertainment',
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      scale: 2.5,
      color: '#9333ea', // Purple
      icon: 'fa-monument',
      style: 'modern',
      description: 'ساحة مركزية فسيحة محاطة بالمباني والمتاجر، نقطة تجمع رئيسية للزوار',
      animated: true,
      hasInterior: false
    },
    
    // Travel district - Left side
    {
      id: 'travelAgency',
      name: 'وكالة السفر العربي',
      type: 'travel',
      position: { x: -20, y: 0, z: -5 },
      rotation: 15,
      scale: 1.8,
      color: '#3b82f6', // Blue
      icon: 'fa-plane',
      style: 'modern',
      floors: 3,
      description: 'وكالة سفر تقدم رحلات وعروض سياحية مميزة حول العالم',
      animated: true,
      hasInterior: true,
      interiorComponent: <AirplaneBuildingInterior />
    },
    {
      id: 'hotel',
      name: 'فندق أمريكي الفاخر',
      type: 'services',
      position: { x: -28, y: 0, z: 5 },
      rotation: 0,
      scale: 2.2,
      color: '#2563eb', // Darker blue
      icon: 'fa-hotel',
      style: 'modern',
      floors: 5,
      description: 'فندق فاخر بتصميم عربي عصري وإطلالة رائعة على المدينة',
      animated: false,
      hasInterior: true
    },
    
    // Shopping district - Right side
    {
      id: 'luxuryClothingStore',
      name: 'متجر الملابس الفاخرة',
      type: 'clothing',
      position: { x: 20, y: 0, z: -5 },
      rotation: -15,
      scale: 1.7,
      color: '#f59e0b', // Amber
      icon: 'fa-tshirt',
      style: 'arabic',
      floors: 2,
      description: 'متجر للأزياء الراقية والملابس العصرية مع تجربة افتراضية للملابس',
      animated: true,
      hasInterior: true
    },
    {
      id: 'mallComplex',
      name: 'مجمع التسوق',
      type: 'entertainment',
      position: { x: 28, y: 0, z: 5 },
      rotation: 0,
      scale: 2.4,
      color: '#d97706', // Darker amber
      icon: 'fa-shopping-bag',
      style: 'modern',
      floors: 4,
      description: 'مجمع تسوق كبير يضم العديد من المتاجر والمطاعم والترفيه',
      animated: true,
      hasInterior: true
    },
    
    // Technology district - Forward
    {
      id: 'electronicsStore',
      name: 'متجر الإلكترونيات والتقنية',
      type: 'electronics',
      position: { x: -10, y: 0, z: 20 },
      rotation: 180,
      scale: 1.6,
      color: '#10b981', // Emerald
      icon: 'fa-laptop',
      style: 'futuristic',
      floors: 2,
      description: 'متجر متخصص بأحدث المنتجات الإلكترونية والتقنية',
      animated: true,
      hasInterior: true
    },
    {
      id: 'techHub',
      name: 'مركز التقنية والابتكار',
      type: 'services',
      position: { x: 10, y: 0, z: 20 },
      rotation: 180,
      scale: 1.9,
      color: '#059669', // Darker emerald
      icon: 'fa-microchip',
      style: 'futuristic',
      floors: 3,
      description: 'مركز للتقنية والابتكار يضم مساحات عمل وشركات تقنية ناشئة',
      animated: false,
      hasInterior: true
    },
    
    // Traditional district - Between areas
    {
      id: 'traditionalMarket',
      name: 'السوق التقليدي',
      type: 'food',
      position: { x: -15, y: 0, z: 15 },
      rotation: 135,
      scale: 1.5,
      color: '#b45309', // Orange/brown
      icon: 'fa-store',
      style: 'traditional',
      floors: 1,
      description: 'سوق تقليدي يعرض المنتجات المحلية والحرف اليدوية',
      animated: true,
      hasInterior: true
    },
    {
      id: 'restaurantDistrict',
      name: 'منطقة المطاعم',
      type: 'food',
      position: { x: 15, y: 0, z: 15 },
      rotation: -135,
      scale: 1.4,
      color: '#db2777', // Pink
      icon: 'fa-utensils',
      style: 'arabic',
      floors: 1,
      description: 'مجموعة متنوعة من المطاعم العالمية والمحلية',
      animated: true,
      hasInterior: true
    },
    
    // Entertainment venues - Further back
    {
      id: 'virtualArcade',
      name: 'صالة الألعاب الافتراضية',
      type: 'entertainment',
      position: { x: -22, y: 0, z: 22 },
      rotation: 45,
      scale: 1.7,
      color: '#8b5cf6', // Violet
      icon: 'fa-gamepad',
      style: 'futuristic',
      floors: 2,
      description: 'مركز ترفيهي للألعاب الافتراضية والتجارب التفاعلية',
      animated: true,
      hasInterior: true
    },
    {
      id: 'culturalCenter',
      name: 'المركز الثقافي',
      type: 'entertainment',
      position: { x: 22, y: 0, z: 22 },
      rotation: -45,
      scale: 1.8,
      color: '#ec4899', // Pink
      icon: 'fa-landmark',
      style: 'arabic',
      floors: 2,
      description: 'مركز ثقافي يضم معارض فنية وفعاليات ثقافية',
      animated: false,
      hasInterior: true
    }
  ];
  
  // Small decorative structures
  const decorativeStructures = [
    { id: 'fountain', type: 'decoration', position: { x: 0, y: 0, z: -5 }, scale: 1 },
    { id: 'statue1', type: 'decoration', position: { x: -5, y: 0, z: -5 }, scale: 0.7 },
    { id: 'statue2', type: 'decoration', position: { x: 5, y: 0, z: -5 }, scale: 0.7 },
    { id: 'garden1', type: 'decoration', position: { x: -10, y: 0, z: 10 }, scale: 1.2 },
    { id: 'garden2', type: 'decoration', position: { x: 10, y: 0, z: 10 }, scale: 1.2 },
  ];
  
  // شخصيات افتراضية لتحسين تجربة المستخدم وإضافة حياة إلى المدينة
  const characters = [
    { 
      id: 'shopkeeper1', 
      name: 'تاجر الملابس', 
      position: { x: 18, y: 0, z: -3 }, 
      type: 'npc',
      model: 'shopkeeper',
      dialogue: ['مرحباً بك في متجرنا!', 'لدينا أحدث صيحات الموضة', 'هل تريد تجربة قطعة ملابس؟'],
      animation: 'idle'
    },
    { 
      id: 'tourGuide1', 
      name: 'مرشد سياحي', 
      position: { x: -18, y: 0, z: -3 }, 
      type: 'npc',
      model: 'guide',
      dialogue: ['مرحباً بك في مدينة أمريكي!', 'هل تحتاج إلى مساعدة؟', 'يمكنني إرشادك إلى أهم المعالم'],
      animation: 'wave'
    },
    { 
      id: 'techSupport1', 
      name: 'مساعد تقني', 
      position: { x: -8, y: 0, z: 18 }, 
      type: 'npc',
      model: 'techie',
      dialogue: ['مرحباً، هل تبحث عن أي منتج تقني؟', 'لدينا أحدث الإصدارات من الأجهزة الذكية'],
      animation: 'typing'
    },
    { 
      id: 'chef1', 
      name: 'طاهي', 
      position: { x: 13, y: 0, z: 13 }, 
      type: 'npc',
      model: 'chef',
      dialogue: ['أهلاً بك في منطقة المطاعم!', 'جرب أطباقنا الشهية', 'نقدم أشهى المأكولات العالمية والمحلية'],
      animation: 'cooking'
    },
    { 
      id: 'securityGuard1', 
      name: 'حارس أمن', 
      position: { x: 8, y: 0, z: -10 }, 
      type: 'npc',
      model: 'guard',
      dialogue: ['مرحباً، كيف يمكنني مساعدتك؟', 'نحن هنا لضمان تجربة آمنة وممتعة'],
      animation: 'patrol',
      patrolPath: [
        { x: 8, y: 0, z: -10 },
        { x: 12, y: 0, z: -10 },
        { x: 12, y: 0, z: -5 },
        { x: 8, y: 0, z: -5 }
      ]
    },
    { 
      id: 'shopper1', 
      name: 'متسوق', 
      position: { x: 5, y: 0, z: 5 }, 
      type: 'npc',
      model: 'shopper',
      dialogue: ['مرحباً!', 'المتاجر هنا رائعة', 'أنا أحب التسوق في مدينة أمريكي'],
      animation: 'walking',
      patrolPath: [
        { x: 5, y: 0, z: 5 },
        { x: 15, y: 0, z: 5 },
        { x: 15, y: 0, z: 10 },
        { x: 5, y: 0, z: 10 }
      ]
    },
    { 
      id: 'shopper2', 
      name: 'متسوق', 
      position: { x: -5, y: 0, z: 5 }, 
      type: 'npc',
      model: 'shopper_female',
      dialogue: ['مرحباً!', 'يمكن العثور على أفضل المنتجات هنا'],
      animation: 'walking',
      patrolPath: [
        { x: -5, y: 0, z: 5 },
        { x: -15, y: 0, z: 5 },
        { x: -15, y: 0, z: 10 },
        { x: -5, y: 0, z: 10 }
      ]
    }
  ];
  
  // Setup audio context and sound effects
  useEffect(() => {
    // Create audio context
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }
    
    // Initialize ambient sounds
    const sounds = [
      { id: 'ambient-city', url: '/sounds/city-ambience.mp3', loop: true },
      { id: 'ambient-market', url: '/sounds/market-ambience.mp3', loop: true },
      { id: 'footsteps', url: '/sounds/footsteps.mp3', loop: true },
      { id: 'door-open', url: '/sounds/door-open.mp3', loop: false },
      { id: 'notification', url: '/sounds/notification.mp3', loop: false },
    ];
    
    // Function to preload sounds
    const preloadSounds = () => {
      sounds.forEach(sound => {
        try {
          // Create audio element but don't play it yet
          const audio = new Audio();
          audio.src = sound.url;
          audio.loop = sound.loop;
          audio.volume = environment.soundVolume;
          audio.preload = 'auto';
          
          // Store reference to audio element
          soundSourcesRef.current.set(sound.id, audio);
        } catch (error) {
          console.log(`Error preloading sound ${sound.id}:`, error);
        }
      });
    };
    
    // Try to preload sounds
    try {
      preloadSounds();
    } catch (error) {
      console.log("Error setting up audio:", error);
    }
    
    // Cleanup function
    return () => {
      // Stop all sounds
      soundSourcesRef.current.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      
      // Clear sound sources
      soundSourcesRef.current.clear();
      
      // Close audio context if exists
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.log("Error closing audio context:", e));
      }
    };
  }, []);
  
  // Effect to play ambient sound based on environment setting
  useEffect(() => {
    // Function to play ambient sound
    const playAmbientSound = () => {
      // Get current ambient sound setting
      const { ambientSound, soundVolume } = environment;
      
      // Stop all ambient sounds first
      soundSourcesRef.current.forEach((audio, id) => {
        if (id.startsWith('ambient-')) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      
      // If sound is disabled, don't play anything
      if (ambientSound === 'none') return;
      
      // Get the requested ambient sound
      const ambientAudio = soundSourcesRef.current.get(`ambient-${ambientSound}`);
      
      // Play the sound if it exists
      if (ambientAudio) {
        ambientAudio.volume = soundVolume;
        ambientAudio.play().catch(e => console.log("Error playing ambient sound:", e));
      }
    };
    
    // Try to play ambient sound
    try {
      playAmbientSound();
    } catch (error) {
      console.log("Error playing ambient sound:", error);
    }
    
  }, [environment.ambientSound, environment.soundVolume]);
  
  // Effect to play footstep sounds when moving
  useEffect(() => {
    const footstepsAudio = soundSourcesRef.current.get('footsteps');
    
    if (footstepsAudio) {
      if (isMoving) {
        footstepsAudio.volume = environment.soundVolume * 0.7; // Slightly lower volume for footsteps
        footstepsAudio.play().catch(e => console.log("Error playing footsteps:", e));
      } else {
        footstepsAudio.pause();
      }
    }
    
    return () => {
      if (footstepsAudio) {
        footstepsAudio.pause();
      }
    };
  }, [isMoving, environment.soundVolume]);
  
  // Register buildings as collision objects
  useEffect(() => {
    // We need to create a stable reference to the buildings functions
    const setupCollisions = () => {
      // Add all buildings as collision objects
      buildings.forEach(building => {
        addCollisionObject({
          id: building.id,
          position: building.position,
          size: { 
            width: 5 * building.scale, 
            height: 10 * (building.floors || 1), 
            depth: 5 * building.scale 
          },
          type: building.hasInterior ? 'trigger' : 'object',
          onCollision: building.hasInterior ? () => handleBuildingApproach(building.id) : undefined,
        });
      });
      
      // Add decorative structures as smaller collision objects
      decorativeStructures.forEach(structure => {
        addCollisionObject({
          id: structure.id,
          position: structure.position,
          size: { width: 2 * structure.scale, height: 3 * structure.scale, depth: 2 * structure.scale },
          type: 'object',
        });
      });
      
      // Add city boundaries
      const cityRadius = 40;
      const boundaryHeight = 10;
      
      // Add invisible boundary wall in a circle
      for (let angle = 0; angle < 360; angle += 10) {
        const radians = angle * (Math.PI / 180);
        const x = Math.cos(radians) * cityRadius;
        const z = Math.sin(radians) * cityRadius;
        
        addCollisionObject({
          id: `boundary-${angle}`,
          position: { x, y: boundaryHeight / 2, z },
          size: { width: 5, height: boundaryHeight, depth: 5 },
          type: 'object',
        });
      }
    };
    
    // Set up all collisions
    setupCollisions();
    
    // Cleanup function to remove collisions when unmounted
    return () => {
      buildings.forEach(building => {
        removeCollisionObject(building.id);
      });
      
      decorativeStructures.forEach(structure => {
        removeCollisionObject(structure.id);
      });
      
      // Remove boundary collisions
      for (let angle = 0; angle < 360; angle += 10) {
        removeCollisionObject(`boundary-${angle}`);
      }
    };
  }, [addCollisionObject, removeCollisionObject]);
  
  // Function to handle approaching a building with interior
  const handleBuildingApproach = (buildingId: string) => {
    // Play door sound
    try {
      const doorSound = soundSourcesRef.current.get('door-open');
      if (doorSound) {
        doorSound.volume = environment.soundVolume;
        doorSound.currentTime = 0; // Reset to start
        doorSound.play().catch(e => console.log("Error playing door sound:", e));
      }
    } catch (error) {
      console.log("Error playing door sound:", error);
    }
    
    // Show notification
    const building = buildings.find(b => b.id === buildingId);
    if (building) {
      toast({
        title: `${building.name}`,
        description: "اضغط E للدخول إلى المبنى",
        duration: 3000,
      });
    }
    
    // Set active building
    setActiveBuilding(buildingId);
  };
  
  // Function to enter a building
  const enterBuilding = () => {
    if (activeBuilding) {
      setIsInteriorView(true);
      // You could add more effects or state changes here
    }
  };
  
  // Function to exit a building
  const exitBuilding = () => {
    setIsInteriorView(false);
    setActiveBuilding(null);
  };
  
  // Handle keyboard input for entering buildings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && activeBuilding && !isInteriorView) {
        enterBuilding();
      } else if (e.key.toLowerCase() === 'escape' && isInteriorView) {
        exitBuilding();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeBuilding, isInteriorView]);
  
  // Function to render characters (NPCs)
  const renderCharacters = () => {
    return characters.map((character) => {
      // Calculate position relative to player
      const relX = character.position.x - position.x;
      const relZ = character.position.z - position.z;
      
      // Calculate distance to determine visibility and scale
      const distance = Math.sqrt(relX * relX + relZ * relZ);
      
      // Skip rendering if too far away
      if (distance > 40) return null;
      
      // Apply rotation based on player's view direction
      const angle = rotation.y * (Math.PI / 180);
      const rotatedX = relX * Math.cos(angle) - relZ * Math.sin(angle);
      const rotatedZ = relX * Math.sin(angle) + relZ * Math.cos(angle);
      
      // Convert to screen position (percentage)
      const screenX = 50 + (rotatedX * 2.5);
      const screenY = 50 + (rotatedZ * 2.5);
      
      // Skip if outside field of view
      if (screenX < -20 || screenX > 120 || screenY < -20 || screenY > 120) return null;
      
      // Calculate size and opacity based on distance
      const size = Math.max(3, 20 - (distance * 0.4));
      const opacity = Math.min(1, 1 - (distance / 40));
      
      // Determine whether character is in front or behind player
      const inFront = rotatedZ >= 0;
      if (!inFront) return null; // Skip rendering characters behind player
      
      // Calculate z-index based on distance
      const zIndex = Math.floor(1000 - distance);
      
      // Character style
      const getCharacterStyle = () => {
        let style: React.CSSProperties = {
          position: 'absolute',
          left: `${screenX}%`,
          top: `${screenY}%`,
          width: `${size}vw`,
          height: `${size * 2}vw`, // Characters are taller than wide
          transform: 'translate(-50%, -100%)',
          zIndex,
          opacity,
          cursor: 'pointer',
          transition: 'all 0.2s ease-out',
        };
        
        return style;
      };
      
      // Get character avatar based on model type
      const getCharacterAvatar = () => {
        switch (character.model) {
          case 'shopkeeper':
            return '👨‍💼';
          case 'guide':
            return '👨‍✈️';
          case 'techie':
            return '👨‍💻';
          case 'chef':
            return '👨‍🍳';
          case 'guard':
            return '💂‍♂️';
          case 'shopper':
            return '🧔';
          case 'shopper_female':
            return '👩';
          default:
            return '👤';
        }
      };
      
      // Get animation for this character
      const getCharacterAnimation = () => {
        switch (character.animation) {
          case 'wave':
            return {
              rotate: [0, 5, 0, -5, 0],
              y: [0, -3, 0],
              transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
            };
          case 'patrol':
            return {
              x: [0, 10, 0, -10, 0],
              transition: { repeat: Infinity, duration: 10, ease: "linear" }
            };
          case 'typing':
            return {
              y: [0, -1, 0, -1, 0],
              transition: { repeat: Infinity, duration: 1, ease: "linear" }
            };
          case 'cooking':
            return {
              rotate: [0, 10, 0, 10, 0],
              transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            };
          case 'walking':
            return {
              x: [0, 5, 0, -5, 0],
              transition: { repeat: Infinity, duration: 5, ease: "linear" }
            };
          case 'idle':
          default:
            return {
              y: [0, -2, 0],
              transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
            };
        }
      };
      
      // Handle character click to show dialogue
      const handleCharacterClick = () => {
        if (character.dialogue && character.dialogue.length > 0) {
          const randomDialogue = character.dialogue[Math.floor(Math.random() * character.dialogue.length)];
          toast({
            title: character.name,
            description: randomDialogue,
            duration: 3000,
          });
        }
      };
      
      return (
        <motion.div
          key={character.id}
          style={getCharacterStyle()}
          animate={getCharacterAnimation()}
          onClick={handleCharacterClick}
          whileHover={{ scale: 1.1 }}
        >
          <div style={{ 
            fontSize: `${size * 1.5}vw`, 
            textAlign: 'center',
            textShadow: '0 0 5px rgba(0,0,0,0.5)'
          }}>
            {getCharacterAvatar()}
          </div>
          <div style={{
            fontSize: `${Math.max(0.8, size * 0.3)}vw`,
            textAlign: 'center',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            padding: '2px 5px',
            borderRadius: '4px',
            marginTop: '5px',
            whiteSpace: 'nowrap'
          }}>
            {character.name}
          </div>
        </motion.div>
      );
    });
  };
  
  // Get environment visual styles based on time of day and weather
  const getEnvironmentStyles = () => {
    // Base styles
    let styles: React.CSSProperties = {
      transition: 'all 1s ease-out',
    };
    
    // Time of day styles
    switch (environment.timeOfDay) {
      case 'dawn':
        styles = {
          ...styles,
          background: 'linear-gradient(to bottom, #ff7e5f, #feb47b)',
          filter: 'brightness(0.9) contrast(1.1) saturate(1.2)',
        };
        break;
      case 'day':
        styles = {
          ...styles,
          background: 'linear-gradient(to bottom, #56ccf2, #2f80ed)',
          filter: 'brightness(1.1) contrast(1) saturate(1)',
        };
        break;
      case 'dusk':
        styles = {
          ...styles,
          background: 'linear-gradient(to bottom, #fc466b, #3f5efb)',
          filter: 'brightness(0.8) contrast(1.2) saturate(1.1)',
        };
        break;
      case 'night':
        styles = {
          ...styles,
          background: 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)',
          filter: 'brightness(0.6) contrast(1.3) saturate(0.8)',
        };
        break;
    }
    
    // Weather condition styles
    switch (environment.weatherCondition) {
      case 'cloudy':
        styles = {
          ...styles,
          filter: `${styles.filter} brightness(0.9) contrast(0.95)`,
        };
        break;
      case 'rainy':
        styles = {
          ...styles,
          filter: `${styles.filter} brightness(0.7) contrast(1.1) saturate(0.9)`,
        };
        break;
      case 'sandstorm':
        styles = {
          ...styles,
          filter: `${styles.filter} sepia(0.3) brightness(0.85) contrast(1.1)`,
        };
        break;
    }
    
    return styles;
  };
  
  // Function to render buildings with 3D effect
  const renderBuildings = () => {
    return buildings.map((building) => {
      // Calculate position relative to player
      const relX = building.position.x - position.x;
      const relZ = building.position.z - position.z;
      
      // Calculate distance to determine visibility and scale
      const distance = Math.sqrt(relX * relX + relZ * relZ);
      
      // Skip rendering if too far away
      if (distance > 60) return null;
      
      // Apply rotation based on player's view direction
      const angle = rotation.y * (Math.PI / 180);
      const rotatedX = relX * Math.cos(angle) - relZ * Math.sin(angle);
      const rotatedZ = relX * Math.sin(angle) + relZ * Math.cos(angle);
      
      // Convert to screen position (percentage)
      const screenX = 50 + (rotatedX * 2);
      const screenY = 50 + (rotatedZ * 2);
      
      // Skip if outside field of view
      if (screenX < -20 || screenX > 120 || screenY < -20 || screenY > 120) return null;
      
      // Calculate size and opacity based on distance
      const size = Math.max(5, 40 - (distance * 0.5));
      const opacity = Math.min(1, 1 - (distance / 60));
      
      // Determine whether building is in front or behind player
      const inFront = rotatedZ >= 0;
      if (!inFront) return null; // Skip rendering buildings behind player
      
      // Calculate z-index based on distance
      const zIndex = Math.floor(1000 - distance);
      
      // Building style based on type and time of day
      const getBuildingStyle = () => {
        let style: React.CSSProperties = {
          position: 'absolute',
          left: `${screenX}%`,
          top: `${screenY}%`,
          width: `${size}vw`,
          height: `${size * (building.floors || 1) * 0.8}vw`,
          transform: `translate(-50%, -100%) rotateY(${building.rotation}deg) scale(${building.scale})`,
          zIndex,
          opacity,
          transformStyle: 'preserve-3d',
          transition: 'all 0.3s ease-out',
        };
        
        // Apply shader effect based on environment setting
        if (environment.shader !== 'standard') {
          style = {
            ...style,
            boxShadow: environment.timeOfDay === 'night' 
              ? `0 0 20px ${building.color}50, 0 0 40px rgba(0,0,0,0.5)` 
              : `0 10px 30px rgba(0,0,0,0.2)`,
          };
        }
        
        return style;
      };
      
      // Dynamic hover animation based on building type
      const getHoverAnimation = () => {
        switch (building.type) {
          case 'travel':
            return { scale: building.scale * 1.05, y: -5 };
          case 'electronics':
            return { scale: building.scale * 1.05, rotate: building.rotation + 5 };
          case 'entertainment':
            return { scale: building.scale * 1.05, filter: 'brightness(1.3)' };
          default:
            return { scale: building.scale * 1.05 };
        }
      };
      
      return (
        <motion.div
          key={building.id}
          style={getBuildingStyle()}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: building.scale || 1,
            opacity,
            y: building.animated && building.type === 'travel' ? [0, -5, 0] : 0,
          }}
          transition={
            building.animated 
              ? { 
                  y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                  scale: { duration: 0.7, ease: "easeOut" },
                  opacity: { duration: 0.5 }
                }
              : {
                  scale: { duration: 0.7, ease: "easeOut" },
                  opacity: { duration: 0.5 }
                }
          }
          whileHover={getHoverAnimation()}
          onClick={() => handleBuildingApproach(building.id)}
        >
          <ThreeBuildingModel 
            type="building"
            color={building.color}
            showControls={false}
            className="w-full h-full"
          />
          
          {/* Building label */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {building.name}
          </div>
        </motion.div>
      );
    });
  };
  
  // Function to render weather effects
  const renderWeatherEffects = () => {
    switch (environment.weatherCondition) {
      case 'rainy':
        return (
          <div className="absolute inset-0 pointer-events-none z-10">
            {Array.from({ length: 100 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-0.5 bg-blue-200 opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  height: `${Math.random() * 20 + 10}px`,
                  animationDuration: `${Math.random() * 1 + 0.5}s`,
                  animation: 'falling-rain linear infinite',
                }}
              ></div>
            ))}
          </div>
        );
      case 'sandstorm':
        return (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 bg-yellow-700/30 animate-pulse"></div>
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-yellow-200 opacity-40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 5 + 1}px`,
                  height: `${Math.random() * 5 + 1}px`,
                  animation: `floating-dust ${Math.random() * 10 + 5}s linear infinite`,
                }}
              ></div>
            ))}
          </div>
        );
      case 'cloudy':
        return (
          <div className="absolute inset-0 pointer-events-none z-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white opacity-70 rounded-full blur-xl"
                style={{
                  left: `${Math.random() * 120 - 10}%`,
                  top: `${Math.random() * 40}%`,
                  width: `${Math.random() * 30 + 10}%`,
                  height: `${Math.random() * 20 + 10}%`,
                  animation: `floating-cloud ${Math.random() * 100 + 100}s linear infinite`,
                }}
              ></div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };
  
  // Render special lighting effects
  const renderLightingEffects = () => {
    if (environment.timeOfDay === 'night') {
      return (
        <>
          {/* Street lights */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { x: -15, z: -10 }, { x: -5, z: -10 }, { x: 5, z: -10 }, { x: 15, z: -10 },
              { x: -15, z: 0 }, { x: 15, z: 0 },
              { x: -15, z: 10 }, { x: -5, z: 10 }, { x: 5, z: 10 }, { x: 15, z: 10 },
            ].map((pos, i) => {
              // Calculate relative position
              const relX = pos.x - position.x;
              const relZ = pos.z - position.z;
              
              // Apply rotation based on player's view
              const angle = rotation.y * (Math.PI / 180);
              const rotatedX = relX * Math.cos(angle) - relZ * Math.sin(angle);
              const rotatedZ = relX * Math.sin(angle) + relZ * Math.cos(angle);
              
              // Convert to screen position
              const screenX = 50 + (rotatedX * 2);
              const screenY = 50 + (rotatedZ * 2);
              
              // Skip if outside view
              if (screenX < -10 || screenX > 110 || screenY < -10 || screenY > 110) return null;
              
              // Determine if in front of player
              const inFront = rotatedZ >= 0;
              if (!inFront) return null;
              
              // Calculate distance for size
              const distance = Math.sqrt(relX * relX + relZ * relZ);
              const size = Math.max(2, 8 - (distance * 0.1));
              
              return (
                <div 
                  key={`light-${i}`}
                  className="absolute w-2 h-20 flex flex-col items-center"
                  style={{
                    left: `${screenX}%`,
                    top: `${screenY}%`,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 500 - Math.floor(distance),
                  }}
                >
                  <div className="w-0.5 h-16 bg-gray-700"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-200 animate-pulse-slow">
                    <div 
                      className="absolute w-16 h-16 rounded-full bg-yellow-100 filter blur-xl opacity-60"
                      style={{ width: `${size * 8}vw`, height: `${size * 8}vw` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Building lights */}
          <div className="absolute inset-0 pointer-events-none">
            {buildings.map((building) => {
              // Skip if building wouldn't have lights
              if (building.type === 'other') return null;
              
              // Calculate relative position
              const relX = building.position.x - position.x;
              const relZ = building.position.z - position.z;
              
              // Apply rotation
              const angle = rotation.y * (Math.PI / 180);
              const rotatedX = relX * Math.cos(angle) - relZ * Math.sin(angle);
              const rotatedZ = relX * Math.sin(angle) + relZ * Math.cos(angle);
              
              // Screen position
              const screenX = 50 + (rotatedX * 2);
              const screenY = 50 + (rotatedZ * 2);
              
              // Skip if outside view or behind player
              if (screenX < -20 || screenX > 120 || screenY < -20 || screenY > 120 || rotatedZ < 0) return null;
              
              // Calculate distance for glow intensity
              const distance = Math.sqrt(relX * relX + relZ * relZ);
              const glowSize = Math.max(5, 30 - (distance * 0.5)) * building.scale;
              const glowOpacity = Math.min(0.6, 0.8 - (distance / 50));
              
              // Window lights randomly blinking
              return (
                <div 
                  key={`glow-${building.id}`} 
                  className="absolute"
                  style={{
                    left: `${screenX}%`,
                    top: `${screenY}%`,
                    width: `${glowSize}vw`,
                    height: `${glowSize * 0.8 * (building.floors || 1)}vw`,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 499 - Math.floor(distance),
                  }}
                >
                  <div 
                    className="w-full h-full rounded-xl filter blur-xl"
                    style={{ 
                      background: `radial-gradient(circle, ${building.color}50 0%, transparent 70%)`,
                      opacity: glowOpacity,
                      animation: 'pulse-gentle 4s infinite alternate',
                    }}
                  ></div>
                  
                  {/* Windows */}
                  {Array.from({ length: (building.floors || 1) * 6 }).map((_, i) => {
                    const row = Math.floor(i / 3);
                    const col = i % 3;
                    const isLit = Math.random() > 0.3; // 70% of windows are lit
                    
                    return (
                      <div 
                        key={`window-${building.id}-${i}`}
                        className={`absolute w-2 h-2 rounded-sm ${isLit ? 'bg-yellow-200' : 'bg-gray-800'}`}
                        style={{
                          left: `${20 + col * 30}%`,
                          top: `${20 + row * 20}%`,
                          opacity: isLit ? (Math.random() * 0.5 + 0.5) : 0.7,
                          animation: isLit && Math.random() > 0.8 ? 'blink-window 5s infinite' : 'none',
                          animationDelay: `${Math.random() * 5}s`,
                        }}
                      ></div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      );
    }
    return null;
  };
  
  // Render environment control panel
  const renderControlPanel = () => {
    if (!showSettings) return null;
    
    return (
      <div className="absolute top-4 right-4 z-30 w-64 bg-black/70 backdrop-blur-md rounded-lg p-4 text-white border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">إعدادات البيئة</h3>
          <button 
            onClick={() => setShowSettings(false)}
            className="text-white/70 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-white/80">الوقت</label>
            <Select
              value={environment.timeOfDay}
              onValueChange={(value) => setEnvironment({
                ...environment,
                timeOfDay: value as 'dawn' | 'day' | 'dusk' | 'night'
              })}
            >
              <SelectTrigger className="w-full h-8 text-sm bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="dawn">الفجر</SelectItem>
                <SelectItem value="day">النهار</SelectItem>
                <SelectItem value="dusk">الغروب</SelectItem>
                <SelectItem value="night">الليل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-white/80">الطقس</label>
            <Select
              value={environment.weatherCondition}
              onValueChange={(value) => setEnvironment({
                ...environment,
                weatherCondition: value as 'clear' | 'cloudy' | 'rainy' | 'sandstorm'
              })}
            >
              <SelectTrigger className="w-full h-8 text-sm bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="clear">صافي</SelectItem>
                <SelectItem value="cloudy">غائم</SelectItem>
                <SelectItem value="rainy">ممطر</SelectItem>
                <SelectItem value="sandstorm">عاصفة رملية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-white/80">الصوت</label>
            <Select
              value={environment.ambientSound}
              onValueChange={(value) => setEnvironment({
                ...environment,
                ambientSound: value as 'city' | 'market' | 'quiet' | 'nature' | 'none'
              })}
            >
              <SelectTrigger className="w-full h-8 text-sm bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="city">أصوات المدينة</SelectItem>
                <SelectItem value="market">أصوات السوق</SelectItem>
                <SelectItem value="quiet">هادئ</SelectItem>
                <SelectItem value="nature">أصوات طبيعية</SelectItem>
                <SelectItem value="none">بدون صوت</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm text-white/80">مستوى الصوت</label>
              <span className="text-xs text-white/60">{Math.round(environment.soundVolume * 100)}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={environment.soundVolume}
              onChange={(e) => setEnvironment({
                ...environment,
                soundVolume: parseFloat(e.target.value)
              })}
              className="w-full h-2 rounded-full bg-white/10 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-white/80">جودة العرض</label>
            <Select
              value={environment.renderQuality}
              onValueChange={(value) => setEnvironment({
                ...environment,
                renderQuality: value as 'low' | 'medium' | 'high',
                shadowsEnabled: value !== 'low',
                reflectionsEnabled: value === 'high',
                postProcessingEnabled: value === 'high'
              })}
            >
              <SelectTrigger className="w-full h-8 text-sm bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper for rendering minimap
  const renderMinimap = () => {
    if (!showMinimap) return null;
    
    const mapSize = 150;
    const playerDot = 8;
    const mapScaleFactor = mapSize / 100; // Map scaling factor
    
    return (
      <div className="absolute bottom-4 right-4 z-30 bg-black/50 backdrop-blur-md rounded-lg p-2 border border-white/20">
        <div 
          className="relative"
          style={{ width: `${mapSize}px`, height: `${mapSize}px` }}
        >
          {/* Map background */}
          <div className="absolute inset-0 bg-slate-800/80 rounded-lg"></div>
          
          {/* Buildings on minimap */}
          {buildings.map((building) => {
            const buildingX = (building.position.x + 50) * mapScaleFactor; // Centered at 0,0
            const buildingZ = (building.position.z + 50) * mapScaleFactor;
            const buildingSize = 6 * building.scale;
            
            return (
              <div
                key={`map-${building.id}`}
                className="absolute rounded-sm"
                style={{
                  left: `${buildingX}px`,
                  top: `${buildingZ}px`,
                  width: `${buildingSize}px`,
                  height: `${buildingSize}px`,
                  backgroundColor: building.color,
                  transform: 'translate(-50%, -50%)',
                }}
                title={building.name}
              ></div>
            );
          })}
          
          {/* Player position */}
          <div
            className="absolute rounded-full bg-blue-500"
            style={{
              left: `${(position.x + 50) * mapScaleFactor}px`, 
              top: `${(position.z + 50) * mapScaleFactor}px`,
              width: `${playerDot}px`,
              height: `${playerDot}px`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.2s, top 0.2s',
            }}
          >
            {/* Direction indicator */}
            <div 
              className="absolute bg-blue-300 h-3 w-1 -top-3 left-1/2 -translate-x-1/2 origin-bottom"
              style={{
                transform: `translateX(-50%) rotate(${-rotation.y}deg)`,
              }}
            ></div>
          </div>
          
          {/* Map toggle button */}
          <button
            className="absolute -top-1 -left-1 w-5 h-5 bg-white/20 rounded-full text-white/80 hover:bg-white/30 hover:text-white flex items-center justify-center text-xs"
            onClick={() => setShowMinimap(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    );
  };
  
  // Helper for rendering HUD (Heads-Up Display)
  const renderHUD = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Show settings button */}
        <div className="absolute top-4 left-4 z-30 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-black/40 border-white/30 text-white hover:bg-black/60 hover:text-white"
          >
            <i className="fas fa-cog mr-2"></i>
            الإعدادات
          </Button>
        </div>
        
        {/* Show map button (if minimap is hidden) */}
        {!showMinimap && (
          <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMinimap(true)}
              className="bg-black/40 border-white/30 text-white hover:bg-black/60 hover:text-white"
            >
              <i className="fas fa-map mr-2"></i>
              الخريطة
            </Button>
          </div>
        )}
        
        {/* Touch controls for mobile */}
        {isMobile && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
            <TouchControls 
              onMove={direction => {
                switch (direction) {
                  case 'forward': moveForward(); break;
                  case 'backward': moveBackward(); break;
                  case 'left': moveLeft(); break;
                  case 'right': moveRight(); break;
                }
              }}
              onLook={(deltaX, deltaY) => rotate(deltaX, deltaY)}
              showControls={true}
            />
          </div>
        )}
        
        {/* Building interaction prompt */}
        {activeBuilding && !isInteriorView && (
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-center">
              <p>اضغط على زر E للدخول</p>
              <Button
                variant="outline"
                size="sm"
                onClick={enterBuilding}
                className="mt-2 bg-white/10 border-white/30 hover:bg-white/20"
              >
                <i className="fas fa-door-open mr-2"></i>
                دخول
              </Button>
            </div>
          </div>
        )}
        
        {/* Building information when looking at a building */}
        {activeBuilding && !isInteriorView && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-center max-w-md">
              {(() => {
                const building = buildings.find(b => b.id === activeBuilding);
                if (!building) return null;
                
                return (
                  <>
                    <h3 className="text-lg font-bold mb-1">{building.name}</h3>
                    {building.description && (
                      <p className="text-sm text-white/80">{building.description}</p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Main render method
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={getEnvironmentStyles()}
    >
      {/* Sky and ground */}
      <div className="absolute inset-0 z-0">
        {/* Ground with texture */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: '80px 80px',
            transform: 'rotateX(90deg) translateZ(-50px)',
            transformOrigin: 'center center',
            perspective: '1000px',
            perspectiveOrigin: 'center center',
          }}
        >
          {/* Ground plane */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-900/50"></div>
        </div>
      </div>
      
      {/* Weather and lighting effects */}
      {renderWeatherEffects()}
      {renderLightingEffects()}
      
      {/* Main city scene */}
      <div className="relative w-full h-full perspective-1000">
        {isInteriorView ? (
          // Building interior view when inside a building
          <AnimatePresence>
            <motion.div
              key="interior"
              className="absolute inset-0 z-20 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {(() => {
                const building = buildings.find(b => b.id === activeBuilding);
                
                return (
                  <div className="relative h-full">
                    {/* Exit button */}
                    <button
                      className="absolute top-4 right-4 z-50 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70"
                      onClick={exitBuilding}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    
                    {/* Building interior content */}
                    {building?.interiorComponent || (
                      <div className="flex items-center justify-center h-full bg-gray-100 text-center p-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-4">{building?.name}</h2>
                          <p className="text-gray-500 mb-6">{building?.description}</p>
                          <p>محتوى المبنى قيد التطوير</p>
                          <Button
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={exitBuilding}
                          >
                            العودة إلى المدينة
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        ) : (
          // Exterior city view
          <>
            {/* 3D buildings */}
            <div className="absolute inset-0">
              {renderBuildings()}
            </div>
          </>
        )}
      </div>
      
      {/* HUD elements (always visible) */}
      {renderHUD()}
      
      {/* Control panel (togglable) */}
      {renderControlPanel()}
      
      {/* Minimap */}
      {renderMinimap()}
      
      {/* Custom CSS animations */}
      <style>{`
        @keyframes falling-rain {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        
        @keyframes floating-dust {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(100px, 50px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        @keyframes floating-cloud {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        
        @keyframes pulse-gentle {
          0% {
            opacity: 0.5;
          }
          100% {
            opacity: 0.8;
          }
        }
        
        @keyframes blink-window {
          0%, 92%, 100% {
            opacity: 0.8;
          }
          95% {
            opacity: 0.2;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes animate-border-tl {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(100%, 0);
          }
          50% {
            transform: translate(100%, 100%);
          }
          75% {
            transform: translate(0, 100%);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        @keyframes animate-border-tr {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(0, 100%);
          }
          50% {
            transform: translate(-100%, 100%);
          }
          75% {
            transform: translate(-100%, 0);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        @keyframes animate-border-bl {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(0, -100%);
          }
          50% {
            transform: translate(100%, -100%);
          }
          75% {
            transform: translate(100%, 0);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        
        @keyframes animate-border-br {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-100%, 0);
          }
          50% {
            transform: translate(-100%, -100%);
          }
          75% {
            transform: translate(0, -100%);
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
}