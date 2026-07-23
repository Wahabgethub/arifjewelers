import React from "react";
import AppHeader from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { MessageCircle, CheckCircle } from "lucide-react";

const STEPS_EN = [
  { title: "Bring your item", desc: "Any old gold or silver jewelry — chains, bangles, rings, biscuits — is welcome." },
  { title: "Purity test", desc: "We test the karat using a professional touchstone / electronic tester in front of you." },
  { title: "Weigh and calculate", desc: "The piece is weighed on a certified scale; deductions (if any) are shown clearly." },
  { title: "Fair valuation", desc: "You receive the current live rate for the tested karat, minus any small refining charge." },
  { title: "Exchange or cash", desc: "Apply the value against a new design, or take cash — your choice." },
];

export default function ExchangePage() {
  const { t } = useLang();
  return (
    <div data-testid="exchange-page" className="pb-8">
      <AppHeader subtitle={t.exchange} />
      <div className="mt-4 mx-4">
        <h2 className="font-serif-lux text-2xl text-gold-gradient">{t.exchange}</h2>
        <p className="text-[13px] text-[#D4CFC8] leading-relaxed mt-2">{t.exchangeIntro}</p>

        <div className="mt-5 space-y-2">
          {STEPS_EN.map((s, i) => (
            <div key={i} className="surface p-4 flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#D4AF37]/12 border border-[#D4AF37]/30 shrink-0">
                <span className="font-mono-num text-[#F3E5AB] text-xs">{i + 1}</span>
              </div>
              <div>
                <div className="font-serif-lux text-[15px] text-[#FDFBF7]">{s.title}</div>
                <div className="text-[12px] text-[#A19D98] leading-relaxed mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 surface p-4">
          <div className="flex items-center gap-2 text-[#F3E5AB] text-[11px] uppercase tracking-widest">
            <CheckCircle size={14} /> What to bring
          </div>
          <ul className="mt-2 text-[13px] text-[#D4CFC8] space-y-1 list-disc pl-5">
            <li>The jewelry or bars you'd like to exchange</li>
            <li>Original receipt / certificate (if available — not required)</li>
            <li>A valid CNIC for larger transactions</li>
          </ul>
        </div>

        <a
          href={whatsappLink("Assalam-o-Alaikum, mujhe apna purana sona/chandi exchange karwana hai. Kya aap process bata sakte hain?")}
          target="_blank"
          rel="noreferrer"
          data-testid="exchange-whatsapp-btn"
          className="mt-5 btn-gold btn-press h-12 rounded-full w-full flex items-center justify-center gap-2 font-medium"
        >
          <MessageCircle size={16} /> Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}
