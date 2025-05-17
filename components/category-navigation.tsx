"use client"

import type React from "react"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react"
import { useWine } from "@/context/wine-context"
import type { WineCategory } from "@/types/wine"

const categories: { id: WineCategory; label: string; icon?: React.ReactNode }[] = [
  { id: "all", label: "All Wines" },
  { id: "glass", label: "By the Glass" },
  { id: "red", label: "Red Wines" },
  { id: "white", label: "White Wines" },
  { id: "sparkling", label: "Sparkling Wines" },
  { id: "rose", label: "Rosé Wines" },
  {
    id: "favorites",
    label: "Client Favorites",
    icon: <Bookmark className="mr-1 h-4 w-4" />,
  },
]

export function CategoryNavigation() {
  const { selectedCategory, setSelectedCategory, hasBookmarkedWines } = useWine()
  const scrollRef = useRef<HTMLDivElement>(null)

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
