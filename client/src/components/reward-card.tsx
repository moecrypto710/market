
import { useState } from "react";
import { Reward } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

export function RewardCard({ reward, userPoints }: RewardCardProps) {
  const [claimed, setClaimed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleClaim = async () => {
    if (claimed || userPoints < reward.pointsRequired) return;
    
    try {
      const response = await fetch(`/api/rewards/${reward.id}/claim`, {
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
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>{reward.name}</CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{reward.pointsRequired} نقطة</span>
          <Button 
            onClick={handleClaim}
            disabled={claimed || userPoints < reward.pointsRequired}
            variant={claimed ? "outline" : "default"}
          >
            {claimed ? "تم المطالبة" : "مطالبة"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
