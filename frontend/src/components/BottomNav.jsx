import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Diamond, TrendingUp, Heart, User } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const items = [
  { to: "/", key: "home", Icon: Home, testid: "nav-home" },
  { to: "/collections", key: "collections", Icon: Diamond, testid: "nav-collections" },
  { to: "/rates", key: "rates", Icon: TrendingUp, testid: "nav-rates" },
  { to: "/wishlist", key: "wishlist", Icon: Heart, testid: "nav-wishlist" },
  { to: "/profile", key: "profile", Icon: User, testid: "nav-profile" },
];

export default function BottomNav() {
  const { t } = useLang();
  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 glass-dark border-t border-white/5 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 px-2 pt-2 pb-2">
        {items.map(({ to, key, Icon, testid }) => (
          <NavLink
            key={key}
            to={to}
            end={to === "/"}
            data-testid={testid}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1.5 rounded-xl btn-press ${
                isActive ? "text-[#F3E5AB]" : "text-[#A19D98]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg ${isActive ? "bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/40" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                </div>
                <span className="text-[10px] tracking-wider uppercase">{t.nav[key]}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
