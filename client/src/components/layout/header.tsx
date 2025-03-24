import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function Header() {
  const isMobile = useIsMobile();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-black text-white text-center py-4 px-2 sticky top-0 z-50 border-b border-gray-700/20 shadow-md shadow-purple-900/10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0"></div>
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(124, 58, 237, 0.15), transparent 70%)'
        }}></div>
      </div>

      <div className="relative z-10">
        <h1 className="text-2xl font-bold">
          مدينة أمريكي
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mx-1"></span>
        </h1>
        <p className="text-sm text-white/70">مدينة التسوق الافتراضية المتكاملة</p>
      </div>
      
      <div 
        className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer transform transition-transform hover:scale-105"
      >
        <Link href="/virtual-city">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
            <i className="fas fa-shopping-cart ml-1"></i> {isMobile ? "تسوق" : "تسوق الآن"}
          </span>
        </Link>
      </div>
      
      <div 
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transform transition-transform hover:scale-105"
      >
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">
              {isMobile ? "" : "مرحباً، "}{user.username || 'زائر'}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg"
              disabled={logoutMutation.isPending}
            >
              <i className="fas fa-sign-out-alt ml-1"></i> {isMobile ? "" : "خروج"}
            </button>
          </div>
        ) : (
          <Link href="/auth">
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
              <i className="fas fa-user ml-1"></i> {isMobile ? "دخول" : "تسجيل دخول"}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
