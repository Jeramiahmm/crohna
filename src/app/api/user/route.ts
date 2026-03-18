import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// GET /api/user — get user profile and preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
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
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT /api/user — update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const body = await req.json();
    const { name, preferences } = body;

    if (name !== undefined && typeof name === "string" && name.length > 200) {
      return NextResponse.json({ error: "Name must be under 200 characters" }, { status: 400 });
    }

    // Validate preferences if provided
    if (preferences !== undefined && (typeof preferences !== "object" || preferences === null)) {
      return NextResponse.json({ error: "Invalid preferences format" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined && { name: name?.trim() || null }),
        ...(preferences !== undefined && { preferences }),
      },
    });

    return NextResponse.json({
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
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
