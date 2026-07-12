import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    // Find or create the user (upsert)
    let user = await prisma.user.findUnique({ where: { name } });
    if (!user) {
      user = await prisma.user.create({ data: { name } });
    }

    // Set the cookie
    (await cookies()).set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  (await cookies()).delete("userId");
  return NextResponse.json({ success: true });
}
