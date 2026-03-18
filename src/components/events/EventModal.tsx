"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { TimelineEvent } from "@/data/demo";
import { CATEGORIES } from "@/lib/constants";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useRef } from "react";

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

const EMPTY_FORM = {
  title: "",
  date: "",
  location: "",
  description: "",
  category: "",
  chapter: "",
};

export default function EventModal({ isOpen, onClose, onSave, event, onDelete }: EventModalProps) {
  const isEditing = !!event;
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    imagePreviewUrl,
    dragOver,
    fileInputRef,
    handleDrop,
    handleFileSelect,
    setDragOver,
    resetImage,
    setImagePreviewUrl,
    uploadImage,
  } = useImageUpload();

  // Reset form when modal opens or event changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: event?.title || "",
        date: event?.date || "",
        location: event?.location || "",
        description: event?.description || "",
        category: event?.category || "",
        chapter: event?.chapter || "",
      });
      if (event?.imageUrl) {
        setImagePreviewUrl(event.imageUrl);
      } else {
        resetImage();
      }
      setErrors({});
      setShowSuccess(false);
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    let finalImageUrl = imagePreviewUrl;

    try {
      const url = await uploadImage();
      if (url) finalImageUrl = url;
    } catch (err) {
      setErrors({ title: err instanceof Error ? err.message : "Image upload failed" });
      setSaving(false);
      return;
    }

    onSave({
      ...event,
      ...form,
      imageUrl: finalImageUrl,
      id: event?.id || `evt-${Date.now()}`,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1200);
    setSaving(false);
  }, [form, event, validate, onSave, onClose, imagePreviewUrl, uploadImage]);

  // Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
            ref={modalRef}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl md:max-h-[85vh] z-[70] bg-chrono-surface border border-[var(--line-strong)] overflow-hidden flex flex-col"
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
                    className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 text-chrono-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <p className="text-chrono-text font-display font-bold">
                    {isEditing ? "Event updated" : "Event created"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between p-6 border-b border-[var(--line-strong)]">
              <div>
                <h2 className="text-xl font-display font-bold text-chrono-text">
                  {isEditing ? "Edit Event" : "New Event"}
                </h2>
                <p className="text-xs font-body font-extralight text-chrono-muted mt-1">
                  {isEditing ? "Update your memory" : "Add a moment to your timeline"}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text hover:bg-[var(--muted)] transition-all"
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
                      ? "border-[var(--line-hover)] bg-[var(--muted)]"
                      : imagePreviewUrl
                      ? "border-[var(--line-strong)]"
                      : "border-[var(--line-strong)] hover:border-[var(--line-hover)] bg-[var(--card-bg)]"
                  }`}
                >
                  {imagePreviewUrl ? (
                    <div className="relative w-full h-full group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
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
                  Title <span className="text-chrono-accent">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={form.title}
                  onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((er) => ({ ...er, title: "" })); }}
                  placeholder="What happened?"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  className={`w-full bg-[var(--input-bg)] px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border transition-colors outline-none focus:border-[var(--line-hover)] ${
                    errors.title ? "border-red-500/40" : "border-[var(--line-strong)]"
                  }`}
                />
                {errors.title && <p id="title-error" className="text-xs text-red-400/70 mt-1" role="alert">{errors.title}</p>}
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
                    aria-invalid={!!errors.date}
                    aria-describedby={errors.date ? "date-error" : undefined}
                    className={`w-full bg-[var(--input-bg)] px-4 py-3 text-sm text-chrono-text border transition-colors outline-none focus:border-[var(--line-hover)] ${
                      errors.date ? "border-red-500/40" : "border-[var(--line-strong)]"
                    }`}
                  />
                  {errors.date && <p id="date-error" className="text-xs text-red-400/70 mt-1" role="alert">{errors.date}</p>}
                </div>
                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="City, State"
                    className="w-full bg-[var(--input-bg)] px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border border-[var(--line-strong)] transition-colors outline-none focus:border-[var(--line-hover)]"
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
                  className="w-full bg-[var(--input-bg)] px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border border-[var(--line-strong)] transition-colors outline-none focus:border-[var(--line-hover)] resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setForm((f) => ({ ...f, category: f.category === cat.value ? "" : cat.value }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
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
                          ? "bg-[var(--muted)] border border-[var(--line-hover)] text-chrono-text"
                          : "bg-[var(--card-bg)] border border-[var(--line-strong)] text-chrono-muted hover:border-[var(--line-hover)]"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--line-strong)] flex items-center justify-between">
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
                  className="px-5 py-2.5 text-sm text-chrono-muted hover:text-chrono-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-colors duration-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  )}
                  {isEditing ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
