import { useMutation } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

export default function RewardCard({ reward, userPoints }: RewardCardProps) {
  const { toast } = useToast();
  
  const redeemRewardMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/rewards/${reward.id}/redeem`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "تمت عملية الاستبدال",
        description: `تم استبدال ${reward.name} بنجاح.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الاستبدال",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const canRedeem = userPoints >= reward.pointsRequired;
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex justify-between items-center">
      <div>
        <h4 className="font-bold">{reward.name}</h4>
        <p className="text-sm text-white/70">{reward.description}</p>
      </div>
      <div className="text-center">
        <span className="text-[#ffeb3b] font-bold block">{reward.pointsRequired}</span>
        <button 
          className={`mt-2 ${canRedeem ? 'bg-[#5e35b1] hover:bg-[#3b2fa3]' : 'bg-gray-500 cursor-not-allowed'} px-4 py-1 rounded-full text-sm transition duration-300`}
          onClick={() => canRedeem && redeemRewardMutation.mutate()}
          disabled={!canRedeem || redeemRewardMutation.isPending}
        >
          {redeemRewardMutation.isPending ? 'جاري...' : 'استبدال'}
        </button>
      </div>
    </div>
  );
}
