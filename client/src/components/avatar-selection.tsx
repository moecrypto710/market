import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export interface AvatarProps {
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
  const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  
  // Particles animation setup
  const [particles, setParticles] = useState<{ x: number, y: number, size: number, speed: number, color: string }[]>([]);
  
  useEffect(() => {
    // Create holographic particles effect
    const randomParticles = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      speed: 0.5 + Math.random() * 1.5,
      color: [
        '#d946ef80', // Fuchsia
        '#ffffff30', // White
        '#0ea5e980', // Cyan
        '#f9731680'  // Orange
      ][Math.floor(Math.random() * 4)]
    }));
    
    setParticles(randomParticles);
  }, []);
  
  // Handle the avatar selection with animation
  const handleSelectAvatar = (avatar: AvatarProps) => {
    setSelectedAvatar(avatar.id);
    setAnimating(true);
    
    // Delay actual selection to allow for animation
    setTimeout(() => {
      onSelectAvatar(avatar);
      
      toast({
        title: `تم اختيار ${avatar.name}!`,
        description: `ميزة خاصة: ${avatar.specialFeature}. استخدم الأسهم للتنقل في المول.`,
        duration: 5000,
      });
    }, 1200);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Futuristic background with grid and particles */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#090418] to-[#0e0526]">
        {/* Grid floor */}
        <div className="absolute inset-x-0 bottom-0 h-[40vh] perspective-[1000px]">
          <div 
            className="absolute inset-0 transform-gpu"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(217, 70, 239, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(217, 70, 239, 0.2) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              transform: 'rotateX(60deg)',
              transformOrigin: 'center bottom',
            }}
          ></div>
        </div>
        
        {/* Floating particles */}
        {particles.map((particle, index) => (
          <div 
            key={index}
            className="absolute rounded-full animate-float1"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDuration: `${8 + particle.speed}s`,
              opacity: 0.7,
              filter: 'blur(1px)'
            }}
          ></div>
        ))}
        
        {/* Ambient glow */}
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(217, 70, 239, 0.4) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(14, 165, 233, 0.4) 0%, transparent 60%)'
             }}></div>
      </div>
      
      {/* Avatar selection interface */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header with holographic effect */}
        <div className="relative mb-10 text-center">
          <h2 className="text-5xl font-bold mb-3 text-transparent bg-clip-text holographic-bg"
              style={{
                backgroundImage: 'linear-gradient(to right, #d946ef, #ffffff, #d946ef)',
                backgroundSize: '200% auto',
                animation: 'holographic-move 6s linear infinite',
                WebkitBackgroundClip: 'text'
              }}>
            اختر شخصيتك الافتراضية
          </h2>
          
          <div className="w-24 h-1 mx-auto mb-4 rounded-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"></div>
          
          <p className="text-white/80 text-lg">
            اختر شخصية للتجول في مول أمريكي الافتراضي
          </p>
        </div>
        
        {/* Simple instruction panel */}
        <div className="holographic-container max-w-3xl mx-auto mb-8 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-info text-white text-xs"></i>
            </div>
            <p className="text-white/80 text-sm">
              كل شخصية لديها قدرات خاصة تساعدك في التسوق. اختر الشخصية التي تناسب اهتماماتك للحصول على تجربة مخصصة.
            </p>
          </div>
        </div>
        
        {/* Avatar grid - simplified and more futuristic */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mx-auto max-w-5xl">
          {avatars.map(avatar => (
            <div 
              key={avatar.id}
              className={`
                relative transform perspective-[1000px] cursor-pointer group
                transition-all duration-500 hover:scale-105
                ${selectedAvatar === avatar.id ? 'scale-110 z-10' : ''}
                ${animating && selectedAvatar === avatar.id ? 'animate-zoom-in' : ''}
              `}
              style={{
                transform: hoveredAvatar === avatar.id ? 'rotateY(10deg)' : 'rotateY(0deg)',
                transformStyle: 'preserve-3d',
              }}
              onClick={() => !animating && handleSelectAvatar(avatar)}
              onMouseEnter={() => setHoveredAvatar(avatar.id)}
              onMouseLeave={() => setHoveredAvatar(null)}
            >
              {/* Card container */}
              <div className="relative overflow-hidden futuristic-panel h-72 flex flex-col items-center p-5">
                {/* Holographic background shimmer */}
                <div className="absolute inset-0 opacity-20 holographic-bg rounded-xl overflow-hidden"></div>
                
                {/* Scanline effect */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, transparent 50%, rgba(217, 70, 239, 0.2) 50%, transparent 50.5%)',
                    backgroundSize: '100% 8px',
                    animation: 'scanline 8s linear infinite',
                    pointerEvents: 'none'
                  }}
                ></div>
                
                {/* Avatar image with glow effect */}
                <div className="relative w-24 h-24 mb-4">
                  {/* Ambient glow */}
                  <div 
                    className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, ${avatar.color || '#d946ef'}70 0%, transparent 70%)`,
                      filter: 'blur(10px)',
                    }}
                  ></div>
                  
                  {/* Holographic ring */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:animate-spin-slow"
                    style={{ transform: 'scale(1.15)' }}
                  ></div>
                  
                  {/* Avatar image */}
                  <div 
                    className="w-full h-full rounded-full overflow-hidden border-2"
                    style={{
                      borderColor: avatar.color || '#d946ef',
                      boxShadow: `0 0 15px ${avatar.color || '#d946ef'}50`
                    }}
                  >
                    <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* Avatar details - simplified */}
                <h3 className="text-2xl font-bold mb-2 text-white">{avatar.name}</h3>
                
                {/* Special feature chip */}
                <div 
                  className="px-3 py-1 rounded-full text-xs mb-3"
                  style={{
                    backgroundColor: `${avatar.color || '#d946ef'}20`,
                    borderColor: `${avatar.color || '#d946ef'}40`,
                    color: 'white'
                  }}
                >
                  {avatar.specialFeature}
                </div>
                
                {/* Category indicator */}
                <div className="mb-auto">
                  <span 
                    className="px-2 py-0.5 rounded-md text-xs bg-black/30 border border-white/10"
                    style={{ color: avatar.color || '#d946ef' }}
                  >
                    {avatar.favoriteCategory === 'electronics' ? 'الإلكترونيات 💻' :
                     avatar.favoriteCategory === 'clothing' ? 'الأزياء 👗' :
                     avatar.favoriteCategory === 'home' ? 'المنزل 🏠' :
                     avatar.favoriteCategory === 'sports' ? 'الرياضة 🏅' : 'متنوع ✨'}
                  </span>
                </div>
                
                {/* Select button - modern and cleaner */}
                <button 
                  className="mt-4 w-full py-2 rounded-lg font-bold text-sm transition-all duration-300 relative overflow-hidden group-hover:shadow-lg"
                  style={{
                    background: `linear-gradient(45deg, ${avatar.color || '#d946ef'}, ${avatar.color === '#5e35b1' ? '#3f51b5' : '#0ea5e9'})`,
                    boxShadow: `0 4px 15px -3px ${avatar.color || '#d946ef'}40`
                  }}
                >
                  {/* Button shine effect */}
                  <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100">
                    <span 
                      className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan"
                      style={{ animationDuration: '1.5s' }}
                    ></span>
                  </span>
                  
                  <span className="relative z-10">اختيار</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}