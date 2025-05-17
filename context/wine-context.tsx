"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Wine, WineCategory, WineFilter } from "@/types/wine"
import { fetchAllWines, fetchWinesByCategory, searchWines } from "@/lib/api"

interface WineContextType {
  wines: Wine[]
  loading: boolean
  error: string | null
  bookmarkedWines: Set<string>
  selectedCategory: WineCategory
  searchQuery: string
  filters: WineFilter
  filteredWines: Wine[]
  selectedWine: Wine | null
  toggleBookmark: (id: string) => void
  setSelectedCategory: (category: WineCategory) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: WineFilter) => void
  setSelectedWine: (wine: Wine | null) => void
  isWineBookmarked: (id: string) => boolean
  hasBookmarkedWines: boolean
}

const WineContext = createContext<WineContextType | undefined>(undefined)

export function WineProvider({ children }: { children: ReactNode }) {
  const [wines, setWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarkedWines, setBookmarkedWines] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<WineCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<WineFilter>({})
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
  const [filteredWines, setFilteredWines] = useState<Wine[]>([])

  // Load wines from API
  useEffect(() => {
    async function loadWines() {
      try {
        setLoading(true)
        setError(null)

        let wineData: Wine[]

        if (selectedCategory !== "all") {
          wineData = await fetchWinesByCategory(selectedCategory)
        } else {
          wineData = await fetchAllWines()
        }

        setWines(wineData)
      } catch (err) {
        console.error("Error loading wines:", err)
        setError("Failed to load wine data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    // Only load from API if not in favorites view
    if (selectedCategory !== "favorites") {
      loadWines()
    } else {
      // For favorites, we filter from the existing wines
      setLoading(false)
    }
  }, [selectedCategory])

  // Handle search query changes
  useEffect(() => {
    async function performSearch() {
      if (!searchQuery) {
        // If search is cleared, revert to category-based filtering
        if (selectedCategory !== "favorites") {
          try {
            setLoading(true)
            const wineData = await fetchWinesByCategory(selectedCategory)
            setWines(wineData)
          } catch (err) {
            console.error("Error loading wines after search clear:", err)
            setError("Failed to load wine data. Please try again later.")
          } finally {
            setLoading(false)
          }
        }
        return
      }

      try {
        setLoading(true)
        const searchResults = await searchWines(searchQuery)
        setWines(searchResults)
      } catch (err) {
        console.error("Error searching wines:", err)
        setError("Failed to search wines. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    // Debounce search to avoid too many API calls
    const debounceTimeout = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(debounceTimeout)
  }, [searchQuery, selectedCategory])

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedWines")
    if (savedBookmarks) {
      setBookmarkedWines(new Set(JSON.parse(savedBookmarks)))
    }
  }, [])

  // Save bookmarks to localStorage when they change
  useEffect(() => {
    localStorage.setItem("bookmarkedWines", JSON.stringify(Array.from(bookmarkedWines)))
  }, [bookmarkedWines])

  // Apply filters to wines
  useEffect(() => {
    let result = [...wines]

    // Apply additional filters
    if (filters.region && filters.region.length > 0) {
      result = result.filter((wine) =>
        filters.region!.some((region) => wine.region?.toLowerCase().includes(region.toLowerCase())),
      )
    }

    if (filters.grape && filters.grape.length > 0) {
      result = result.filter((wine) =>
        filters.grape!.some((grape) => wine.uva?.toLowerCase().includes(grape.toLowerCase())),
      )
    }

    if (filters.style && filters.style.length > 0) {
      result = result.filter((wine) =>
        filters.style!.some((style) => wine.estilo?.toLowerCase().includes(style.toLowerCase())),
      )
    }

    if (filters.type && filters.type.length > 0) {
      result = result.filter((wine) =>
        filters.type!.some((type) => wine.tipo?.toLowerCase().includes(type.toLowerCase())),
      )
    }

    // For favorites view, filter by bookmarked wines
    if (selectedCategory === "favorites") {
      result = result.filter((wine) => bookmarkedWines.has(wine.id))
    }

    setFilteredWines(result)
  }, [wines, filters, selectedCategory, bookmarkedWines])

  // Toggle bookmark status for a wine
  const toggleBookmark = (id: string) => {
    setBookmarkedWines((prev) => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(id)) {
        newBookmarks.delete(id)
      } else {
        newBookmarks.add(id)
      }
      return newBookmarks
    })
  }

  // Check if a wine is bookmarked
  const isWineBookmarked = (id: string) => {
    return bookmarkedWines.has(id)
  }

  // Check if there are any bookmarked wines
  const hasBookmarkedWines = bookmarkedWines.size > 0

  const value = {
    wines,
    loading,
    error,
    bookmarkedWines,
    selectedCategory,
    searchQuery,
    filters,
    filteredWines,
    selectedWine,
    toggleBookmark,
    setSelectedCategory,
    setSearchQuery,
    setFilters,
    setSelectedWine,
    isWineBookmarked,
    hasBookmarkedWines,
  }

  return <WineContext.Provider value={value}>{children}</WineContext.Provider>
}

export function useWine() {
  const context = useContext(WineContext)
  if (context === undefined) {
    throw new Error("useWine must be used within a WineProvider")
  }
  return context
}
