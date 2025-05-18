"use client"

import { useWine } from "@/context/wine-context"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

export function CategoryNav() {
  const { categorizedWineData, selectedCategory, setSelectedCategory, hasBookmarkedWines } = useWine()

  // Create a safe ID for use in the DOM
  const createSafeId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-")
  }

  const categories = [
    { id: "all", name: "All Wines" },
    { id: "glass", name: "By the Glass" },
  ]

  // Add dynamic categories from wine data
  const dynamicCategories = categorizedWineData.map((category) => ({
    id: createSafeId(category.categoryName),
    name: category.categoryName,
  }))

  // Combine all categories
  const allCategories = [...categories, ...dynamicCategories]

  return (
    <nav className="overflow-x-auto">
      <ul className="flex space-x-4 border-b">
        {allCategories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "px-2 py-2 text-sm whitespace-nowrap border-b-2 transition-colors",
                selectedCategory === category.id
                  ? "border-red-600 text-red-600 font-medium"
                  : "border-transparent hover:text-red-600",
              )}
            >
              {category.name}
            </button>
          </li>
        ))}
        {hasBookmarkedWines && (
          <li>
            <button
              onClick={() => setSelectedCategory("favorites")}
              className={cn(
                "px-2 py-2 text-sm whitespace-nowrap border-b-2 transition-colors flex items-center",
                selectedCategory === "favorites"
                  ? "border-red-600 text-red-600 font-medium"
                  : "border-transparent hover:text-red-600",
              )}
            >
              <Bookmark className="h-3 w-3 mr-1" />
              Guardado
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
