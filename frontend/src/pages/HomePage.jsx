import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import AppHeader from "@/components/AppHeader";
import LiveRatesCard from "@/components/LiveRatesCard";
import ProductCard from "@/components/ProductCard";
import { whatsappLink, callLink } from "@/lib/whatsapp";

const HERO_IMG = "https://images.pexels.com/photos/24815712/pexels-photo-24815712.jpeg";

const CATEGORY_COVERS = {
  necklaces: "https://images.pexels.com/photos/24815712/pexels-photo-24815712.jpeg",
  rings: "https://images.unsplash.com/photo-1713950920412-97799efdf870?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHw0fHxnb2xkJTIwcmluZ3MlMjBsdXh1cnl8ZW58MHx8fHwxNzg0Nzk1NDU4fDA&ixlib=rb-4.1.0&q=85",
  bridal: "https://images.pexels.com/photos/12708653/pexels-photo-12708653.jpeg",
  "gold-bars": "https://images.pexels.com/photos/321452/pexels-photo-321452.jpeg",
};

export default function HomePage() {
  const { t } = useLang();
  const [featured, setFeatured] = useState([]);
  const [newArr, setNewArr] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const [f, n, c] = await Promise.all([
        api.get("/products", { params: { featured: true } }).then((r) => r.data).catch(() => []),
        api.get("/products", { params: { new_arrival: true } }).then((r) => r.data).catch(() => []),
        api.get("/categories").then((r) => r.data).catch(() => []),
      ]);
      setFeatured(f.slice(0, 6));
      setNewArr(n.slice(0, 6));
      setCategories(c);
    })();
  }, []);

  return (
    <div data-testid="home-page" className="pb-8">
      <AppHeader />

      {/* Hero */}
      <section className="relative mt-3 mx-4 rounded-2xl overflow-hidden surface border-gold-hair">
        <div className="relative h-56">
          <img src={HERO_IMG} alt="Arif Jewellers" className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-[#080706]/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[10px] uppercase tracking-[0.35em] text-[#F3E5AB]/85"
            >
              {t.tagline}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif-lux text-3xl leading-tight text-gold-gradient mt-1"
            >
              {t.shopName}
            </motion.h2>
            <p className="text-[12px] text-[#A19D98] mt-1 flex items-center gap-1">
              <MapPin size={11} /> {t.address}
            </p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-4 mx-4 grid grid-cols-3 gap-2">
        <a
          href={whatsappLink("Assalam-o-Alaikum, Arif Jewellers.")}
          target="_blank"
          rel="noreferrer"
          data-testid="quick-whatsapp"
          className="btn-press surface p-3 flex flex-col items-center gap-1"
        >
          <MessageCircle size={18} className="text-[#25D366]" />
          <span className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.whatsapp}</span>
        </a>
        <a
          href={callLink()}
          data-testid="quick-call"
          className="btn-press surface p-3 flex flex-col items-center gap-1"
        >
          <Phone size={18} className="text-[#F3E5AB]" />
          <span className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.call}</span>
        </a>
        <Link
          to="/about"
          data-testid="quick-location"
          className="btn-press surface p-3 flex flex-col items-center gap-1"
        >
          <MapPin size={18} className="text-[#F3E5AB]" />
          <span className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.location}</span>
        </Link>
      </section>

      {/* Live Rates */}
      <section className="mt-5 mx-4">
        <LiveRatesCard />
      </section>

      {/* Categories */}
      <section className="mt-6 mx-4">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-serif-lux text-xl text-[#FDFBF7]">{t.exploreCategories}</h3>
          <Link to="/collections" className="text-[10px] uppercase tracking-widest text-[#F3E5AB]">{t.viewAll}</Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {categories.slice(0, 6).map((cat, i) => (
            <Link
              key={cat.slug}
              to={`/collections/${cat.slug}`}
              data-testid={`home-cat-${cat.slug}`}
              className={`relative rounded-xl overflow-hidden aspect-[4/3] group ${i === 0 ? "col-span-2 aspect-[16/9]" : ""}`}
            >
              {CATEGORY_COVERS[cat.slug] ? (
                <img
                  src={CATEGORY_COVERS[cat.slug]}
                  alt={cat.name_en}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#080706]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-[#080706]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-[10px] uppercase tracking-widest text-[#F3E5AB]/85">Category</div>
                <div className="font-serif-lux text-lg text-[#FDFBF7] leading-tight">{cat.name_en}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArr.length > 0 && (
        <section className="mt-6 mx-4">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-serif-lux text-xl text-[#FDFBF7]">{t.newArrivals}</h3>
            <Link to="/collections" className="text-[10px] uppercase tracking-widest text-[#F3E5AB]">{t.viewAll}</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {newArr.map((p, i) => (
              <div key={p.id} className="w-[44%] flex-shrink-0">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mt-6 mx-4">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-serif-lux text-xl text-[#FDFBF7]">{t.featuredCollections}</h3>
            <Link to="/collections" className="text-[10px] uppercase tracking-widest text-[#F3E5AB]">{t.viewAll}</Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Reviews strip / Exchange / Inquiry teasers */}
      <section className="mt-6 mx-4 grid grid-cols-2 gap-2">
        <Link to="/reviews" data-testid="teaser-reviews" className="surface p-4 btn-press">
          <div className="text-[10px] uppercase tracking-widest text-[#F3E5AB]">Real Customers</div>
          <div className="mt-1 font-serif-lux text-lg leading-tight">{t.reviews}</div>
          <div className="mt-2 text-[10px] text-[#A19D98]">Verified photos & stories →</div>
        </Link>
        <Link to="/exchange" data-testid="teaser-exchange" className="surface p-4 btn-press">
          <div className="text-[10px] uppercase tracking-widest text-[#F3E5AB]">Fair Value</div>
          <div className="mt-1 font-serif-lux text-lg leading-tight">{t.exchange}</div>
          <div className="mt-2 text-[10px] text-[#A19D98]">Bring old gold →</div>
        </Link>
        <Link to="/inquiry" data-testid="teaser-inquiry" className="surface p-4 btn-press col-span-2">
          <div className="text-[10px] uppercase tracking-widest text-[#F3E5AB]">Book / Reserve</div>
          <div className="mt-1 font-serif-lux text-lg leading-tight">{t.inquiryTitle}</div>
          <div className="mt-2 text-[10px] text-[#A19D98]">Message goes straight to our shop's WhatsApp →</div>
        </Link>
      </section>
    </div>
  );
}
