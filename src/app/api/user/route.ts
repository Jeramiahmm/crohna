import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// PUT /api/user — update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const body = await req.json();
    const { name } = body;

    if (name !== undefined && typeof name === "string" && name.length > 200) {
      return NextResponse.json({ error: "Name must be under 200 characters" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined && { name: name?.trim() || null }),
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("PUT /api/user error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
