import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { fileUrl } from "@/lib/api";
import { useWishlist } from "@/contexts/WishlistContext";

export default function ProductCard({ product, index = 0 }) {
  const { has, toggle } = useWishlist();
  const inWish = has(product.id);
  const cover = product.images?.[0];
  return (
    <motion.div
      data-testid={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      className="relative surface overflow-hidden group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[4/5] bg-black/30 relative overflow-hidden">
          {cover ? (
            <img
              src={fileUrl(cover)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B6661] text-xs">No image</div>
          )}
          {product.new_arrival && (
            <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase bg-[#D4AF37] text-[#12100E] px-2 py-0.5 rounded-full font-medium">
              New
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="font-serif-lux text-[15px] text-[#FDFBF7] leading-tight truncate">{product.name}</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-[#A19D98]">
            {product.weight ? `${product.weight}` : product.purity || product.category}
          </div>
        </div>
      </Link>
      <button
        data-testid={`wishlist-toggle-${product.id}`}
        onClick={() => toggle(product.id)}
        className="btn-press absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-black/55 backdrop-blur-md border border-white/10"
        aria-label="Toggle wishlist"
      >
        <Heart
          size={15}
          className={inWish ? "text-[#F87171]" : "text-[#FDFBF7]"}
          fill={inWish ? "#F87171" : "none"}
        />
      </button>
    </motion.div>
  );
}
