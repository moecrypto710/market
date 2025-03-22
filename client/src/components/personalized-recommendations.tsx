import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PersonalizedRecommendationsProps {
  maxItems?: number;
  viewedProducts?: number[];
}

export default function PersonalizedRecommendations({
  maxItems = 4,
  viewedProducts = []
}: PersonalizedRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  
  // Fetch all products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Generate personalized recommendations based on user history and viewed products
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // In a real app, this would be a server-side API call with machine learning
    // For now, we'll simulate personalization with some basic logic
    
    const generateRecommendations = () => {
      // 1. Filter out products the user has already viewed
      const nonViewedProducts = products.filter(product => 
        !viewedProducts.includes(product.id)
      );
      
      // 2. Generate weighted scores for each product based on user's points and categories
      const scoredProducts = nonViewedProducts.map(product => {
        let score = 0;
        
        // Higher commission products get higher scores (promoted items)
        score += product.commissionRate * 2;
        
        // VR-enabled products get a boost if the user has high points (experienced users)
        if (product.vrEnabled && user && user.points && user.points > 500) {
          score += 20;
        }
        
        // Preferred category matching based on user ID (simulated preference)
        const userID = user?.id ?? 0;
        const simulatedPreferredCategories = [
          userID % 2 === 0 ? "electronics" : "clothing",
          userID % 3 === 0 ? "home" : "sports"
        ];
        
        if (simulatedPreferredCategories.includes(product.category)) {
          score += 15;
        }
        
        // Add a small random factor
        score += Math.random() * 10;
        
        return { product, score };
      });
      
      // 3. Sort by score and take top N
      const topRecommendations = scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems)
        .map(item => item.product);
      
      setRecommendations(topRecommendations);
    };
    
    generateRecommendations();
  }, [products, user, viewedProducts, maxItems]);
  
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">مخصص لك</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(maxItems).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!recommendations.length) {
    return null;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">مخصص لك</h2>
        <Button variant="link" className="text-[#fff59d] text-sm p-0">
          تحديث
          <i className="fas fa-sync-alt mr-2 text-xs"></i>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="bg-white/5 rounded-lg p-4 mt-3">
        <div className="text-sm text-white/70 flex items-center">
          <i className="fas fa-lightbulb text-[#ffeb3b] mr-2"></i>
          <span>تم اختيار هذه المنتجات بناءً على تفضيلاتك وسلوك التصفح الخاص بك.</span>
        </div>
      </div>
    </div>
  );
}