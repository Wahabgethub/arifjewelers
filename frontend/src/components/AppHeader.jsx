import React from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { MapPin, ShoppingBag } from "lucide-react";

export default function AppHeader({ subtitle }) {
  const { t } = useLang();
  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-30 glass-dark border-b border-white/5"
    >
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            data-testid="header-shop-name"
            onClick={() => window.dispatchEvent(new Event("arif-replay-splash"))}
            className="font-serif-lux text-2xl leading-none text-gold-gradient cursor-pointer active:opacity-70"
          >
            {t.shopName}
          </h1>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#A19D98]">
            <MapPin size={11} />
            <span className="truncate">{subtitle || t.address}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CartButton />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

function CartButton() {
  const { count } = useCart();
  return (
    <Link
      to="/cart"
      data-testid="header-cart"
      className="relative w-9 h-9 rounded-full flex items-center justify-center surface border-gold-hair"
      aria-label="My Selection"
    >
      <ShoppingBag size={16} className="text-[#F3E5AB]" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#D4AF37] text-[#080706] text-[9px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
