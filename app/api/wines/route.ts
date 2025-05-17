import { NextResponse } from "next/server"
import { fetchAllWinesFromSheet, fetchWinesByCategoryFromSheet, searchWinesFromSheet } from "@/lib/google-sheets"

export async function GET(request: Request) {
  try {
    // Parse URL and query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const query = searchParams.get("q")

    // Handle search query if present
    if (query) {
      const wines = await searchWinesFromSheet(query)
      return NextResponse.json(wines)
    }

    // Handle category filter if present
    if (category) {
      const wines = await fetchWinesByCategoryFromSheet(category)
      return NextResponse.json(wines)
    }

    // Default: return all wines
    const wines = await fetchAllWinesFromSheet()
    return NextResponse.json(wines)
  } catch (error) {
    console.error("Error in wines API route:", error)
    return NextResponse.json({ error: "Failed to fetch wines" }, { status: 500 })
  }
}
