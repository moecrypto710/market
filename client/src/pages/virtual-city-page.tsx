import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useVR } from '@/hooks/use-vr';
import CityBuilder from '@/components/city-builder';
import BuildingShowcase from '@/components/building-showcase';
import TouchControls from '@/components/touch-controls';
import CarTraffic from '@/components/car-traffic';
import TrafficLight from '@/components/traffic-light';
import GateControl from '@/components/gate-control';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMovement } from '@/hooks/use-movement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

/**
 * Enhanced Virtual City Page
 * 
 * This page displays a 3D virtual city with interactive buildings
 * where users can explore and shop in different stores.
 * Includes enhanced visuals, controls, and setting options.
 */
export default function VirtualCityPage() {
  const { user } = useAuth();
  const { vrEnabled, toggleVR, walkSpeed, setWalkSpeed, toggleGestureControl } = useVR();
  const isMobile = useIsMobile();
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [showControls, setShowControls] = useState(isMobile);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activePOI, setActivePOI] = useState<string | null>(null);
  
  // Set up movement using our movement hook
  const movement = useMovement({
    initialPosition: { x: 0, y: 1, z: -10 },
    collisionsEnabled: true,
    returnToInitialOnCollision: true,
    speedFactor: walkSpeed
  });
  
  // Effects for fullscreen mode
  useEffect(() => {
    const toggleFullscreen = () => {
      if (!fullscreenMode) {
        try {
          const docEl = document.documentElement;
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(e => console.log("Fullscreen request failed"));
          }
        } catch (e) {
          console.log("Fullscreen not supported");
        }
      } else {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(e => console.log("Exit fullscreen failed"));
          }
        } catch (e) {
          console.log("Exit fullscreen not supported");
        }
      }
    };
    
    toggleFullscreen();
    
    return () => {
      // Exit fullscreen when component unmounts if needed
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(e => {});
      }
    };
  }, [fullscreenMode]);
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };
  
  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const landmarks = [
    { id: 'travel', name: 'وكالة السفر العربي', icon: 'plane', color: 'blue' },
    { id: 'clothing', name: 'متجر الملابس الفاخرة', icon: 'tshirt', color: 'amber' },
    { id: 'electronics', name: 'متجر الإلكترونيات والتقنية', icon: 'laptop', color: 'emerald' },
    { id: 'main-gate', name: 'البوابة الرئيسية', icon: 'archway', color: 'purple' },
    { id: 'mall', name: 'المجمع التجاري', icon: 'shopping-cart', color: 'pink' },
  ];
  
  return (
    <div className={`relative ${fullscreenMode ? 'h-screen w-screen overflow-hidden fixed inset-0 z-50 bg-slate-900' : ''}`}>
      {/* Floating controls in fullscreen mode */}
      {fullscreenMode && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/50"
            onClick={() => setFullscreenMode(false)}
          >
            <i className="fas fa-times mr-2"></i>
            خروج
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/50"
            onClick={() => setShowControls(!showControls)}
          >
            <i className={`fas fa-${showControls ? 'eye-slash' : 'eye'} mr-2`}></i>
            {showControls ? 'إخفاء التحكم' : 'إظهار التحكم'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/50"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <i className="fas fa-question-circle mr-2"></i>
            تعليمات
          </Button>
        </div>
      )}
      
      {/* Popup instruction modal */}
      {showInstructions && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowInstructions(false)}
        >
          <motion.div 
            className="bg-slate-800 p-6 rounded-xl max-w-md mx-auto border border-blue-500/30 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-white flex items-center">
              <i className="fas fa-info-circle text-blue-400 mr-2"></i>
              تعليمات التنقل
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                  <i className="fas fa-arrows-alt text-blue-400"></i>
                </div>
                <div className="text-slate-200 text-sm">مفاتيح الأسهم للتحرك</div>
              </div>
              
              <div className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                  <i className="fas fa-mouse text-blue-400"></i>
                </div>
                <div className="text-slate-200 text-sm">سحب الماوس للنظر</div>
              </div>
              
              <div className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                  <i className="fas fa-hand-pointer text-blue-400"></i>
                </div>
                <div className="text-slate-200 text-sm">النقر على المباني للدخول</div>
              </div>
              
              <div className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                  <i className="fas fa-mobile-alt text-blue-400"></i>
                </div>
                <div className="text-slate-200 text-sm">أزرار التحكم للجوال</div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setShowInstructions(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                فهمت
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {!fullscreenMode ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div 
            className="text-center mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">المدينة الافتراضية</h1>
            <p className="mt-2 text-slate-500 max-w-3xl mx-auto">
              استمتع بتجربة تسوق فريدة في مدينة افتراضية ثلاثية الأبعاد مع تقنيات الواقع الافتراضي المتطورة
            </p>
          </motion.div>
          
          {/* VR Mode controls */}
          <motion.div 
            className="mb-8 bg-gradient-to-r from-slate-900 to-indigo-900 p-6 rounded-xl border border-indigo-500/20 shadow-xl"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-right">
                <h2 className="text-2xl font-bold text-white mb-2">تجربة واقع افتراضي متكاملة</h2>
                <p className="text-slate-300 max-w-xl">استكشف المدينة بشكل كامل في وضع ملء الشاشة للحصول على تجربة غامرة تُحاكي وكأنك متواجد في المكان</p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={() => setFullscreenMode(true)} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-700/30"
                  size="lg"
                >
                  <i className="fas fa-vr-cardboard mr-2"></i>
                  دخول التجربة الكاملة
                </Button>
                
                <Button 
                  onClick={() => toggleVR()} 
                  variant="outline" 
                  className="border-indigo-400/30 text-indigo-100 hover:bg-indigo-500/20"
                >
                  <i className={`fas fa-toggle-${vrEnabled ? 'on' : 'off'} mr-2`}></i>
                  {vrEnabled ? 'تعطيل' : 'تفعيل'} وضع الواقع الافتراضي
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Main city preview */}
          <motion.div 
            className="mb-10"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">استكشف المدينة</h2>
              <div className="flex items-center">
                <span className="text-slate-500 ml-2 text-sm">سرعة التحرك</span>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={walkSpeed} 
                  onChange={(e) => setWalkSpeed(Number(e.target.value))}
                  className="w-24 accent-indigo-600"
                />
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-xl p-2 overflow-hidden shadow-xl border border-indigo-500/20">
              <CityBuilder />
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowInstructions(true)}
                className="border-indigo-400/30 text-indigo-900 hover:bg-indigo-500/20"
              >
                <i className="fas fa-info-circle mr-2"></i>
                تعليمات الاستخدام
              </Button>
              
              <Button 
                onClick={() => toggleGestureControl()}
                variant={vrEnabled ? "default" : "outline"}
                className={vrEnabled 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                  : "border-indigo-400/30 text-indigo-900 hover:bg-indigo-500/20"}
                disabled={!vrEnabled}
              >
                <i className="fas fa-hand-paper mr-2"></i>
                التحكم بالإيماءات {vrEnabled ? 'مفعل' : 'غير متاح'}
              </Button>
              
              <Button>
                <Link href="/">
                  <div className="flex items-center">
                    <i className="fas fa-home mr-2"></i>
                    العودة للرئيسية
                  </div>
                </Link>
              </Button>
            </div>
          </motion.div>
          
          {/* Landmarks section */}
          <motion.div 
            className="mb-10"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <h2 className="text-2xl font-bold mb-4">معالم المدينة</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {landmarks.map((landmark) => (
                <Card 
                  key={landmark.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg border border-${landmark.color}-500/20 hover:border-${landmark.color}-500/50`}
                  onClick={() => setActivePOI(landmark.id === activePOI ? null : landmark.id)}
                >
                  <CardHeader className="pb-2">
                    <div className={`w-10 h-10 rounded-full bg-${landmark.color}-500/20 flex items-center justify-center mb-2`}>
                      <i className={`fas fa-${landmark.icon} text-${landmark.color}-500`}></i>
                    </div>
                    <CardTitle className="text-base">{landmark.name}</CardTitle>
                  </CardHeader>
                  {activePOI === landmark.id && (
                    <CardContent className="pt-0">
                      <Separator className="my-2" />
                      <p className="text-xs text-slate-500">انقر للانتقال إلى هذه المنطقة في وضع الواقع الافتراضي</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>
          
          {/* Buildings Showcase with better header */}
          <motion.div 
            className="mb-10"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="mb-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-4 shadow-lg">
                <i className="fas fa-building text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">نماذج المباني ثلاثية الأبعاد</h2>
                <p className="text-slate-500">استعرض نماذج المباني المختلفة التي يمكنك التفاعل معها داخل المدينة</p>
              </div>
            </div>
            <BuildingShowcase />
          </motion.div>
          
          {/* City information with better styling */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <i className="fas fa-walking text-blue-700"></i>
                  </div>
                  <CardTitle>كيفية التنقل</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { icon: 'arrow-right', text: 'استخدم مفاتيح الأسهم للتحرك' },
                    { icon: 'mouse-pointer', text: 'انقر واسحب الماوس للنظر حولك' },
                    { icon: 'hand-pointer', text: 'انقر على المباني للدخول إليها' },
                    { icon: 'mobile', text: 'للأجهزة اللوحية والجوالات، استخدم أزرار التحكم المرئية' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 ml-3">
                        <i className={`fas fa-${item.icon} text-blue-600 text-xs`}></i>
                      </div>
                      <span className="text-slate-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <i className="fas fa-map-marked-alt text-purple-700"></i>
                  </div>
                  <CardTitle>المعالم الرئيسية</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {landmarks.map(landmark => (
                    <Badge key={landmark.id} variant="outline" className={`bg-${landmark.color}-100 text-${landmark.color}-800 border-${landmark.color}-200`}>
                      <i className={`fas fa-${landmark.icon} mr-1 text-xs`}></i>
                      {landmark.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-slate-500">اكتشف جميع المناطق للاستمتاع بتجربة كاملة من التسوق والترفيه</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3">
                    <i className="fas fa-lightbulb text-emerald-700"></i>
                  </div>
                  <CardTitle>نصائح للتجربة المثالية</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { icon: 'chrome', text: 'استخدم متصفح حديث للتجربة الأفضل', color: 'emerald' },
                    { icon: 'cubes', text: 'فعّل خاصية WebGL في متصفحك', color: 'teal' },
                    { icon: 'desktop', text: 'يفضل استخدام شاشة كبيرة للاستمتاع بالتفاصيل', color: 'emerald' },
                    { icon: 'vr-cardboard', text: 'حرك رأسك في وضع VR للتفاعل مع المحيط', color: 'teal' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-reverse space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-${item.color}-100 flex items-center justify-center`}>
                        <i className={`fas fa-${item.icon} text-${item.color}-700`}></i>
                      </div>
                      <span className="text-slate-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        /* Fullscreen VR Mode */
        <div className="fixed inset-0">
          {/* Main VR City Experience */}
          <div className="h-full w-full">
            <CityBuilder />
            
            {/* Floating landmarks indicators */}
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-black/30 backdrop-blur-md p-3 rounded-lg border border-white/10">
                <div className="text-white text-sm mb-2">المناطق المتاحة:</div>
                <div className="flex flex-wrap gap-2">
                  {landmarks.map(landmark => (
                    <Badge 
                      key={landmark.id} 
                      variant="outline" 
                      className="bg-black/50 hover:bg-black/70 text-white border-white/20 cursor-pointer"
                      onClick={() => setActivePOI(landmark.id)}
                    >
                      <i className={`fas fa-${landmark.icon} mr-1 text-${landmark.color}-400`}></i>
                      {landmark.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Touch controls for mobile */}
            {showControls && (
              <div className="absolute bottom-4 right-4 z-20">
                <TouchControls 
                  onMove={(direction) => {
                    switch(direction) {
                      case 'forward': movement.moveForward(); break;
                      case 'backward': movement.moveBackward(); break;
                      case 'left': movement.moveLeft(); break;
                      case 'right': movement.moveRight(); break;
                    }
                  }}
                  onLook={(deltaX, deltaY) => movement.rotate(deltaX, deltaY)}
                  showControls={true}
                  className="bg-black/20 backdrop-blur-md p-3 rounded-lg border border-white/10"
                />
              </div>
            )}
            
            {/* Traffic elements for more realism */}
            <CarTraffic 
              direction="right-to-left" 
              speed={5}
              carStyle="sedan"
              trafficLightState="green"
            />
            
            <TrafficLight 
              position={{ x: 10, y: 0, z: 5 }}
              cycleTime={15}
            />
            
            {/* Gate controls for interactions */}
            <GateControl 
              playerPosition={movement.position}
              gatePosition={{ x: 0, y: 0, z: 5 }}
              triggerDistance={3}
              onEnter={() => console.log("Gate entered")}
              gateWidth={5}
              gateHeight={4}
              gateColor="#6366f1"
            />
          </div>
        </div>
      )}
    </div>
  );
}