
import { useState, useRef, useEffect } from "react";
import { Reward } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

export function RewardCard({ reward, userPoints }: RewardCardProps) {
  const [claimed, setClaimed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canClaim = userPoints >= reward.pointsRequired;
  
  // Add keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current || !cardRef.current.contains(e.target as Node)) return;
      
      // If card is focused and Enter or Space is pressed, focus the button
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === cardRef.current) {
        e.preventDefault();
        buttonRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClaim = async () => {
    if (claimed || !canClaim) return;
    
    try {
      const response = await fetch(`/api/rewards/${reward.id}/redeem`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to claim reward');
      
      setClaimed(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Create a live region announcement for screen readers
      const announceElement = document.createElement('div');
      announceElement.className = 'sr-only';
      announceElement.setAttribute('aria-live', 'assertive');
      announceElement.textContent = `تمت المطالبة بـ ${reward.name} بنجاح!`;
      document.body.appendChild(announceElement);
      
      // Remove the announcement after it's been read
      setTimeout(() => {
        document.body.removeChild(announceElement);
      }, 3000);
      
      toast({
        title: "تم المطالبة بالمكافأة",
        description: `تمت المطالبة بـ ${reward.name} بنجاح!`,
      });
    } catch (error) {
      toast({
        title: "فشل المطالبة",
        description: "حدث خطأ أثناء المطالبة بالمكافأة"
      });
    }
  };

  return (
    <Card 
      ref={cardRef}
      tabIndex={0}
      role="article"
      aria-label={`مكافأة: ${reward.name}, ${reward.description}, تتطلب ${reward.pointsRequired} نقطة`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`overflow-hidden border border-white/10 bg-black text-white transition-all duration-300 group relative focus:outline-none ${isFocused ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''}`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-700">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full filter blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-full filter blur-xl"></div>
      </div>
      
      {/* Shine effect on hover/focus */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-focus:opacity-20 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full group-focus:translate-x-full transform transition-transform duration-1000"></div>
      
      <CardContent className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 id={`reward-title-${reward.id}`} className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90 group-hover:from-purple-400 group-hover:to-pink-400 group-focus:from-purple-400 group-focus:to-pink-400 transition-all duration-300 tracking-wide">{reward.name}</h3>
            <p id={`reward-desc-${reward.id}`} className="text-sm text-white/60 group-hover:text-white/80 group-focus:text-white/80 transition-all duration-300 mt-1.5">{reward.description}</p>
          </div>
          <Badge 
            variant="outline"
            aria-label={`تتطلب ${reward.pointsRequired} نقطة`}
            className={`
              transition-all duration-300 
              ${canClaim 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white" 
                : "border-white/20 bg-black/40 text-white/70"
              }
            `}
          >
            {reward.pointsRequired} نقطة
          </Badge>
        </div>
        
        <div 
          role="progressbar" 
          aria-valuenow={Math.floor((userPoints / reward.pointsRequired) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-labelledby={`reward-title-${reward.id}`}
          className="w-full h-2 bg-black/60 rounded-full mb-5 p-[1px] border border-white/10"
        >
          <div 
            className={`
              h-full rounded-full transition-all duration-700 relative
              ${canClaim 
                ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                : "bg-gradient-to-r from-purple-500/40 to-pink-500/40"
              }
            `}
            style={{ width: canClaim ? '100%' : `${Math.min(99, Math.floor((userPoints / reward.pointsRequired) * 100))}%` }}
          >
            {canClaim && (
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white opacity-20 rounded-full animate-pulse-slow"></div>
            )}
          </div>
        </div>
        
        <Button 
          ref={buttonRef}
          onClick={handleClaim}
          disabled={claimed || !canClaim}
          variant={claimed ? "outline" : "default"}
          aria-disabled={claimed || !canClaim}
          aria-label={claimed ? "تم المطالبة بهذه المكافأة" : canClaim ? `مطالبة بـ ${reward.name}` : "نقاط غير كافية للمطالبة بهذه المكافأة"}
          className={`
            w-full font-bold tracking-wide py-6 relative overflow-hidden group/btn focus:ring-2 focus:ring-purple-500 focus:outline-none
            ${claimed 
              ? "border-white/10 text-white/50 hover:border-purple-500/30 hover:text-white/70" 
              : canClaim 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 border-none" 
                : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
            }
          `}
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 group-focus/btn:opacity-20 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover/btn:translate-x-full group-focus/btn:translate-x-full transform transition-transform duration-1000"></div>
          
          <span className="relative z-10">
            {claimed ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-check-circle mr-2" aria-hidden="true"></i>
                تم المطالبة
              </span>
            ) : canClaim ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-gift mr-2" aria-hidden="true"></i>
                مطالبة الآن
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="fas fa-lock mr-2" aria-hidden="true"></i>
                نقاط غير كافية
              </span>
            )}
          </span>
        </Button>
        
        {/* Hidden instruction for screen readers */}
        <div className="sr-only" aria-live="polite">
          {canClaim 
            ? "يمكنك المطالبة بهذه المكافأة. استخدم مفتاح Tab للانتقال إلى زر المطالبة ثم اضغط Enter." 
            : `تحتاج إلى ${reward.pointsRequired - userPoints} نقطة إضافية للمطالبة بهذه المكافأة.`
          }
        </div>
      </CardContent>
    </Card>
  );
}
