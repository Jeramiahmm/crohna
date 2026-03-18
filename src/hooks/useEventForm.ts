"use client";

import { useState, useCallback, useEffect } from "react";

export interface EventFormData {
  title: string;
  date: string;
  location: string;
  category: string;
  description: string;
  imageUrl: string;
  chapter: string;
}

const EMPTY_FORM: EventFormData = {
  title: "",
  date: "",
  location: "",
  category: "",
  description: "",
  imageUrl: "",
  chapter: "",
};

interface UseEventFormOptions {
  initialData?: Partial<EventFormData>;
}

export function useEventForm(options?: UseEventFormOptions) {
  const [form, setForm] = useState<EventFormData>({ ...EMPTY_FORM, ...options?.initialData });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback((data?: Partial<EventFormData>) => {
    setForm({ ...EMPTY_FORM, ...data });
    setImageFile(null);
    setErrors({});
    setSaving(false);
  }, []);

  const setField = useCallback((field: keyof EventFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "title" || field === "date") {
      setErrors((er) => ({ ...er, [field]: "" }));
    }
  }, []);

  const toggleField = useCallback((field: keyof EventFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: f[field] === value ? "" : value }));
  }, []);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.date) errs.date = "Date is required";
    return errs;
  }, [form.title, form.date]);

  const uploadImageIfNeeded = useCallback(async (): Promise<{ url?: string; error?: string }> => {
    if (!imageFile) return { url: form.imageUrl || undefined };

    const uploadForm = new FormData();
    uploadForm.append("file", imageFile);
    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        return { error: data.error || "Image upload failed" };
      }
      const { url } = await uploadRes.json();
      return { url };
    } catch {
      return { error: "Image upload failed" };
    }
  }, [imageFile, form.imageUrl]);

  // Revoke blob URLs on cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (form.imageUrl && form.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(form.imageUrl);
      }
    };
  }, [form.imageUrl]);

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (form.imageUrl && form.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(form.imageUrl);
    }
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, imageUrl: url }));
    setImageFile(file);
  }, [form.imageUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  return {
    form,
    setForm,
    setField,
    toggleField,
    imageFile,
    dragOver,
    setDragOver,
    saving,
    setSaving,
    errors,
    setErrors,
    resetForm,
    validate,
    uploadImageIfNeeded,
    handleDrop,
    handleFileSelect,
  };
}
