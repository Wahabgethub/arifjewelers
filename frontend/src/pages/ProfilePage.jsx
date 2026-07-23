import React from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, Info, MessageCircle, Repeat, Settings, Star, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { t } = useLang();
  const { ids } = useWishlist();
  const { user, logout } = useAuth();

  return (
    <div data-testid="profile-page" className="pb-8">
      <AppHeader subtitle={t.nav.profile} />
      <div className="mx-4 mt-4">
        <div className="surface p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#D4AF37]/12 border border-[#D4AF37]/30">
            <User size={22} className="text-[#F3E5AB]" />
          </div>
          <div className="min-w-0">
            <div className="font-serif-lux text-lg text-[#FDFBF7] leading-tight">Guest</div>
            <div className="text-[11px] text-[#A19D98] mt-0.5">
              {ids.length} saved · Since 1988 · Arif Jewellers
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <ProfileLink to="/wishlist" icon={<Heart size={17} />} label={t.nav.wishlist} testid="profile-link-wishlist" />
          <ProfileLink to="/reviews" icon={<Star size={17} />} label={t.reviews} testid="profile-link-reviews" />
          <ProfileLink to="/exchange" icon={<Repeat size={17} />} label={t.exchange} testid="profile-link-exchange" />
          <ProfileLink to="/inquiry" icon={<MessageCircle size={17} />} label={t.inquiryTitle} testid="profile-link-inquiry" />
          <ProfileLink to="/about" icon={<Info size={17} />} label={t.aboutUs} testid="profile-link-about" />
        </div>

        <div className="mt-6">
          {user && user.role === "admin" ? (
            <div className="surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#F3E5AB]">Signed in as Admin</div>
                  <div className="text-[13px] text-[#FDFBF7]">{user.email}</div>
                </div>
                <button data-testid="profile-logout" onClick={logout} className="btn-press flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#F87171]">
                  <LogOut size={14} /> {t.logout}
                </button>
              </div>
              <Link
                to="/admin"
                data-testid="profile-admin-link"
                className="mt-3 btn-gold btn-press w-full h-10 rounded-full flex items-center justify-center text-[13px] font-medium"
              >
                Open {t.adminPanel}
              </Link>
            </div>
          ) : (
            <Link
              to="/admin/login"
              data-testid="profile-admin-gear"
              className="btn-press flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-[#6B6661] py-3"
              aria-label="Admin"
            >
              <Settings size={13} /> Settings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ to, icon, label, testid }) {
  return (
    <Link to={to} data-testid={testid} className="btn-press surface px-4 py-3 flex items-center gap-3">
      <div className="text-[#F3E5AB]">{icon}</div>
      <div className="flex-1 text-[14px] text-[#FDFBF7]">{label}</div>
      <div className="text-[#6B6661]">›</div>
    </Link>
  );
}
