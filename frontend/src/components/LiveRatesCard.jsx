import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import dayjs from "dayjs";
import { TrendingUp } from "lucide-react";

function formatPKR(n) {
  if (!n && n !== 0) return "—";
  return new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export default function LiveRatesCard({ compact = false }) {
  const { t } = useLang();
  const [cities, setCities] = useState([]);
  const [activeCity, setActiveCity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/rates");
        setCities(data || []);
        if (data && data.length) setActiveCity(data[0].city);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cityDoc = cities.find((c) => c.city === activeCity);

  return (
    <motion.div
      data-testid="live-rates-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="surface p-5 relative overflow-hidden border-gold-hair shimmer"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#D4AF37]/12 border border-[#D4AF37]/30">
            <TrendingUp size={16} className="text-[#F3E5AB]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#A19D98]">{t.liveRatesTitle}</p>
            {cityDoc && (
              <p className="text-[10px] text-[#6B6661] font-mono-num">
                {t.lastUpdated}: {dayjs(cityDoc.updated_at).format("DD MMM YYYY · h:mm A")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* City tabs */}
      <div className="flex gap-1.5 mb-4 no-scrollbar overflow-x-auto relative z-10">
        {cities.map((c) => (
          <button
            key={c.city}
            data-testid={`rates-city-${c.city}`}
            onClick={() => setActiveCity(c.city)}
            className={`btn-press px-3 py-1 text-[11px] uppercase tracking-widest rounded-full border ${
              activeCity === c.city
                ? "bg-[#D4AF37]/15 text-[#F3E5AB] border-[#D4AF37]/50"
                : "text-[#A19D98] border-white/10 hover:border-white/25"
            }`}
          >
            {c.city}
          </button>
        ))}
      </div>

      {/* Rates */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        {loading && <div className="col-span-2 text-[#A19D98] text-sm">Loading rates…</div>}
        {!loading && cityDoc?.rates?.map((r) => (
          <div key={r.karat} className="rounded-lg bg-black/30 border border-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] uppercase tracking-widest ${r.karat === "Silver" ? "text-[#D8D5CF]" : "text-[#F3E5AB]"}`}>
                {r.karat}
              </span>
              {!compact && <span className="text-[9px] text-[#6B6661]">{t.perTola}</span>}
            </div>
            <div className="mt-1 font-mono-num text-lg text-[#FDFBF7]">
              PKR {formatPKR(r.price_per_tola)}
            </div>
            {!compact && (
              <div className="text-[10px] text-[#A19D98] font-mono-num">
                {t.perGram}: {formatPKR(r.price_per_gram)}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
