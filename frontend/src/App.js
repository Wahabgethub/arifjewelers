import React, { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

import CinematicSplash from "@/components/CinematicSplash";
import BottomNav from "@/components/BottomNav";
import FloatingActions from "@/components/FloatingActions";

import HomePage from "@/pages/HomePage";
import CollectionsPage from "@/pages/CollectionsPage";
import ProductPage from "@/pages/ProductPage";
import RatesPage from "@/pages/RatesPage";
import WishlistPage from "@/pages/WishlistPage";
import CartPage from "@/pages/CartPage";
import ReviewsPage from "@/pages/ReviewsPage";
import ExchangePage from "@/pages/ExchangePage";
import InquiryPage from "@/pages/InquiryPage";
import AboutPage from "@/pages/AboutPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function AnimatedRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          className={isAdminRoute ? "" : "pb-24"}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionsPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/rates" element={<RatesPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/exchange" element={<ExchangePage />} />
            <Route path="/inquiry" element={<InquiryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {!isAdminRoute && (
        <>
          <FloatingActions />
          <BottomNav />
        </>
      )}
    </>
  );
}

function AppShell() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("arif_splash_seen"));

  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => {
      sessionStorage.setItem("arif_splash_seen", "1");
      setShowSplash(false);
    }, 8300);
    return () => clearTimeout(t);
  }, [showSplash]);

  useEffect(() => {
    const handler = () => setShowSplash(true);
    window.addEventListener("arif-replay-splash", handler);
    return () => window.removeEventListener("arif-replay-splash", handler);
  }, []);

  return (
    <div className="App">
      <div className="app-frame">
        {showSplash && <CinematicSplash onDone={() => { sessionStorage.setItem("arif_splash_seen", "1"); setShowSplash(false); }} />}
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </div>
      <Toaster position="top-center" theme="dark" richColors closeButton />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WishlistProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
