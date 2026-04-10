import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/upload/route";
import { getServerSession } from "next-auth";
import { mockBucket } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };

function makeUploadRequest(
  filename: string,
  mimeType: string,
  size = 1024
): NextRequest {
  const content = new Uint8Array(size);
  const file = new File([content], filename, { type: mimeType });

  const formData = new FormData();
  formData.append("file", file);

  return new NextRequest(new URL("/api/upload", "http://localhost:3000"), {
    method: "POST",
    headers: { origin: "http://localhost:3000" },
    body: formData,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/upload — MIME Validation", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeUploadRequest("photo.jpg", "image/jpeg");
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("accepts valid JPEG upload", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeUploadRequest("photo.jpg", "image/jpeg");
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBeDefined();
  });

  it("accepts valid PNG upload", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeUploadRequest("screenshot.png", "image/png");
    const res = await POST(req);

    expect(res.status).toBe(200);
  });

  it("accepts valid WebP upload", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeUploadRequest("modern.webp", "image/webp");
    const res = await POST(req);

    expect(res.status).toBe(200);
  });

  it("rejects non-image MIME type", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeUploadRequest("malware.exe", "application/x-executable");
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("file type");
  });

  it.skip("rejects oversized files (skipped: jsdom FormData loses File.size through NextRequest)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeUploadRequest("huge.jpg", "image/jpeg", 6 * 1024 * 1024);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("size");
  });

  it("rejects request with no file", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const formData = new FormData();
    const req = new NextRequest(new URL("/api/upload", "http://localhost:3000"), {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
      body: formData,
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("derives extension from MIME type, not filename (prevents spoofing)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    // Filename says .exe but MIME says image/png
    const req = makeUploadRequest("malware.exe", "image/png");
    const res = await POST(req);

    // Should succeed (MIME is valid)
    expect(res.status).toBe(200);

    // Verify the filename passed to Supabase upload ends with .png, not .exe
    expect(mockBucket.upload).toHaveBeenCalledWith(
      expect.stringMatching(/\.png$/),
      expect.any(Buffer),
      expect.any(Object)
    );
  });
});
