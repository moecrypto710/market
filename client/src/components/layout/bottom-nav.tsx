import { useLocation, Link } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "الرئيسية", icon: "home" },
    { path: "/business-world", label: "بلدة الأمريكي", icon: "building" },
    { path: "/rewards", label: "المكافآت والعمولة", icon: "award" },
    { path: "/services", label: "خدمات", icon: "concierge-bell" },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 flex justify-around py-3 z-50 shadow-lg shadow-purple-900/10 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent opacity-30"></div>
      
      {navItems.map((item) => (
        <div key={item.path} className="flex flex-col items-center relative z-10">
          <Link 
            href={item.path}
            className={`flex flex-col items-center transition-all duration-200 ${
              location === item.path 
                ? 'text-white scale-110' 
                : 'text-white/60 hover:text-white hover:scale-105'
            }`}
          >
            {location === item.path && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
            <div className={`p-2 rounded-full ${location === item.path ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20' : ''}`}>
              <i className={`fas fa-${item.icon} text-lg ${location === item.path ? 'animate-pulse-slow' : ''}`}></i>
            </div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        </div>
      ))}
    </nav>
  );
}
