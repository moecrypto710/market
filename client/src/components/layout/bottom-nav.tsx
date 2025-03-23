import { useLocation, Link } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "الرئيسية", icon: "home" },
    { path: "/rewards", label: "المكافآت", icon: "gift" },
    { path: "/store-rental", label: "متاجر", icon: "store" },
    { path: "/affiliate", label: "الإحالة", icon: "users" },
    { path: "/account", label: "حسابي", icon: "user" }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/20 flex justify-around py-3 z-50">
      {navItems.map((item) => (
        <div key={item.path} className="flex flex-col items-center">
          <Link 
            href={item.path}
            className={`flex flex-col items-center ${location === item.path ? 'text-white' : 'text-white/60 hover:text-white transition'}`}
          >
            <i className={`fas fa-${item.icon} text-lg`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        </div>
      ))}
    </nav>
  );
}
