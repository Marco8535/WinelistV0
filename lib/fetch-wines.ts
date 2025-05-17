import type { Wine } from "@/types/wine"

export async function fetchWines(): Promise<Wine[]> {
  try {
    // Fetch wines from our API endpoint that connects to Google Sheets
    const response = await fetch("/api/wines")

    if (!response.ok) {
      throw new Error(`Failed to fetch wine data: ${response.status}`)
    }

    const wines = await response.json()
    return wines
  } catch (error) {
    console.error("Error fetching wine data:", error)
    return []
  }
}
