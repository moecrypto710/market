import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AvatarSelection, { AvatarProps } from "@/components/avatar-selection";

// Pre-defined avatar data
const AVATARS = [
  { 
    id: 1, 
    name: "عمر",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Omar&backgroundColor=b6e3f4",
    personality: "مهتم بالتكنولوجيا والإلكترونيات الحديثة",
    favoriteCategory: "electronics",
    personalStyle: "عصري تقني",
    benefits: [
      "تخفيضات إضافية 10% على الإلكترونيات",
      "وصول حصري لآخر التقنيات",
    ],
    color: "#03a9f4",
    specialFeature: "تقني",
    specialFeatureDescription: "قدرة خاصة على فهم وتجربة المنتجات التقنية المعقدة"
  },
  { 
    id: 2, 
    name: "ليلى",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Layla&backgroundColor=ffcdd2",
    personality: "عاشقة الموضة والأزياء العصرية",
    favoriteCategory: "clothing",
    personalStyle: "أنيق عصري",
    benefits: [
      "تخفيضات إضافية 15% على الملابس",
      "تجربة الملابس افتراضياً قبل الشراء",
    ],
    color: "#e91e63",
    specialFeature: "ذوق رفيع",
    specialFeatureDescription: "قدرة خاصة على اكتشاف أفضل الصفقات في الأزياء والإكسسوارات"
  },
  { 
    id: 3, 
    name: "محمد",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Mohammed&backgroundColor=dcedc8",
    personality: "مهتم بالرياضة واللياقة البدنية",
    favoriteCategory: "sports",
    personalStyle: "رياضي",
    benefits: [
      "تخفيضات إضافية 12% على المنتجات الرياضية",
      "وصول حصري لمجموعات محدودة",
    ],
    color: "#4caf50",
    specialFeature: "نشيط",
    specialFeatureDescription: "قدرة على التحرك بسرعة أكبر في المول الافتراضي"
  },
  { 
    id: 4, 
    name: "نور",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Noor&backgroundColor=ffe0b2",
    personality: "مهتمة بالديكور المنزلي والتصميم",
    favoriteCategory: "home",
    personalStyle: "كلاسيكي أنيق",
    benefits: [
      "تخفيضات إضافية 10% على منتجات المنزل",
      "استشارات تصميم منزلي مجانية",
    ],
    color: "#ff9800",
    specialFeature: "تصميم",
    specialFeatureDescription: "قدرة خاصة على رؤية كيف ستبدو المنتجات في بيئات مختلفة"
  },
  { 
    id: 5, 
    name: "أحمد",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Ahmed&backgroundColor=bbdefb",
    personality: "باحث عن الصفقات والعروض المميزة",
    favoriteCategory: "all",
    personalStyle: "عملي مريح",
    benefits: [
      "يكشف الخصومات المخفية",
      "إشعارات حصرية بالعروض الجديدة",
    ],
    color: "#ffeb3b",
    specialFeature: "صائد الصفقات",
    specialFeatureDescription: "قدرة خاصة على اكتشاف أفضل العروض والتخفيضات في المول"
  },
];

interface AvatarSelectionScreenProps {
  onSelectAvatar: (avatar: AvatarProps) => void;
}

export default function AvatarSelectionScreen({ onSelectAvatar }: AvatarSelectionScreenProps) {
  const { toast } = useToast();

  const handleAvatarSelect = (avatar: AvatarProps) => {
    onSelectAvatar(avatar);
    toast({
      title: `مرحبا ${avatar.name}!`,
      description: `لقد اخترت ${avatar.name} - ${avatar.personality}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center">
      <div className="w-full max-w-4xl bg-black/60 border border-white/20 rounded-xl p-8 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold mb-2">اختر الشخصية الافتراضية</h2>
        <p className="text-white/70 mb-6">كل شخصية لديها قدرات خاصة ومميزات فريدة في المول الافتراضي</p>
        
        <AvatarSelection 
          avatars={AVATARS} 
          onSelectAvatar={handleAvatarSelect} 
        />
      </div>
    </div>
  );
}