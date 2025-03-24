import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Heart, Star, AlertCircle, Bell, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

/**
 * نظام المايكرو-تفاعلات المبهجة
 * 
 * يضيف تفاعلات صغيرة ولكن مبهجة أثناء تجول المستخدم في المدينة للمساعدة في:
 * 1. تعزيز تجربة المستخدم الإيجابية
 * 2. توجيه انتباه المستخدم إلى العناصر المهمة
 * 3. إعطاء ردود فعل فورية للتفاعلات
 * 4. خلق شعور بالمتعة والإنجاز
 */

interface MicroInteractionsProps {
  playerPosition?: { x: number; y: number; z: number };
  enableEffects?: boolean;
  effectDensity?: 'low' | 'medium' | 'high';
  effectStyle?: 'minimal' | 'colorful' | 'playful';
  onInteraction?: (type: string, details: any) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
}

interface HotspotConfig {
  id: string;
  position: { x: number; y: number; z: number };
  triggerDistance: number;
  effect: 'sparkle' | 'pulse' | 'bounce' | 'celebrate' | 'highlight';
  message?: string;
  action?: () => void;
  collectible?: boolean;
  collected?: boolean;
  particles?: number;
  color?: string;
  sound?: string;
  achievementId?: string;
}

export default function MicroInteractions({
  playerPosition = { x: 0, y: 0, z: 0 },
  enableEffects = true,
  effectDensity = 'medium',
  effectStyle = 'colorful',
  onInteraction,
  onAchievementUnlocked
}: MicroInteractionsProps) {
  const { toast } = useToast();
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  const [activeEffects, setActiveEffects] = useState<{ id: string; x: number; y: number; type: string; duration: number }[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentDiscoveries, setRecentDiscoveries] = useState<string[]>([]);
  const [hintVisible, setHintVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState({ text: '', icon: <Sparkles /> });
  
  // مناطق المؤثرات في المدينة
  const [hotspots] = useState<HotspotConfig[]>([
    {
      id: 'mall-entrance',
      position: { x: 5, y: 0, z: 10 },
      triggerDistance: 3,
      effect: 'sparkle',
      message: 'اكتشفت المول الرئيسي!',
      particles: 10,
      color: '#f59e0b',
      achievementId: 'mall-explorer'
    },
    {
      id: 'tech-store',
      position: { x: -8, y: 0, z: 15 },
      triggerDistance: 2.5,
      effect: 'pulse',
      message: 'وجدت متجر التقنية!',
      collectible: true,
      color: '#3b82f6'
    },
    {
      id: 'fashion-district',
      position: { x: 12, y: 0, z: -5 },
      triggerDistance: 4,
      effect: 'celebrate',
      message: 'اكتشفت منطقة الأزياء!',
      particles: 20,
      color: '#ec4899'
    },
    {
      id: 'bank-building',
      position: { x: -2, y: 0, z: -12 },
      triggerDistance: 3,
      effect: 'highlight',
      message: 'وصلت إلى البنك!',
      color: '#10b981'
    },
    {
      id: 'food-court',
      position: { x: 7, y: 0, z: -8 },
      triggerDistance: 2.5,
      effect: 'bounce',
      message: 'اكتشفت منطقة المطاعم!',
      collectible: true,
      color: '#f97316'
    },
    // ... المزيد من المناطق يمكن إضافتها حسب توسع المدينة
  ]);
  
  // قائمة الإنجازات المتاحة
  const [achievements] = useState<Achievement[]>([
    {
      id: 'mall-explorer',
      title: 'مستكشف المول',
      description: 'قمت بزيارة المول الرئيسي لأول مرة',
      icon: <Star className="h-4 w-4 text-amber-400" />,
      points: 10
    },
    {
      id: 'collector',
      title: 'جامع الكنوز',
      description: 'جمعت 3 عناصر قابلة للتحصيل',
      icon: <Award className="h-4 w-4 text-purple-400" />,
      points: 25
    },
    {
      id: 'explorer',
      title: 'مستكشف المدينة',
      description: 'زرت 5 مناطق مختلفة في المدينة',
      icon: <Zap className="h-4 w-4 text-blue-400" />,
      points: 50
    },
    // ... المزيد من الإنجازات يمكن إضافتها
  ]);
  
  // فحص المسافة بين اللاعب ونقاط التأثير
  useEffect(() => {
    if (!enableEffects) return;
    
    const now = Date.now();
    // الحد من تكرار تنفيذ التأثيرات (throttling)
    if (now - lastTriggerTime < 500) return;
    
    hotspots.forEach(hotspot => {
      if (collectedItems.includes(hotspot.id) && hotspot.collectible) return;
      
      const dist = calculateDistance(playerPosition, hotspot.position);
      
      if (dist <= hotspot.triggerDistance) {
        // إظهار تأثير فقط إذا لم يكن نشطًا بالفعل
        if (!activeEffects.some(effect => effect.id === hotspot.id)) {
          triggerEffect(hotspot);
          setLastTriggerTime(now);
          
          // تحديث قائمة الاكتشافات
          if (!recentDiscoveries.includes(hotspot.id)) {
            setRecentDiscoveries(prev => [...prev.slice(-4), hotspot.id]);
          }
          
          // إضافة العنصر إلى المجموعة إذا كان قابلاً للتحصيل
          if (hotspot.collectible && !collectedItems.includes(hotspot.id)) {
            setCollectedItems(prev => [...prev, hotspot.id]);
            
            // التحقق من إنجاز جمع العناصر
            if ([...collectedItems, hotspot.id].length >= 3) {
              unlockAchievement('collector');
            }
          }
          
          // التحقق من إنجاز استكشاف المدينة
          const uniqueVisits = new Set([...recentDiscoveries, hotspot.id]);
          if (uniqueVisits.size >= 5 && !unlockedAchievements.includes('explorer')) {
            unlockAchievement('explorer');
          }
          
          // فتح إنجاز محدد إذا كان مرتبطًا بهذه المنطقة
          if (hotspot.achievementId && !unlockedAchievements.includes(hotspot.achievementId)) {
            unlockAchievement(hotspot.achievementId);
          }
        }
      }
    });
  }, [playerPosition, enableEffects]);
  
  // تشغيل تأثير عند اكتشاف منطقة
  const triggerEffect = (hotspot: HotspotConfig) => {
    // إضافة تأثير جديد إلى القائمة
    const newEffect = {
      id: hotspot.id,
      x: Math.random() * 100, // موقع عشوائي على الشاشة للتأثير
      y: Math.random() * 80,
      type: hotspot.effect,
      duration: Math.random() * 1000 + 1000 // مدة عشوائية بين 1-2 ثانية
    };
    setActiveEffects(prev => [...prev, newEffect]);
    
    // إظهار رسالة
    if (hotspot.message) {
      toast({
        title: hotspot.message,
        description: hotspot.collectible ? "عنصر جديد أضيف إلى مجموعتك!" : "استمر في استكشاف المدينة!",
        variant: "default",
      });
    }
    
    // استدعاء الدالة المخصصة للتفاعل إن وجدت
    if (onInteraction) {
      onInteraction(hotspot.effect, { 
        id: hotspot.id, 
        position: hotspot.position,
        collectible: hotspot.collectible 
      });
    }
    
    // إظهار تأثير الاحتفال عند جمع عنصر
    if (hotspot.collectible) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    
    // إزالة التأثير بعد انتهاء مدته
    setTimeout(() => {
      setActiveEffects(prev => prev.filter(effect => effect.id !== hotspot.id));
    }, newEffect.duration);
  };
  
  // فتح إنجاز جديد
  const unlockAchievement = (achievementId: string) => {
    if (unlockedAchievements.includes(achievementId)) return;
    
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    setUnlockedAchievements(prev => [...prev, achievementId]);
    
    // إظهار إشعار الإنجاز
    toast({
      title: `إنجاز جديد: ${achievement.title}!`,
      description: `${achievement.description} (+${achievement.points} نقطة)`,
      variant: "default",
    });
    
    if (onAchievementUnlocked) {
      onAchievementUnlocked(achievement);
    }
    
    // إظهار تأثير احتفالي كبير
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };
  
  // إظهار تلميح عشوائي للمستخدم
  useEffect(() => {
    const hints = [
      { text: "جرب استكشاف منطقة المطاعم!", icon: <Bell className="h-4 w-4" /> },
      { text: "هناك عناصر مخفية يمكنك جمعها", icon: <Star className="h-4 w-4" /> },
      { text: "زيارة المتاجر المختلفة تفتح إنجازات", icon: <Award className="h-4 w-4" /> },
      { text: "انتقل بين مناطق المدينة المختلفة", icon: <Zap className="h-4 w-4" /> },
    ];
    
    // إظهار تلميح كل 60 ثانية
    const hintInterval = setInterval(() => {
      if (Math.random() > 0.5) { // 50% فرصة لإظهار تلميح
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        setCurrentHint(randomHint);
        setHintVisible(true);
        
        // إخفاء التلميح بعد 5 ثوان
        setTimeout(() => setHintVisible(false), 5000);
      }
    }, 60000);
    
    return () => clearInterval(hintInterval);
  }, []);
  
  // حساب المسافة بين نقطتين في الفضاء ثلاثي الأبعاد
  const calculateDistance = (pointA: {x: number, y: number, z: number}, pointB: {x: number, y: number, z: number}) => {
    return Math.sqrt(
      Math.pow(pointA.x - pointB.x, 2) +
      Math.pow(pointA.y - pointB.y, 2) +
      Math.pow(pointA.z - pointB.z, 2)
    );
  };
  
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* تأثيرات متنوعة في مواقع مختلفة من الشاشة */}
      <AnimatePresence>
        {activeEffects.map((effect, index) => (
          <motion.div
            key={`${effect.id}-${index}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="absolute"
            style={{ 
              left: `${effect.x}%`, 
              top: `${effect.y}%`,
              zIndex: 60
            }}
          >
            {effect.type === 'sparkle' && (
              <div className="text-yellow-400 animate-spin-slow">
                <Sparkles className="h-8 w-8" />
              </div>
            )}
            {effect.type === 'pulse' && (
              <div className="text-blue-400 animate-pulse-slow">
                <Zap className="h-8 w-8" />
              </div>
            )}
            {effect.type === 'bounce' && (
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: 3, duration: 0.5 }}
                className="text-orange-400"
              >
                <Bell className="h-8 w-8" />
              </motion.div>
            )}
            {effect.type === 'celebrate' && (
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 1 }}
                  className="text-pink-400"
                >
                  <Heart className="h-8 w-8" />
                </motion.div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      x: Math.sin(i * Math.PI * 2 / 5) * 30,
                      y: Math.cos(i * Math.PI * 2 / 5) * 30,
                    }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute top-0 left-0 h-2 w-2 rounded-full bg-pink-400"
                  />
                ))}
              </div>
            )}
            {effect.type === 'highlight' && (
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0 0px rgba(16, 185, 129, 0)', '0 0 0 15px rgba(16, 185, 129, 0.3)', '0 0 0 0px rgba(16, 185, 129, 0)']
                }}
                transition={{ repeat: 2, duration: 1 }}
                className="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-400 bg-opacity-30"
              >
                <AlertCircle className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* تأثير الاحتفال عند جمع عنصر أو فتح إنجاز */}
      {showConfetti && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -20,
                rotate: Math.random() * 360,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: window.innerHeight + 50,
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 2 + 2,
                ease: "easeOut"
              }}
              className="absolute h-3 w-3 rounded-full"
              style={{ 
                backgroundColor: [
                  '#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#8b5cf6', '#ef4444'
                ][Math.floor(Math.random() * 6)]
              }}
            />
          ))}
        </div>
      )}
      
      {/* تلميحات للمستخدم */}
      <AnimatePresence>
        {hintVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto"
          >
            <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/10">
              {currentHint.icon}
              <span>{currentHint.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* عرض آخر الاكتشافات */}
      <div className="fixed top-4 left-4 z-50">
        <AnimatePresence>
          {recentDiscoveries.slice(-3).map((id, index) => {
            const hotspot = hotspots.find(h => h.id === id);
            if (!hotspot) return null;
            
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="mb-2"
              >
                <Badge 
                  variant="outline" 
                  className="bg-black/50 backdrop-blur-sm border-white/10 text-white gap-1 items-center pl-1.5 pr-2 py-1"
                >
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: hotspot.color || '#3b82f6' }} />
                  <span className="text-xs">{hotspot.message?.replace(/اكتشفت |وجدت |وصلت إلى /g, '').replace('!', '')}</span>
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* زر لفتح قائمة الإنجازات */}
      {unlockedAchievements.length > 0 && (
        <div className="fixed bottom-20 right-4 pointer-events-auto">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-10 w-10 p-0 bg-black/50 backdrop-blur-sm border-white/10"
            onClick={() => {
              const count = unlockedAchievements.length;
              toast({
                title: `الإنجازات المفتوحة (${count})`,
                description: `لقد فتحت ${count} إنجازات من أصل ${achievements.length}. استمر في استكشاف المدينة!`,
                variant: "default",
              });
            }}
          >
            <Award className="h-5 w-5 text-amber-400" />
          </Button>
        </div>
      )}
    </div>
  );
}