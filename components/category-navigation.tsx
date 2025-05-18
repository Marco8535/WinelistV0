"use client"

import { useWine } from "@/context/wine-context"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

export function CategoryNavigation() {
  const { categorizedWineData, selectedCategory, setSelectedCategory, hasBookmarkedWines } = useWine()

  // Create a safe ID for use in the DOM
  const createSafeId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-")
  }

  return (
    <nav className="border-b border-gray-200 overflow-x-auto">
      <div className="max-w-screen-xl mx-auto">
        <ul className="flex whitespace-nowrap px-4">
          <li>
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-3 text-sm border-b-2 transition-colors",
                selectedCategory === "all"
                  ? "border-red-600 text-red-600 font-medium"
                  : "border-transparent hover:text-red-600",
              )}
            >
              All Wines
            </button>
          </li>
          <li>
            <button
              onClick={() => setSelectedCategory("glass")}
              className={cn(
                "px-3 py-3 text-sm border-b-2 transition-colors",
                selectedCategory === "glass"
                  ? "border-red-600 text-red-600 font-medium"
                  : "border-transparent hover:text-red-600",
              )}
            >
              By the Glass
            </button>
          </li>

          {/* Categorías dinámicas - ya ordenadas desde el contexto */}
          {categorizedWineData.map((category) => (
            <li key={category.categoryName}>
              <button
                onClick={() => setSelectedCategory(createSafeId(category.categoryName))}
                className={cn(
                  "px-3 py-3 text-sm border-b-2 transition-colors",
                  selectedCategory === createSafeId(category.categoryName)
                    ? "border-red-600 text-red-600 font-medium"
                    : "border-transparent hover:text-red-600",
                )}
              >
                {category.categoryName}
              </button>
            </li>
          ))}

          {/* Botón Guardado siempre visible */}
          <li>
            <button
              onClick={() => setSelectedCategory("favorites")}
              className={cn(
                "px-3 py-3 text-sm border-b-2 transition-colors flex items-center",
                selectedCategory === "favorites"
                  ? "border-red-600 text-red-600 font-medium"
                  : "border-transparent hover:text-red-600",
              )}
            >
              <Bookmark
                className="h-3 w-3 mr-1"
                fill={hasBookmarkedWines ? "#c11119" : "transparent"}
                stroke={hasBookmarkedWines ? "#c11119" : "currentColor"}
              />
              Guardado
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
