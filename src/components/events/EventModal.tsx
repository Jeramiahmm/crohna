"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect, KeyboardEvent } from "react";
import { TimelineEvent } from "@/data/demo";

const categories = [
  { value: "travel", label: "Travel" },
  { value: "career", label: "Career" },
  { value: "achievement", label: "Achievement" },
  { value: "education", label: "Education" },
  { value: "life", label: "Life" },
];

const chapters = [
  "College Years",
  "Career Start",
  "Travel Adventures",
  "Personal Growth",
  "Major Moves",
  "Relationships",
];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<TimelineEvent> & { chapter?: string }) => void;
  event?: TimelineEvent & { chapter?: string };
  onDelete?: (id: string) => void;
}

export default function EventModal({ isOpen, onClose, onSave, event, onDelete }: EventModalProps) {
  const isEditing = !!event;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: event?.title || "",
    date: event?.date || "",
    location: event?.location || "",
    description: event?.description || "",
    category: event?.category || "",
    imageUrl: event?.imageUrl || "",
    chapter: event?.chapter || "",
  });

  const [tags, setTags] = useState<string[]>(event?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        title: event?.title || "",
        date: event?.date || "",
        location: event?.location || "",
        description: event?.description || "",
        category: event?.category || "",
        imageUrl: event?.imageUrl || "",
        chapter: event?.chapter || "",
      });
      setTags(event?.tags || []);
      setTagInput("");
      setErrors({});
      setSaving(false);
      setShowSuccess(false);
    }
  }, [isOpen, event]);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.date) errs.date = "Date is required";
    return errs;
  }, [form.title, form.date]);

  const handleSave = useCallback(async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);

    await new Promise((r) => setTimeout(r, 600));

    onSave({
      ...event,
      ...form,
      tags,
      id: event?.id || `evt-${Date.now()}`,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1200);
    setSaving(false);
  }, [form, tags, event, validate, onSave, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    }
  }, []);

  const addTag = useCallback((value: string) => {
    const tag = value.trim().toLowerCase().replace(/,$/,"");
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  }, [tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleTagKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }, [tagInput, tags, addTag]);

  const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const parts = val.split(",");
      parts.forEach((p, i) => {
        if (i < parts.length - 1 && p.trim()) addTag(p);
      });
      setTagInput(parts[parts.length - 1]);
    } else {
      setTagInput(val);
    }
  }, [addTag]);

  useEffect(() => {
    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl md:max-h-[85vh] z-[70] bg-chrono-surface border border-white/[0.12] overflow-hidden flex flex-col"
          >
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-chrono-surface/95 flex items-center justify-center flex-col gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-16 h-16 rounded-full bg-white/[0.08] flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <p className="text-chrono-text font-display font-bold">
                    {isEditing ? "Event updated" : "Event created"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <div>
                <h2 className="text-xl font-display font-bold text-chrono-text">
                  {isEditing ? "Edit Memory" : "Add Memory"}
                </h2>
                <p className="text-xs font-body font-extralight text-chrono-muted mt-1">
                  {isEditing ? "Update your memory" : "Add a moment to your timeline"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text hover:bg-white/[0.06] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Photo</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative h-40 border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                    dragOver
                      ? "border-white/30 bg-white/[0.03]"
                      : form.imageUrl
                      ? "border-white/[0.08]"
                      : "border-white/[0.12] hover:border-white/20 bg-chrono-card/20"
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

              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">
                  Title <span className="text-white/60">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((er) => ({ ...er, title: "" })); }}
                  placeholder="What happened?"
                  className={`w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border transition-colors outline-none focus:border-white/30 ${
                    errors.title ? "border-red-500/40" : "border-white/[0.08]"
                  }`}
                />
                {errors.title && <p className="text-xs text-red-400/70 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">
                    Date <span className="text-white/60">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => { setForm((f) => ({ ...f, date: e.target.value })); setErrors((er) => ({ ...er, date: "" })); }}
                    className={`w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text border transition-colors outline-none focus:border-white/30 [color-scheme:dark] ${
                      errors.date ? "border-red-500/40" : "border-white/[0.08]"
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
                    className="w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border border-white/[0.08] transition-colors outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell the story behind this moment..."
                  rows={3}
                  className="w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border border-white/[0.08] transition-colors outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setForm((f) => ({ ...f, category: f.category === cat.value ? "" : cat.value }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                        form.category === cat.value
                          ? "bg-white text-black border-2 border-white"
                          : "border border-white/[0.08] text-white/60 hover:border-white/20"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Tags</label>
                <div className="flex flex-wrap items-center gap-1.5 bg-chrono-card/40 px-3 py-2 border border-white/[0.08] focus-within:border-white/30 transition-colors min-h-[44px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-white/80 border border-white/20 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="w-3.5 h-3.5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Add tags — press Enter or comma to add" : ""}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-chrono-text placeholder:text-chrono-muted/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">
                  Life Chapter <span className="text-chrono-muted/50">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {chapters.map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setForm((f) => ({ ...f, chapter: f.chapter === ch ? "" : ch }))}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                        form.chapter === ch
                          ? "bg-white/[0.1] border border-white/30 text-white"
                          : "bg-chrono-card/30 border border-white/[0.08] text-white/60 hover:border-white/20"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/[0.08] flex items-center justify-between">
              {isEditing && onDelete ? (
                <button
                  onClick={() => onDelete(event!.id)}
                  className="text-sm text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Delete event
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm text-white/60 hover:text-chrono-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-body font-light bg-white text-black rounded-full hover:bg-white/90 transition-colors duration-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  )}
                  {isEditing ? "Save Changes" : "Create Memory"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
