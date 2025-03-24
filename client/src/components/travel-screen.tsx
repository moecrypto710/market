import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface TravelScreenProps {
  className?: string;
  style?: React.CSSProperties;
  destinations?: { city: string; country: string; imageUrl?: string; price?: string }[];
  onSelectDestination?: (destination: { city: string; country: string; imageUrl?: string; price?: string }) => void;
  isArabic?: boolean;
}

/**
 * A Unity-inspired TravelScreen component for displaying travel destinations
 * This is based on the Unity TravelScreen class provided
 */
export default function TravelScreen({
  className = '',
  style,
  destinations = [
    { city: 'دبي', country: 'الإمارات العربية المتحدة', imageUrl: '/images/dubai.jpg', price: '2500 ج.م' },
    { city: 'القاهرة', country: 'مصر', imageUrl: '/images/cairo.jpg', price: '1800 ج.م' },
    { city: 'الرياض', country: 'المملكة العربية السعودية', imageUrl: '/images/riyadh.jpg', price: '2200 ج.م' },
    { city: 'نيويورك', country: 'الولايات المتحدة', imageUrl: '/images/newyork.jpg', price: '8000 ج.م' },
    { city: 'طوكيو', country: 'اليابان', imageUrl: '/images/tokyo.jpg', price: '9500 ج.م' },
    { city: 'باريس', country: 'فرنسا', imageUrl: '/images/paris.jpg', price: '5000 ج.م' },
  ],
  onSelectDestination,
  isArabic = true
}: TravelScreenProps) {
  const [index, setIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [infoVisible, setInfoVisible] = useState(false);

  // Function to move to next destination (equivalent to NextDestination in Unity)
  const nextDestination = () => {
    setIndex((prevIndex) => (prevIndex + 1) % destinations.length);
    resetInfoVisibility();
  };

  // Function to move to previous destination
  const prevDestination = () => {
    setIndex((prevIndex) => (prevIndex - 1 + destinations.length) % destinations.length);
    resetInfoVisibility();
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll) return;
    
    const interval = setInterval(() => {
      nextDestination();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoScroll, destinations.length]);

  // Reset info visibility when changing destination
  const resetInfoVisibility = () => {
    setInfoVisible(false);
    setTimeout(() => setInfoVisible(true), 300);
  };

  // Handle destination selection
  const handleSelectDestination = () => {
    if (onSelectDestination) {
      onSelectDestination(destinations[index]);
    }
  };

  // Format direction based on language
  const dir = isArabic ? 'rtl' : 'ltr';
  const currentDestination = destinations[index];

  return (
    <div 
      className={`relative bg-black/80 rounded-xl overflow-hidden ${className}`}
      style={{ 
        maxWidth: '800px', 
        height: '500px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 0 20px rgba(138, 43, 226, 0.3)',
        ...style
      }}
      dir={dir}
    >
      {/* Background image with parallax effect */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: `url(${currentDestination.imageUrl || 'https://via.placeholder.com/800x500'})`,
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
      </motion.div>
      
      {/* Control buttons */}
      <div className="absolute left-4 right-4 top-1/2 transform -translate-y-1/2 flex justify-between items-center z-20">
        <Button
          variant="ghost" 
          size="icon"
          className="bg-black/30 text-white hover:bg-black/50 h-12 w-12 rounded-full"
          onClick={prevDestination}
        >
          {isArabic ? '→' : '←'}
        </Button>
        
        <Button
          variant="ghost" 
          size="icon"
          className="bg-black/30 text-white hover:bg-black/50 h-12 w-12 rounded-full"
          onClick={nextDestination}
        >
          {isArabic ? '←' : '→'}
        </Button>
      </div>
      
      {/* Auto-scroll toggle */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant={autoScroll ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setAutoScroll(!autoScroll)}
        >
          {autoScroll ? "إيقاف التنقل التلقائي" : "تشغيل التنقل التلقائي"}
        </Button>
      </div>
      
      {/* Destination info */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: infoVisible ? 1 : 0, y: infoVisible ? 0 : 20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-white mb-2">{currentDestination.city}</h2>
        <p className="text-xl text-white/80 mb-3">{currentDestination.country}</p>
        
        {currentDestination.price && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-md font-bold">
              {isArabic ? `السعر: ${currentDestination.price}` : `Price: ${currentDestination.price}`}
            </div>
            
            <Button 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={handleSelectDestination}
            >
              {isArabic ? "احجز الآن" : "Book Now"}
            </Button>
          </div>
        )}
      </motion.div>
      
      {/* Destination indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {destinations.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/30'}`}
            onClick={() => {
              setIndex(i);
              resetInfoVisibility();
            }}
          />
        ))}
      </div>
    </div>
  );
}