"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Wine, WineCategory, WineFilter } from "@/types/wine"
import { fetchWines } from "@/lib/fetch-wines"
import { searchWines as searchWinesFromSupabase } from "@/lib/supabase"

// Mock data for UI development - would be replaced with API calls
// const MOCK_WINES: Wine[] = [
//   {
//     id: "1",
//     nombre: "Gran Reserva Malbec",
//     productor: "Bodega Catena Zapata",
//     region: "Mendoza",
//     pais: "Argentina",
//     ano: "2018",
//     uva: "Malbec",
//     alcohol: "14.5%",
//     enologo: "Laura Catena",
//     precio: "$85",
//     precioCopaR1: "$22",
//     precioCopaR2: "$15",
//     vista: "Rojo intenso con reflejos violáceos",
//     nariz: "Aromas a frutos negros, vainilla y especias",
//     boca: "Taninos suaves, final persistente",
//     maridaje: "Carnes rojas, cordero",
//     estilo: "Tinto de cuerpo completo",
//     tipo: "Tinto",
//     caracteristica: "Vino Tinto Malbec",
//   },
//   {
//     id: "2",
//     nombre: "Chardonnay Reserva",
//     productor: "Viña Concha y Toro",
//     region: "Valle de Casablanca",
//     pais: "Chile",
//     ano: "2020",
//     uva: "Chardonnay",
//     alcohol: "13.5%",
//     precio: "$45",
//     precioCopaR1: "$12",
//     vista: "Amarillo pálido con reflejos verdosos",
//     nariz: "Notas de frutas tropicales y vainilla",
//     boca: "Fresco, con buena acidez y final largo",
//     maridaje: "Pescados, mariscos, quesos suaves",
//     estilo: "Blanco con crianza en barrica",
//     tipo: "Blanco",
//     caracteristica: "Vino Blanco Chardonnay",
//   },
//   {
//     id: "3",
//     nombre: "Brut Nature Rosé",
//     productor: "Champagne Billecart-Salmon",
//     region: "Champagne",
//     pais: "Francia",
//     ano: "NV",
//     uva: "Pinot Noir, Chardonnay",
//     alcohol: "12%",
//     precio: "$120",
//     vista: "Rosa pálido con burbujas finas",
//     nariz: "Fresas, frambuesas y notas de pan tostado",
//     boca: "Fresco, elegante, con final largo",
//     maridaje: "Aperitivos, mariscos, postres de frutas",
//     estilo: "Espumoso Brut Nature",
//     tipo: "Espumante",
//     caracteristica: "Vino Espumante Rosé",
//   },
//   {
//     id: "4",
//     nombre: "Rosé de Provence",
//     productor: "Château Minuty",
//     region: "Provence",
//     pais: "Francia",
//     ano: "2021",
//     uva: "Grenache, Cinsault, Syrah",
//     alcohol: "12.5%",
//     precio: "$55",
//     precioCopaR1: "$14",
//     vista: "Rosa pálido con reflejos salmón",
//     nariz: "Frutas rojas frescas y cítricos",
//     boca: "Seco, fresco, con final mineral",
//     maridaje: "Ensaladas, pescados, cocina mediterránea",
//     estilo: "Rosado seco",
//     tipo: "Rosado",
//     caracteristica: "Vino Rosado",
//   },
// ]

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
  const [searchResults, setSearchResults] = useState<Wine[] | null>(null)

  // Load wines from Supabase
  useEffect(() => {
    async function loadWines() {
      try {
        setLoading(true)
        const data = await fetchWines()
        setWines(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load wine data. Please try again later.")
        console.error(err)
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

  // Search wines when query changes
  useEffect(() => {
    async function performSearch() {
      if (searchQuery.trim().length > 0) {
        try {
          const results = await searchWinesFromSupabase(searchQuery)
          setSearchResults(results)
        } catch (err) {
          console.error("Search error:", err)
          setSearchResults(null)
        }
      } else {
        setSearchResults(null)
      }
    }

    const debounceTimer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

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
  const filteredWines = (searchResults || wines).filter((wine) => {
    // Filter by category
    if (selectedCategory === "favorites") {
      if (!bookmarkedWines.has(wine.id)) return false
    } else if (selectedCategory === "glass") {
      if (!wine.precioCopaR1 && !wine.precioCopaR2 && !wine.precioCopaR3 && !wine.precioCopa) return false
    } else if (selectedCategory === "red") {
      if (!wine.caracteristica?.toLowerCase().includes("tinto") && !wine.tipo?.toLowerCase().includes("tinto"))
        return false
    } else if (selectedCategory === "white") {
      if (!wine.caracteristica?.toLowerCase().includes("blanco") && !wine.tipo?.toLowerCase().includes("blanco"))
        return false
    } else if (selectedCategory === "sparkling") {
      if (
        !wine.caracteristica?.toLowerCase().includes("espumante") &&
        !wine.caracteristica?.toLowerCase().includes("espumoso") &&
        !wine.tipo?.toLowerCase().includes("espumante") &&
        !wine.tipo?.toLowerCase().includes("espumoso")
      )
        return false
    } else if (selectedCategory === "rose") {
      if (
        !wine.caracteristica?.toLowerCase().includes("rosado") &&
        !wine.caracteristica?.toLowerCase().includes("rosé") &&
        !wine.tipo?.toLowerCase().includes("rosado") &&
        !wine.tipo?.toLowerCase().includes("rosé")
      )
        return false
    }

    // Apply additional filters
    if (filters.region && filters.region.length > 0) {
      const matchesRegion = filters.region.some((region) => wine.region?.toLowerCase().includes(region.toLowerCase()))
      if (!matchesRegion) return false
    }

    if (filters.grape && filters.grape.length > 0) {
      const matchesGrape = filters.grape.some((grape) => wine.uva?.toLowerCase().includes(grape.toLowerCase()))
      if (!matchesGrape) return false
    }

    if (filters.style && filters.style.length > 0) {
      const matchesStyle = filters.style.some((style) => wine.estilo?.toLowerCase().includes(style.toLowerCase()))
      if (!matchesStyle) return false
    }

    if (filters.type && filters.type.length > 0) {
      const matchesType = filters.type.some((type) => wine.tipo?.toLowerCase().includes(type.toLowerCase()))
      if (!matchesType) return false
    }

    return true
  })

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
