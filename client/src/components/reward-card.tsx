
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
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{reward.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{reward.description}</p>
          </div>
          <Badge variant={canClaim ? "default" : "outline"} className={canClaim ? "bg-[#5e35b1]" : ""}>
            {reward.pointsRequired} نقطة
          </Badge>
        </div>
        
        <Button 
          onClick={handleClaim}
          disabled={claimed || !canClaim}
          variant={claimed ? "outline" : "default"}
          className={`w-full ${claimed ? "" : "bg-[#5e35b1]"}`}
          size="sm"
        >
          {claimed ? "تم المطالبة" : canClaim ? "مطالبة الآن" : "نقاط غير كافية"}
        </Button>
      </CardContent>
    </Card>
  );
}
