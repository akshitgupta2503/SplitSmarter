import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.password) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Set the cookie
    (await cookies()).set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
