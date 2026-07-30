import React from "react";
import { Link } from "react-router-dom";
import { X, MessageCircle, ShoppingBag } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useCart } from "@/contexts/CartContext";
import { whatsappLink } from "@/lib/whatsapp";

export default function CartPage() {
  const { items, remove, clear } = useCart();

  const buildMessage = () => {
    const lines = items.map(
      (it, i) => `${i + 1}. ${it.name}${it.weight ? ` — ${it.weight}` : ""}${it.purity ? ` (${it.purity})` : ""}`
    );
    return `Assalam-o-Alaikum, mujhe in items ki price/availability puchni hai:\n\n${lines.join("\n")}`;
  };

  return (
    <div data-testid="cart-page" className="pb-8">
      <AppHeader subtitle="My Selection" />
      <div className="mt-4 mx-4">
        <h2 className="font-serif-lux text-2xl text-gold-gradient">My Selection</h2>

        {items.length === 0 ? (
          <div className="surface p-6 mt-4 text-center text-[#A19D98] text-sm">
            <ShoppingBag size={26} className="mx-auto mb-2 text-[#4a4642]" />
            No items selected yet. Browse collections and tap "Add to Selection" on any piece.
            <div className="mt-3">
              <Link
                to="/collections"
                className="btn-press inline-block rounded-full surface border-gold-hair px-4 py-2 text-[12px] text-[#F3E5AB]"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              {items.map((it) => (
                <div key={it.id} className="surface p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] text-[#FDFBF7] truncate">{it.name}</div>
                    <div className="text-[11px] text-[#A19D98]">
                      {[it.weight, it.purity].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    data-testid={`cart-remove-${it.id}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-black/30 text-[#F87171] shrink-0"
                    aria-label="Remove"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

            <a
              href={whatsappLink(buildMessage())}
              target="_blank"
              rel="noreferrer"
              data-testid="cart-send-whatsapp"
              className="btn-press btn-gold mt-5 w-full h-12 rounded-full flex items-center justify-center gap-2 font-medium"
            >
              <MessageCircle size={17} /> Send Selection on WhatsApp ({items.length})
            </a>

            <button
              onClick={clear}
              data-testid="cart-clear"
              className="btn-press mt-2 w-full h-10 rounded-full surface border border-white/10 text-[12px] text-[#A19D98]"
            >
              Clear All
            </button>
          </>
        )}
      </div>
    </div>
  );
}
