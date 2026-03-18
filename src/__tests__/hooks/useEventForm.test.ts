import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEventForm } from "@/hooks/useEventForm";

beforeEach(() => {
  vi.clearAllMocks();
  // Mock URL.createObjectURL and revokeObjectURL for jsdom
  globalThis.URL.createObjectURL = vi.fn(() => "blob:http://localhost/fake-blob");
  globalThis.URL.revokeObjectURL = vi.fn();
});

describe("useEventForm", () => {
  it("initializes with empty form data", () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.form.title).toBe("");
    expect(result.current.form.date).toBe("");
    expect(result.current.form.location).toBe("");
    expect(result.current.saving).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("initializes with provided data", () => {
    const { result } = renderHook(() =>
      useEventForm({ initialData: { title: "Test", date: "2024-01-01" } })
    );

    expect(result.current.form.title).toBe("Test");
    expect(result.current.form.date).toBe("2024-01-01");
  });

  it("setField updates a specific field", () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setField("title", "New Title");
    });

    expect(result.current.form.title).toBe("New Title");
  });

  it("setField clears errors for title and date", () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setErrors({ title: "Required", date: "Required" });
    });

    expect(result.current.errors.title).toBe("Required");

    act(() => {
      result.current.setField("title", "Something");
    });

    expect(result.current.errors.title).toBe("");
  });

  it("toggleField toggles between value and empty", () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.toggleField("category", "travel");
    });
    expect(result.current.form.category).toBe("travel");

    act(() => {
      result.current.toggleField("category", "travel");
    });
    expect(result.current.form.category).toBe("");
  });

  it("validate returns errors for missing title and date", () => {
    const { result } = renderHook(() => useEventForm());

    let errors: Record<string, string> = {};
    act(() => {
      errors = result.current.validate();
    });

    expect(errors.title).toBe("Title is required");
    expect(errors.date).toBe("Date is required");
  });

  it("validate returns empty for valid form", () => {
    const { result } = renderHook(() =>
      useEventForm({ initialData: { title: "Test", date: "2024-01-01" } })
    );

    let errors: Record<string, string> = {};
    act(() => {
      errors = result.current.validate();
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("resetForm clears all state", () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setField("title", "Something");
      result.current.setSaving(true);
    });

    expect(result.current.form.title).toBe("Something");

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.form.title).toBe("");
    expect(result.current.saving).toBe(false);
  });

  it("uploadImageIfNeeded returns existing URL when no file", async () => {
    const { result } = renderHook(() =>
      useEventForm({ initialData: { imageUrl: "https://example.com/img.jpg" } })
    );

    let uploadResult: { url?: string; error?: string } = {};
    await act(async () => {
      uploadResult = await result.current.uploadImageIfNeeded();
    });

    expect(uploadResult.url).toBe("https://example.com/img.jpg");
  });
});
