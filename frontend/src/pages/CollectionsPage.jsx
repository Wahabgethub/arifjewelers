import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

const CAT_COVERS = {
  necklaces: "https://images.pexels.com/photos/24815712/pexels-photo-24815712.jpeg",
  rings: "https://images.unsplash.com/photo-1713950920412-97799efdf870?crop=entropy&cs=srgb&fm=jpg&q=85",
  bridal: "https://images.pexels.com/photos/12708653/pexels-photo-12708653.jpeg",
  "gold-bars": "https://images.pexels.com/photos/321452/pexels-photo-321452.jpeg",
};

export default function CollectionsPage() {
  const { slug } = useParams();
  const { t } = useLang();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const c = await api.get("/categories").then((r) => r.data).catch(() => []);
      setCategories(c);
    })();
  }, []);

  useEffect(() => {
    if (!slug) { setProducts([]); return; }
    (async () => {
      const p = await api.get("/products", { params: { category: slug } }).then((r) => r.data).catch(() => []);
      setProducts(p);
    })();
  }, [slug]);

  const activeCat = categories.find((c) => c.slug === slug);

  return (
    <div data-testid="collections-page" className="pb-8">
      <AppHeader subtitle={activeCat ? activeCat.name_en : "All Categories"} />

      {!slug && (
        <div className="mt-4 mx-4">
          <h2 className="font-serif-lux text-2xl mb-3 text-[#FDFBF7]">{t.exploreCategories}</h2>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04 }}
              >
                <Link
                  to={`/collections/${cat.slug}`}
                  data-testid={`cat-${cat.slug}`}
                  className={`block relative rounded-xl overflow-hidden aspect-[4/3] group surface border-gold-hair`}
                >
                  <img
                    src={CAT_COVERS[cat.slug] || CAT_COVERS.necklaces}
                    alt={cat.name_en}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-[#080706]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="font-serif-lux text-[15px] text-[#FDFBF7] leading-tight">{cat.name_en}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {slug && (
        <div className="mt-4 mx-4">
          <Link to="/collections" data-testid="back-to-cats" className="btn-press inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#A19D98] mb-3">
            <ChevronLeft size={14} /> Categories
          </Link>
          <h2 className="font-serif-lux text-2xl mb-3 text-gold-gradient">{activeCat?.name_en || slug}</h2>
          {products.length === 0 ? (
            <div className="surface p-6 text-center text-[#A19D98] text-sm">
              No items in this category yet. Please check back soon or ask on WhatsApp.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
