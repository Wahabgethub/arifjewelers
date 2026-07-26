import React from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/contexts/LanguageContext";
import { MapPin } from "lucide-react";

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
        <LanguageSwitcher />
      </div>
    </header>
  );
}
