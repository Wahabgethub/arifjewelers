import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import { Trash2, Phone, MessageCircle } from "lucide-react";

export default function AdminInquiries() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const r = await api.get("/inquiries").then((res) => res.data).catch(() => []);
    setItems(r);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete inquiry?")) return;
    await api.delete(`/inquiries/${id}`);
    await load();
  };

  return (
    <div>
      <h2 className="font-serif-lux text-xl text-[#FDFBF7] mb-3">Inquiries</h2>
      {items.length === 0 && <div className="text-[#A19D98] text-sm py-4">No inquiries yet.</div>}
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="surface p-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="text-[14px] text-[#FDFBF7]">{i.name}</div>
                <div className="text-[11px] text-[#A19D98] font-mono-num">{i.phone}</div>
                {i.product_name && <div className="text-[11px] text-[#F3E5AB]">Product: {i.product_name}</div>}
              </div>
              <div className="text-[10px] text-[#6B6661]">{dayjs(i.created_at).format("DD MMM · h:mm A")}</div>
            </div>
            <p className="mt-2 text-[13px] text-[#D4CFC8]">{i.message}</p>
            <div className="mt-2 flex gap-1.5">
              <a href={`tel:${i.phone}`} className="btn-press text-[10px] px-2 py-1 rounded-md border border-white/10 text-[#F3E5AB] flex items-center gap-1"><Phone size={11} /> Call</a>
              <a href={`https://wa.me/${i.phone.replace(/\D/g, "").replace(/^0/, "92")}`} target="_blank" rel="noreferrer" className="btn-press text-[10px] px-2 py-1 rounded-md border border-white/10 text-[#25D366] flex items-center gap-1"><MessageCircle size={11} /> WA</a>
              <button onClick={() => remove(i.id)} className="btn-press text-[10px] px-2 py-1 rounded-md border border-[#F87171]/30 text-[#F87171] ml-auto"><Trash2 size={11} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
