"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react"
import { useWine } from "@/context/wine-context"
import { cn } from "@/lib/utils"

export function CategoryNavigation() {
  const { categorizedWineData, selectedCategory, setSelectedCategory, hasBookmarkedWines } = useWine()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Create a safe ID for use in the DOM
  const createSafeId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-")
  }

  // Función para desplazar las categorías
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200 // Cantidad de píxeles a desplazar
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative border-b border-gray-200">
      {/* Flecha izquierda - Siempre visible */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 z-10 top-1/2 transform -translate-y-1/2 flex items-center justify-center px-2"
        aria-label="Scroll left"
      >
        <div className="w-8 h-8 flex items-center justify-center bg-[#F8F8F8] rounded-full border border-gray-200">
          <ChevronLeft className="h-5 w-5 text-black" />
        </div>
      </button>

      {/* Categorías fijas a la izquierda y categorías dinámicas */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-4 py-2 text-sm whitespace-nowrap transition-colors font-medium border-b-2",
            selectedCategory === "all" ? "border-red-600 text-red-600" : "border-transparent hover:text-red-600",
          )}
        >
          All Wines
        </button>

        <button
          onClick={() => setSelectedCategory("glass")}
          className={cn(
            "px-4 py-2 text-sm whitespace-nowrap transition-colors font-medium border-b-2",
            selectedCategory === "glass" ? "border-red-600 text-red-600" : "border-transparent hover:text-red-600",
          )}
        >
          By the Glass
        </button>

        {/* Categorías dinámicas */}
        {categorizedWineData.map((category) => (
          <button
            key={category.categoryName}
            onClick={() => setSelectedCategory(createSafeId(category.categoryName))}
            className={cn(
              "px-4 py-2 text-sm whitespace-nowrap transition-colors font-medium border-b-2",
              selectedCategory === createSafeId(category.categoryName)
                ? "border-red-600 text-red-600"
                : "border-transparent hover:text-red-600",
            )}
          >
            {category.categoryName}
          </button>
        ))}

        {/* "Guardado" fijo a la derecha */}
        <button
          onClick={() => setSelectedCategory("favorites")}
          className={cn(
            "px-4 py-2 text-sm whitespace-nowrap transition-colors flex items-center font-medium border-b-2",
            selectedCategory === "favorites" ? "border-red-600 text-red-600" : "border-transparent hover:text-red-600",
          )}
        >
          <Bookmark
            className="h-4 w-4 mr-1"
            fill={hasBookmarkedWines ? "#c11119" : "transparent"}
            stroke={hasBookmarkedWines ? "#c11119" : "currentColor"}
          />
          Guardado
        </button>
      </div>

      {/* Flecha derecha - Siempre visible */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 z-10 top-1/2 transform -translate-y-1/2 flex items-center justify-center px-2"
        aria-label="Scroll right"
      >
        <div className="w-8 h-8 flex items-center justify-center bg-[#F8F8F8] rounded-full border border-gray-200">
          <ChevronRight className="h-5 w-5 text-black" />
        </div>
      </button>
    </div>
  )
}
