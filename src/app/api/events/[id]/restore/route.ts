import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { validateCsrf } from "@/lib/csrf";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// POST /api/events/[id]/restore — restore a soft-deleted event
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return apiError("User not found", 404);
    }

    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id, deletedAt: { not: null } },
    });
    if (!existing) {
      return apiError("Event not found or not deleted", 404);
    }

    await prisma.event.update({ where: { id }, data: { deletedAt: null } });

    return apiSuccess({ restored: true });
  } catch (error) {
    logger.error("POST /api/events/[id]/restore error", { error: String(error) });
    return apiError("Failed to restore event", 500);
  }
}
