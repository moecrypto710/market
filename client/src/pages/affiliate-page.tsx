import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import CopyLink from "@/components/copy-link";

export default function AffiliatePage() {
  const { user } = useAuth();
  
  const { data: affiliate } = useQuery({
    queryKey: ['/api/affiliate'],
  });
  
  const { data: promotedProducts } = useQuery<Product[]>({
    queryKey: ['/api/products/promoted'],
  });
  
  const earnings = affiliate?.earnings || 0;
  const conversions = affiliate?.conversions || 0;
  
  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">التسويق بالعمولة</h2>
      
      {/* Affiliate Dashboard */}
      <div className="bg-black rounded-lg p-6 mb-6 border border-white/10">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <span className="text-white text-2xl font-bold block">${earnings}</span>
            <p className="text-sm text-white/70">الأرباح هذا الشهر</p>
          </div>
          <div className="text-center">
            <span className="text-white text-2xl font-bold block">{conversions}</span>
            <p className="text-sm text-white/70">التحويلات الناجحة</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button className="bg-black text-white py-2 px-4 rounded-lg font-bold border border-[#00ffcd] hover:bg-[#00ffcd]/10 transition duration-300">
            <i className="fas fa-money-bill-wave ml-2"></i>
            سحب الأرباح
          </button>
          <button className="bg-black text-white py-2 px-4 rounded-lg font-bold border border-white hover:bg-white/10 transition duration-300">
            <i className="fas fa-chart-line ml-2"></i>
            تقارير مفصلة
          </button>
        </div>
      </div>
      
      {/* Affiliate Link */}
      <div className="bg-black rounded-lg p-4 mb-6 border border-white/10">
        <h3 className="text-lg font-bold mb-2 text-white">رابط الإحالة الخاص بك</h3>
        <CopyLink affiliateCode={user?.affiliateCode || ''} />
        <div className="flex justify-between mt-3">
          <button className="flex items-center justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-white/5 transition duration-300 w-[48%] border border-white/20">
            <i className="fab fa-facebook-f ml-2"></i>
            فيسبوك
          </button>
          <button className="flex items-center justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-white/5 transition duration-300 w-[48%] border border-white/20">
            <i className="fab fa-twitter ml-2"></i>
            تويتر
          </button>
        </div>
      </div>
      
      {/* Promoted Products */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">المنتجات الرائجة للترويج</h3>
        
        <div className="space-y-4">
          {promotedProducts?.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-20 h-20 object-cover rounded-lg ml-4" 
              />
              <div className="flex-1">
                <h4 className="font-bold">{product.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="text-[#ffeb3b] font-bold">{product.commissionRate}%</span>
                    <span className="text-sm text-white/70"> عمولة</span>
                  </div>
                  <button className="bg-[#5e35b1] px-3 py-1 rounded-full text-sm hover:bg-[#3b2fa3] transition duration-300">
                    ترويج
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Affiliate Tips */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">نصائح لزيادة الأرباح</h3>
        <ul className="space-y-2 list-disc list-inside text-white/90">
          <li>استخدم وسائل التواصل الاجتماعي للترويج للمنتجات</li>
          <li>أنشئ محتوى مراجعة للمنتجات المميزة</li>
          <li>استهدف المناسبات والمواسم للترويج للمنتجات المناسبة</li>
          <li>تابع الإحصائيات وركز على المنتجات الأكثر تحويلاً</li>
        </ul>
      </div>
    </div>
  );
}
