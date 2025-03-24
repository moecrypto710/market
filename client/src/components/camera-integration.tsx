import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Filter {
  id: string;
  name: string;
  type: 'color' | 'effect' | 'overlay';
  preview: string;
  style?: React.CSSProperties;
  className?: string;
}

interface AREffect {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface CameraIntegrationProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
  mode?: 'product-try-on' | 'avatar-creation' | 'ar-measure';
  productImageUrl?: string;
  enableFilters?: boolean;
  enableAREffects?: boolean;
}

export default function CameraIntegration({
  onCapture,
  onClose,
  mode = 'product-try-on',
  productImageUrl,
  enableFilters = true,
  enableAREffects = true
}: CameraIntegrationProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [virtualPosition, setVirtualPosition] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  
  // Available filters for camera
  const filters: Filter[] = [
    { 
      id: 'normal', 
      name: 'طبيعي', 
      type: 'color', 
      preview: 'https://api.dicebear.com/7.x/shapes/svg?seed=normal',
      style: { filter: 'none' }
    },
    { 
      id: 'warm', 
      name: 'دافئ', 
      type: 'color', 
      preview: 'https://api.dicebear.com/7.x/shapes/svg?seed=warm',
      style: { filter: 'sepia(0.5) saturate(1.5) hue-rotate(-20deg)' }
    },
    { 
      id: 'cool', 
      name: 'بارد', 
      type: 'color', 
      preview: 'https://api.dicebear.com/7.x/shapes/svg?seed=cool',
      style: { filter: 'saturate(1.2) hue-rotate(20deg) brightness(1.1)' }
    },
    { 
      id: 'neon', 
      name: 'نيون', 
      type: 'color', 
      preview: 'https://api.dicebear.com/7.x/shapes/svg?seed=neon',
      style: { filter: 'brightness(1.1) contrast(1.2) saturate(1.8) hue-rotate(10deg)' }
    },
    { 
      id: 'futuristic', 
      name: 'مستقبلي', 
      type: 'color', 
      preview: 'https://api.dicebear.com/7.x/shapes/svg?seed=futuristic',
      style: { filter: 'brightness(1.2) contrast(1.1) saturate(1.2) hue-rotate(180deg)' }
    }
  ];
  
  // Available AR effects
  const arEffects: AREffect[] = [
    { 
      id: 'none', 
      name: 'بدون', 
      icon: 'circle', 
      description: 'عرض عادي بدون تأثيرات'
    },
    { 
      id: 'hologram', 
      name: 'هولوجرام', 
      icon: 'vr-cardboard',
      description: 'تأثير الهولوجرام الثلاثي الأبعاد'
    },
    { 
      id: 'virtual-try', 
      name: 'تجربة افتراضية', 
      icon: 'tshirt',
      description: 'تجربة المنتج بشكل افتراضي'
    },
    { 
      id: 'measure', 
      name: 'قياس', 
      icon: 'ruler',
      description: 'قياس المنتج في مساحتك الحقيقية'
    },
    { 
      id: 'scan', 
      name: 'مسح', 
      icon: 'qrcode',
      description: 'مسح المنتج للحصول على معلومات إضافية'
    }
  ];
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Request camera permission and initialize stream
  useEffect(() => {
    async function setupCamera() {
      try {
        const constraints = {
          video: { 
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        setHasCameraPermission(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasCameraPermission(false);
        toast({
          title: "خطأ في الوصول للكاميرا",
          description: "يرجى السماح بالوصول إلى الكاميرا للاستمرار",
          variant: "destructive"
        });
      }
    }
    
    setupCamera();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraFacing]);

  // Capture image from video stream
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      
      // Draw countdown animation
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          
          // Capture the image
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          // Make sure video and canvas elements exist
          if (!video || !canvas) return;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Flip horizontally if using front camera
            if (cameraFacing === 'user') {
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
            }
            
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // If in product-try-on mode, overlay the product image
            if (mode === 'product-try-on' && productImageUrl) {
              // This is a simplified example - real AR would need face/body detection
              const productImg = new Image();
              productImg.onload = () => {
                // Make sure context still exists
                if (!ctx || !canvas) return;
                
                // Position the product in the center-bottom of the frame
                const scale = 0.5; // Scale the product image
                const posX = (canvas.width - productImg.width * scale) / 2;
                const posY = canvas.height - productImg.height * scale - 20;
                
                // Draw the product
                ctx.drawImage(
                  productImg, 
                  posX, posY, 
                  productImg.width * scale, 
                  productImg.height * scale
                );
                
                // Get the final image data
                const imageSrc = canvas.toDataURL('image/png');
                setCapturedImage(imageSrc);
              };
              productImg.src = productImageUrl;
            } else {
              // Get the image data
              const imageSrc = canvas.toDataURL('image/png');
              setCapturedImage(imageSrc);
            }
            
            setIsCapturing(false);
          }
        }
      }, 1000);
    }
  };

  // Toggle front/back camera
  const toggleCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Accept and use the captured image
  const acceptImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      toast({
        title: "تم التقاط الصورة بنجاح",
        description: "يمكنك الآن استخدام الصورة في التجربة الافتراضية"
      });
    }
  };

  // Retake the image
  const retakeImage = () => {
    setCapturedImage(null);
  };

  // Render appropriate message based on camera permission status
  if (hasCameraPermission === false) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-lg p-8 rounded-xl border border-red-500/50 max-w-md text-center">
          <div className="mb-4 text-red-500 flex justify-center">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">لم يتم السماح بالوصول للكاميرا</h2>
          <p className="text-white/70 mb-6">
            لاستخدام ميزات الواقع المعزز والتجربة الافتراضية، يرجى السماح للتطبيق بالوصول إلى الكاميرا من إعدادات المتصفح.
          </p>
          <Button onClick={onClose}>عودة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {mode === 'product-try-on' && 'تجربة المنتج افتراضيًا'}
          {mode === 'avatar-creation' && 'إنشاء شخصية افتراضية'}
          {mode === 'ar-measure' && 'قياس المنتج في مساحتك'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <i className="fas fa-times"></i>
        </Button>
      </div>
      
      {/* Main content */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-white/20 bg-black/50 aspect-video">
        {/* Camera view or captured image */}
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={selectedFilter ? filters.find(f => f.id === selectedFilter)?.style : undefined}
              className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            
            {/* Futuristic AR interface overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Holographic scanline effect */}
              <div className="absolute inset-0 bg-scan-lines opacity-10"></div>
              
              {/* Futuristic HUD elements */}
              <div className="absolute top-4 left-4 border border-fuchsia-500/40 px-3 py-1 rounded-lg text-xs bg-black/30 backdrop-blur-sm text-fuchsia-500 font-mono">
                AR MODE: {isARActive ? 'ACTIVE' : 'STANDBY'}
              </div>
              
              <div className="absolute top-4 right-4 border border-fuchsia-500/40 px-3 py-1 rounded-lg text-xs bg-black/30 backdrop-blur-sm text-fuchsia-500 font-mono flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                CAMERA: {cameraFacing === 'user' ? 'FRONT' : 'REAR'}
              </div>
              
              {/* Corner brackets for futuristic interface */}
              <div className="absolute top-2 left-2 border-t-2 border-l-2 border-fuchsia-500/50 w-12 h-12"></div>
              <div className="absolute top-2 right-2 border-t-2 border-r-2 border-fuchsia-500/50 w-12 h-12"></div>
              <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-fuchsia-500/50 w-12 h-12"></div>
              <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-fuchsia-500/50 w-12 h-12"></div>
            </div>
            
            {/* Countdown overlay */}
            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-6xl font-bold">
                <div className="animate-pulse">التقاط الصورة...</div>
              </div>
            )}
            
            {/* AR guide overlay based on mode */}
            {mode === 'product-try-on' && !isARActive && (
              <div className="absolute inset-0 flex items-end justify-center pb-20 opacity-50">
                <div className="border-2 border-dashed border-fuchsia-500 rounded-full w-32 h-32 relative">
                  <div className="text-center text-xs mt-12 text-white">ضع وجهك هنا</div>
                  
                  {/* Animated guide markers */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-2 border-fuchsia-500 rounded-full animate-ping"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-fuchsia-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-2 border-fuchsia-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-fuchsia-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
              </div>
            )}
            
            {/* AR effect overlay */}
            {isARActive && selectedEffect && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {selectedEffect === 'hologram' && (
                  <div className="relative">
                    <div className="absolute -inset-8 rounded-full bg-blue-500/20 animate-pulse"></div>
                    <div className="text-blue-500 text-lg font-mono">HOLOGRAM PROCESSING</div>
                    <div className="mt-2 h-1 bg-blue-500/30 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-blue-500 animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                )}
                
                {selectedEffect === 'virtual-try' && productImageUrl && (
                  <img 
                    src={productImageUrl} 
                    alt="Virtual Try-on" 
                    className="max-w-[80%] max-h-[80%] object-contain opacity-90"
                    style={{
                      transform: `translate(${virtualPosition.x}px, ${virtualPosition.y}px) 
                                 scale(${virtualPosition.scale}) 
                                 rotate(${virtualPosition.rotation}deg)`,
                    }}
                  />
                )}
                
                {selectedEffect === 'measure' && (
                  <div className="absolute inset-0">
                    <div className="absolute left-1/3 top-1/3 w-1/3 h-1/3 border-2 border-yellow-500 border-dashed"></div>
                    <div className="absolute left-1/3 top-1/3 w-[2px] h-1/3 bg-yellow-500"></div>
                    <div className="absolute left-1/3 top-1/3 w-1/3 h-[2px] bg-yellow-500"></div>
                    <div className="absolute right-1/3 bottom-1/3 text-xs text-yellow-500 font-mono">MEASURING...</div>
                  </div>
                )}
                
                {selectedEffect === 'scan' && (
                  <div className="absolute inset-0">
                    <div className="h-[2px] w-full bg-fuchsia-500/80 animate-scan"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-fuchsia-500 font-mono">
                      SCANNING PRODUCT
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}
        
        {/* Canvas for processing - hidden */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Filter and effect controls */}
      {!capturedImage && (
        <div className="w-full max-w-3xl flex flex-wrap justify-center items-center gap-2 mt-4">
          {/* Filter selection */}
          {enableFilters && (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="mr-2 text-xs">
                <i className="fas fa-magic mr-1"></i>
                فلاتر
              </Button>
              
              {showFilters && (
                <div className="flex gap-2 items-center bg-black/60 rounded-full px-3 py-1 backdrop-blur-sm border border-fuchsia-500/30">
                  {filters.map(filter => (
                    <div 
                      key={filter.id}
                      className={`w-8 h-8 rounded-full cursor-pointer overflow-hidden border-2 transition-all
                                ${selectedFilter === filter.id ? 'border-fuchsia-500 scale-110' : 'border-white/20'}`}
                      onClick={() => setSelectedFilter(filter.id)}
                      title={filter.name}
                    >
                      <div 
                        className="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-500"
                        style={filter.style}
                      ></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* AR effects selection */}
          {enableAREffects && (
            <div className="flex items-center">
              <Button 
                variant={isARActive ? "default" : "ghost"}
                size="sm" 
                onClick={() => setShowEffects(!showEffects)}
                className="mr-2 text-xs">
                <i className="fas fa-vr-cardboard mr-1"></i>
                تأثيرات
              </Button>
              
              {showEffects && (
                <div className="flex gap-2 items-center bg-black/60 rounded-full px-3 py-1 backdrop-blur-sm border border-fuchsia-500/30">
                  {arEffects.map(effect => (
                    <div 
                      key={effect.id}
                      className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all
                              ${selectedEffect === effect.id ? 'bg-fuchsia-500 text-white' : 'bg-black/50 text-white/70 hover:text-white/90'}`}
                      onClick={() => {
                        setSelectedEffect(effect.id);
                        setIsARActive(effect.id !== 'none');
                      }}
                      title={effect.name}
                    >
                      <i className={`fas fa-${effect.icon} text-sm`}></i>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Main controls */}
      <div className="w-full max-w-3xl mt-4 flex justify-center gap-4">
        {!capturedImage ? (
          <>
            <Button onClick={captureImage} disabled={isCapturing} className="w-32">
              <i className="fas fa-camera mr-2"></i>
              التقاط
            </Button>
            <Button onClick={toggleCamera} variant="outline" className="w-32">
              <i className="fas fa-sync mr-2"></i>
              تبديل الكاميرا
            </Button>
          </>
        ) : (
          <>
            <Button onClick={acceptImage} variant="default" className="w-32">
              <i className="fas fa-check mr-2"></i>
              استخدام
            </Button>
            <Button onClick={retakeImage} variant="outline" className="w-32">
              <i className="fas fa-redo mr-2"></i>
              إعادة التقاط
            </Button>
          </>
        )}
      </div>
      
      {/* Instructions */}
      <div className="w-full max-w-3xl mt-6 p-4 rounded-lg bg-black/50 border border-white/10">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <i className="fas fa-lightbulb text-amber-400 mr-2"></i>
          إرشادات
        </h3>
        <ul className="text-sm text-white/70 space-y-2 list-disc list-inside">
          {mode === 'product-try-on' && (
            <>
              <li>تأكد من وضع وجهك في المساحة المحددة للحصول على أفضل تجربة</li>
              <li>استخدم الإضاءة الجيدة للحصول على نتائج أفضل</li>
              <li>يمكنك تحريك رأسك لضبط موضع المنتج</li>
            </>
          )}
          {mode === 'avatar-creation' && (
            <>
              <li>اجعل وجهك في منتصف الشاشة للحصول على أفضل نتيجة</li>
              <li>تأكد من وضوح الإضاءة</li>
              <li>يمكنك تعديل الشخصية الافتراضية بعد إنشائها</li>
            </>
          )}
          {mode === 'ar-measure' && (
            <>
              <li>وجه الكاميرا نحو المساحة التي تريد قياسها</li>
              <li>حرك الهاتف ببطء لمسح المساحة</li>
              <li>انقر على الشاشة لتحديد نقاط القياس</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}