import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AvatarProps {
  id: number;
  name: string;
  image: string;
  personality: string;
  favoriteCategory: string;
  personalStyle: string;
  benefits: string[];
  color?: string;
  specialFeature?: string;
  specialFeatureDescription?: string;
}

interface AvatarSelectionProps {
  avatars: AvatarProps[];
  onSelectAvatar: (avatar: AvatarProps) => void;
}

export default function AvatarSelection({ avatars, onSelectAvatar }: AvatarSelectionProps) {
  const { toast } = useToast();
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-gradient-to-tr from-[#2a1f6f] to-[#5e35b1]/80 rounded-lg p-8 max-w-3xl w-full shadow-xl shadow-purple-900/20">
        <h2 className="text-3xl font-bold text-center mb-2 text-white">اختر شخصيتك في مول أمريكي</h2>
        <p className="text-white/60 text-center mb-4">كل شخصية تمتلك قدرات وميزات فريدة تناسب أسلوبك في التسوق</p>
        
        {/* AI Assistant Tips */}
        <div className="mb-6 p-3 bg-gradient-to-r from-[#00ffcd]/10 to-[#ff00aa]/10 rounded-lg border border-[#00ffcd]/20 flex items-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00ffcd] to-[#ff00aa] flex-shrink-0 flex items-center justify-center mr-3 mt-1">
            <i className="fas fa-robot text-black"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#00ffcd] mb-1">نصائح المساعد الذكي</h3>
            <p className="text-xs text-white/80 leading-relaxed">
              اختر شخصية تناسب اهتماماتك للحصول على توصيات ومزايا مخصصة. كل شخصية لديها قدرة خاصة تساعدك في التسوق والاستمتاع بميزات المول بطريقة مختلفة. يمكنك التحرك باستخدام الأسهم أو سحب الشخصية بالماوس. للمساعدة، انقر على أيقونة المساعد الذكي.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {avatars.map(avatar => (
            <div 
              key={avatar.id}
              className="bg-black/30 rounded-xl p-4 cursor-pointer transition-all duration-300 
                         hover:bg-black/50 hover:scale-[1.03] hover:shadow-lg border border-white/5 
                         hover:border-[#ffeb3b]/30 flex flex-col items-center"
              style={{
                boxShadow: avatar.color ? `0 4px 15px -4px ${avatar.color}20` : undefined
              }}
              onClick={() => {
                onSelectAvatar(avatar);
                
                // Show welcome toast with tips
                toast({
                  title: `أهلاً ${avatar.name}!`,
                  description: avatar.specialFeature 
                    ? `استخدم قدرتك الخاصة "${avatar.specialFeature}" في تجربة التسوق! استخدم الأسهم للتنقل.` 
                    : "استخدم الأسهم للتنقل في المول، وانقر على المنتجات لاستعراضها. المساعد الذكي جاهز لمساعدتك!",
                  duration: 5000,
                });
              }}
            >
              <div 
                className="w-24 h-24 mb-3 rounded-full overflow-hidden shadow-lg"
                style={{
                  background: avatar.color ? `linear-gradient(135deg, ${avatar.color}15, ${avatar.color}05)` : undefined,
                  border: avatar.color ? `2px solid ${avatar.color}30` : '2px solid rgba(255,255,255,0.2)'
                }}
              >
                <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-lg mb-1">{avatar.name}</h3>
              <p className="text-xs text-white/70 text-center mb-2">{avatar.personality}</p>
              
              {avatar.specialFeature && (
                <div 
                  className="w-full p-2 rounded-md mb-2 text-center text-xs"
                  style={{
                    background: avatar.color ? `${avatar.color}10` : 'rgba(255,255,255,0.05)',
                    color: avatar.color || '#00ffcd',
                    border: avatar.color ? `1px solid ${avatar.color}20` : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <strong>{avatar.specialFeature}</strong>
                </div>
              )}
              
              <div className="mt-2 text-xs flex items-center">
                <span 
                  className="px-2 py-1 rounded-full"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    color: avatar.color || '#ffeb3b',
                    border: avatar.color ? `1px solid ${avatar.color}30` : '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {avatar.favoriteCategory === 'electronics' ? 'الإلكترونيات 💻' :
                   avatar.favoriteCategory === 'clothing' ? 'الأزياء 👗' :
                   avatar.favoriteCategory === 'home' ? 'المنزل 🏠' :
                   avatar.favoriteCategory === 'sports' ? 'الرياضة 🏅' : 
                   avatar.favoriteCategory === 'vip-lounge' ? 'كبار الزوار 👑' :
                   'متنوع ✨'}
                </span>
              </div>
              
              <button className="mt-4 w-full py-2 bg-[#ffeb3b] text-[#2a1f6f] rounded-lg font-bold text-sm hover:bg-[#ffeb3b]/90 transition">
                اختيار
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center text-sm text-white/60 mt-8">
          سيتم توجيهك إلى المول الافتراضي بعد اختيار الشخصية
        </div>
      </div>
    </div>
  );
}