import React, { useEffect, useState } from "react";
import { api, fileUrl, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, X, Star, Upload } from "lucide-react";

const EMPTY = { customer_name: "", rating: 5, text: "", photo: null };

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const r = await api.get("/reviews").then((res) => res.data).catch(() => []);
    setReviews(r);
  };
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const { data } = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((p) => ({ ...p, photo: data.id }));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async () => {
    if (!form.customer_name.trim() || !form.text.trim()) { toast.error("Fill all fields"); return; }
    setSaving(true);
    try {
      await api.post("/reviews", form);
      toast.success("Review added");
      setForm(EMPTY);
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete review?")) return;
    await api.delete(`/reviews/${id}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif-lux text-xl text-[#FDFBF7]">Reviews</h2>
        <button data-testid="admin-add-review" onClick={() => setShowForm(true)} className="btn-gold btn-press h-9 px-4 rounded-full text-[12px] font-medium flex items-center gap-1.5">
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {reviews.map((r) => (
          <div key={r.id} className="surface p-3 flex gap-3">
            {r.photo && <img src={fileUrl(r.photo)} alt="" className="w-12 h-12 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] text-[#FDFBF7]">{r.customer_name}</div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} className={i < r.rating ? "text-[#D4AF37]" : "text-[#3A342D]"} fill={i < r.rating ? "#D4AF37" : "none"} />
                ))}
              </div>
              <p className="text-[12px] text-[#A19D98] line-clamp-2">{r.text}</p>
            </div>
            <button onClick={() => remove(r.id)} className="text-[#F87171] btn-press p-2"><Trash2 size={14} /></button>
          </div>
        ))}
        {reviews.length === 0 && <div className="text-[#A19D98] text-sm py-4">No reviews yet.</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-[#12100E] border-t border-white/10 sm:border sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="font-serif-lux text-lg text-[#FDFBF7]">Add Review</div>
              <button onClick={() => setShowForm(false)} className="btn-press w-8 h-8 rounded-full flex items-center justify-center border border-white/10"><X size={15} /></button>
            </div>
            <div className="p-4 space-y-3">
              <input data-testid="rf-name" placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full bg-[#0d0b0a] border border-white/10 rounded-lg px-3 py-2.5 text-[14px]" />
              <div className="flex items-center gap-2">
                <div className="text-[10px] uppercase tracking-widest text-[#A19D98]">Rating</div>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setForm({ ...form, rating: n })} className="btn-press">
                    <Star size={18} className={n <= form.rating ? "text-[#D4AF37]" : "text-[#3A342D]"} fill={n <= form.rating ? "#D4AF37" : "none"} />
                  </button>
                ))}
              </div>
              <textarea data-testid="rf-text" placeholder="Review text…" rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full bg-[#0d0b0a] border border-white/10 rounded-lg px-3 py-2.5 text-[14px] resize-none" />
              <label className="btn-press surface border border-dashed border-white/15 p-3 flex items-center justify-center gap-2 text-[13px] text-[#A19D98] rounded-lg cursor-pointer">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {form.photo ? "Change photo" : "Upload photo (optional)"}
                <input type="file" accept="image/*" className="hidden" onChange={upload} />
              </label>
              {form.photo && <img src={fileUrl(form.photo)} alt="" className="w-16 h-16 rounded object-cover" />}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-press flex-1 h-11 rounded-full border border-white/10 text-[13px]">Cancel</button>
                <button data-testid="rf-save" onClick={save} disabled={saving} className="btn-gold btn-press flex-1 h-11 rounded-full font-medium text-[13px] flex items-center justify-center gap-2">
                  {saving && <Loader2 size={15} className="animate-spin" />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
