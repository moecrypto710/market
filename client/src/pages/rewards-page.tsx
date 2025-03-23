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
      <h2 className="text-2xl font-bold mb-6 text-white">برنامج المكافآت</h2>
      
      {/* Current Points - Styled with black and white theme */}
      <Card className="mb-6 bg-black border border-white/30 text-white">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <span className="text-5xl font-bold block text-white tracking-wider">{currentPoints}</span>
            <p className="text-sm text-white/70 mt-2">نقاط المكافآت الحالية</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2 text-white/70">
              <span>0 نقطة</span>
              <span>المستوى التالي: {nextRewardLevel} نقطة</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full">
              <div 
                className="h-2 rounded-full bg-white transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Available Rewards - Grid Layout */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 text-white flex items-center">
          <span className="border-b-2 border-white pb-1">المكافآت المتاحة</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards?.map((reward) => (
            <RewardCard key={reward.id} reward={reward} userPoints={currentPoints} />
          ))}
        </div>
      </div>
      
      {/* How to Earn - Styled with black and white theme */}
      <div className="bg-black border border-white/30 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-6 text-white flex items-center">
          <span className="border-b-2 border-white pb-1">كيف تكسب النقاط</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {earningMethods.map((method) => (
            <Card key={method.id} className="bg-black border border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <div className="bg-black border border-white/70 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`fas fa-${method.icon} text-white text-xl`}></i>
                </div>
                <h4 className="font-bold mb-2 text-lg">{method.title}</h4>
                <p className="text-sm text-white/70">{method.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
