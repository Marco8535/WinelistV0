"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Bookmark, Heart, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { BookmarkState } from "./wine-list"

interface Wine {
  id: string
  name: string
  displayName: string
  type: string
  region?: string
  year: string
  price: number
  description: string
  glass?: number
  winery: string
  grape: string
  range?: string
  sku?: string
  supplier?: string
  alcohol?: string
  volume?: string
  origin?: string
  notes?: string
  pairings?: string
  latitude?: number
  longitude?: number
  terroir?: string
  isSommelierFavorite?: boolean
  imageUrl?: string
  winemaker?: string
}

interface WineCarouselProps {
  wines: Wine[]
  onWineClick: (wine: Wine) => void
  bookmarkStates: Record<string, BookmarkState>
  onBookmarkToggle: (id: string, e?: React.MouseEvent) => void
  isFavoriteTab: boolean
  onRemoveBookmark: (id: string, e?: React.MouseEvent) => void
  wineTypeColors: Record<string, string>
}

export function WineCarousel({
  wines,
  onWineClick,
  bookmarkStates,
  onBookmarkToggle,
  isFavoriteTab,
  onRemoveBookmark,
  wineTypeColors,
}: WineCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === wines.length - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? wines.length - 1 : prevIndex - 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Get color for the type of wine
  const getWineTypeColor = (type: string): string => {
    return wineTypeColors[type] || "bg-gray-100 text-gray-800 border-gray-200" // Default color
  }

  // Render bookmark icon based on state
  const renderBookmarkIcon = (state: BookmarkState) => {
    return state === "bookmark" ? (
      <Bookmark className="h-6 w-6 fill-current" />
    ) : (
      <Bookmark className="h-6 w-6 fill-none" />
    )
  }

  if (wines.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No se encontraron vinos con los filtros seleccionados.</p>
      </div>
    )
  }

  const currentWine = wines[currentIndex]

  return (
    <div className="relative w-full">
      <div
        ref={carouselRef}
        className="w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Card
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow mx-auto max-w-md"
          onClick={() => onWineClick(currentWine)}
        >
          <div className="flex flex-col">
            {/* Wine Image */}
            <div className="w-full relative bg-gray-50 border-b p-4 flex items-center justify-center h-64">
              <div className="relative w-full h-full">
                <Image
                  src={currentWine.imageUrl || "/placeholder.svg?height=300&width=200&text=Vino"}
                  alt={currentWine.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>

            {/* Wine Content */}
            <div className="w-full flex flex-col">
              <CardHeader className="relative pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">{currentWine.displayName}</CardTitle>
                    <CardDescription>
                      {currentWine.winery} • {currentWine.origin} • {currentWine.year}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {currentWine.isSommelierFavorite && (
                      <span className="text-rose-500" title="Favorito del Sommelier">
                        <Heart className="h-4 w-4 fill-current" />
                      </span>
                    )}
                    {!isFavoriteTab ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onBookmarkToggle(currentWine.id, e)
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Marcar vino"
                      >
                        {renderBookmarkIcon(bookmarkStates[currentWine.id] || "none")}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveBookmark(currentWine.id, e)
                        }}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Quitar de favoritos"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline" className="rounded-full">
                    {currentWine.grape}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {currentWine.terroir}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{currentWine.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-sm">
                  <span className="font-medium">${currentWine.price.toLocaleString("es-AR")}</span>
                  {currentWine.glass && (
                    <span className="ml-3 text-muted-foreground">
                      Copa: ${currentWine.glass.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>
                <Badge variant="outline" className={cn("rounded-full", getWineTypeColor(currentWine.type))}>
                  {currentWine.type}
                </Badge>
              </CardFooter>
            </div>
          </div>
        </Card>

        {/* Navigation Controls */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              prevSlide()
            }}
            aria-label="Vino anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {wines.length}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              nextSlide()
            }}
            aria-label="Siguiente vino"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
