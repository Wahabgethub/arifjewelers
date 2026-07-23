import React, { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { api, fileUrl } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { Star } from "lucide-react";
import dayjs from "dayjs";

export default function ReviewsPage() {
  const { t } = useLang();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await api.get("/reviews").then((res) => res.data).catch(() => []);
      setReviews(r);
    })();
  }, []);

  return (
    <div data-testid="reviews-page" className="pb-8">
      <AppHeader subtitle={t.reviews} />
      <div className="mt-4 mx-4">
        <h2 className="font-serif-lux text-2xl text-gold-gradient mb-1">{t.reviews}</h2>
        <p className="text-[12px] text-[#A19D98] mb-4">Real customers, real trust — sabhi asli tasaveer.</p>

        {reviews.length === 0 ? (
          <div className="surface p-6 text-center text-[#A19D98] text-sm">
            No reviews yet. First customer stories will appear here soon.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} data-testid={`review-${r.id}`} className="surface p-4">
                <div className="flex items-start gap-3">
                  {r.photo && (
                    <img src={fileUrl(r.photo)} alt="" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-serif-lux text-[15px] text-[#FDFBF7]">{r.customer_name}</div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? "#D4AF37" : "none"} className={i < r.rating ? "text-[#D4AF37]" : "text-[#3A342D]"} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-[13px] text-[#D4CFC8] leading-relaxed">{r.text}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-[#6B6661]">
                      {dayjs(r.created_at).format("DD MMM YYYY")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
