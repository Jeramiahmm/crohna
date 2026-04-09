import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { validateCsrf } from "@/lib/csrf";
import { updateUserSchema, deleteAccountSchema, parseBody } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";

// GET /api/user — get user profile and preferences
export async function GET() {
  try {
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

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        preferences: user.preferences ?? {},
      },
    });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return apiError("Failed to fetch user", 500);
  }
}

// PUT /api/user — update user profile
export async function PUT(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    const { data: body, error: validationError } = await parseBody(req, updateUserSchema);
    if (validationError) return validationError;

    const { name, preferences } = body;

    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined && { name: name?.trim() || null }),
        ...(preferences !== undefined && { preferences }),
      },
    });

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        preferences: user.preferences ?? {},
      },
    });
  } catch (error) {
    console.error("PUT /api/user error:", error);
    return apiError("Failed to update profile", 500);
  }
}

// DELETE /api/user — delete user account and all associated data
export async function DELETE(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    // Require explicit confirmation to prevent accidental deletion
    const { error: validationError } = await parseBody(req, deleteAccountSchema);
    if (validationError) return validationError;

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // Delete all user data in order (cascade should handle this, but be explicit)
    await prisma.$transaction([
      prisma.aIStory.deleteMany({ where: { userId: user.id } }),
      prisma.event.deleteMany({ where: { userId: user.id } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return apiSuccess({});
  } catch (error) {
    console.error("DELETE /api/user error:", error);
    return apiError("Failed to delete account", 500);
  }
}
