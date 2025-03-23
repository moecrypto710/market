import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AugmentedRealityProps {
  product: Product;
  button?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export default function AugmentedReality({
  product,
  button = true,
  size = "default",
  className = "",
}: AugmentedRealityProps) {
  const { toast } = useToast();
  const [isARSupported, setIsARSupported] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Check if AR is supported (WebXR or camera access)
  useEffect(() => {
    // Check for WebXR support
    const xrSupported = 'xr' in navigator && 'isSessionSupported' in (navigator as any).xr;
    
    // Check for camera access support
    const mediaSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    
    setIsARSupported(xrSupported || mediaSupported);
  }, []);
  
  // Function to request camera permission
  const requestCameraPermission = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsPermissionGranted(true);
      
      // Stop the stream since we're just checking permissions
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (err) {
      console.error('Camera permission denied:', err);
      toast({
        title: "لم يتم السماح بالوصول للكاميرا",
        description: "الرجاء السماح بالوصول للكاميرا لاستخدام الواقع المعزز",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start AR experience
  const startAR = async () => {
    if (!isARSupported) {
      toast({
        title: "غير مدعوم",
        description: "جهازك أو متصفحك لا يدعم تقنية الواقع المعزز",
        variant: "destructive",
      });
      return;
    }
    
    // Request camera permission if not already granted
    if (!isPermissionGranted) {
      const granted = await requestCameraPermission();
      if (!granted) return;
    }
    
    setIsOpen(true);
    
    // We'll start the camera once the dialog is open
    setTimeout(initCamera, 500);
  };
  
  // Initialize camera stream
  const initCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      // Start the AR rendering loop
      startARRenderLoop();
      
      toast({
        title: "تم تشغيل الواقع المعزز",
        description: "حرك الكاميرا لوضع المنتج في بيئتك",
      });
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الوصول للكاميرا",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Stop AR experience
  const stopAR = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsOpen(false);
  };
  
  // Simulate placing the product in the environment
  const startARRenderLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Preload product image
    const productImage = new Image();
    productImage.src = product.imageUrl;
    productImage.onload = () => {
      // Simple render loop
      const render = () => {
        if (!video.paused && !video.ended) {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Calculate product image size (scaled to 1/4 of the canvas)
          const imgWidth = canvas.width / 4;
          const imgHeight = (imgWidth / productImage.width) * productImage.height;
          
          // Draw product in the center bottom area
          ctx.drawImage(
            productImage, 
            canvas.width / 2 - imgWidth / 2, 
            canvas.height - imgHeight - 50, 
            imgWidth, 
            imgHeight
          );
          
          // Add instructions
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('حرك الكاميرا لوضع المنتج في بيئتك المحيطة', canvas.width / 2, canvas.height - 15);
          
          // Request next frame
          if (isOpen) {
            requestAnimationFrame(render);
          }
        }
      };
      
      // Start the render loop
      render();
    };
  };
  
  // Clear resources when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  if (button) {
    return (
      <>
        <Button
          variant="outline"
          size={size}
          className={`border-[#ffeb3b] text-[#ffeb3b] hover:bg-[#ffeb3b]/10 ${className}`}
          onClick={startAR}
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin ml-2"></i>
          ) : (
            <i className="fas fa-cube ml-2"></i>
          )}
          عرض بالواقع المعزز
        </Button>
        
        {/* AR Dialog */}
        <Dialog open={isOpen} onOpenChange={(open) => !open && stopAR()}>
          <DialogContent className="max-w-[90vw] w-[800px] h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>عرض {product.name} بالواقع المعزز</DialogTitle>
              <DialogDescription>
                شاهد المنتج في بيئتك الحقيقية
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative flex-grow flex items-center justify-center">
              <div className="w-full h-full relative overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="absolute w-full h-full object-cover" 
                  playsInline 
                  muted
                />
                <canvas 
                  ref={canvasRef} 
                  className="absolute w-full h-full object-cover" 
                />
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
                      <p>جاري تهيئة الواقع المعزز...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-between">
              <Button 
                variant="outline"
                onClick={stopAR}
              >
                إغلاق
              </Button>
              
              <Button 
                variant="default"
                className="bg-[#ffeb3b] text-[#2a1f6f] hover:bg-[#fdd835]"
              >
                <i className="fas fa-shopping-cart ml-2"></i>
                إضافة للسلة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  // If not a button, return direct dialog trigger
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && stopAR()}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size={size}
          className={`border-[#ffeb3b] text-[#ffeb3b] hover:bg-[#ffeb3b]/10 ${className}`}
          onClick={() => startAR()}
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin ml-2"></i>
          ) : (
            <i className="fas fa-cube ml-2"></i>
          )}
          عرض بالواقع المعزز
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-[800px] h-[80vh] flex flex-col p-0">
        {/* Content is the same as above */}
        <DialogHeader className="p-4 border-b">
          <DialogTitle>عرض {product.name} بالواقع المعزز</DialogTitle>
          <DialogDescription>
            شاهد المنتج في بيئتك الحقيقية
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative flex-grow flex items-center justify-center">
          <div className="w-full h-full relative overflow-hidden">
            <video 
              ref={videoRef} 
              className="absolute w-full h-full object-cover" 
              playsInline 
              muted
            />
            <canvas 
              ref={canvasRef} 
              className="absolute w-full h-full object-cover" 
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
                  <p>جاري تهيئة الواقع المعزز...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-between">
          <Button 
            variant="outline"
            onClick={stopAR}
          >
            إغلاق
          </Button>
          
          <Button 
            variant="default"
            className="bg-[#ffeb3b] text-[#2a1f6f] hover:bg-[#fdd835]"
          >
            <i className="fas fa-shopping-cart ml-2"></i>
            إضافة للسلة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}