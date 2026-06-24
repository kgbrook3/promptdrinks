import { NextResponse } from "next/server";
import { listCocktails } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cocktails = await listCocktails();
    return NextResponse.json(cocktails);
  } catch (err: any) {
    console.error("List error:", err);
    return NextResponse.json({ error: "Could not load cocktails." }, { status: 500 });
  }
}
