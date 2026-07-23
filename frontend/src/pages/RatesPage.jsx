import React from "react";
import AppHeader from "@/components/AppHeader";
import LiveRatesCard from "@/components/LiveRatesCard";
import { useLang } from "@/contexts/LanguageContext";

export default function RatesPage() {
  const { t } = useLang();
  return (
    <div data-testid="rates-page" className="pb-8">
      <AppHeader subtitle={t.liveRatesTitle} />
      <div className="mt-4 mx-4">
        <h2 className="font-serif-lux text-2xl text-gold-gradient mb-3">{t.liveRatesTitle}</h2>
        <p className="text-[12px] text-[#A19D98] mb-4">
          Rates are updated by our shop. For confirmed price on a specific piece, please contact us on WhatsApp.
        </p>
        <LiveRatesCard />
      </div>
    </div>
  );
}
