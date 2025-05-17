"use client"

import { useEffect, useState } from "react"
import type { Wine } from "@/types/wine"
import { WineCard } from "./wine-card"
import { fetchWines, groupWinesByCategory } from "@/lib/fetch-wines"

export function WineList() {
  const [groupedWines, setGroupedWines] = useState<Record<string, Wine[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWines = async () => {
      try {
        setLoading(true)
        setError(null)

        const wines = await fetchWines()
        const grouped = groupWinesByCategory(wines)

        setGroupedWines(grouped)
      } catch (err) {
        console.error("Error loading wines:", err)
        setError("Failed to load wine data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadWines()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-lg">Cargando carta de vinos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (Object.keys(groupedWines).length === 0) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-lg">No hay vinos disponibles en la carta en este momento.</p>
      </div>
    )
  }

  // Get category names and sort them alphabetically
  const sortedCategories = Object.keys(groupedWines).sort((a, b) => a.localeCompare(b))

  return (
    <div className="space-y-12">
      {sortedCategories.map((category) => (
        <section key={category} className="wine-section">
          <h2 className="text-2xl font-serif font-medium text-[#003366] dark:text-blue-400 mb-6 pb-2 border-b border-[#E2E8F0] dark:border-gray-700">
            {category}
          </h2>

          <div className="space-y-6">
            {groupedWines[category].map((wine) => (
              <WineCard key={wine.id} wine={wine} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
