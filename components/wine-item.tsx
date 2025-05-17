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

  // Format the sub-details line
  const formatSubDetails = () => {
    const parts = []

    if (wine.productor) parts.push(wine.productor)

    const location = []
    if (wine.region) location.push(wine.region)
    if (wine.pais) location.push(wine.pais)

    if (location.length > 0) {
      parts.push(location.join(", "))
    }

    if (wine.ano) parts.push(wine.ano)

    return parts.join(" • ")
  }

  return (
    <li className="wine-item">
      <div className="flex flex-col space-y-2 cursor-pointer" onClick={() => setSelectedWine(wine)}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold">{wine.nombre}</h3>
            <p className="text-sm text-gray-600 mt-1">{formatSubDetails()}</p>
          </div>

          <div className="flex flex-col items-end">
            <button
              onClick={handleBookmarkClick}
              className={`p-1 e-ink-button ${animateBookmark ? "bookmark-animation" : ""}`}
              aria-label={bookmarked ? "Remove from favorites" : "Add to favorites"}
            >
              <Bookmark size={20} className={bookmarked ? "fill-[#4A0404] text-[#4A0404]" : ""} />
            </button>
          </div>
        </div>

        {/* Pricing information */}
        <div className="flex justify-end text-sm">
          <div className="space-x-2">
            {wine.precio && <span className="font-medium">Botella: {wine.precio}</span>}
            {wine.precioCopaR1 && <span>Copa R1: {wine.precioCopaR1}</span>}
            {wine.precioCopaR2 && <span>Copa R2: {wine.precioCopaR2}</span>}
            {wine.precioCopaR3 && <span>Copa R3: {wine.precioCopaR3}</span>}
            {wine.precioCopa && !wine.precioCopaR1 && !wine.precioCopaR2 && !wine.precioCopaR3 && (
              <span>Copa: {wine.precioCopa}</span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
