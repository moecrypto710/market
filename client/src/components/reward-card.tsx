import { Reward } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import confetti from "canvas-confetti";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

export default function RewardCard({ reward, userPoints }: RewardCardProps) {
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  
  // Calculate progress percentage
  const progressPercentage = Math.min(Math.round((userPoints / reward.pointsRequired) * 100), 100);
  
  // Redeem mutation
  const redeemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        `/api/rewards/${reward.id}/redeem`, 
        {}
      );
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setClaimed(true);
      
      // Show confetti
      const showConfetti = () => {
        const colors = ['#FFD700', '#FFC107', '#673AB7', '#3F51B5'];
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: colors,
        });
      };
      
      showConfetti();
      
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
  
  // Handle redeem button click
  const handleRedeem = () => {
    if (userPoints < reward.pointsRequired) {
      toast({
        title: "نقاط غير كافية",
        description: `تحتاج إلى ${reward.pointsRequired - userPoints} نقطة إضافية لاستبدال هذه المكافأة`,
        variant: "destructive",
      });
      return;
    }
    
    redeemMutation.mutate();
  };
  
  // Determine card styling based on progress
  const cardStyle = progressPercentage >= 100
    ? "border-[#ffeb3b] bg-gradient-to-b from-[#424242] to-[#212121]"
    : "border-white/10 bg-black/20";
    
  // Determine progress color
  const progressColor = 
    progressPercentage >= 100 ? "bg-[#ffeb3b]" : 
    progressPercentage >= 70 ? "bg-[#4caf50]" : 
    progressPercentage >= 40 ? "bg-[#ff9800]" : 
    "bg-[#f44336]";
  
  return (
    <Card className={`overflow-hidden relative ${cardStyle}`}>
      {progressPercentage >= 100 && (
        <div className="absolute top-0 left-0 w-full h-full bg-[#ffeb3b]/10 pointer-events-none" />
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{reward.name}</span>
          <div className="flex items-center text-sm font-normal">
            <i className="fas fa-star mr-1 text-[#ffeb3b]"></i>
            <span>{reward.pointsRequired} نقطة</span>
          </div>
        </CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>التقدم</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${progressColor}`}
          />
          
          <div className="flex justify-between text-xs text-white/60">
            <span>{userPoints} نقطة</span>
            <span>{reward.pointsRequired} نقطة</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className={progressPercentage >= 100 
            ? "w-full bg-[#ffeb3b] text-black hover:bg-[#fdd835]" 
            : "w-full"
          }
          disabled={progressPercentage < 100 || redeemMutation.isPending || claimed}
          onClick={handleRedeem}
        >
          {redeemMutation.isPending ? (
            <i className="fas fa-spinner fa-spin ml-2"></i>
          ) : claimed ? (
            <i className="fas fa-check ml-2"></i>
          ) : (
            <i className={`fas fa-gift ml-2 ${progressPercentage >= 100 ? "text-black" : ""}`}></i>
          )}
          {claimed ? "تم الاستبدال" : "استبدال المكافأة"}
        </Button>
      </CardFooter>
      
      {/* Visual indicators for almost complete */}
      {progressPercentage >= 70 && progressPercentage < 100 && (
        <div className="absolute top-2 right-2">
          <div className="bg-[#ff9800] text-white text-xs rounded-full px-2 py-0.5 animate-pulse">
            <i className="fas fa-bolt ml-1"></i>
            اقتربت!
          </div>
        </div>
      )}
    </Card>
  );
}