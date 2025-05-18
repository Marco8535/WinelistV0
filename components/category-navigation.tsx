"use client"
import { useRef, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react"
import { useWine } from "@/context/wine-context"

export function CategoryNavigation() {
  const { selectedCategory, setSelectedCategory, hasBookmarkedWines, wines, categoryOrder } = useWine()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<{ id: string; label: string; fixed?: boolean }[]>([
    { id: "all", label: "All Wines", fixed: true },
    { id: "glass", label: "By the Glass" },
    { id: "favorites", label: "Guardado", fixed: true },
  ])

  // Añadir categorías dinámicas basadas en los datos
  useEffect(() => {
    if (wines && wines.length > 0) {
      // Extraer categorías únicas de los vinos usando un Map para evitar duplicados
      const uniqueCategories = new Map<string, string>()

      wines.forEach((wine) => {
        // Solo consideramos vinos que están en carta
        if (wine.enCarta) {
          // Añadimos el estilo como categoría si existe
          if (wine.estilo && wine.estilo.trim() !== "") {
            const key = wine.estilo.trim().toLowerCase()
            uniqueCategories.set(key, wine.estilo.trim())
          }

          // Añadimos el tipo como categoría si existe y no es igual al estilo
          if (wine.tipo && wine.tipo.trim() !== "") {
            const key = wine.tipo.trim().toLowerCase()
            // Evitamos duplicados entre estilo y tipo
            if (!wine.estilo || wine.estilo.trim().toLowerCase() !== key) {
              uniqueCategories.set(key, wine.tipo.trim())
            }
          }
        }
      })

      // Obtener las categorías como array
      const categoryArray = Array.from(uniqueCategories.values())

      // Crear objetos de categoría para ordenar
      const categoriesToSort = categoryArray.map((cat) => ({
        id: cat.toLowerCase().replace(/\s+/g, "-"),
        label: cat,
        fixed: false,
      }))

      // Ordenar categorías según el orden definido en el contexto

      if (categoryOrder && categoryOrder.length > 0) {
        // Crear un mapa de orden para búsqueda rápida
        const orderMap = new Map<string, number>()
        categoryOrder.forEach((config) => {
          orderMap.set(config.categoryName.toLowerCase(), config.displayOrder)
        })

        // Ordenar categorías según el mapa de orden
        categoriesToSort.sort((a, b) => {
          const orderA = orderMap.get(a.label.toLowerCase())
          const orderB = orderMap.get(b.label.toLowerCase())

          if (orderA !== undefined && orderB !== undefined) {
            return orderA - orderB
          }
          if (orderA !== undefined) return -1
          if (orderB !== undefined) return 1
          return a.label.localeCompare(b.label)
        })
      } else {
        // Si no hay configuración de orden, ordenar alfabéticamente
        categoriesToSort.sort((a, b) => a.label.localeCompare(b.label))
      }

      // Crear el array final de categorías con las fijas al principio y final
      const newCategories = [
        { id: "all", label: "All Wines", fixed: true },
        { id: "glass", label: "By the Glass", fixed: true },
        ...categoriesToSort,
        { id: "favorites", label: "Guardado", fixed: true },
      ]

      setCategories(newCategories)
    }
  }, [wines, categoryOrder])

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
