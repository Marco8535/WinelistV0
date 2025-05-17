"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Wine, WineCategory, WineFilter } from "@/types/wine"
import { fetchWines } from "@/lib/fetch-wines"

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

  // Load wines from CSV
  useEffect(() => {
    async function loadWines() {
      try {
        setLoading(true)
        const data = await fetchWines()

        // Filtrar solo los vinos que están en la carta (EnCarta_Restaurante1 = true)
        const availableWines = data.filter((wine) => wine.enCarta !== false)

        if (availableWines.length === 0) {
          setError("No se encontraron vinos disponibles en la carta. Verifica que la URL del CSV sea correcta.")
        } else {
          setWines(availableWines)
          setError(null)
        }
      } catch (err: any) {
        setError(`Error al cargar los datos de vinos: ${err.message}`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadWines()
  }, [])

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

  // Filter wines based on category, search query, and filters
  const filteredWines = wines.filter((wine) => {
    // Filter by category
    if (selectedCategory === "favorites") {
      if (!bookmarkedWines.has(wine.id)) return false
    } else if (selectedCategory === "glass") {
      if (!wine.precioCopa) return false
    } else if (selectedCategory === "red") {
      const lowerTipo = wine.tipo?.toLowerCase() || ""
      const lowerCaracteristica = wine.caracteristica?.toLowerCase() || ""
      if (
        !lowerTipo.includes("tinto") &&
        !lowerTipo.includes("red") &&
        !lowerCaracteristica.includes("tinto") &&
        !lowerCaracteristica.includes("red")
      ) {
        return false
      }
    } else if (selectedCategory === "white") {
      const lowerTipo = wine.tipo?.toLowerCase() || ""
      const lowerCaracteristica = wine.caracteristica?.toLowerCase() || ""
      if (
        !lowerTipo.includes("blanco") &&
        !lowerTipo.includes("white") &&
        !lowerCaracteristica.includes("blanco") &&
        !lowerCaracteristica.includes("white")
      ) {
        return false
      }
    } else if (selectedCategory === "sparkling") {
      const lowerTipo = wine.tipo?.toLowerCase() || ""
      const lowerCaracteristica = wine.caracteristica?.toLowerCase() || ""
      if (
        !lowerTipo.includes("espumante") &&
        !lowerTipo.includes("espumoso") &&
        !lowerTipo.includes("sparkling") &&
        !lowerCaracteristica.includes("espumante") &&
        !lowerCaracteristica.includes("espumoso") &&
        !lowerCaracteristica.includes("sparkling")
      ) {
        return false
      }
    } else if (selectedCategory === "rose") {
      const lowerTipo = wine.tipo?.toLowerCase() || ""
      const lowerCaracteristica = wine.caracteristica?.toLowerCase() || ""
      if (
        !lowerTipo.includes("rosado") &&
        !lowerTipo.includes("rosé") &&
        !lowerTipo.includes("rose") &&
        !lowerCaracteristica.includes("rosado") &&
        !lowerCaracteristica.includes("rosé") &&
        !lowerCaracteristica.includes("rose")
      ) {
        return false
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        (wine.nombre?.toLowerCase() || "").includes(query) ||
        (wine.productor?.toLowerCase() || "").includes(query) ||
        (wine.uva?.toLowerCase() || "").includes(query) ||
        (wine.region?.toLowerCase() || "").includes(query)

      if (!matchesSearch) return false
    }

    // Apply additional filters
    if (filters.region && filters.region.length > 0) {
      const wineRegion = wine.region?.toLowerCase() || ""
      const matchesRegion = filters.region.some((region) => wineRegion.includes(region.toLowerCase()))
      if (!matchesRegion) return false
    }

    if (filters.grape && filters.grape.length > 0) {
      const wineGrape = wine.uva?.toLowerCase() || ""
      const matchesGrape = filters.grape.some((grape) => wineGrape.includes(grape.toLowerCase()))
      if (!matchesGrape) return false
    }

    if (filters.style && filters.style.length > 0) {
      const wineStyle = wine.estilo?.toLowerCase() || ""
      const matchesStyle = filters.style.some((style) => wineStyle.includes(style.toLowerCase()))
      if (!matchesStyle) return false
    }

    if (filters.type && filters.type.length > 0) {
      const wineType = wine.tipo?.toLowerCase() || ""
      const matchesType = filters.type.some((type) => wineType.includes(type.toLowerCase()))
      if (!matchesType) return false
    }

    return true
  })

  // Sort wines by order if available, otherwise by name
  const sortedFilteredWines = [...filteredWines].sort((a, b) => {
    // First by order if available
    if (a.orden !== undefined && b.orden !== undefined) {
      return a.orden - b.orden
    }

    // Then by name
    return (a.nombre || "").localeCompare(b.nombre || "")
  })

  const value = {
    wines,
    loading,
    error,
    bookmarkedWines,
    selectedCategory,
    searchQuery,
    filters,
    filteredWines: sortedFilteredWines,
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
