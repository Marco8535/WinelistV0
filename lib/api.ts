import type { Wine, WineCategory } from "@/types/wine"

/**
 * Fetch all wines from the API
 */
export async function fetchAllWines(): Promise<Wine[]> {
  const response = await fetch("/api/wines")

  if (!response.ok) {
    throw new Error(`Failed to fetch wines: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch wines by category
 */
export async function fetchWinesByCategory(category: WineCategory): Promise<Wine[]> {
  const response = await fetch(`/api/wines?category=${category}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch wines by category: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Search wines by query
 */
export async function searchWines(query: string): Promise<Wine[]> {
  const response = await fetch(`/api/wines?q=${encodeURIComponent(query)}`)

  if (!response.ok) {
    throw new Error(`Failed to search wines: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch a single wine by ID
 */
export async function fetchWineById(id: string): Promise<Wine> {
  const response = await fetch(`/api/wines/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch wine: ${response.statusText}`)
  }

  return response.json()
}
