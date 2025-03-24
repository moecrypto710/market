import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import TravelScreen from './travel-screen';
import FlightAttendant from './flight-attendant';
import VirtualFittingRoom from './virtual-fitting-room';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Airplane Building Interior Component
 * 
 * Shows the inside of an airline building with travel information and booking options
 */
export default function AirplaneBuildingInterior() {
  const { toast } = useToast();
  const [selectedDestination, setSelectedDestination] = useState<{
    city: string;
    country: string;
    imageUrl?: string;
    price?: string;
  } | null>(null);
  
  // State to control visibility of the virtual fitting room
  const [showFittingRoom, setShowFittingRoom] = useState(false);

  // Sample outfits for the virtual fitting room based on Unity's VirtualFittingRoom.cs
  const travelOutfits = [
    {
      id: 1,
      name: "قميص سفر أنيق",
      image: "/images/product-templates/adidas-tshirt.svg",
      description: "قميص مريح ومناسب للسفر الطويل",
      price: 450
    },
    {
      id: 2,
      name: "حذاء رياضي للسفر",
      image: "/images/product-templates/nike-shoes.svg",
      description: "حذاء مريح للتنقل في المطارات",
      price: 800
    },
    {
      id: 3,
      name: "بنطلون سفر كلاسيكي",
      image: "/images/product-templates/levis-jeans.svg",
      description: "بنطلون مريح وعملي للسفر طويل المدى",
      price: 650
    }
  ];
  
  // Available destinations for the travel agency
  const destinations = [
    { 
      city: 'دبي', 
      country: 'الإمارات العربية المتحدة', 
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&h=200&q=80',
      price: '5,500'
    },
    { 
      city: 'باريس', 
      country: 'فرنسا',
      imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=300&h=200&q=80',
      price: '8,200'
    },
    { 
      city: 'نيويورك', 
      country: 'الولايات المتحدة',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=300&h=200&q=80',
      price: '10,900'
    },
    { 
      city: 'طوكيو', 
      country: 'اليابان',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&h=200&q=80',
      price: '12,300'
    }
  ];

  // Handle selection of a destination
  const handleSelectDestination = (destination: {
    city: string;
    country: string;
    imageUrl?: string;
    price?: string;
  }) => {
    setSelectedDestination(destination);
    toast({
      title: `تم اختيار ${destination.city}`,
      description: `سعر التذكرة: ${destination.price || 'غير محدد'} جنيه مصري`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-900 to-blue-950 text-white p-6 rounded-lg">
      <div className="text-center mb-8">
        <div className="text-3xl font-bold mb-2 text-yellow-400">السفر العربي</div>
        <div className="text-lg text-blue-200">وكالة السفر الرسمية</div>
        <div className="h-1 w-32 bg-yellow-400 mx-auto my-4"></div>
      </div>
      
      <Tabs defaultValue="destinations" className="flex-1">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="destinations">الوجهات</TabsTrigger>
          <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
          <TabsTrigger value="special">عروض خاصة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="destinations" className="h-[calc(100%-50px)]">
          <div className="bg-blue-800/40 rounded-lg p-4 h-full">
            <h2 className="text-xl font-semibold mb-4">استكشف وجهات السفر</h2>
            
            <div className="flex flex-col space-y-4">
              <div className="flex-1 relative min-h-[300px]">
                <TravelScreen 
                  destinations={destinations}
                  onSelectDestination={handleSelectDestination}
                  isArabic={true}
                />
              </div>
              
              {selectedDestination && (
                <div className="bg-blue-700/50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">{selectedDestination.city}, {selectedDestination.country}</h3>
                  <div className="flex justify-between items-center">
                    <div className="text-yellow-300 font-bold">{selectedDestination.price} جنيه</div>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "تم تأكيد الحجز",
                          description: `تم حجز رحلة إلى ${selectedDestination.city} بنجاح!`,
                        });
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      تأكيد الحجز
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings">
          <div className="bg-blue-800/40 rounded-lg p-4 h-full">
            <h2 className="text-xl font-semibold mb-4">حجوزاتك الحالية</h2>
            
            <div className="text-center text-blue-300 py-8">
              ليس لديك أي حجوزات حالية.
            </div>
            
            <Button 
              onClick={() => {
                toast({
                  title: "الانتقال إلى قسم الوجهات",
                  description: "استكشف وجهات جديدة لرحلتك القادمة!"
                });
              }}
              variant="outline"
              className="w-full mt-4 border-blue-400 text-blue-200"
            >
              حجز رحلة جديدة
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="special">
          <div className="bg-blue-800/40 rounded-lg p-4 h-full">
            <h2 className="text-xl font-semibold mb-4">عروض وخصومات خاصة</h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
                <div className="font-bold text-yellow-300 mb-1">عرض الصيف</div>
                <p className="text-sm text-blue-100">خصم 15% على جميع الرحلات إلى أوروبا</p>
              </div>
              
              <div className="bg-blue-600/30 p-3 rounded-lg border border-blue-400/30">
                <div className="font-bold text-blue-300 mb-1">العائلات</div>
                <p className="text-sm text-blue-100">الأطفال تحت سن 12 بنصف السعر</p>
              </div>
              
              <div className="bg-green-600/20 p-3 rounded-lg border border-green-500/30">
                <div className="font-bold text-green-300 mb-1">المسافر الدائم</div>
                <p className="text-sm text-blue-100">اكسب نقاط مع كل رحلة واحصل على تذاكر مجانية</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Flight Attendant component based on Unity's FlightAttendant.cs */}
      <div className="relative">
        <FlightAttendant 
          position={{ x: 20, y: 10 }}
          scale={1.2}
          customDialogues={[
            "مرحبًا بكم في السفر العربي!",
            "هل تحتاج إلى مساعدة في اختيار وجهتك؟",
            "يمكنك تجربة ملابس السفر الخاصة بنا قبل رحلتك!"
          ]}
          onDialogueComplete={() => {
            toast({
              title: "شكراً لتحدثك مع مضيفة الطيران",
              description: "يمكنك التواصل معها في أي وقت للمساعدة."
            });
          }}
          onTryClothes={() => setShowFittingRoom(true)}
        />
      </div>
      
      {/* Virtual Fitting Room based on Unity's VirtualFittingRoom.cs */}
      {showFittingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl h-[80vh] overflow-hidden rounded-lg shadow-xl relative">
            <VirtualFittingRoom 
              outfits={travelOutfits}
              onOutfitSelected={(outfit) => {
                toast({
                  title: `تم اختيار ${outfit.name}`,
                  description: "يمكنك شراء هذا المنتج قبل رحلتك!"
                });
              }}
            />
            
            <button 
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
              onClick={() => setShowFittingRoom(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center text-sm text-blue-300">
        <div>رقم الهاتف: 1234-567-8910+</div>
        <div>ساعات العمل: 9 صباحًا - 9 مساءً</div>
        
        {/* Button to open virtual fitting room */}
        <Button 
          variant="outline" 
          size="sm"
          className="border-yellow-400 text-yellow-400 hover:bg-blue-900/50"
          onClick={() => setShowFittingRoom(true)}
        >
          تجربة ملابس السفر
        </Button>
      </div>
    </div>
  );
}