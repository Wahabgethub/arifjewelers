import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arif_cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("arif_cart", JSON.stringify(items));
  }, [items]);

  const has = (id) => items.some((x) => x.id === id);

  const add = (product) => {
    if (has(product.id)) return;
    setItems((prev) => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        weight: product.weight || "",
        purity: product.purity || "",
        category: product.category || "",
      },
    ]);
  };

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const toggle = (product) => (has(product.id) ? remove(product.id) : add(product));
  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, has, add, remove, toggle, clear, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
