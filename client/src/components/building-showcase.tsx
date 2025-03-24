import React, { useState } from 'react';
import ThreeBuildingModel from './three-building-model';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * BuildingShowcase Component
 * 
 * Displays interactive 3D building models to showcase different store types
 * in the virtual city.
 */
export default function BuildingShowcase() {
  const isMobile = useIsMobile();
  const [selectedBuilding, setSelectedBuilding] = useState<'travel' | 'clothing' | 'electronics'>('travel');
  
  const buildings = [
    {
      id: 'travel',
      name: 'وكالة السفر العربي',
      description: 'وكالة متخصصة في تنظيم الرحلات السياحية والسفر بجميع أنحاء العالم',
      color: '#2563eb',
      features: ['حجز تذاكر طيران', 'باقات سياحية متكاملة', 'خدمات VIP'],
      renderOrder: 1
    },
    {
      id: 'clothing',
      name: 'متجر الملابس الفاخرة',
      description: 'متجر يقدم أحدث خطوط الأزياء والموضة من ماركات عالمية',
      color: '#f59e0b',
      features: ['أحدث صيحات الموضة', 'ماركات عالمية', 'غرفة قياس افتراضية'],
      renderOrder: 2
    },
    {
      id: 'electronics',
      name: 'متجر الإلكترونيات والتقنية',
      description: 'متجر متخصص بأحدث الأجهزة الإلكترونية والهواتف الذكية',
      color: '#10b981',
      features: ['أجهزة ذكية', 'ملحقات تقنية', 'ضمان شامل'],
      renderOrder: 3
    }
  ];
  
  return (
    <div className="w-full bg-slate-900 p-4 md:p-6 rounded-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">استكشف المباني ثلاثية الأبعاد</h2>
        <p className="text-slate-300 mt-2">اكتشف المحلات التجارية المتوفرة في المدينة الافتراضية</p>
      </div>
      
      <Tabs defaultValue="travel" onValueChange={(value) => setSelectedBuilding(value as any)}>
        <div className="mb-4">
          <TabsList className="w-full bg-slate-800 p-1">
            {buildings.map((building) => (
              <TabsTrigger
                key={building.id}
                value={building.id}
                className="flex-1 data-[state=active]:bg-slate-700"
              >
                {building.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {buildings.map((building) => (
          <TabsContent key={building.id} value={building.id} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* 3D Building View */}
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  <ThreeBuildingModel
                    type={building.id as any}
                    color={building.color}
                    modelHeight={350}
                    showControls={true}
                  />
                </CardContent>
              </Card>
              
              {/* Building Details */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{building.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-slate-700 text-white border-slate-600"
                    >
                      {building.id === 'travel' ? 'سفر وسياحة' : 
                       building.id === 'clothing' ? 'أزياء وموضة' : 
                       'إلكترونيات'}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-300">
                    {building.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">المميزات</h4>
                      <ul className="grid grid-cols-1 gap-2">
                        {building.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-white">
                            <span className="ml-2 text-xs">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4">
                      <Button className="w-full" style={{ backgroundColor: building.color }}>
                        دخول المبنى
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Interactive note */}
      <div className="mt-6 text-center text-sm text-slate-400">
        <p>يمكنك النقر على المباني لاستكشافها داخل المدينة الافتراضية</p>
      </div>
    </div>
  );
}