import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { processCSV } from "@/lib/importer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    
    // Create a group for this import session
    const group = await prisma.group.create({
      data: { name: "Flatmates" }
    });

    const result = await processCSV(text, group.id);

    return NextResponse.json({ success: true, anomalies: result.anomalies, groupId: group.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
