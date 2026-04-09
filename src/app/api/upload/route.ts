import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { getExtensionFromMime } from "@/lib/url-validation";
import { apiSuccess, apiError } from "@/lib/api-response";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const checkUploadLimit = createRateLimiter("upload", 10, 60_000);

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = session.user.email || "unknown";
    if (!(await checkUploadLimit(userId)).allowed) {
      return apiError("Too many uploads. Please wait a minute and try again.", 429);
    }

    const supabase = getSupabase();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file provided", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Invalid file type. Allowed: JPEG, PNG, GIF, WebP", 400);
    }

    if (file.size > MAX_SIZE) {
      return apiError("File too large. Maximum size is 5MB", 400);
    }

    // Derive extension from validated MIME type, not user-supplied filename
    const ext = getExtensionFromMime(file.type);
    const safeUserId = (session.user.email || "unknown").replace(/[^a-zA-Z0-9@._-]/g, "_");
    const filename = `${safeUserId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error.message);
      return apiError("Upload failed. Please try again.", 500);
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filename);

    return apiSuccess({ url: urlData.publicUrl });
  } catch {
    return apiError("Upload failed", 500);
  }
}
