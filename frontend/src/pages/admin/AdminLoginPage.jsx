import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { t } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back, Admin");
      navigate("/admin");
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex flex-col justify-center px-6">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#D4AF37]/12 border border-[#D4AF37]/30 mb-3">
            <Lock size={18} className="text-[#F3E5AB]" />
          </div>
          <h1 className="font-serif-lux text-2xl text-gold-gradient">{t.adminPanel}</h1>
          <p className="text-[11px] text-[#6B6661] tracking-widest uppercase mt-1">Restricted access</p>
        </div>

        <form onSubmit={submit} className="surface p-5 space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.email}</label>
            <input
              data-testid="admin-login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-[#0d0b0a] border border-white/10 rounded-lg px-3 py-3 text-[14px] focus:outline-none focus:border-[#D4AF37]/60"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#A19D98]">{t.password}</label>
            <input
              data-testid="admin-login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-[#0d0b0a] border border-white/10 rounded-lg px-3 py-3 text-[14px] focus:outline-none focus:border-[#D4AF37]/60"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            data-testid="admin-login-submit"
            disabled={loading}
            className="btn-gold btn-press h-11 rounded-full w-full flex items-center justify-center gap-2 font-medium disabled:opacity-70"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {t.login}
          </button>
        </form>
      </div>
    </div>
  );
}
