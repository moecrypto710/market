import { useEffect } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to main page 
    setLocation('/');
    return () => {};
  }, [setLocation]);
  
  return null;
}