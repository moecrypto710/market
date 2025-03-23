
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
    <Card className="overflow-hidden border border-white/30 bg-black text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-white tracking-wide">{reward.name}</h3>
            <p className="text-sm text-white/70 mt-1">{reward.description}</p>
          </div>
          <Badge 
            variant={canClaim ? "default" : "outline"} 
            className={canClaim ? "bg-white text-black border-none" : "border-white/70 text-white bg-transparent"}
          >
            {reward.pointsRequired} نقطة
          </Badge>
        </div>
        
        <div className="w-full h-1 bg-white/10 rounded-full mb-4">
          <div 
            className="h-1 rounded-full bg-white transition-all duration-500"
            style={{ width: canClaim ? '100%' : `${Math.min(99, Math.floor((userPoints / reward.pointsRequired) * 100))}%` }}
          ></div>
        </div>
        
        <Button 
          onClick={handleClaim}
          disabled={claimed || !canClaim}
          variant={claimed ? "outline" : "default"}
          className={`w-full font-bold tracking-wide py-5 ${
            claimed 
              ? "border-white/50 text-white/70 hover:bg-white/10" 
              : canClaim 
                ? "bg-white text-black hover:bg-white/90" 
                : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          {claimed ? "تم المطالبة" : canClaim ? "مطالبة الآن" : "نقاط غير كافية"}
        </Button>
      </CardContent>
    </Card>
  );
}
