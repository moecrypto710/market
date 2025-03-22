import { useAuth } from "@/hooks/use-auth";
import { useVR } from "@/hooks/use-vr";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { user, logoutMutation } = useAuth();
  const { vrEnabled, gestureControlEnabled, soundEffectsEnabled, toggleVR, toggleGestureControl, toggleSoundEffects } = useVR();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const accountOptions = [
    { id: 1, name: "طلباتي", icon: "shopping-bag" },
    { id: 2, name: "المفضلة", icon: "heart" },
    { id: 3, name: "العناوين", icon: "address-book" },
    { id: 4, name: "طرق الدفع", icon: "credit-card" }
  ];
  
  return (
    <div className="px-4 py-6">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-[#7e57c2] rounded-full mx-auto mb-3 flex items-center justify-center">
          <i className="fas fa-user text-4xl"></i>
        </div>
        <h2 className="text-xl font-bold">{user?.fullName}</h2>
        <p className="text-white/70">{user?.email}</p>
      </div>
      
      {/* Account Options */}
      <div className="space-y-3 mb-6">
        {accountOptions.map(option => (
          <button 
            key={option.id}
            className="w-full bg-white/10 py-3 px-4 rounded-lg flex justify-between items-center hover:bg-white/20 transition duration-300"
          >
            <div className="flex items-center">
              <i className={`fas fa-${option.icon} ml-3 w-6 text-center`}></i>
              <span>{option.name}</span>
            </div>
            <i className="fas fa-chevron-left"></i>
          </button>
        ))}
      </div>
      
      {/* VR Settings */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold mb-3">إعدادات الواقع الافتراضي</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center">
                <i className="fas fa-vr-cardboard ml-2"></i>
                تفعيل وضع الواقع الافتراضي
              </label>
              <Switch checked={vrEnabled} onCheckedChange={toggleVR} />
            </div>
            <div className="text-xs text-white/70">
              يتيح لك تجربة التسوق بشكل افتراضي ثلاثي الأبعاد
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center">
                <i className="fas fa-hand-pointer ml-2"></i>
                إيماءات التحكم
              </label>
              <Switch checked={gestureControlEnabled} onCheckedChange={toggleGestureControl} />
            </div>
            <div className="text-xs text-white/70">
              استخدام حركات اليد للتحكم في تجربة الواقع الافتراضي
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center">
                <i className="fas fa-volume-up ml-2"></i>
                مؤثرات صوتية
              </label>
              <Switch checked={soundEffectsEnabled} onCheckedChange={toggleSoundEffects} />
            </div>
            <div className="text-xs text-white/70">
              تفعيل المؤثرات الصوتية أثناء التجربة الافتراضية
            </div>
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <Button 
        variant="ghost" 
        onClick={handleLogout}
        className="w-full bg-white/10 py-3 rounded-lg flex justify-center items-center font-bold hover:bg-white/20 transition duration-300"
      >
        <i className="fas fa-sign-out-alt ml-2"></i>
        تسجيل الخروج
      </Button>
    </div>
  );
}
