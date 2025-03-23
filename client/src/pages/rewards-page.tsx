import { useQuery } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { RewardCard } from "@/components/reward-card";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";

export default function RewardsPage() {
  const { user } = useAuth();
  
  const { data: rewards } = useQuery<Reward[]>({
    queryKey: ['/api/rewards'],
  });
  
  const currentPoints = user?.points || 0;
  const nextRewardLevel = 1000;
  const progressPercentage = Math.min(100, (currentPoints / nextRewardLevel) * 100);
  
  const earningMethods = [
    {
      id: 1,
      title: "عمليات الشراء",
      description: "10 نقاط لكل 100 جنيه",
      icon: "shopping-cart"
    },
    {
      id: 2,
      title: "دعوة أصدقاء",
      description: "200 نقطة لكل صديق",
      icon: "user-plus"
    },
    {
      id: 3,
      title: "تقييم المنتجات",
      description: "50 نقطة لكل تقييم",
      icon: "star"
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">برنامج المكافآت</h2>
      
      {/* Current Points - Simplified */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <span className="text-3xl font-bold block text-[#5e35b1]">{currentPoints}</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">نقاط المكافآت</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>0</span>
              <span>{nextRewardLevel}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Available Rewards - Grid Layout */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">المكافآت المتاحة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards?.map((reward) => (
            <RewardCard key={reward.id} reward={reward} userPoints={currentPoints} />
          ))}
        </div>
      </div>
      
      {/* How to Earn - Simplified */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4">كيف تكسب النقاط</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {earningMethods.map((method) => (
            <Card key={method.id} className="border-0">
              <CardContent className="pt-6 text-center">
                <div className="bg-[#5e35b1] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className={`fas fa-${method.icon}`}></i>
                </div>
                <h4 className="font-bold mb-1">{method.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
