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
  productImageUrl
}: CameraIntegrationProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  
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
              className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            
            {/* Countdown overlay */}
            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-6xl font-bold">
                <div className="animate-pulse">التقاط الصورة...</div>
              </div>
            )}
            
            {/* AR guide overlay based on mode */}
            {mode === 'product-try-on' && (
              <div className="absolute inset-0 flex items-end justify-center pb-20 opacity-50">
                <div className="border-2 border-dashed border-white rounded-full w-32 h-32">
                  <div className="text-center text-xs mt-12 text-white">ضع وجهك هنا</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}
        
        {/* Canvas for processing - hidden */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Controls */}
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