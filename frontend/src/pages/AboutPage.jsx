import React from "react";
import AppHeader from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { whatsappLink, callLink, WA_DISPLAY } from "@/lib/whatsapp";
import { MapPin, Phone, MessageCircle, Clock, Instagram} from "lucide-react";

const SHOP_IMG = "https://images.unsplash.com/photo-1782834294716-8e28c18bdba6?crop=entropy&cs=srgb&fm=jpg&q=85";

export default function AboutPage() {
  const { t } = useLang();
  return (
    <div data-testid="about-page" className="pb-8">
      <AppHeader subtitle={t.aboutUs} />

      <div className="mx-4 mt-4">
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden surface">
          <img src={SHOP_IMG} alt="Arif Jewellers showroom" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#F3E5AB]/85">Since 1988</div>
            <div className="font-serif-lux text-2xl text-gold-gradient leading-tight">A Family Legacy in Gold</div>
          </div>
        </div>

        <div className="mt-4 surface p-4">
          <p className="text-[13px] text-[#D4CFC8] leading-relaxed">
            Arif Jewellers was founded in <span className="text-[#F3E5AB]">1988</span> in the heart of Shahi Bazar, Shahdadpur — a small family shop built on one promise: <em className="text-[#F3E5AB] not-italic">purity you can trust</em>. Over <span className="text-[#F3E5AB]">37+ years</span>, generations of families across Sindh have walked through our door for weddings, gifts, savings, and heirlooms. Every piece is tested, every rate is transparent, and every customer leaves with confidence.
          </p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <div className="surface p-4 flex items-start gap-3">
            <MapPin size={17} className="text-[#F3E5AB] mt-0.5" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#A19D98]">Shop</div>
              <div className="text-[14px] text-[#FDFBF7]">Shahi Bazar, Shahdadpur, Sindh, Pakistan</div>
            </div>
          </div>
          <div className="surface p-4 flex items-start gap-3">
            <Clock size={17} className="text-[#F3E5AB] mt-0.5" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#A19D98]">Business Hours</div>
              <div className="text-[14px] text-[#FDFBF7]">Mon – Sat · 10:00 AM – 9:00 PM</div>
              <div className="text-[12px] text-[#A19D98]">Friday break: 12:30 PM – 2:30 PM</div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
          <iframe
            title="Arif Jewellers Location"
            src={`https://www.google.com/maps?q=25.924056,68.620833&output=embed`}
            className="w-full h-56 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=25.924056,68.620833"
          target="_blank"
          rel="noreferrer"
          data-testid="about-directions"
          className="btn-press mt-2 w-full h-11 rounded-full flex items-center justify-center gap-2 text-[13px] text-[#080706] bg-[#D4AF37] font-medium"
        >
          Get Directions
        </a>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={whatsappLink("Assalam-o-Alaikum, Arif Jewellers ke baare mein aur maloomat chahiye.")}
            target="_blank"
            rel="noreferrer"
            data-testid="about-whatsapp"
            className="btn-press surface h-12 rounded-full flex items-center justify-center gap-2 text-[13px] text-[#F3E5AB] border-gold-hair"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
          <a
            href={callLink()}
            data-testid="about-call"
            className="btn-press btn-gold h-12 rounded-full flex items-center justify-center gap-2 font-medium"
          >
            <Phone size={15} /> {WA_DISPLAY}
          </a>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          
            href="https://instagram.com/arifjewellerofficial"
            target="_blank"
            rel="noreferrer"
            data-testid="about-instagram"
            className="btn-press surface h-12 rounded-full flex items-center justify-center gap-2 text-[13px] text-[#F3E5AB] border-gold-hair"
          >
            <Instagram size={15} /> Instagram
          </a>
          
            href="https://www.tiktok.com/@arif.jewelers.offi"
            target="_blank"
            rel="noreferrer"
            data-testid="about-tiktok"
            className="btn-press surface h-12 rounded-full flex items-center justify-center gap-2 text-[13px] text-[#F3E5AB] border-gold-hair"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82c-.7-.77-1.1-1.76-1.1-2.82h-3.2v13.9c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.3 0 .58.05.85.13v-3.25a6.1 6.1 0 0 0-.85-.06 6.1 6.1 0 0 0 0 12.2c3.37 0 6.1-2.73 6.1-6.1V9.4a7.9 7.9 0 0 0 4.6 1.48V7.68c-1.24 0-2.38-.44-3.5-1.86Z"/></svg>
            TikTok
          </a>
        </div>
      </div>
    </div>
  );
}
