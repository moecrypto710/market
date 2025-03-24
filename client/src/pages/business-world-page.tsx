import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVR } from "@/hooks/use-vr";
import { useToast } from "@/hooks/use-toast";
import PartnershipOffers from "@/components/partnership-offers";
import { 
  Plane, Building, Phone, ShoppingBag, MapPin, ChevronRight, 
  Star, CreditCard, Calendar, Users, BriefcaseBusiness, Handshake, 
  GraduationCap, Video, Lightbulb, Globe, CircleDollarSign, Rocket,
  LifeBuoy, LucideProps, AreaChart, LineChart, BarChart, PieChart
} from "lucide-react";
import confetti from 'canvas-confetti';

// Virtual Town Component
export default function BusinessWorldPage() {
  const { user } = useAuth() || { user: null };
  const isMobile = useIsMobile();
  const { vrEnabled, toggleVR } = useVR() || { vrEnabled: false, toggleVR: () => {} };
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [currentVRSection, setCurrentVRSection] = useState<string>("main");
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'map' | '3d' | 'first-person'>('3d');
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [rentProgress, setRentProgress] = useState(0);
  const [isExploring, setIsExploring] = useState(false);
  const [flyInAnimation, setFlyInAnimation] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [highlighedFeature, setHighlightedFeature] = useState<string | null>(null);
  
  // Refs
  const townRef = useRef<HTMLDivElement>(null);
  const rotateInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch products
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: true,
  });

  // Business categories
  const businessCategories = [
    { id: "all", name: "جميع الأعمال", icon: <Building className="h-5 w-5" />, vrColor: "#9c27b0" },
    { id: "retail", name: "متاجر الأزياء", icon: <ShoppingBag className="h-5 w-5" />, vrColor: "#e91e63" },
    { id: "travel", name: "سفر وفنادق", icon: <Plane className="h-5 w-5" />, vrColor: "#2196f3" },
    { id: "devices", name: "إلكترونيات", icon: <Phone className="h-5 w-5" />, vrColor: "#5e35b1" },
    { id: "accessories", name: "إكسسوارات", icon: <Star className="h-5 w-5" />, vrColor: "#ff9800" },
    { id: "services", name: "خدمات أعمال", icon: <BriefcaseBusiness className="h-5 w-5" />, vrColor: "#4caf50" },
  ];

  // Sample business data (in a real app, this would come from an API)
  const businessData = [
    {
      id: 1,
      name: "متجر الأزياء الراقية",
      category: "retail",
      description: "متجر متخصص في الأزياء الراقية والعصرية",
      location: "الطابق الأول، بلوك A",
      price: 5000,
      rating: 4.8,
      popular: true,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000",
      customShape: "store"
    },
    {
      id: 2,
      name: "وكالة السفر العربية",
      category: "travel",
      description: "وكالة سفر متخصصة في الرحلات السياحية داخل وخارج البلاد",
      location: "الطابق الثاني، بلوك B",
      price: 7500,
      rating: 4.9,
      popular: true,
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000",
      customShape: "airplane"
    },
    {
      id: 3,
      name: "المتجر الذكي للأجهزة",
      category: "devices",
      description: "متجر متخصص في بيع أحدث الأجهزة الإلكترونية والهواتف الذكية",
      location: "الطابق الأول، بلوك C",
      price: 6500,
      rating: 4.7,
      popular: false,
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1000",
      customShape: "phone"
    },
    {
      id: 4,
      name: "متجر الأحذية الرياضية",
      category: "retail",
      description: "متجر متخصص في بيع الأحذية الرياضية من أشهر الماركات العالمية",
      location: "الطابق الأول، بلوك D",
      price: 4800,
      rating: 4.6,
      popular: false,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000",
      customShape: "store"
    },
    {
      id: 5,
      name: "سفريات العالم الجديد",
      category: "travel",
      description: "وكالة سفر متخصصة في الرحلات الجوية والبحرية",
      location: "الطابق الثاني، بلوك E",
      price: 7200,
      rating: 4.5,
      popular: true,
      image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=1000",
      customShape: "airplane"
    },
    {
      id: 6,
      name: "متجر الجوالات المتطورة",
      category: "devices",
      description: "متجر متخصص في بيع أحدث الهواتف الذكية والأجهزة اللوحية",
      location: "الطابق الأول، بلوك F",
      price: 6800,
      rating: 4.4,
      popular: false,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
      customShape: "phone"
    }
  ];

  // Filter businesses based on selected category
  const filteredBusinesses = selectedCategory === "all" 
    ? businessData 
    : businessData.filter(business => business.category === selectedCategory);

  // Handle VR tour
  const startVirtualTour = () => {
    toggleVR();
    setShowVirtualTour(true);
  };

  // Features of Amrikyy Town
  const features = [
    {
      title: "تصميم عربي أصيل",
      description: "مستوحى من العمارة العربية التقليدية مع لمسات عصرية",
      icon: <Star className="h-6 w-6 text-primary" />
    },
    {
      title: "موقع استراتيجي",
      description: "موقع متميز يجذب آلاف الزوار يومياً",
      icon: <MapPin className="h-6 w-6 text-primary" />
    },
    {
      title: "خيارات متنوعة",
      description: "متاجر، وكالات سفر، أجهزة إلكترونية وأكثر",
      icon: <ShoppingBag className="h-6 w-6 text-primary" />
    },
    {
      title: "أسعار تنافسية",
      description: "خطط أسعار مرنة تناسب جميع أنواع الأعمال",
      icon: <CreditCard className="h-6 w-6 text-primary" />
    }
  ];

  // Business shape component with enhanced VR-ready designs
  const BusinessShape = ({ type, children, category }: { type: string, children: React.ReactNode, category?: string }) => {
    // Get the VR color based on the business category
    const getCategoryColor = () => {
      const cat = businessCategories.find(c => c.id === category) || businessCategories[0];
      return cat.vrColor;
    };
    
    // Custom color based on business category
    const categoryColor = getCategoryColor();
    
    switch(type) {
      case "airplane":
        return (
          <div className="relative perspective-3d transform transition-all duration-500 hover:scale-[1.03]">
            {/* 3D Airplane building with enhanced CSS for VR */}
            <div className="relative w-full h-60 bg-gradient-to-b from-sky-100 to-white rounded-t-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
              {/* Animated sky background */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-blue-100/30">
                <div className="absolute inset-0 animate-float1 opacity-20" 
                     style={{ 
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.7' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                       backgroundSize: '50px 50px'
                     }}
                ></div>
              </div>
              
              {/* Main building structure */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-5/6 h-40 bg-white rounded-t-2xl shadow-lg overflow-hidden">
                {/* Building facade with windows */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2">
                  {Array(24).fill(0).map((_, i) => (
                    <div key={i} className="bg-blue-100/50 rounded-sm"></div>
                  ))}
                </div>
                
                {/* Travel agency logo/sign */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/2 h-8 bg-blue-500 rounded-md flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs">وكالة سفر</span>
                </div>
                
                {/* Entrance */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-14 bg-blue-900/80 rounded-t-lg"></div>
              </div>
              
              {/* Runway/Road leading to building */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-700"></div>
              
              {/* Animated planes */}
              <div className="absolute top-[20%] right-[10%] transform -rotate-12 animate-float2" style={{ animationDuration: '15s' }}>
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <div className="absolute top-[30%] left-[15%] transform rotate-12 animate-float3" style={{ animationDuration: '18s', animationDelay: '2s' }}>
                <Plane className="h-5 w-5 text-blue-500" />
              </div>
              
              {/* VR elements: Glow effect and floating elements */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-2 bg-blue-400/50 blur-md rounded-full animate-pulse-slow"></div>
              
              {/* 3D Perspective elements */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-40 border-4 border-dashed border-blue-300/40 rounded-full animate-spin-slow" 
                   style={{ animationDuration: '30s' }}></div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-lg">
              {children}
            </div>
          </div>
        );
        
      case "phone":
        return (
          <div className="relative perspective-3d transform transition-all duration-500 hover:scale-[1.03]">
            {/* 3D Electronics Store with futuristic elements */}
            <div className="relative w-full h-60 bg-gradient-to-b from-purple-900/90 to-black rounded-t-lg overflow-hidden shadow-xl">
              {/* Technology grid background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 circuit-overlay"></div>
              </div>
              
              {/* Main store structure */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-5/6 h-36 bg-gray-900 rounded-t-lg border border-purple-500/30 overflow-hidden">
                {/* Digital facade with LED screen effect */}
                <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-r from-purple-600/80 via-purple-400/80 to-purple-600/80 flex items-center justify-center">
                  <span className="text-white text-xs font-bold px-2 py-1">متجر الإلكترونيات</span>
                </div>
                
                {/* Display windows with devices */}
                <div className="absolute top-8 inset-x-4 bottom-8 grid grid-cols-3 gap-2">
                  <div className="bg-black border border-purple-500/30 rounded flex items-center justify-center">
                    <Phone className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="bg-black border border-purple-500/30 rounded flex items-center justify-center">
                    <div className="w-5 h-8 rounded-sm bg-gray-800 border border-purple-400/50"></div>
                  </div>
                  <div className="bg-black border border-purple-500/30 rounded flex items-center justify-center">
                    <Phone className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                
                {/* Store entrance */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-purple-900"></div>
              </div>
              
              {/* Floating tech elements */}
              <div className="absolute top-6 right-8 w-10 h-10 digital-glitch">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/50 animate-spin-slow" style={{ animationDuration: '20s' }}></div>
                <div className="absolute inset-2 rounded-full border border-purple-400/30 animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-4 bg-purple-500/20 rounded-full animate-pulse-slow"></div>
              </div>
              
              <div className="absolute top-12 left-8 w-8 h-8 digital-glitch">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/50 animate-spin-slow" style={{ animationDuration: '25s' }}></div>
                <div className="absolute inset-2 rounded-full border border-purple-400/30 animate-spin-slow" style={{ animationDuration: '18s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-3 bg-purple-500/20 rounded-full animate-pulse-slow"></div>
              </div>
              
              {/* Holographic phone display */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-float2" style={{ animationDuration: '5s' }}>
                <div className="relative w-12 h-20 bg-black/80 rounded-xl border border-purple-500/50 overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                  <div className="absolute inset-1 opacity-60 bg-gradient-to-b from-purple-500/20 to-transparent"></div>
                  <div className="h-16 w-10 bg-purple-900/30 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-lg">
              {children}
            </div>
          </div>
        );
        
      case "accessories":
        return (
          <div className="relative perspective-3d transform transition-all duration-500 hover:scale-[1.03]">
            {/* 3D Accessories boutique with elegant design */}
            <div className="relative w-full h-60 bg-gradient-to-b from-amber-100 to-white rounded-t-xl overflow-hidden shadow-lg">
              {/* Luxury background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" 
                     style={{ 
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                       backgroundSize: '30px 30px'
                     }}
                ></div>
              </div>
              
              {/* Main boutique structure */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-5/6 h-40 bg-amber-50 rounded-t-lg shadow-md overflow-hidden border border-amber-200">
                {/* Boutique facade */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-amber-600/80 via-amber-500/80 to-amber-600/80 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">بوتيك الإكسسوارات</span>
                </div>
                
                {/* Display window */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-white/70 backdrop-blur-sm border border-amber-200 rounded">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                      {/* Necklace display */}
                      <div className="relative h-12 w-6">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-amber-300"></div>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-8 bg-amber-300"></div>
                      </div>
                      
                      {/* Watch display */}
                      <div className="relative h-10 w-6">
                        <div className="absolute inset-0 rounded-full border-2 border-amber-400 flex items-center justify-center">
                          <div className="h-4 w-4 rounded-full bg-amber-100 border border-amber-300"></div>
                        </div>
                      </div>
                      
                      {/* Ring display */}
                      <div className="h-6 w-6 rounded-full border-4 border-amber-300"></div>
                    </div>
                  </div>
                </div>
                
                {/* Boutique entrance */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-8 bg-amber-800/60 rounded-t"></div>
              </div>
              
              {/* Floating luxury elements */}
              <div className="absolute top-8 right-10 animate-float2" style={{ animationDuration: '8s' }}>
                <div className="w-8 h-8 rounded-full border-2 border-amber-400/70 flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-400" />
                </div>
              </div>
              
              <div className="absolute top-16 left-10 animate-float3" style={{ animationDuration: '10s' }}>
                <div className="w-6 h-6 rounded-full border border-amber-400/70 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-400/70"></div>
                </div>
              </div>
              
              {/* Shimmering effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan" style={{ animationDuration: '3s' }}></div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-lg">
              {children}
            </div>
          </div>
        );
        
      case "services":
        return (
          <div className="relative perspective-3d transform transition-all duration-500 hover:scale-[1.03]">
            {/* 3D Business Services Office */}
            <div className="relative w-full h-60 bg-gradient-to-b from-green-100 to-white rounded-t-xl overflow-hidden shadow-lg">
              {/* Business pattern background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 circuit-overlay" 
                     style={{ 
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%234caf50' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                       backgroundSize: '50px 50px'
                     }}
                ></div>
              </div>
              
              {/* Modern office building */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-5/6 h-44 bg-white rounded-t-lg border border-green-200 shadow-lg overflow-hidden">
                {/* Office facade */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-1 p-2">
                  {Array(48).fill(0).map((_, i) => (
                    <div key={i} className="bg-green-50 border border-green-100 rounded-sm"></div>
                  ))}
                </div>
                
                {/* Company logo/sign */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2/5 h-8 bg-green-600 rounded flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-semibold">خدمات أعمال</span>
                </div>
                
                {/* Office entrance */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-10 bg-green-800 rounded-t"></div>
              </div>
              
              {/* Business elements */}
              <div className="absolute top-6 right-6 animate-float1" style={{ animationDuration: '12s' }}>
                <BriefcaseBusiness className="h-8 w-8 text-green-600/70" />
              </div>
              
              <div className="absolute top-20 left-8 animate-float2" style={{ animationDuration: '15s' }}>
                <div className="w-10 h-10 rounded-full border-2 border-green-500/30 flex items-center justify-center">
                  <Handshake className="h-5 w-5 text-green-600/70" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-lg">
              {children}
            </div>
          </div>
        );
        
      case "store":
      default:
        return (
          <div className="relative perspective-3d transform transition-all duration-500 hover:scale-[1.03]">
            {/* 3D Clothing Store with fashion elements */}
            <div className="relative w-full h-60 bg-gradient-to-b from-pink-50 to-white rounded-t-xl overflow-hidden shadow-lg">
              {/* Fashion background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" 
                     style={{ 
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e91e63' fill-opacity='0.4'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                       backgroundSize: '30px 30px'
                     }}
                ></div>
              </div>
              
              {/* Main store building */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-5/6 h-40 bg-white rounded-t-lg shadow-md overflow-hidden border border-pink-200">
                {/* Store facade */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-pink-600/80 via-pink-500/80 to-pink-600/80 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">متجر الأزياء</span>
                </div>
                
                {/* Store display windows */}
                <div className="absolute top-10 inset-x-4 h-20 flex gap-2">
                  {/* Mannequin displays */}
                  <div className="flex-1 border border-pink-200 rounded flex items-center justify-center">
                    <div className="relative">
                      <div className="w-2 h-8 bg-gray-200"></div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-200"></div>
                      <div className="absolute top-8 left-1 w-5 h-2 bg-pink-300 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 border border-pink-200 rounded flex items-center justify-center">
                    <div className="relative">
                      <div className="w-2 h-8 bg-gray-200"></div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-200"></div>
                      <div className="absolute top-8 -left-2 w-6 h-4 bg-pink-200 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 border border-pink-200 rounded flex items-center justify-center">
                    <div className="relative">
                      <div className="w-2 h-8 bg-gray-200"></div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-200"></div>
                      <div className="absolute top-8 left-1 w-4 h-3 bg-pink-400 rounded"></div>
                    </div>
                  </div>
                </div>
                
                {/* Store entrance */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-8 bg-pink-800/60 rounded-t"></div>
              </div>
              
              {/* Floating fashion elements */}
              <div className="absolute top-6 right-6 animate-float1" style={{ animationDuration: '12s' }}>
                <ShoppingBag className="h-8 w-8 text-pink-500/70" />
              </div>
              
              <div className="absolute top-20 left-8 animate-float2" style={{ animationDuration: '15s' }}>
                <div className="w-10 h-10 rounded-full border-2 border-pink-300/50 flex items-center justify-center">
                  <Star className="h-5 w-5 text-pink-400/70" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-lg">
              {children}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-purple-600 text-white mb-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555529771-7888783a18d3?q=80&w=2000')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-700/80"></div>
        
        {/* Arabic pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSJub25lIj48L3JlY3Q+CjxwYXRoIGQ9Ik0yOCAwTDAgMTAwTDU2IDEwMEwyOCAwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPgo8L3N2Zz4=')] opacity-20 bg-repeat"></div>
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-right">
                بلدة الأمريكي
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-6 text-right">
                عالم افتراضي متكامل للأعمال بتصميم عربي أصيل وتقنيات حديثة
              </p>
              <div className="flex flex-wrap gap-3 justify-end">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="backdrop-blur-sm bg-white/10 hover:bg-white/20"
                  onClick={startVirtualTour}
                >
                  <span className="ml-2">جولة افتراضية</span> 
                  <Building className="h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/40"
                >
                  <span className="ml-2">احجز مكانك الآن</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="relative h-60 w-60">
                <motion.div 
                  className="absolute inset-0"
                  animate={{ 
                    rotateY: [0, 360], 
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="h-full w-full rounded-full border-8 border-white/30 flex items-center justify-center">
                    <div className="h-5/6 w-5/6 rounded-full border-4 border-white/20 flex items-center justify-center">
                      <div className="h-4/6 w-4/6 rounded-full bg-white/10 flex items-center justify-center">
                        <Building className="h-16 w-16 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,165.3C672,171,768,149,864,149.3C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Features section */}
      <div className="mb-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">لماذا تختار بلدة الأمريكي؟</h2>
          <p className="text-gray-600">اكتشف ميزات مشروعنا المبتكر للأعمال</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-center text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Categories Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">استكشف الأعمال المتاحة</h2>
          <div className="flex space-x-2">
            {businessCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2 ml-2"
              >
                {category.icon}
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <BusinessShape type={business.customShape}>
                <div className="flex flex-col h-full">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    {business.popular && (
                      <Badge variant="default" className="bg-primary text-white">شائع</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{business.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 ml-1" />
                    <span>{business.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Star className="h-4 w-4 ml-1 text-amber-500" />
                    <span>{business.rating} تقييم</span>
                  </div>
                  <div className="mt-auto border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold">{business.price.toLocaleString()} ريال / سنة</span>
                      <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    </div>
                  </div>
                </div>
              </BusinessShape>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mb-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">خطط الأسعار</h2>
          <p className="text-gray-600">اختر الخطة التي تناسب احتياجات عملك</p>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="monthly">شهري</TabsTrigger>
              <TabsTrigger value="yearly">سنوي</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle>الباقة الأساسية</CardTitle>
                  <CardDescription>مناسبة للشركات الناشئة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">500</span>
                    <span className="text-gray-500 ml-1">ريال/شهر</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي صغير
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع قياسي
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني أساسي
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="h-4 w-4 ml-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      خدمات الواقع الافتراضي
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">اختر الباقة</Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="border-2 border-primary relative">
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs rounded-bl-lg">الأكثر شعبية</div>
                <CardHeader>
                  <CardTitle>الباقة المميزة</CardTitle>
                  <CardDescription>للشركات المتوسطة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">1200</span>
                    <span className="text-gray-500 ml-1">ريال/شهر</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي متوسط
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع متميز
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      خدمات واقع افتراضي أساسية
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني على مدار الساعة
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90">اختر الباقة</Button>
                </CardFooter>
              </Card>

              {/* VIP Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle>الباقة الذهبية</CardTitle>
                  <CardDescription>للشركات الكبيرة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">2500</span>
                    <span className="text-gray-500 ml-1">ريال/شهر</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي كبير
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع بالقرب من المدخل
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      خدمات واقع افتراضي متكاملة
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني وتسويقي متخصص
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">اختر الباقة</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle>الباقة الأساسية</CardTitle>
                  <CardDescription>مناسبة للشركات الناشئة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">5000</span>
                    <span className="text-gray-500 ml-1">ريال/سنة</span>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200 font-normal">
                    وفر 1000 ريال
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي صغير
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع قياسي
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني أساسي
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="h-4 w-4 ml-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      خدمات الواقع الافتراضي
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">اختر الباقة</Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="border-2 border-primary relative">
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs rounded-bl-lg">الأكثر شعبية</div>
                <CardHeader>
                  <CardTitle>الباقة المميزة</CardTitle>
                  <CardDescription>للشركات المتوسطة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">12000</span>
                    <span className="text-gray-500 ml-1">ريال/سنة</span>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200 font-normal">
                    وفر 2400 ريال
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي متوسط
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع متميز
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      خدمات واقع افتراضي أساسية
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني على مدار الساعة
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90">اختر الباقة</Button>
                </CardFooter>
              </Card>

              {/* VIP Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle>الباقة الذهبية</CardTitle>
                  <CardDescription>للشركات الكبيرة</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">25000</span>
                    <span className="text-gray-500 ml-1">ريال/سنة</span>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200 font-normal">
                    وفر 5000 ريال
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      متجر افتراضي كبير
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      موقع بالقرب من المدخل
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      خدمات واقع افتراضي متكاملة
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      دعم فني وتسويقي متخصص
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">اختر الباقة</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-100 rounded-xl p-8 text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">ابدأ رحلتك الآن في بلدة الأمريكي</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          انضم إلى مجتمع الأعمال المزدهر في البلدة الافتراضية الأكثر ابتكاراً في العالم العربي
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          تواصل معنا للحجز
        </Button>
      </div>
    </div>
  );
}