import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import CategoryProducts from "./pages/CategoryProducts";
import SearchResults from "./pages/SearchResults";
import ArowanaTypes from "./pages/ArowanaTypes";
import DiscusTypes from "./pages/DiscusTypes";
import SilverDollarTypes from "./pages/SilverDollarTypes";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ArowanaCertification from "./pages/ArowanaCertification";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import StaticPage from "./pages/StaticPage";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import TermsConditions from "./pages/StaticPages/TermsConditions";
import PrivacyPolicy from "./pages/StaticPages/PrivacyPolicy";
import WhatsAppButton from '@/components/ui/whatsapp-button';
import ProductTypes from '@/pages/ProductTypes';

// Create a wrapper component for the app content
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  return (
    <div className="min-h-screen">
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/category/:category" element={<CategoryProducts />} />
          <Route path="/products/search" element={<SearchResults />} />
          <Route path="/arowana-types" element={<ArowanaTypes />} />
          <Route path="/discus-types" element={<DiscusTypes />} />
          <Route path="/silver-dollar-types" element={<SilverDollarTypes />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/certification" element={<ArowanaCertification />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/page/:slug" element={<StaticPage />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/:category-types" element={<ProductTypes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider delayDuration={300}>
              <Toaster />
              <Sonner />
              <AppContent />
              <WhatsAppButton />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
