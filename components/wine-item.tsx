"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"
import { useWine } from "@/context/wine-context"
import type { Wine } from "@/types/wine"

interface WineItemProps {
  wine: Wine
}

export function WineItem({ wine }: WineItemProps) {
  const { toggleBookmark, isWineBookmarked, setSelectedWine } = useWine()
  const [bookmarked, setBookmarked] = useState(isWineBookmarked(wine.id))
  const [animateBookmark, setAnimateBookmark] = useState(false)

  // Update bookmarked state when it changes in context
  useEffect(() => {
    setBookmarked(isWineBookmarked(wine.id))
  }, [wine.id, isWineBookmarked])

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleBookmark(wine.id)
    setAnimateBookmark(true)

    // Reset animation after it completes
    setTimeout(() => {
      setAnimateBookmark(false)
    }, 300)
  }

  // Format price display
  const formatPrice = (price: number | string | undefined | null) => {
    if (price === undefined || price === null || price === "") return ""

    // Convert to string if it's a number
    const priceStr = typeof price === "number" ? price.toString() : price

    // If price is already formatted with currency symbol, return as is
    if (priceStr.startsWith("$") || priceStr.startsWith("€")) {
      return priceStr
    }

    // Otherwise, add $ symbol
    return `$${priceStr}`
  }

  return (
    <li className="wine-item py-3">
      <div className="flex flex-col space-y-1 cursor-pointer" onClick={() => setSelectedWine(wine)}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Nombre_Vino_Completo en negrita */}
            <h3 className="text-xl font-bold">{wine.nombre}</h3>

            {/* Información secundaria: Bodega y Cosecha */}
            <div className="text-sm text-gray-600 mt-1">
              {wine.productor && <span>{wine.productor}</span>}
              {wine.productor && wine.ano && <span> • </span>}
              {wine.ano && <span>{wine.ano}</span>}
            </div>
          </div>

          <div className="flex flex-col items-end">
            {/* Precio por botella en negrita */}
            {wine.precio !== undefined && wine.precio !== null && (
              <span className="font-bold text-right mb-1">{formatPrice(wine.precio)}</span>
            )}

            <button
              onClick={handleBookmarkClick}
              className={`p-1 e-ink-button ${animateBookmark ? "bookmark-animation" : ""}`}
              aria-label={bookmarked ? "Remove from favorites" : "Add to favorites"}
            >
              <Bookmark size={20} className={bookmarked ? "fill-[#4A0404] text-[#4A0404]" : ""} />
            </button>
          </div>
        </div>

        {/* Precio por copa en gris */}
        {wine.precioCopa !== undefined && wine.precioCopa !== null && (
          <div className="flex justify-end text-sm text-gray-600">
            <span>Copa: {formatPrice(wine.precioCopa)}</span>
          </div>
        )}
      </div>
    </li>
  )
}
