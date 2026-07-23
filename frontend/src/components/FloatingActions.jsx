import React from "react";
import { Phone } from "lucide-react";
import { whatsappLink, callLink } from "@/lib/whatsapp";

export default function FloatingActions() {
  return (
    <div
      data-testid="floating-actions"
      className="fixed z-40 bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none"
    >
      <div className="flex justify-end pr-4 gap-3 pointer-events-auto">
        <a
          href={callLink()}
          data-testid="fab-call"
          className="btn-press w-12 h-12 rounded-full flex items-center justify-center surface border-gold-hair"
          aria-label="Call"
        >
          <Phone size={20} className="text-[#F3E5AB]" />
        </a>
        <a
          href={whatsappLink("Assalam-o-Alaikum, mujhe Arif Jewellers ke baare mein maloomat chahiye.")}
          target="_blank"
          rel="noreferrer"
          data-testid="fab-whatsapp"
          className="btn-press w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "#25D366", boxShadow: "0 10px 30px -8px rgba(37,211,102,0.55)" }}
          aria-label="WhatsApp"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.89c0 2.1.55 4.15 1.6 5.96L0 24l6.32-1.66a11.86 11.86 0 0 0 5.74 1.46h.01c6.56 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.17-3.44-8.43ZM12.07 21.3h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.75.98 1-3.66-.24-.38a9.9 9.9 0 1 1 18.36-5.25 9.9 9.9 0 0 1-9.95 9.9Zm5.42-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.38c-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.55.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
