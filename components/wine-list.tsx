"use client"

import { useWine } from "@/context/wine-context"
import { WineItem } from "./wine-item"
import { WineDetail } from "./wine-detail"

export function WineList() {
  const { loading, error, filteredWines, selectedCategory, searchQuery, selectedWine } = useWine()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg">Loading wine selection...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    )
  }

  if (filteredWines.length === 0) {
    let message = "No wines match your current selection. Please adjust your search or filters."

    if (selectedCategory === "favorites") {
      message =
        "You haven't bookmarked any wines yet. Tap the bookmark icon next to a wine to add it to your favorites."
    }

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-center max-w-md">{message}</p>
      </div>
    )
  }

  if (selectedWine) {
    return <WineDetail />
  }

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      <ul>
        {filteredWines.map((wine) => (
          <WineItem key={wine.id} wine={wine} />
        ))}
      </ul>
    </div>
  )
}
