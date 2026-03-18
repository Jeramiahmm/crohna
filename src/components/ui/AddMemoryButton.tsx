"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ShimmerButton from "./shimmer-button";
import { CATEGORIES } from "@/lib/constants";

export default function AddMemoryButton() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    category: "",
    description: "",
    imageUrl: "",
  });

  const resetForm = () => {
    setForm({ title: "", date: "", location: "", category: "", description: "", imageUrl: "" });
    setImageFile(null);
    setErrors({});
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.date) errs.date = "Date is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      let uploadedImageUrl = form.imageUrl || undefined;

      if (imageFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          setErrors({ title: data.error || "Image upload failed" });
          setSaving(false);
          return;
        }
        const { url } = await uploadRes.json();
        uploadedImageUrl = url;
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          date: form.date,
          location: form.location.trim() || undefined,
          category: form.category || "life",
          description: form.description.trim() || undefined,
          imageUrl: uploadedImageUrl,
        }),
      });

      if (res.ok) {
        setOpen(false);
        resetForm();
        router.refresh();
        // If on timeline page, trigger a re-fetch by dispatching a custom event
        window.dispatchEvent(new CustomEvent("chrono:event-created"));
      } else {
        const data = await res.json();
        setErrors({ title: data.error || "Failed to save. Please try again." });
      }
    } catch {
      setErrors({ title: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Revoke blob URLs on cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (form.imageUrl && form.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(form.imageUrl);
      }
    };
  }, [form.imageUrl]);

  // Escape key to close modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (form.imageUrl && form.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(form.imageUrl);
      }
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      setImageFile(file);
    }
  }, [form.imageUrl]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (form.imageUrl && form.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(form.imageUrl);
      }
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      setImageFile(file);
    }
  }, [form.imageUrl]);

  if (!session) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <ShimmerButton
          onClick={() => setOpen(true)}
          className="px-5 py-3 text-sm font-body font-medium shadow-lg"
        >
          <span className="text-lg leading-none">+</span>
          Add Memory
        </ShimmerButton>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[calc(100%-2rem)] max-w-xl max-h-[90vh] bg-chrono-surface border border-[var(--border)] rounded-lg overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--line)]">
                <div>
                  <h2 className="text-xl font-display font-bold text-chrono-text">Add Memory</h2>
                  <p className="text-xs font-body font-extralight text-chrono-muted mt-1">
                    Capture a moment worth remembering
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">
                    Title <span className="text-chrono-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((er) => ({ ...er, title: "" })); }}
                    placeholder="What happened?"
                    className={`w-full bg-[var(--input-bg)] px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted border transition-colors outline-none focus:border-[var(--line-hover)] ${
                      errors.title ? "border-red-500/40" : "border-[var(--line-strong)]"
                    }`}
                  />
                  {errors.title && <p className="text-xs text-red-400/70 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">
                      Date <span className="text-chrono-accent">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => { setForm((f) => ({ ...f, date: e.target.value })); setErrors((er) => ({ ...er, date: "" })); }}
                      className={`w-full bg-[var(--input-bg)] px-4 py-3 text-sm text-chrono-text border transition-colors outline-none focus:border-[var(--line-hover)] ${
                        errors.date ? "border-red-500/40" : "border-[var(--line-strong)]"
                      }`}
                    />
                    {errors.date && <p className="text-xs text-red-400/70 mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="City, State"
                      className="w-full bg-[var(--input-bg)] px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted border border-[var(--line-strong)] transition-colors outline-none focus:border-[var(--line-hover)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setForm((f) => ({ ...f, category: f.category === cat.value ? "" : cat.value }))}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                          form.category === cat.value
                            ? "bg-foreground text-background border-2 border-foreground"
                            : "border border-[var(--line-strong)] text-chrono-muted hover:border-[var(--line-hover)]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Tell the story behind this moment..."
                    rows={3}
                    className="w-full bg-[var(--input-bg)] px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted border border-[var(--line-strong)] transition-colors outline-none focus:border-[var(--line-hover)] resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Photo Upload</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-32 border-2 border-dashed transition-all cursor-pointer overflow-hidden rounded-lg ${
                      dragOver
                        ? "border-[var(--line-hover)] bg-[var(--muted)]"
                        : form.imageUrl
                        ? "border-[var(--line)]"
                        : "border-[var(--line-strong)] hover:border-[var(--line-hover)] bg-[var(--card-bg)]"
                    }`}
                  >
                    {form.imageUrl ? (
                      <div className="relative w-full h-full group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-sm text-white">Change photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <svg className="w-8 h-8 text-chrono-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                        <p className="text-xs text-chrono-muted">Drag & drop or click to upload</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[var(--line)]">
                <ShimmerButton
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 text-sm font-body font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Memory"}
                </ShimmerButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
