import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Check if user already exists with email
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
    }

    // Check if user already exists with name (from CSV import)
    let existingByName = await prisma.user.findUnique({ where: { name } });
    
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingByName) {
      // Claim the account
      if (existingByName.email) {
        return NextResponse.json({ success: false, error: "Name already taken by another registered user" }, { status: 400 });
      }
      user = await prisma.user.update({
        where: { id: existingByName.id },
        data: { email, password: hashedPassword }
      });
    } else {
      user = await prisma.user.create({ 
        data: { name, email, password: hashedPassword } 
      });
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
