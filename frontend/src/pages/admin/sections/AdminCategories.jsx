import React, { useEffect, useState } from "react";
import { api, fileUrl, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Loader2, X, Upload, Trash2, Edit3, Image as ImageIcon } from "lucide-react";

const EMPTY = { name_en: "", name_ur: "", name_sd: "", cover_image: null };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingSlug, setEditingSlug] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const c = await api.get("/categories").then((r) => r.data).catch(() => []);
    setCategories(c);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditingSlug(null); setShowForm(true); };
  const openEdit = (cat) => {
    setForm({ name_en: cat.name_en, name_ur: cat.name_ur || "", name_sd: cat.name_sd || "", cover_image: cat.cover_image || null });
    setEditingSlug(cat.slug);
    setShowForm(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((prev) => ({ ...prev, cover_image: data.id }));
      toast.success("Cover photo uploaded");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async () => {
    if (!form.name_en.trim()) { toast.error("Category name required"); return; }
    setSaving(true);
    try {
      if (editingSlug) {
        await api.put(`/admin/categories/${editingSlug}`, form);
      } else {
        await api.post("/admin/categories", form);
      }
      toast.success("Saved");
      setShowForm(false);
      setForm(EMPTY);
      setEditingSlug(null);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slug) => {
    if (!window.confirm("Delete this collection? Products already in it will remain but the collection tile will disappear.")) return;
    try {
      await api.delete(`/admin/categories/${slug}`);
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-categories">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif-lux text-xl text-[#FDFBF7]">Collections</h2>
        <button
          data-testid="admin-add-category"
          onClick={openNew}
          className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] text-[12px] px-3 py-2"
        >
          <Plus size={14} /> New Collection
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => (
          <div key={cat.slug} className="surface rounded-xl overflow-hidden border border-white/5">
            <div className="aspect-[4/3] relative">
              {cat.cover_image ? (
                <img src={fileUrl(cat.cover_image)} alt={cat.name_en} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#080706] flex items-center justify-center text-[#4a4642]">
                  <ImageIcon size={22} />
                </div>
              )}
            </div>
            <div className="p-2.5">
              <div className="text-[13px] text-[#FDFBF7] truncate">{cat.name_en}</div>
              <div className="mt-2 flex gap-1.5">
                <button
                  onClick={() => openEdit(cat)}
                  className="btn-press flex-1 rounded-lg surface border border-white/10 text-[11px] py-1.5 flex items-center justify-center gap-1 text-[#A19D98]"
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => remove(cat.slug)}
                  className="btn-press rounded-lg surface border border-white/10 text-[11px] py-1.5 px-2 text-[#F87171]"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70" onClick={() => setShowForm(false)}>
          <div
            className="w-full sm:max-w-md max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0F0D0C] border border-white/10 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-lux text-lg text-[#FDFBF7]">
                {editingSlug ? "Edit Collection" : "New Collection"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[#A19D98]"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#A19D98]">Cover Photo</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#080706] flex items-center justify-center border border-white/10">
                    {form.cover_image ? (
                      <img src={fileUrl(form.cover_image)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-[#4a4642]" />
                    )}
                  </div>
                  <label className="btn-press cursor-pointer inline-flex items-center gap-1.5 rounded-lg surface border border-white/10 text-[12px] px-3 py-2 text-[#A19D98]">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploading ? "Uploading..." : "Choose Photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#A19D98]">Name (English)</label>
                <input
                  value={form.name_en}
                  onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
                  placeholder="e.g. Artificial Payal"
                  className="mt-1 w-full rounded-lg bg-[#080706] border border-white/10 px-3 py-2 text-[14px] text-[#FDFBF7] outline-none focus:border-[#D4AF37]/50"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#A19D98]">Name (Urdu) — optional</label>
                <input
                  dir="rtl"
                  value={form.name_ur}
                  onChange={(e) => setForm((p) => ({ ...p, name_ur: e.target.value }))}
                  className="mt-1 w-full rounded-lg bg-[#080706] border border-white/10 px-3 py-2 text-[14px] text-[#FDFBF7] outline-none focus:border-[#D4AF37]/50"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#A19D98]">Name (Sindhi) — optional</label>
                <input
                  dir="rtl"
                  value={form.name_sd}
                  onChange={(e) => setForm((p) => ({ ...p, name_sd: e.target.value }))}
                  className="mt-1 w-full rounded-lg bg-[#080706] border border-white/10 px-3 py-2 text-[14px] text-[#FDFBF7] outline-none focus:border-[#D4AF37]/50"
                />
              </div>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="btn-press mt-5 w-full rounded-lg bg-[#D4AF37] text-[#080706] font-medium py-2.5 text-[13px] flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingSlug ? "Save Changes" : "Create Collection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
