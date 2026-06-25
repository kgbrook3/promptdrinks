import { NextResponse } from "next/server";
import { incrementCheers } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }
    const cheers = await incrementCheers(id);
    return NextResponse.json({ cheers });
  } catch (err) {
    console.error("Cheers error:", err);
    return NextResponse.json({ error: "Could not record cheers." }, { status: 500 });
  }
}
