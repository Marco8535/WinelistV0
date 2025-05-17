import { NextResponse } from "next/server"
import { fetchAllWinesFromSheet, fetchWinesByCategoryFromSheet, searchWinesFromSheet } from "@/lib/google-sheets"
import { MOCK_WINES } from "@/lib/mock-data"

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

    // Return mock data as fallback
    console.log("Returning mock data as fallback")

    // If there was a search query, filter the mock data
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const query = searchParams.get("q")

    let filteredMockWines = [...MOCK_WINES]

    if (query) {
      const lowerQuery = query.toLowerCase()
      filteredMockWines = filteredMockWines.filter(
        (wine) =>
          wine.nombre.toLowerCase().includes(lowerQuery) ||
          wine.productor.toLowerCase().includes(lowerQuery) ||
          wine.uva?.toLowerCase().includes(lowerQuery) ||
          wine.region?.toLowerCase().includes(lowerQuery),
      )
    }

    if (category && category !== "all") {
      if (category === "glass") {
        filteredMockWines = filteredMockWines.filter(
          (wine) => wine.precioCopa || wine.precioCopaR1 || wine.precioCopaR2 || wine.precioCopaR3,
        )
      } else if (category === "red") {
        filteredMockWines = filteredMockWines.filter(
          (wine) => wine.tipo?.toLowerCase().includes("tinto") || wine.caracteristica?.toLowerCase().includes("tinto"),
        )
      } else if (category === "white") {
        filteredMockWines = filteredMockWines.filter(
          (wine) =>
            wine.tipo?.toLowerCase().includes("blanco") || wine.caracteristica?.toLowerCase().includes("blanco"),
        )
      } else if (category === "sparkling") {
        filteredMockWines = filteredMockWines.filter(
          (wine) =>
            wine.tipo?.toLowerCase().includes("espumante") ||
            wine.tipo?.toLowerCase().includes("espumoso") ||
            wine.caracteristica?.toLowerCase().includes("espumante") ||
            wine.caracteristica?.toLowerCase().includes("espumoso"),
        )
      } else if (category === "rose") {
        filteredMockWines = filteredMockWines.filter(
          (wine) =>
            wine.tipo?.toLowerCase().includes("rosado") ||
            wine.tipo?.toLowerCase().includes("rosé") ||
            wine.caracteristica?.toLowerCase().includes("rosado") ||
            wine.caracteristica?.toLowerCase().includes("rosé"),
        )
      }
    }

    return NextResponse.json(filteredMockWines)
  }
}
