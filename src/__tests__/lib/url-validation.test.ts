import { describe, it, expect } from "vitest";
import { validateImageUrl, getExtensionFromMime } from "@/lib/url-validation";

// Don't use global mocks for this pure function
vi.unmock("@/lib/url-validation");

describe("validateImageUrl", () => {
  it("allows valid HTTPS URLs", () => {
    expect(validateImageUrl("https://example.com/photo.jpg")).toBeNull();
  });

  it("allows valid HTTP URLs", () => {
    expect(validateImageUrl("http://cdn.example.com/img.png")).toBeNull();
  });

  it("rejects non-http protocols", () => {
    expect(validateImageUrl("ftp://example.com/file")).toContain("protocol");
    expect(validateImageUrl("file:///etc/passwd")).toContain("protocol");
    expect(validateImageUrl("javascript:alert(1)")).toContain("protocol");
  });

  it("rejects invalid URLs", () => {
    expect(validateImageUrl("not-a-url")).toContain("Invalid image URL");
    expect(validateImageUrl("")).toContain("Invalid image URL");
  });

  // SSRF blocking tests
  describe("SSRF protection", () => {
    it("blocks localhost", () => {
      expect(validateImageUrl("http://localhost/admin")).toContain("private");
      expect(validateImageUrl("http://127.0.0.1/admin")).toContain("private");
    });

    it("blocks 10.x.x.x (RFC1918)", () => {
      expect(validateImageUrl("http://10.0.0.1/secret")).toContain("private");
      expect(validateImageUrl("http://10.255.255.255/")).toContain("private");
    });

    it("blocks 172.16-31.x.x (RFC1918)", () => {
      expect(validateImageUrl("http://172.16.0.1/")).toContain("private");
      expect(validateImageUrl("http://172.31.255.255/")).toContain("private");
    });

    it("allows 172.15.x.x and 172.32.x.x (not RFC1918)", () => {
      expect(validateImageUrl("http://172.15.0.1/")).toBeNull();
      expect(validateImageUrl("http://172.32.0.1/")).toBeNull();
    });

    it("blocks 192.168.x.x (RFC1918)", () => {
      expect(validateImageUrl("http://192.168.1.1/")).toContain("private");
      expect(validateImageUrl("http://192.168.0.100/")).toContain("private");
    });

    it("blocks 169.254.x.x (link-local / AWS metadata)", () => {
      expect(validateImageUrl("http://169.254.169.254/latest/meta-data/")).toContain("private");
      expect(validateImageUrl("http://169.254.0.1/")).toContain("private");
    });

    it("blocks 0.0.0.0", () => {
      expect(validateImageUrl("http://0.0.0.0/")).toContain("private");
    });

    it("allows public IPs", () => {
      expect(validateImageUrl("http://8.8.8.8/")).toBeNull();
      expect(validateImageUrl("http://1.1.1.1/")).toBeNull();
      expect(validateImageUrl("http://203.0.113.1/")).toBeNull();
    });
  });
});

describe("getExtensionFromMime", () => {
  it("maps common MIME types correctly", () => {
    expect(getExtensionFromMime("image/jpeg")).toBe("jpg");
    expect(getExtensionFromMime("image/png")).toBe("png");
    expect(getExtensionFromMime("image/gif")).toBe("gif");
    expect(getExtensionFromMime("image/webp")).toBe("webp");
  });

  it("defaults to jpg for unknown MIME types", () => {
    expect(getExtensionFromMime("image/bmp")).toBe("jpg");
    expect(getExtensionFromMime("application/pdf")).toBe("jpg");
    expect(getExtensionFromMime("")).toBe("jpg");
  });
});
