import React from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/contexts/LanguageContext";

const LANGS = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
  { code: "sd", label: "سنڌي" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid="lang-switcher-btn"
          className="btn-press flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#A19D98] hover:text-[#F3E5AB] px-2 py-1 rounded-full border border-white/10"
        >
          <Globe size={14} />
          {LANGS.find((l) => l.code === lang)?.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#12100E] border border-white/10 text-[#FDFBF7]">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            data-testid={`lang-option-${l.code}`}
            onClick={() => setLang(l.code)}
            className={`cursor-pointer ${lang === l.code ? "text-[#F3E5AB]" : ""}`}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
