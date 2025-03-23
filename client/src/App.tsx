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
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import BottomNav from "./components/layout/bottom-nav";
import Header from "./components/layout/header";
import { VRProvider } from "./hooks/use-vr";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VRProvider>
          <div className="min-h-screen font-[Tajawal] bg-gradient-to-br from-[#3b2fa3] to-[#7e57c2] text-white">
            <Header />
            <main className="pb-20">
              <Router />
            </main>
            <BottomNav />
            <Toaster />
          </div>
        </VRProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;