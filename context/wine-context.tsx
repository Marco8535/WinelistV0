// Archivo: context/wine-context.tsx

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Wine, WineFilter, GroupedWineData } from "@/types/wine"
import { fetchWines } from "@/lib/fetch-wines"
import { processAndGroupWines } from "@/lib/process-wines"
import { fetchCategoryConfig, type CategoryConfig } from "@/lib/fetch-category-config"

// Definición del tipo para el Contexto
interface WineContextType {
  wines: Wine[] // Lista plana de vinos que están en carta y procesados
  loading: boolean
  error: string | null
  categorizedWineData: GroupedWineData // Datos agrupados y ordenados por nuestro "chef"
  categoryOrder: CategoryConfig[] // Configuración de orden de categorías

  // Tus otras propiedades existentes:
  bookmarkedWines: Set<string>
  selectedCategory: string // Tipo renombrado para evitar conflicto
  searchQuery: string
  filters: WineFilter
  filteredWines: Wine[] // Vinos después de aplicar filtros de UI
  selectedWine: Wine | null
  toggleBookmark: (id: string) => void
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: WineFilter) => void
  setSelectedWine: (wine: Wine | null) => void
  isWineBookmarked: (id: string) => boolean
  hasBookmarkedWines: boolean
}

const WineContext = createContext<WineContextType | undefined>(undefined)

export function WineProvider({ children }: { children: ReactNode }) {
  // Estados del contexto
  const [wines, setWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categorizedWineData, setCategorizedWineData] = useState<GroupedWineData>([])

  // Otros estados que ya tenías
  const [bookmarkedWines, setBookmarkedWines] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<WineFilter>({})
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
  const [categoryOrder, setCategoryOrder] = useState<CategoryConfig[]>([])

  // useEffect para cargar y procesar los vinos al inicio
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        setError(null)
        setCategorizedWineData([]) // Limpiar datos previos mientras carga
        setWines([]) // Limpiar datos previos

        // Cargar vinos y configuración de orden de categorías en paralelo
        const [rawWinesFromSheet, categoryConfigData] = await Promise.all([fetchWines(), fetchCategoryConfig()])

        // Guardar la configuración de orden en el estado
        setCategoryOrder(categoryConfigData)

        // Pasar AMBOS, los vinos crudos Y la configuración de orden, a processAndGroupWines
        const processedAndCategorizedData = processAndGroupWines(rawWinesFromSheet, categoryConfigData)

        if (processedAndCategorizedData.length === 0) {
          if (rawWinesFromSheet.length === 0 && !error) {
            setError("No se pudieron cargar los datos de vinos desde la fuente.")
          } else {
            setError("No hay vinos disponibles en la carta que cumplan los criterios de procesamiento.")
          }
        } else {
          setCategorizedWineData(processedAndCategorizedData)

          // Crear una lista plana de vinos únicos
          const uniqueWines = new Map<string, Wine>()
          processedAndCategorizedData.forEach((category) => {
            category.wines.forEach((wine) => {
              if (!uniqueWines.has(wine.id)) {
                uniqueWines.set(wine.id, wine)
              }
            })
          })

          setWines(Array.from(uniqueWines.values()))
          setError(null)
        }
      } catch (err: any) {
        setError(`Error crítico al cargar datos iniciales: ${err.message}`)
        console.error("Error en loadInitialData (WineContext):", err)
        setWines([])
        setCategorizedWineData([])
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, []) // El [] vacío asegura que se ejecute solo una vez

  // Tus otros useEffects para bookmarks (sin cambios)
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedWines")
    if (savedBookmarks) {
      setBookmarkedWines(new Set(JSON.parse(savedBookmarks)))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("bookmarkedWines", JSON.stringify(Array.from(bookmarkedWines)))
  }, [bookmarkedWines])

  // Tus otras funciones (toggleBookmark, etc. - sin cambios)
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

  const isWineBookmarked = (id: string) => {
    return bookmarkedWines.has(id)
  }

  const hasBookmarkedWines = bookmarkedWines.size > 0

  // Lógica para 'filteredWines' y 'sortedFilteredWines' (opera sobre el estado 'wines')
  const filteredWinesLogic = wines.filter((wine) => {
    // Solo mostrar vinos que están en la carta
    if (wine.enCarta === false) return false

    // Filtrar por categoría
    if (selectedCategory === "favorites") {
      if (!bookmarkedWines.has(wine.id)) return false
    } else if (selectedCategory === "glass") {
      if (wine.precioCopa === undefined || wine.precioCopa === null) return false
    } else if (selectedCategory !== "all") {
      // Para categorías dinámicas, buscar en el categorizedWineData
      const categoryName = selectedCategory.replace(/-/g, " ")

      // Buscar la categoría en categorizedWineData
      const category = categorizedWineData.find((cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase())

      // Si la categoría existe, verificar si el vino está en esa categoría
      if (category) {
        const wineInCategory = category.wines.some((w) => w.id === wine.id)
        if (!wineInCategory) return false
      } else {
        // Si la categoría no existe, no mostrar ningún vino
        return false
      }
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        (wine.nombre?.toLowerCase() || "").includes(query) ||
        (wine.productor?.toLowerCase() || "").includes(query) ||
        (wine.uva?.toLowerCase() || "").includes(query) ||
        (wine.region?.toLowerCase() || "").includes(query)

      if (!matchesSearch) return false
    }

    // Aplicar filtros adicionales
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

  const sortedFilteredWines = [...filteredWinesLogic].sort((a, b) => {
    if (typeof a.orden === "number" && typeof b.orden === "number") {
      if (a.orden !== b.orden) return a.orden - b.orden
    } else if (typeof a.orden === "number") {
      return -1
    } else if (typeof b.orden === "number") {
      return 1
    }
    return (a.nombre || "").localeCompare(b.nombre || "")
  })

  // Objeto 'value' que el Provider entrega a sus hijos
  const value = {
    wines,
    loading,
    error,
    categorizedWineData,
    categoryOrder,

    bookmarkedWines,
    selectedCategory,
    setSearchQuery,
    searchQuery,
    filters,
    setFilters,
    filteredWines: sortedFilteredWines,
    selectedWine,
    setSelectedWine,
    toggleBookmark,
    setSelectedCategory,
    isWineBookmarked,
    hasBookmarkedWines,
  }

  return <WineContext.Provider value={value}>{children}</WineContext.Provider>
}

// Hook personalizado para usar el contexto
export function useWine() {
  const context = useContext(WineContext)
  if (context === undefined) {
    throw new Error(
      "useWine must be used within a WineProvider. Asegúrate de que el componente que usa useWine esté envuelto por WineProvider.",
    )
  }
  return context
}
