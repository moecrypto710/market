
import { useState } from "react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canClaim = userPoints >= reward.pointsRequired;

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
    <Card className="overflow-hidden border border-white/10 bg-black text-white transition-all duration-300 group relative">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full filter blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-full filter blur-xl"></div>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform duration-1000"></div>
      
      <CardContent className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300 tracking-wide">{reward.name}</h3>
            <p className="text-sm text-white/60 group-hover:text-white/80 transition-all duration-300 mt-1.5">{reward.description}</p>
          </div>
          <Badge 
            variant="outline"
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
        
        <div className="w-full h-2 bg-black/60 rounded-full mb-5 p-[1px] border border-white/10">
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
          onClick={handleClaim}
          disabled={claimed || !canClaim}
          variant={claimed ? "outline" : "default"}
          className={`
            w-full font-bold tracking-wide py-6 relative overflow-hidden group/btn
            ${claimed 
              ? "border-white/10 text-white/50 hover:border-purple-500/30 hover:text-white/70" 
              : canClaim 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 border-none" 
                : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
            }
          `}
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover/btn:translate-x-full transform transition-transform duration-1000"></div>
          
          <span className="relative z-10">
            {claimed ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-check-circle mr-2"></i>
                تم المطالبة
              </span>
            ) : canClaim ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-gift mr-2"></i>
                مطالبة الآن
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="fas fa-lock mr-2"></i>
                نقاط غير كافية
              </span>
            )}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
