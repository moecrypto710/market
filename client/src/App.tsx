import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import RewardsPage from "@/pages/rewards-page";
import AffiliatePage from "@/pages/affiliate-page";
import PaymentPage from "@/pages/payment-page";
import AccountPage from "@/pages/account-page";
import AuthPage from "@/pages/auth-page";
import ProductDetailPage from "@/pages/product-detail-page";
import StoreRentalPage from "@/pages/store-rental-page";
import ServicesPage from "@/pages/services-page";
import BusinessWorldPage from "@/pages/business-world-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import BottomNav from "./components/layout/bottom-nav";
import Header from "./components/layout/header";
import { VRProvider } from "./hooks/use-vr";
import WelcomeScreen from "./components/welcome-screen";

// Function to check if this is the first visit
function isFirstVisit() {
  const visited = localStorage.getItem('visited');
  if (!visited) {
    localStorage.setItem('visited', 'true');
    return true;
  }
  return false;
}

// Function to check if user wants to see the welcome animation again
function hasResetWelcomeAnimation() {
  const resetWelcome = sessionStorage.getItem('resetWelcome');
  if (resetWelcome) {
    sessionStorage.removeItem('resetWelcome');
    return true;
  }
  return false;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/product/:productId" component={ProductDetailPage} />
      <ProtectedRoute path="/rewards" component={RewardsPage} />
      <ProtectedRoute path="/affiliate" component={AffiliatePage} />
      <ProtectedRoute path="/payment" component={PaymentPage} />
      <ProtectedRoute path="/account" component={AccountPage} />
      <ProtectedRoute path="/store-rental" component={StoreRentalPage} />
      <ProtectedRoute path="/services" component={ServicesPage} />
      <ProtectedRoute path="/business-world" component={BusinessWorldPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  
  useEffect(() => {
    // Show welcome screen on first visit or if manually triggered
    const shouldShowWelcome = isFirstVisit() || hasResetWelcomeAnimation();
    
    // Small delay to ensure the app has mounted properly
    const timer = setTimeout(() => {
      setShowWelcome(shouldShowWelcome);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VRProvider>
          <div className="min-h-screen font-[Tajawal] bg-black text-white">
            <Header />
            <main className="pb-20">
              <Router />
            </main>
            <BottomNav />
            <Toaster />
            
            {/* Arabic cultural welcome screen */}
            {showWelcome && <WelcomeScreen onComplete={handleWelcomeComplete} />}
          </div>
        </VRProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;