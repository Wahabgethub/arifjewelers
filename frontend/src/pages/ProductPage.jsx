import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Heart, Phone, Share2, MessageCircle } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { whatsappLink, callLink, askPriceMessage } from "@/lib/whatsapp";
import { toast } from "sonner";

export default function ProductPage() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { has, toggle } = useWishlist();
  const [product, setProduct] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (e) {
        setProduct(false);
      }
    })();
  }, [id]);

  if (product === null) {
    return <div className="p-10 text-center text-[#A19D98] text-sm">Loading…</div>;
  }
  if (product === false) {
    return (
      <div className="p-10 text-center">
        <p className="text-[#A19D98] text-sm">Product not found.</p>
        <Link to="/collections" className="text-[#F3E5AB] text-sm underline">Browse Collections</Link>
      </div>
    );
  }

  const inWish = has(product.id);
  const cover = product.images?.[imgIdx];

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {}
  };

  return (
    <div data-testid="product-page" className="pb-8">
      <div className="sticky top-0 z-30 glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link to={-1} className="btn-press inline-flex items-center gap-1 text-[12px] text-[#A19D98]">
          <ChevronLeft size={16} /> Back
        </Link>
        <button
          onClick={() => toggle(product.id)}
          data-testid="product-wishlist-btn"
          className="btn-press w-9 h-9 rounded-full flex items-center justify-center surface"
          aria-label="Wishlist"
        >
          <Heart size={17} className={inWish ? "text-[#F87171]" : "text-[#FDFBF7]"} fill={inWish ? "#F87171" : "none"} />
        </button>
      </div>

      <div className="aspect-square bg-black/30 relative overflow-hidden">
        {cover ? (
          <img src={fileUrl(cover)} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6B6661] text-sm">No image</div>
        )}
      </div>
      {product.images?.length > 1 && (
        <div className="flex gap-2 px-4 mt-3 overflow-x-auto no-scrollbar">
          {product.images.map((im, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden border ${i === imgIdx ? "border-[#D4AF37]" : "border-white/10"}`}
            >
              <img src={fileUrl(im)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mx-4 mt-4">
        <h1 data-testid="product-name" className="font-serif-lux text-2xl text-[#FDFBF7] leading-tight">{product.name}</h1>
        <div className="mt-1 text-[10px] uppercase tracking-widest text-[#F3E5AB]">{product.category}</div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {product.weight && (
            <div className="surface p-3">
              <div className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.weight}</div>
              <div className="mt-0.5 font-mono-num text-[#FDFBF7]">{product.weight}</div>
            </div>
          )}
          {product.purity && (
            <div className="surface p-3">
              <div className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.purity}</div>
              <div className="mt-0.5 font-mono-num text-[#FDFBF7]">{product.purity}</div>
            </div>
          )}
          {product.making_charges && (
            <div className="surface p-3">
              <div className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.makingCharges}</div>
              <div className="mt-0.5 font-mono-num text-[#FDFBF7]">{product.making_charges}</div>
            </div>
          )}
          <div className="surface p-3">
            <div className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.availability}</div>
            <div className="mt-0.5 text-[#FDFBF7]">{product.availability || "In Stock"}</div>
          </div>
        </div>

        {product.description && (
          <p className="mt-4 text-[13px] leading-relaxed text-[#D4CFC8]">{product.description}</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-2">
          <a
            href={whatsappLink(askPriceMessage(product.name, lang))}
            target="_blank"
            rel="noreferrer"
            data-testid="product-ask-price"
            className="btn-press btn-gold w-full h-12 rounded-full flex items-center justify-center gap-2 font-medium tracking-wide"
          >
            <MessageCircle size={17} /> {t.askPrice}
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={callLink()}
              data-testid="product-call"
              className="btn-press surface h-11 rounded-full flex items-center justify-center gap-2 text-[13px] text-[#F3E5AB] border-gold-hair"
            >
              <Phone size={15} /> {t.callNow}
            </a>
            <button
              onClick={onShare}
              data-testid="product-share"
              className="btn-press surface h-11 rounded-full flex items-center justify-center gap-2 text-[13px] text-[#FDFBF7]"
            >
              <Share2 size={15} /> {t.share}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
