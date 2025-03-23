
import React, { useState } from 'react';
import { Reward } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

export function RewardCard({ reward, userPoints }: RewardCardProps) {
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const queryClient = useQueryClient();

  const handleClaim = async () => {
    if (claimed || userPoints < reward.points) return;
    
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
        description: `تمت المطالبة بـ ${reward.title} بنجاح!`,
      });
    } catch (error) {
      toast({
        title: "فشل المطالبة",
        description: "حدث خطأ أثناء المطالبة بالمكافأة",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>{reward.title}</CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{reward.points} نقطة</span>
          <Button 
            onClick={handleClaim}
            disabled={claimed || userPoints < reward.points}
            variant={claimed ? "outline" : "default"}
          >
            {claimed ? "تم المطالبة" : "مطالبة"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
