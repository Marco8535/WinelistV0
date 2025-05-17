import { NextResponse } from "next/server"
import { MOCK_WINES } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    // Parse URL and query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const query = searchParams.get("q")

    let filteredWines = [...MOCK_WINES]

    // Handle search query if present
    if (query) {
      const lowerQuery = query.toLowerCase()
      filteredWines = filteredWines.filter(
        (wine) =>
          wine.nombre.toLowerCase().includes(lowerQuery) ||
          wine.productor.toLowerCase().includes(lowerQuery) ||
          wine.uva?.toLowerCase().includes(lowerQuery) ||
          wine.region?.toLowerCase().includes(lowerQuery) ||
          wine.pais?.toLowerCase().includes(lowerQuery),
      )
    }

    // Handle category filter if present
    if (category && category !== "all") {
      if (category === "glass") {
        filteredWines = filteredWines.filter(
          (wine) => wine.precioCopa || wine.precioCopaR1 || wine.precioCopaR2 || wine.precioCopaR3,
        )
      } else if (category === "red") {
        filteredWines = filteredWines.filter(
          (wine) => wine.tipo?.toLowerCase().includes("tinto") || wine.caracteristica?.toLowerCase().includes("tinto"),
        )
      } else if (category === "white") {
        filteredWines = filteredWines.filter(
          (wine) =>
            wine.tipo?.toLowerCase().includes("blanco") || wine.caracteristica?.toLowerCase().includes("blanco"),
        )
      } else if (category === "sparkling") {
        filteredWines = filteredWines.filter(
          (wine) =>
            wine.tipo?.toLowerCase().includes("espumante") ||
            wine.tipo?.toLowerCase().includes("espumoso") ||
            wine.caracteristica?.toLowerCase().includes("espumante") ||
            wine.caracteristica?.toLowerCase().includes("espumoso"),
        )
      } else if (category === "rose") {
        filteredWines = filteredWines.filter(
          (wine) =>
            wine.tipo?.toLowerCase().includes("rosado") ||
            wine.tipo?.toLowerCase().includes("rosé") ||
            wine.caracteristica?.toLowerCase().includes("rosado") ||
            wine.caracteristica?.toLowerCase().includes("rosé"),
        )
      }
    }

    return NextResponse.json(filteredWines)
  } catch (error) {
    console.error("Error in wines API route:", error)
    return NextResponse.json({ error: "Failed to fetch wines" }, { status: 500 })
  }
}
