import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import EnhancedCityBuilder from '@/components/enhanced-city-builder';
import MicroInteractions from '@/components/micro-interactions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useMovement } from '@/hooks/use-movement';

/**
 * مدينة أمريكي المتكاملة المطورة
 * 
 * صفحة تجربة المدينة الافتراضية المحسنة بتقنيات متقدمة
 * لتوفير تجربة غامرة على الأجهزة العادية دون الحاجة لمعدات VR
 */
export default function EnhancedCityPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [enableMicroInteractions, setEnableMicroInteractions] = useState(true);
  
  // استخدام hook الحركة لتتبع موقع اللاعب
  const { position } = useMovement({
    initialPosition: { x: 0, y: 1.7, z: 0 },
    speed: 0.15
  });
  
  useEffect(() => {
    // حقق من صحة التحميل
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    // تنظيف المؤقت عند فك المكون
    return () => clearTimeout(timer);
  }, []);
  
  const handleEnterCity = () => {
    setShowIntro(false);
    
    // رسالة ترحيبية للمستخدم
    toast({
      title: 'مرحباً بك في مدينة أمريكي',
      description: user 
        ? `مرحباً ${user.username}! استمتع بتجربة التسوق الفريدة.` 
        : 'استمتع بتجربة التسوق الافتراضية الفريدة.',
      duration: 5000,
    });
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">جاري تحميل مدينة أمريكي...</h1>
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-progress" 
               style={{ width: '100%', animationDuration: '2s' }}></div>
        </div>
      </div>
    );
  }
  
  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-purple-900 flex flex-col items-center justify-center text-white p-4">
        <Helmet>
          <title>مدينة أمريكي المتكاملة | تجربة تسوق افتراضية</title>
          <meta name="description" content="استمتع بتجربة تسوق افتراضية مميزة في مدينة أمريكي المتكاملة" />
        </Helmet>
        
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-down">مدينة أمريكي المتكاملة</h1>
          
          <div className="border border-white/20 bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">مرحباً بك في التجربة الافتراضية</h2>
            
            <p className="text-lg mb-4">
              تقدم لك مدينة أمريكي تجربة تسوق فريدة من نوعها في بيئة افتراضية غامرة.
              استكشف المدينة، تجول بين المباني المختلفة، وتفاعل مع المتاجر والخدمات المتنوعة.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-bold text-xl mb-2">🏙️ استكشاف المدينة</h3>
                <p>تجول في المدينة واستكشف المتاجر والمباني المختلفة</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-bold text-xl mb-2">🛍️ تسوق افتراضي</h3>
                <p>اختر من بين مجموعة متنوعة من المنتجات في متاجر مختلفة</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-bold text-xl mb-2">✨ تجربة محسّنة</h3>
                <p>استمتع بتأثيرات بصرية وصوتية تجعل التجربة أكثر واقعية</p>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">كيفية التحكم:</h3>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="bg-black/20 py-1 px-3 rounded-full">WASD أو الأسهم: التحرك</div>
              <div className="bg-black/20 py-1 px-3 rounded-full">الماوس: تدوير الكاميرا</div>
              <div className="bg-black/20 py-1 px-3 rounded-full">E: الدخول للمباني</div>
              <div className="bg-black/20 py-1 px-3 rounded-full">ESC: العودة للخارج</div>
            </div>
          </div>
          
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6 px-12 rounded-full font-bold animate-pulse-slow"
            onClick={handleEnterCity}
          >
            ادخل المدينة الآن
          </Button>
          
          <p className="mt-4 text-sm text-white/70">
            * لتجربة أفضل، يُنصح باستخدام متصفح حديث ومعدات ذات أداء جيد
          </p>
        </div>
      </div>
    );
  }
  
  // معالجة التفاعلات
  const handleMicroInteraction = (type: string, details: any) => {
    console.log(`Interaction: ${type}`, details);
    
    // زيادة نقاط المستخدم عند التفاعل
    if (details.collectible) {
      setUserPoints(prev => prev + 10);
      toast({
        title: `+10 نقاط`,
        description: "تم إضافة نقاط لاكتشافك مكان جديد!",
        variant: "default",
      });
    }
  };
  
  // معالجة فتح الإنجازات
  const handleAchievementUnlocked = (achievement: any) => {
    console.log(`Achievement unlocked: ${achievement.title}`);
    
    // زيادة نقاط المستخدم عند فتح إنجاز
    setUserPoints(prev => prev + achievement.points);
    
    // رسالة تهنئة
    toast({
      title: `إنجاز جديد! ${achievement.title}`,
      description: `${achievement.description} (+${achievement.points} نقطة)`,
      variant: "default",
    });
  };
  
  return (
    <div className="h-screen w-full overflow-hidden relative">
      <Helmet>
        <title>مدينة أمريكي | تجربة تسوق افتراضية</title>
        <meta name="description" content="استمتع بتجربة تسوق افتراضية مميزة في مدينة أمريكي" />
      </Helmet>
      
      {/* مكوّن المدينة المحسن */}
      <EnhancedCityBuilder />
      
      {/* نظام التفاعلات المبهجة */}
      {!showIntro && enableMicroInteractions && (
        <MicroInteractions 
          playerPosition={position}
          enableEffects={true}
          effectDensity="medium"
          effectStyle="colorful"
          onInteraction={handleMicroInteraction}
          onAchievementUnlocked={handleAchievementUnlocked}
        />
      )}
      
      {/* عرض النقاط المكتسبة */}
      {userPoints > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
          <div className="bg-yellow-500 h-2 w-2 rounded-full"></div>
          <span className="font-bold">{userPoints}</span>
          <span className="text-xs opacity-80">نقطة</span>
        </div>
      )}
      
      {/* زر العودة للصفحة الرئيسية */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          className="bg-black/50 text-white border-white/30 hover:bg-black/70"
          onClick={() => window.location.href = '/'}
        >
          العودة للصفحة الرئيسية
        </Button>
      </div>
      
      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-progress {
          animation: progress 2s linear forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </div>
  );
}