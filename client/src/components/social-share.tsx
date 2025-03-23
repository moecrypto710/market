import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  productId?: number;
  productName?: string;
  imageUrl?: string;
  url?: string;
  title?: string;
  text?: string;
  showLabel?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  style?: React.CSSProperties;
}

export default function SocialShare({ 
  productId,
  productName,
  imageUrl,
  url = window.location.href,
  title = "Amrikyy - تجربة تسوق افتراضية",
  text = "شاهد هذا المتجر الافتراضي الرائع!",
  showLabel = true,
  variant = "default",
  size = "default",
  className = ""
}: SocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // If productId is provided, modify the URL to point to the specific product
  const shareUrl = productId ? `${window.location.origin}/product/${productId}` : url;
  const shareTitle = productName ? `${productName} - Amrikyy` : title;
  const shareText = productName ? `شاهد ${productName} في متجر Amrikyy الافتراضي` : text;
  
  const shareData = {
    title: shareTitle,
    text: shareText,
    url: shareUrl
  };
  
  // Generate QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`;
  
  // Create message for clipboard
  const clipboardText = `${shareTitle}
${shareText}
${shareUrl}`;

  const canUseNativeShare = !!navigator.share;
  
  const shareViaNavigator = async () => {
    try {
      await navigator.share(shareData);
      toast({
        title: "تمت المشاركة",
        description: "تمت مشاركة المحتوى بنجاح",
      });
    } catch (error) {
      // User cancelled or share failed
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "خطأ في المشاركة",
          description: "تعذرت مشاركة المحتوى",
          variant: "destructive",
        });
      }
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الرابط إلى الحافظة",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "خطأ",
        description: "تعذر نسخ الرابط",
        variant: "destructive",
      });
    }
  };
  
  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
  };
  
  const shareViaFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    openShareWindow(fbShareUrl);
  };
  
  const shareViaTwitter = () => {
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    openShareWindow(twitterShareUrl);
  };
  
  const shareViaWhatsapp = () => {
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    openShareWindow(whatsappShareUrl);
  };
  
  const shareViaTelegram = () => {
    const telegramShareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    openShareWindow(telegramShareUrl);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
        >
          <i className="fas fa-share-alt ml-2"></i>
          {showLabel && "مشاركة"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-bold">مشاركة</h3>
          <p className="text-sm text-white/70">شارك هذا المحتوى مع أصدقائك</p>
        </div>
        
        <div className="p-4">
          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <img src={qrCodeUrl} alt="QR Code" className="h-28 w-28 border" />
          </div>
          
          {/* Social Media */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button 
              variant="outline" 
              size="icon"
              className="flex items-center justify-center rounded-full hover:bg-blue-600 hover:text-white"
              onClick={shareViaFacebook}
            >
              <i className="fab fa-facebook-f"></i>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="flex items-center justify-center rounded-full hover:bg-cyan-500 hover:text-white"
              onClick={shareViaTwitter}
            >
              <i className="fab fa-twitter"></i>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="flex items-center justify-center rounded-full hover:bg-green-500 hover:text-white"
              onClick={shareViaWhatsapp}
            >
              <i className="fab fa-whatsapp"></i>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="flex items-center justify-center rounded-full hover:bg-blue-400 hover:text-white"
              onClick={shareViaTelegram}
            >
              <i className="fab fa-telegram-plane"></i>
            </Button>
          </div>
          
          {/* Copy Link */}
          <div className="space-y-2">
            <div className="relative">
              <div className="bg-white/10 truncate rounded-md py-2 px-3 text-xs">
                {shareUrl}
              </div>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              {canUseNativeShare && (
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={shareViaNavigator}
                >
                  <i className="fas fa-external-link-alt ml-2"></i>
                  مشاركة مباشرة
                </Button>
              )}
              <Button 
                variant={copied ? "default" : "secondary"} 
                className="flex-1"
                onClick={copyToClipboard}
              >
                <i className={`fas fa-${copied ? 'check' : 'copy'} ml-2`}></i>
                {copied ? "تم النسخ" : "نسخ الرابط"}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}