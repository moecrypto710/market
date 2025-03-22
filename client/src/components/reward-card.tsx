import React from 'react';
import { Reward } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { redeemReward } from "@/lib/api";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

export function RewardCard({ reward, userPoints }: RewardCardProps) {
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const queryClient = useQueryClient();

  const progressPercentage = Math.min(Math.round((userPoints / reward.pointsRequired) * 100), 100);

  const redeemMutation = useMutation({
    mutationFn: () => redeemReward(reward.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setClaimed(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFC107', '#673AB7', '#3F51B5'],
      });

      toast({
        title: "مبروك!",
        description: `تم استبدال المكافأة: ${reward.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء استبدال المكافأة",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reward.name}</CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="mb-4" />
        <div className="flex justify-between items-center">
          <span>{reward.pointsRequired} نقطة</span>
          <Button
            onClick={() => redeemMutation.mutate()}
            disabled={userPoints < reward.pointsRequired || claimed}
          >
            {claimed ? 'تم الاستبدال' : 'استبدال'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}