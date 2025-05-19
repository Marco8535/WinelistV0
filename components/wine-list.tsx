"use client"

import { useWine } from "@/context/wine-context"
import { Bookmark } from "lucide-react"

export function WineList() {
  const { filteredWines, categorizedWineData, toggleBookmark, isWineBookmarked, selectedCategory, setSelectedWine } =
    useWine()

  // Improved function to format prices correctly
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "-"

    // Ensure we're working with a number
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price

    // Format with thousands separator and NO decimal places
    return `$${Math.floor(numericPrice)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  if (filteredWines.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-500">No se encontraron vinos con los criterios seleccionados.</p>
      </div>
    )
  }

  // Si estamos en "all", mostrar vinos agrupados por categoría
  if (selectedCategory === "all") {
    return (
      <div className="flex-1 overflow-auto prevent-overscroll">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          {categorizedWineData.map((category) => (
            <div key={category.categoryName} className="mb-8">
              <h2 className="font-medium text-xl mb-4 text-center">{category.categoryName}</h2>
              <div className="space-y-6">
                {category.wines
                  .filter((wine) => wine.enCarta !== false)
                  .map((wine) => (
                    <div key={wine.id} className="relative" onClick={() => setSelectedWine(wine)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{wine.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            {wine.productor}
                            {wine.ano && ` • ${wine.ano}`}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{formatPrice(wine.precio)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleBookmark(wine.id)
                            }}
                            className="p-1 rounded-full"
                            aria-label={isWineBookmarked(wine.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                          >
                            <Bookmark
                              className="h-4 w-4"
                              fill={isWineBookmarked(wine.id) ? "#c11119" : "transparent"}
                              stroke={isWineBookmarked(wine.id) ? "#c11119" : "currentColor"}
                            />
                          </button>
                        </div>
                      </div>
                      {wine.precioCopa && (
                        <div className="text-xs text-gray-500 absolute right-0 mt-1">
                          Copa {formatPrice(wine.precioCopa)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Para categorías específicas, agrupar por cepa
  const groupByGrape = (wines: typeof filteredWines) => {
    return wines.reduce(
      (acc, wine) => {
        const grape = wine.uva || "Otros"
        if (!acc[grape]) {
          acc[grape] = []
        }
        acc[grape].push(wine)
        return acc
      },
      {} as Record<string, typeof filteredWines>,
    )
  }

  const groupedByGrape = groupByGrape(filteredWines)
  const sortedGrapes = Object.keys(groupedByGrape).sort()

  return (
    <div className="flex-1 overflow-auto prevent-overscroll">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {sortedGrapes.map((grape) => (
          <div key={grape} className="mb-8">
            <h2 className="font-medium text-xl mb-4 text-center">{grape}</h2>
            <div className="space-y-6">
              {groupedByGrape[grape].map((wine) => (
                <div key={wine.id} className="relative" onClick={() => setSelectedWine(wine)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{wine.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        {wine.productor}
                        {wine.ano && ` • ${wine.ano}`}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{formatPrice(wine.precio)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(wine.id)
                        }}
                        className="p-1 rounded-full"
                        aria-label={isWineBookmarked(wine.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                      >
                        <Bookmark
                          className="h-4 w-4"
                          fill={isWineBookmarked(wine.id) ? "#c11119" : "transparent"}
                          stroke={isWineBookmarked(wine.id) ? "#c11119" : "currentColor"}
                        />
                      </button>
                    </div>
                  </div>
                  {wine.precioCopa && (
                    <div className="text-xs text-gray-500 absolute right-0 mt-1">
                      Copa {formatPrice(wine.precioCopa)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
