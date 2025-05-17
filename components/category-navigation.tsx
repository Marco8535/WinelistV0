"use client"
import { useRef, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react"
import { useWine } from "@/context/wine-context"

export function CategoryNavigation() {
  const { selectedCategory, setSelectedCategory, hasBookmarkedWines, wines } = useWine()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<{ id: string; label: string; fixed?: boolean }[]>([
    { id: "all", label: "All Wines", fixed: true },
    { id: "glass", label: "By the Glass" },
    { id: "favorites", label: "Guardado", fixed: true },
  ])

  // Añadir categorías dinámicas basadas en los datos
  useEffect(() => {
    if (wines && wines.length > 0) {
      // Extraer categorías únicas de los vinos
      const uniqueCategories = new Set<string>()

      wines.forEach((wine) => {
        if (wine.estilo && wine.estilo.trim() !== "") {
          uniqueCategories.add(wine.estilo.trim())
        }
        if (wine.tipo && wine.tipo.trim() !== "") {
          uniqueCategories.add(wine.tipo.trim())
        }
      })

      // Convertir a array y ordenar alfabéticamente
      const sortedCategories = Array.from(uniqueCategories).sort()

      // Crear el array final de categorías con las fijas al principio y final
      const newCategories = [
        { id: "all", label: "All Wines", fixed: true },
        { id: "glass", label: "By the Glass" },
        ...sortedCategories.map((cat) => ({
          id: cat.toLowerCase().replace(/\s+/g, "-"),
          label: cat,
        })),
        { id: "favorites", label: "Guardado", fixed: true },
      ]

      setCategories(newCategories)
    }
  }, [wines])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative flex items-center border-b border-gray-200">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 z-10 p-2 bg-[#F8F8F8] e-ink-button"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      <div ref={scrollRef} className="flex overflow-x-auto py-1 px-8 hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab flex items-center ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.id === "favorites" ? (
              <>
                <Bookmark size={16} className={`mr-1 ${hasBookmarkedWines ? "fill-[#4A0404] text-[#4A0404]" : ""}`} />
                {category.label}
              </>
            ) : (
              category.label
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 z-10 p-2 bg-[#F8F8F8] e-ink-button"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
