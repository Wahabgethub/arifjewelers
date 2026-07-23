import React, { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arif_wishlist") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("arif_wishlist", JSON.stringify(ids));
  }, [ids]);

  const has = (id) => ids.includes(id);
  const toggle = (id) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const remove = (id) => setIds((prev) => prev.filter((x) => x !== id));
  const clear = () => setIds([]);

  return (
    <WishlistContext.Provider value={{ ids, has, toggle, remove, clear }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
