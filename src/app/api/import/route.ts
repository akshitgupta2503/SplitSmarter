import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { processCSV } from "@/lib/importer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    let text = "";
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const arrayBuffer = await file.arrayBuffer();
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      text = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    } else {
      text = await file.text();
    }
    
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
