import { useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", { productId: product.id, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "تمت الإضافة للسلة",
        description: `تمت إضافة ${product.name} إلى سلة التسوق.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden w-64 flex-shrink-0">
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
        {product.vrEnabled && (
          <div className="absolute top-2 right-2 bg-[#ffeb3b] text-[#2a1f6f] rounded-full p-2">
            <i className="fas fa-vr-cardboard"></i>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold mb-1">{product.name}</h3>
        <p className="text-sm text-neutral-200 mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#fff59d]">${(product.price / 100).toFixed(2)}</span>
          <button 
            className="bg-[#5e35b1] hover:bg-[#3b2fa3] rounded-full p-2 transition duration-300"
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
          >
            <i className="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
