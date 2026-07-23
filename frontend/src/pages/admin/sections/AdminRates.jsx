import React, { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw, Trash2, Save, Sparkles } from "lucide-react";
import dayjs from "dayjs";

const KARATS = ["24K", "22K", "21K", "Silver"];

export default function AdminRates() {
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const load = async () => {
    const data = await api.get("/rates").then((r) => r.data).catch(() => []);
    setCities(data);
  };

  useEffect(() => { load(); }, []);

  const updateCityRate = (cityIdx, kIdx, field, val) => {
    setCities((prev) => {
      const next = [...prev];
      const rate = { ...next[cityIdx].rates[kIdx], [field]: parseFloat(val) || 0 };
      next[cityIdx] = { ...next[cityIdx], rates: next[cityIdx].rates.map((r, i) => (i === kIdx ? rate : r)) };
      return next;
    });
  };

  const saveCity = async (city) => {
    setSaving(true);
    try {
      await api.put("/rates", { city: city.city, rates: city.rates });
      toast.success(`${city.city} rates saved`);
      await load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const addCity = async () => {
    if (!newCity.trim()) return;
    const defaultRates = KARATS.map((k) => ({ karat: k, price_per_gram: 0, price_per_tola: 0 }));
    try {
      await api.put("/rates", { city: newCity.trim(), rates: defaultRates });
      toast.success("City added");
      setNewCity("");
      await load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const deleteCity = async (city) => {
    if (!window.confirm(`Delete ${city}?`)) return;
    try {
      await api.delete(`/rates/${encodeURIComponent(city)}`);
      toast.success("City removed");
      await load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const fetchSuggestion = async () => {
    setSuggesting(true);
    try {
      const { data } = await api.get("/rates/api-suggestion");
      setSuggestion(data);
      toast.success("Fetched live spot suggestion");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSuggesting(false);
    }
  };

  const applySuggestionTo = (cityIdx) => {
    if (!suggestion) return;
    setCities((prev) => {
      const next = [...prev];
      next[cityIdx] = { ...next[cityIdx], rates: suggestion.suggested };
      return next;
    });
    toast.success("Applied — remember to Save");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif-lux text-xl text-[#FDFBF7]">Live Rates</h2>
        <button data-testid="admin-fetch-suggestion" onClick={fetchSuggestion} disabled={suggesting} className="btn-press surface border-gold-hair h-9 px-3 rounded-full text-[11px] uppercase tracking-widest text-[#F3E5AB] flex items-center gap-1.5">
          {suggesting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} API Suggest
        </button>
      </div>

      {suggestion && (
        <div className="surface p-3 mb-3 border-gold-hair">
          <div className="text-[10px] uppercase tracking-widest text-[#F3E5AB]">Live spot suggestion (PKR)</div>
          <div className="text-[10px] text-[#6B6661] font-mono-num">USD→PKR: {suggestion.usd_pkr} · Fetched {dayjs(suggestion.fetched_at).format("h:mm A")}</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {suggestion.suggested.map((s) => (
              <div key={s.karat} className="bg-black/30 border border-white/5 rounded-md p-2">
                <div className="text-[11px] text-[#F3E5AB]">{s.karat}</div>
                <div className="text-[12px] text-[#FDFBF7] font-mono-num">PKR {Math.round(s.price_per_tola).toLocaleString()}/tola</div>
                <div className="text-[10px] text-[#A19D98] font-mono-num">{Math.round(s.price_per_gram).toLocaleString()}/g</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-[#6B6661]">Tap "Apply" on any city below to prefill, then edit and Save.</div>
        </div>
      )}

      <div className="space-y-3">
        {cities.map((c, i) => (
          <div key={c.city} data-testid={`admin-rate-city-${c.city}`} className="surface p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-serif-lux text-lg text-[#FDFBF7]">{c.city}</div>
                <div className="text-[10px] text-[#6B6661] font-mono-num">Updated: {dayjs(c.updated_at).format("DD MMM YYYY · h:mm A")}</div>
              </div>
              <div className="flex gap-1.5">
                {suggestion && (
                  <button onClick={() => applySuggestionTo(i)} className="btn-press text-[10px] px-2 py-1 rounded-md border border-[#D4AF37]/30 text-[#F3E5AB]">Apply</button>
                )}
                <button onClick={() => deleteCity(c.city)} className="btn-press text-[10px] px-2 py-1 rounded-md border border-[#F87171]/30 text-[#F87171]"><Trash2 size={11} /></button>
              </div>
            </div>

            {c.rates.map((r, ki) => (
              <div key={r.karat} className="grid grid-cols-[70px_1fr_1fr] gap-2 items-center mb-2">
                <div className="text-[11px] uppercase tracking-widest text-[#F3E5AB]">{r.karat}</div>
                <div>
                  <label className="text-[9px] text-[#A19D98]">PKR / gram</label>
                  <input type="number" value={r.price_per_gram || ""} onChange={(e) => updateCityRate(i, ki, "price_per_gram", e.target.value)} className="w-full bg-[#0d0b0a] border border-white/10 rounded-md px-2 py-1.5 text-[13px] font-mono-num" />
                </div>
                <div>
                  <label className="text-[9px] text-[#A19D98]">PKR / tola</label>
                  <input type="number" value={r.price_per_tola || ""} onChange={(e) => updateCityRate(i, ki, "price_per_tola", e.target.value)} className="w-full bg-[#0d0b0a] border border-white/10 rounded-md px-2 py-1.5 text-[13px] font-mono-num" />
                </div>
              </div>
            ))}

            <button data-testid={`admin-save-rate-${c.city}`} onClick={() => saveCity(c)} disabled={saving} className="btn-gold btn-press mt-2 h-10 w-full rounded-full font-medium text-[13px] flex items-center justify-center gap-2 disabled:opacity-70">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save {c.city}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 surface p-3 flex items-center gap-2">
        <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Add city (e.g. Sukkur)" className="flex-1 bg-[#0d0b0a] border border-white/10 rounded-md px-3 py-2 text-[13px]" />
        <button onClick={addCity} className="btn-press h-9 px-3 rounded-full border border-white/10 text-[12px] text-[#F3E5AB] flex items-center gap-1"><Plus size={12} /> Add</button>
      </div>
    </div>
  );
}
