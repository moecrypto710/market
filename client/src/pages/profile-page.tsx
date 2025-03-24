import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Since we have a guest login system, we need to handle default values
  const fullName = user.fullName || user.username || "زائر";
  const email = user.email || "guest@amrikyy.com";
  const points = user.points || 0;
  const membershipTier = user.membershipTier || "عادي";
  const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-SA') : "غير متوفر";
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">الملف الشخصي</span>
      </h1>
      
      <div className="max-w-md mx-auto">
        {/* User profile card */}
        <Card className="border-white/10 bg-black/70 backdrop-blur-md shadow-lg overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black opacity-70 pointer-events-none"></div>
          
          <CardHeader className="relative z-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl">
                {fullName.substring(0, 1)}
              </span>
            </div>
            <CardTitle className="text-2xl">{fullName}</CardTitle>
            <CardDescription className="text-white/70">{email}</CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">نقاط الولاء:</span>
              <span className="font-bold text-lg">{points} نقطة</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/70">فئة العضوية:</span>
              <span className="font-bold">
                {membershipTier === "vip" ? "مميز" : 
                 membershipTier === "enterprise" ? "ذهبي" : 
                 membershipTier === "premium" ? "بريميوم" : 
                 membershipTier === "basic" ? "أساسي" : "عادي"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/70">آخر تسجيل دخول:</span>
              <span>{lastLogin}</span>
            </div>
            
            <Separator className="my-4 bg-white/10" />
            
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg">
              <h3 className="font-bold mb-2">حالة العضوية</h3>
              <div className="w-full bg-black/50 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(points / 10, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/70">
                {points >= 1000 ? 
                  "لقد وصلت إلى أعلى مستوى من العضوية!" : 
                  `احتاج إلى ${1000 - points} نقطة إضافية للترقية إلى المستوى التالي`
                }
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="relative z-10 flex justify-center border-t border-white/10 pt-6">
            <Button 
              variant="destructive" 
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="border-white/10 bg-black/50 hover:bg-purple-950/50"
          >
            <i className="fas fa-award mr-2"></i>
            نقاط الولاء والمكافآت
          </Button>
          
          <Button 
            variant="outline"
            className="border-white/10 bg-black/50 hover:bg-purple-950/50"
          >
            <i className="fas fa-history mr-2"></i>
            سجل المشتريات
          </Button>
          
          <Button 
            variant="outline"
            className="border-white/10 bg-black/50 hover:bg-purple-950/50"
          >
            <i className="fas fa-cog mr-2"></i>
            إعدادات الحساب
          </Button>
          
          <Button 
            variant="outline"
            className="border-white/10 bg-black/50 hover:bg-purple-950/50"
          >
            <i className="fas fa-bell mr-2"></i>
            الإشعارات
          </Button>
        </div>
      </div>
    </div>
  );
}