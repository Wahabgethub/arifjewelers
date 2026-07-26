import React, { useEffect, useState } from "react";
import { api, fileUrl, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Loader2, X, Upload, Trash2, Edit3, Video as VideoIcon } from "lucide-react";

const EMPTY = {
  name: "",
  category: "necklaces",
  weight: "",
  purity: "",
  making_charges: "",
  availability: "In Stock",
  description: "",
  images: [],
  videos: [],
  featured: false,
  new_arrival: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const [p, c] = await Promise.all([
      api.get("/products").then((r) => r.data).catch(() => []),
      api.get("/categories").then((r) => r.data).catch(() => []),
    ]);
    setProducts(p);
    setCategories(c);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setShowForm(true); };
  const openEdit = (p) => { setForm({ ...EMPTY, ...p }); setShowForm(true); };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const { data } = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        uploaded.push(data.id);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
      toast.success(`Uploaded ${uploaded.length} image(s)`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingVideo(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const { data } = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        uploaded.push(data.id);
      }
      setForm((prev) => ({ ...prev, videos: [...prev.videos, ...uploaded] }));
      toast.success(`Uploaded ${uploaded.length} video(s)`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };

  const removeImage = (id) => setForm((prev) => ({ ...prev, images: prev.images.filter((x) => x !== id) }));
  const removeVideo = (id) => setForm((prev) => ({ ...prev, videos: prev.videos.filter((x) => x !== id) }));

  const save = async () => {
    if (!form.name.trim()) { toast.error("Product name required"); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (form.id) {
        delete payload.id;
        delete payload.created_at;
        delete payload.updated_at;
        await api.put(`/products/${form.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      toast.success("Saved");
      setShowForm(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Deleted");
      await load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif-lux text-xl text-[#FDFBF7]">Products</h2>
        <button data-testid="admin-add-product" onClick={openNew} className="btn-gold btn-press h-9 px-4 rounded-full text-[12px] font-medium flex items-center gap-1.5">
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {products.map((p) => (
          <div key={p.id} data-testid={`admin-product-${p.id}`} className="surface overflow-hidden">
            <div className="aspect-[4/5] bg-black/30 relative">
              {p.images?.[0] && <img src={fileUrl(p.images[0])} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="p-2">
              <div className="text-[12px] text-[#FDFBF7] truncate">{p.name}</div>
              <div className="text-[10px] text-[#A19D98] uppercase tracking-widest">{p.category}</div>
              <div className="mt-2 flex gap-1">
                <button onClick={() => openEdit(p)} className="btn-press text-[10px] px-2 py-1 rounded-md border border-white/10 text-[#F3E5AB] flex items-center gap-1">
                  <Edit3 size={11} /> Edit
                </button>
                <button onClick={() => remove(p.id)} className="btn-press text-[10px] px-2 py-1 rounded-md border border-[#F87171]/30 text-[#F87171] flex items-center gap-1">
                  <Trash2 size={11} /> Del
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="col-span-2 text-[#A19D98] text-sm py-4">No products yet.</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-[#12100E] border-t border-white/10 sm:border sm:rounded-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/10 bg-[#12100E]">
              <div className="font-serif-lux text-lg text-[#FDFBF7]">{form.id ? "Edit" : "Add"} Product</div>
              <button onClick={() => setShowForm(false)} className="btn-press w-8 h-8 rounded-full flex items-center justify-center border border-white/10">
                <X size={15} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <Field label="Name"><input data-testid="pf-name" className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Category">
                <select data-testid="pf-category" className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name_en}</option>))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Weight"><input data-testid="pf-weight" className={inp} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 12g / 1 tola" /></Field>
                <Field label="Purity"><input data-testid="pf-purity" className={inp} value={form.purity} onChange={(e) => setForm({ ...form, purity: e.target.value })} placeholder="e.g. 22K / 916" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Making Charges"><input data-testid="pf-making" className={inp} value={form.making_charges} onChange={(e) => setForm({ ...form, making_charges: e.target.value })} placeholder="e.g. Rs 3500/tola" /></Field>
                <Field label="Availability">
                  <select className={inp} value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                    <option>In Stock</option>
                    <option>Made to Order</option>
                    <option>Sold</option>
                  </select>
                </Field>
              </div>
              <Field label="Description"><textarea rows={3} className={inp} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#A19D98] mb-1">Images</div>
                <label className="btn-press surface border border-dashed border-white/15 p-4 flex items-center justify-center gap-2 text-[13px] text-[#A19D98] rounded-lg cursor-pointer">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span>{uploading ? "Uploading…" : "Upload from gallery / camera"}</span>
                  <input data-testid="pf-images" type="file" multiple accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
                </label>
                {form.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {form.images.map((id) => (
                      <div key={id} className="relative aspect-square rounded-md overflow-hidden border border-white/10">
                        <img src={fileUrl(id)} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(id)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-[#F87171]">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#A19D98] mb-1">Videos</div>
                <label className="btn-press surface border border-dashed border-white/15 p-4 flex items-center justify-center gap-2 text-[13px] text-[#A19D98] rounded-lg cursor-pointer">
                  {uploadingVideo ? <Loader2 size={16} className="animate-spin" /> : <VideoIcon size={16} />}
                  <span>{uploadingVideo ? "Uploading…" : "Upload video from gallery / camera"}</span>
                  <input data-testid="pf-videos" type="file" multiple accept="video/*" capture="environment" className="hidden" onChange={handleVideoUpload} />
                </label>
                {form.videos.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {form.videos.map((id) => (
                      <div key={id} className="relative aspect-video rounded-md overflow-hidden border border-white/10 bg-black">
                        <video src={fileUrl(id)} className="w-full h-full object-cover" muted />
                        <button onClick={() => removeVideo(id)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-[#F87171]">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[13px] text-[#D4CFC8]">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
                </label>
                <label className="flex items-center gap-2 text-[13px] text-[#D4CFC8]">
                  <input type="checkbox" checked={form.new_arrival} onChange={(e) => setForm({ ...form, new_arrival: e.target.checked })} /> New Arrival
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-press flex-1 h-11 rounded-full border border-white/10 text-[13px]">Cancel</button>
                <button data-testid="pf-save" onClick={save} disabled={saving} className="btn-gold btn-press flex-1 h-11 rounded-full font-medium text-[13px] flex items-center justify-center gap-2 disabled:opacity-70">
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

const inp = "w-full bg-[#0d0b0a] border border-white/10 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#D4AF37]/60";
function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[#A19D98] mb-1">{label}</div>
      {children}
    </div>
  );
}
