import { NextResponse } from "next/server"
import { getWineByIdFromSheet } from "@/lib/google-sheets"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Wine ID is required" }, { status: 400 })
    }

    const wine = await getWineByIdFromSheet(id)

    if (!wine) {
      return NextResponse.json({ error: "Wine not found" }, { status: 404 })
    }

    return NextResponse.json(wine)
  } catch (error) {
    console.error("Error in wine by ID API route:", error)
    return NextResponse.json({ error: "Failed to fetch wine" }, { status: 500 })
  }
}
