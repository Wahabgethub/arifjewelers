import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";

export default function WishlistPage() {
  const { t } = useLang();
  const { ids } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (ids.length === 0) { setItems([]); setLoading(false); return; }
      const all = await api.get("/products").then((r) => r.data).catch(() => []);
      setItems(all.filter((p) => ids.includes(p.id)));
      setLoading(false);
    })();
  }, [ids]);

  return (
    <div data-testid="wishlist-page" className="pb-8">
      <AppHeader subtitle={t.nav.wishlist} />
      <div className="mt-4 mx-4">
        <h2 className="font-serif-lux text-2xl text-gold-gradient mb-3">{t.nav.wishlist}</h2>
        {loading ? (
          <div className="text-[#A19D98] text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="surface p-8 text-center">
            <p className="text-sm text-[#A19D98] leading-relaxed">{t.emptyWishlist}</p>
            <Link to="/collections" data-testid="empty-wishlist-browse" className="mt-4 inline-block btn-gold btn-press px-5 py-2 rounded-full text-[13px]">
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
