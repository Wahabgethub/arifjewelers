import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Diamond, TrendingUp, Star, Inbox, ChevronLeft, LayoutGrid } from "lucide-react";
import AdminProducts from "./sections/AdminProducts";
import AdminRates from "./sections/AdminRates";
import AdminReviews from "./sections/AdminReviews";
import AdminInquiries from "./sections/AdminInquiries";
import AdminCategories from "./sections/AdminCategories";

const TABS = [
  { key: "products", label: "Products", Icon: Diamond },
  { key: "categories", label: "Collections", Icon: LayoutGrid },
  { key: "rates", label: "Live Rates", Icon: TrendingUp },
  { key: "reviews", label: "Reviews", Icon: Star },
  { key: "inquiries", label: "Inquiries", Icon: Inbox },
];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");

  if (loading) return <div className="p-10 text-center text-[#A19D98]">Checking session…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div data-testid="admin-dashboard" className="pb-8 min-h-screen">
      <div className="sticky top-0 z-30 glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="btn-press inline-flex items-center gap-1 text-[12px] text-[#A19D98]">
          <ChevronLeft size={16} /> Storefront
        </Link>
        <div className="font-serif-lux text-[16px] text-gold-gradient">Admin</div>
        <button
          data-testid="admin-logout"
          onClick={async () => { await logout(); navigate("/"); }}
          className="btn-press text-[11px] uppercase tracking-widest text-[#F87171] flex items-center gap-1"
        >
          <LogOut size={13} /> Logout
        </button>
      </div>

      <div className="px-3 mt-3 grid grid-cols-5 gap-1.5">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            data-testid={`admin-tab-${key}`}
            onClick={() => setTab(key)}
            className={`btn-press rounded-xl px-2 py-2 flex flex-col items-center gap-1 border ${
              tab === key
                ? "bg-[#D4AF37]/12 border-[#D4AF37]/40 text-[#F3E5AB]"
                : "surface text-[#A19D98] border-white/5"
            }`}
          >
            <Icon size={16} />
            <span className="text-[10px] uppercase tracking-widest">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 mx-4">
        {tab === "products" && <AdminProducts />}
        {tab === "categories" && <AdminCategories />}
        {tab === "rates" && <AdminRates />}
        {tab === "reviews" && <AdminReviews />}
        {tab === "inquiries" && <AdminInquiries />}
      </div>
    </div>
  );
}
