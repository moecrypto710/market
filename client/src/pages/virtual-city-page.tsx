import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import CityBuilder from '@/components/city-builder';
import BuildingShowcase from '@/components/building-showcase';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

/**
 * Virtual City Page
 * 
 * This page displays a 3D virtual city with interactive buildings
 * where users can explore and shop in different stores.
 */
export default function VirtualCityPage() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">المدينة الافتراضية</h1>
        <p className="mt-2 text-gray-600">
          استمتع بتجربة تسوق فريدة في مدينة افتراضية ثلاثية الأبعاد
        </p>
      </div>
      
      {/* Main city experience */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">استكشف المدينة</h2>
        <div className="bg-slate-900 rounded-xl p-2 overflow-hidden shadow-xl">
          <CityBuilder />
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <Button variant="outline">تعليمات الاستخدام</Button>
          <Button>
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
      
      {/* Buildings Showcase */}
      <div className="mb-10">
        <BuildingShowcase />
      </div>
      
      {/* City information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-3">كيفية التنقل</h3>
          <ul className="space-y-2 list-disc mr-6">
            <li>استخدم مفاتيح الأسهم للتحرك</li>
            <li>انقر واسحب الماوس للنظر حولك</li>
            <li>انقر على المباني للدخول إليها</li>
            <li>للأجهزة اللوحية والجوالات، استخدم أزرار التحكم المرئية</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-3">المعالم الرئيسية</h3>
          <ul className="space-y-2 list-disc mr-6">
            <li>وكالة السفر العربي</li>
            <li>متجر الملابس الفاخرة</li>
            <li>متجر الإلكترونيات والتقنية</li>
            <li>البوابة الرئيسية</li>
            <li>المجمع التجاري</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-3">نصائح للتجربة المثالية</h3>
          <ul className="space-y-2 list-disc mr-6">
            <li>استخدم متصفح حديث للتجربة الأفضل</li>
            <li>فعّل خاصية WebGL في متصفحك</li>
            <li>يفضل استخدام شاشة كبيرة للاستمتاع بالتفاصيل</li>
            <li>استكشف جميع المباني للحصول على تجربة كاملة</li>
          </ul>
        </div>
      </div>
    </div>
  );
}