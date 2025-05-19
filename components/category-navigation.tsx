"use client"

import { useWine } from "@/context/wine-context"
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef, useEffect, useState } from "react"

export function CategoryNavigation() {
  const { categorizedWineData, selectedCategory, setSelectedCategory, hasBookmarkedWines } = useWine()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Create a safe ID for use in the DOM
  const createSafeId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-")
  }

  // Función para desplazar las categorías
  const scrollCategories = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200 // Cantidad de píxeles a desplazar
      const currentScroll = scrollContainerRef.current.scrollLeft

      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Monitorear el scroll para mostrar/ocultar flechas
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

      // Mostrar flecha izquierda si no estamos al inicio
      setShowLeftArrow(scrollLeft > 10)

      // Mostrar flecha derecha si no estamos al final
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      // Verificar inicialmente si se necesitan las flechas
      handleScroll()
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [categorizedWineData])

  return (
    <nav className="border-b border-gray-200 relative">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        {/* Categorías fijas a la izquierda */}
        <div className="flex whitespace-nowrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-4 py-3 text-sm border-b-2 transition-colors font-medium",
              selectedCategory === "all" ? "border-red-600 text-red-600" : "border-transparent hover:text-red-600",
            )}
          >
            All Wines
          </button>
          <button
            onClick={() => setSelectedCategory("glass")}
            className={cn(
              "px-4 py-3 text-sm border-b-2 transition-colors font-medium",
              selectedCategory === "glass" ? "border-red-600 text-red-600" : "border-transparent hover:text-red-600",
            )}
          >
            By the Glass
          </button>
        </div>

        {/* Contenedor central con flechas de navegación */}
        <div className="flex-1 relative flex items-center px-2">
          {/* Flecha izquierda */}
          {showLeftArrow && (
            <button
              onClick={() => scrollCategories("left")}
              className="absolute left-0 z-10 bg-white/80 rounded-full p-1 shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
          )}

          {/* Categorías dinámicas - se desplazan horizontalmente */}
          <div
            className="flex-1 overflow-x-auto scrollbar-hide mx-6"
            ref={scrollContainerRef}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex whitespace-nowrap">
              {categorizedWineData.map((category) => (
                <button
                  key={category.categoryName}
                  onClick={() => setSelectedCategory(createSafeId(category.categoryName))}
                  className={cn(
                    "px-4 py-3 text-sm border-b-2 transition-colors font-medium",
                    selectedCategory === createSafeId(category.categoryName)
                      ? "border-red-600 text-red-600"
                      : "border-transparent hover:text-red-600",
                  )}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>
          </div>

          {/* Flecha derecha */}
          {showRightArrow && (
            <button
              onClick={() => scrollCategories("right")}
              className="absolute right-0 z-10 bg-white/80 rounded-full p-1 shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* "Guardado" fijo a la derecha */}
        <button
          onClick={() => setSelectedCategory("favorites")}
          className={cn(
            "px-4 py-3 text-sm border-b-2 transition-colors flex items-center font-medium",
            selectedCategory === "favorites" ? "border-red-600 text-red-600" : "border-transparent hover:text-red-600",
          )}
        >
          <Bookmark
            className="h-3 w-3 mr-1"
            fill={hasBookmarkedWines ? "#c11119" : "transparent"}
            stroke={hasBookmarkedWines ? "#c11119" : "currentColor"}
          />
          Guardado
        </button>
      </div>
    </nav>
  )
}
