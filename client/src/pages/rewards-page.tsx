import { useQuery } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { RewardCard } from "@/components/reward-card";
import { useAuth } from "@/hooks/use-auth";

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
      title: "إتمام عمليات الشراء",
      description: "10 نقاط لكل $1 تنفقه",
      icon: "shopping-cart"
    },
    {
      id: 2,
      title: "دعوة أصدقاء",
      description: "200 نقطة لكل صديق يسجل",
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
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">برنامج المكافآت</h2>
      
      {/* Current Points */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <span className="text-[#ffeb3b] text-4xl font-bold block">{currentPoints}</span>
          <p className="text-sm text-white/70">نقاط المكافآت الخاصة بك</p>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>المستوى التالي:</span>
            <span>{nextRewardLevel} نقطة</span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-white/20" />
        </div>
        
        <button className="w-full bg-[#ffeb3b] text-[#2a1f6f] py-2 rounded-lg font-bold hover:bg-[#fdd835] transition duration-300">
          استبدال النقاط
        </button>
      </div>
      
      {/* Available Rewards */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">المكافآت المتاحة</h3>
        
        <div className="space-y-4">
          {rewards?.map((reward) => (
            <RewardCard key={reward.id} reward={reward} userPoints={currentPoints} />
          ))}
        </div>
      </div>
      
      {/* How to Earn */}
      <div>
        <h3 className="text-lg font-bold mb-4">كيف تكسب النقاط</h3>
        <div className="space-y-3">
          {earningMethods.map((method) => (
            <div key={method.id} className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center">
              <div className="bg-[#7e57c2]/50 w-10 h-10 rounded-full flex items-center justify-center ml-4">
                <i className={`fas fa-${method.icon}`}></i>
              </div>
              <div>
                <h4 className="font-bold">{method.title}</h4>
                <p className="text-sm text-white/70">{method.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
