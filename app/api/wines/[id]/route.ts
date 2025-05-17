import { NextResponse } from "next/server"
import { getWineByIdFromSheet } from "@/lib/google-sheets"
import { MOCK_WINES } from "@/lib/mock-data"

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

    // Return mock data as fallback
    console.log("Returning mock data as fallback")
    const mockWine = MOCK_WINES.find((wine) => wine.id === params.id)

    if (!mockWine) {
      return NextResponse.json({ error: "Wine not found" }, { status: 404 })
    }

    return NextResponse.json(mockWine)
  }
}
