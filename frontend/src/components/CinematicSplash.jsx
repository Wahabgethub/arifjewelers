import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  "1988 se aap ka aitmaad...",
  "Har design mein aitbaar ki chamak.",
  "Arif Jewellers",
];

export default function CinematicSplash({ onDone }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 2000);
    const t2 = setTimeout(() => setStep(2), 4300);
    const t3 = setTimeout(() => setDone(true), 7200);
    const t4 = setTimeout(() => onDone && onDone(), 8000);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="cinematic-splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080706]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="grain absolute inset-0 pointer-events-none" />
          <div className="relative z-10 w-full max-w-md px-8 text-center">
            <div className="min-h-[52vh] flex flex-col justify-center gap-8">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.p
                    key="l1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.7 }}
                    className="font-serif-lux text-2xl text-[#F3E5AB] leading-relaxed tracking-wide"
                  >
                    {LINES[0]}
                  </motion.p>
                )}
                {step === 1 && (
                  <motion.p
                    key="l2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.7 }}
                    className="font-serif-lux text-xl text-[#FDFBF7] leading-relaxed"
                  >
                    {LINES[1]}
                  </motion.p>
                )}
                {step === 2 && (
                  <motion.div
                    key="l3"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="shimmer inline-block rounded-full border border-[#D4AF37]/40 px-6 py-3">
                      <span className="font-serif-lux text-4xl text-gold-gradient tracking-tight">
                        Arif Jewellers
                      </span>
                    </div>
                    <span className="mt-3 text-[11px] uppercase tracking-[0.35em] text-[#A19D98]">
                      Since 1988 · 37+ Years of Trust
                    </span>
                    <span className="text-[11px] tracking-widest text-[#6B6661]">Shahi Bazar · Shahdadpur</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-10 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    step >= i ? "w-8 bg-[#D4AF37]" : "w-4 bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
