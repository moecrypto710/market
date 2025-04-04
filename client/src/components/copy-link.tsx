import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CopyLinkProps {
  affiliateCode: string;
}

export default function CopyLink({ affiliateCode }: CopyLinkProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  
  const affiliateLink = `https://amrikyy.com/ref/${affiliateCode}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setIsCopied(true);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط الإحالة الخاص بك",
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: "فشل النسخ",
        description: "حدث خطأ أثناء نسخ الرابط",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex mb-3">
      <input 
        type="text" 
        value={affiliateLink} 
        readOnly 
        className="w-full bg-black/30 border border-[#00ffcd]/20 rounded-r-lg py-2 px-3 text-white outline-none" 
      />
      <button 
        onClick={handleCopy}
        className="bg-gradient-to-r from-[#00ffcd] to-[#00d6ae] text-black py-2 px-4 rounded-l-lg font-bold hover:opacity-90 transition duration-300 shadow-[0_0_10px_rgba(0,255,205,0.5)]"
      >
        {isCopied ? "تم النسخ" : "نسخ"}
      </button>
    </div>
  );
}
