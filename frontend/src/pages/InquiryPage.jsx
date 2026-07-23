import React, { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";

export default function InquiryPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/inquiries", form);
      toast.success("Inquiry saved. Opening WhatsApp…");
      window.open(data.whatsapp_url, "_blank");
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="inquiry-page" className="pb-8">
      <AppHeader subtitle={t.inquiryTitle} />
      <form onSubmit={submit} className="mt-4 mx-4 space-y-3">
        <h2 className="font-serif-lux text-2xl text-gold-gradient mb-1">{t.inquiryTitle}</h2>
        <p className="text-[12px] text-[#A19D98] mb-2">
          Your message goes straight to our shop's WhatsApp. Our team replies within business hours.
        </p>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.yourName}</label>
          <input
            data-testid="inquiry-name"
            value={form.name}
            onChange={onChange("name")}
            className="mt-1 w-full bg-[#12100E] border border-white/10 rounded-lg px-3 py-3 text-[14px] focus:outline-none focus:border-[#D4AF37]/60"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.yourPhone}</label>
          <input
            data-testid="inquiry-phone"
            value={form.phone}
            onChange={onChange("phone")}
            inputMode="tel"
            className="mt-1 w-full bg-[#12100E] border border-white/10 rounded-lg px-3 py-3 text-[14px] focus:outline-none focus:border-[#D4AF37]/60 font-mono-num"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.yourMessage}</label>
          <textarea
            data-testid="inquiry-message"
            value={form.message}
            onChange={onChange("message")}
            rows={5}
            className="mt-1 w-full bg-[#12100E] border border-white/10 rounded-lg px-3 py-3 text-[14px] focus:outline-none focus:border-[#D4AF37]/60 resize-none"
            placeholder="e.g. Bridal set ki design chahiye, budget 4 lakh…"
          />
        </div>

        <button
          type="submit"
          data-testid="inquiry-submit"
          disabled={loading}
          className="btn-gold btn-press h-12 rounded-full w-full flex items-center justify-center gap-2 font-medium disabled:opacity-70"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
          {t.sendViaWhatsApp}
        </button>
      </form>
    </div>
  );
}
