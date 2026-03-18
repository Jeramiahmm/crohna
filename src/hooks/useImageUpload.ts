"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseImageUploadReturn {
  imageFile: File | null;
  imagePreviewUrl: string;
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDragOver: (v: boolean) => void;
  resetImage: () => void;
  setImagePreviewUrl: (url: string) => void;
  uploadImage: () => Promise<string | null>;
}

export function useImageUpload(initialUrl = ""): UseImageUploadReturn {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(initialUrl);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null!);

  // Revoke blob URLs on cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setImageFile(file);
    },
    [imagePreviewUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const resetImage = useCallback(() => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl("");
  }, [imagePreviewUrl]);

  const uploadImage = useCallback(async (): Promise<string | null> => {
    if (!imageFile) return imagePreviewUrl || null;

    const uploadForm = new FormData();
    uploadForm.append("file", imageFile);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
    if (!uploadRes.ok) {
      const data = await uploadRes.json();
      throw new Error(data.error || "Image upload failed");
    }
    const { url } = await uploadRes.json();
    return url;
  }, [imageFile, imagePreviewUrl]);

  return {
    imageFile,
    imagePreviewUrl,
    dragOver,
    fileInputRef,
    handleDrop,
    handleFileSelect,
    setDragOver,
    resetImage,
    setImagePreviewUrl,
    uploadImage,
  };
}
