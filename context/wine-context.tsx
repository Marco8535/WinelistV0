"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Wine, WineFilter, GroupedWineData } from "@/types/wine"
import { fetchWines } from "@/lib/fetch-wines"
import { processAndGroupWines } from "@/lib/process-wines"
import { fetchCategoryConfig, type CategoryConfig as FetchedCategoryConfig } from "@/lib/fetch-category-config"
import { storageService, type WineListConfig } from "@/lib/storage-service"

// Definición del tipo para el Contexto
interface WineContextType {
  wines: Wine[] // Lista plana de vinos que están en carta y procesados
  loading: boolean
  error: string | null
  categorizedWineData: GroupedWineData // Datos agrupados y ordenados por nuestro "chef"
  categoryOrder: FetchedCategoryConfig[] // Configuración de orden de categorías
  rawWinesData: Wine[] // Datos crudos de vinos

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

  // Nuevas propiedades para la configuración persistente
  savedConfig: WineListConfig | null
  saveConfiguration: (config: WineListConfig) => boolean
  refreshWineList: () => void
  configLastUpdated: number | null
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
  const [categoryOrder, setCategoryOrder] = useState<FetchedCategoryConfig[]>([])

  // Nuevos estados para la configuración persistente
  const [savedConfig, setSavedConfig] = useState<WineListConfig | null>(null)
  const [configLastUpdated, setConfigLastUpdated] = useState<number | null>(null)
  const [rawWinesData, setRawWinesData] = useState<Wine[]>([])
  const [rawCategoryConfig, setRawCategoryConfig] = useState<FetchedCategoryConfig[]>([])
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false)

  // Cargar la configuración guardada al inicio
  useEffect(() => {
    const loadedConfig = storageService.loadConfig()
    if (loadedConfig) {
      setSavedConfig(loadedConfig)
      setConfigLastUpdated(loadedConfig.lastUpdated)
    }
  }, [])

  // Función para guardar la configuración
  const saveConfiguration = (config: WineListConfig): boolean => {
    try {
      // Log para depuración
      console.log("Config received in saveConfiguration:", JSON.stringify(config, null, 2))

      // Asegurarse de que la configuración tenga un timestamp actualizado
      const configWithTimestamp = {
        ...config,
        lastUpdated: Date.now(),
      }

      // Guardar la configuración en localStorage
      const success = storageService.saveConfig(configWithTimestamp)

      if (success) {
        // Actualizar el estado local con la nueva configuración
        setSavedConfig(configWithTimestamp)
        setConfigLastUpdated(configWithTimestamp.lastUpdated)

        // Marcar que se necesita un refresco de la lista de vinos
        setNeedsRefresh(true)

        // Aplicar inmediatamente la configuración a los vinos
        if (rawWinesData.length > 0) {
          processWinesWithConfig(rawWinesData, rawCategoryConfig, configWithTimestamp)
        }

        console.log("Configuración guardada y aplicada correctamente:", configWithTimestamp)
        return true
      }
      return false
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      return false
    }
  }

  // Función para refrescar la lista de vinos con la configuración guardada
  const refreshWineList = () => {
    if (rawWinesData.length > 0) {
      processWinesWithConfig(rawWinesData, rawCategoryConfig, savedConfig)
      setNeedsRefresh(false)
    }
  }

  // Procesar vinos con la configuración guardada
  const processWinesWithConfig = (
    rawWines: Wine[],
    categoryConfigData: FetchedCategoryConfig[],
    config: WineListConfig | null,
  ) => {
    console.log("Procesando vinos con configuración:", config)

    // Crear copias para no modificar los originales
    let processedWines = [...rawWines]

    // Si hay configuración guardada, aplicarla
    if (config) {
      // Aplicar visibilidad de vinos
      processedWines = processedWines.map((wine) => {
        const wineConfig = config.wines.find((w) => w.id === wine.id)
        if (wineConfig) {
          // Log antes de actualizar
          console.log(
            `MATCH FOUND: Wine ID ${wine.id} (${wine.nombre}) matched with config. Raw enCarta: ${wine.enCarta}. Config.visible: ${wineConfig.visible}`,
          )

          // Aplicamos explícitamente la visibilidad y el orden
          const updatedWine = {
            ...wine,
            enCarta: wineConfig.visible,
            orden: wineConfig.order,
          }

          // Log después de actualizar
          console.log(`Updated wine ID ${updatedWine.id} (${updatedWine.nombre}). New enCarta: ${updatedWine.enCarta}`)

          // Log para depuración
          if (!wineConfig.visible) {
            console.log(`Vino marcado como no visible: ${wine.nombre} (ID: ${wine.id})`)
          }

          return updatedWine
        }

        // Log si no hay config
        console.log(
          `NO MATCH: Wine ID ${wine.id} (${wine.nombre}). No specific config found. enCarta remains: ${wine.enCarta}`,
        )
        return wine
      })

      // Log después del map, antes de llamar a processAndGroupWines
      console.log("Processed wines before grouping (sample):", JSON.stringify(processedWines.slice(0, 5), null, 2))
    }

    // Crear un mapa de orden de categorías desde la configuración guardada
    const categoryOrderMap = new Map<string, number>()

    if (config && config.categories.length > 0) {
      // Usar la configuración guardada para el orden de categorías
      config.categories.forEach((cat) => {
        categoryOrderMap.set(cat.name, cat.order)
      })
    } else if (categoryConfigData.length > 0) {
      // Usar la configuración predeterminada si no hay configuración guardada
      categoryConfigData.forEach((cat) => {
        categoryOrderMap.set(cat.categoryName, cat.displayOrder)
      })
    }

    // IMPORTANTE: Guardar todos los vinos en el estado rawWinesData para que estén disponibles en la administración
    setRawWinesData(rawWines)

    // Procesar y agrupar vinos con la configuración aplicada
    // IMPORTANTE: Solo para la visualización del cliente, filtramos por enCarta=true
    const processedAndCategorizedData = processAndGroupWines(processedWines, categoryConfigData)

    // Ordenar las categorías según la configuración
    const sortedCategorizedData = [...processedAndCategorizedData].sort((a, b) => {
      const orderA = categoryOrderMap.get(a.categoryName) || Number.MAX_SAFE_INTEGER
      const orderB = categoryOrderMap.get(b.categoryName) || Number.MAX_SAFE_INTEGER
      return orderA - orderB
    })

    // Actualizar estados
    setCategorizedWineData(sortedCategorizedData)

    // Crear una lista plana de vinos únicos
    const uniqueWines = new Map<string, Wine>()
    sortedCategorizedData.forEach((category) => {
      category.wines.forEach((wine) => {
        if (!uniqueWines.has(wine.id)) {
          uniqueWines.set(wine.id, wine)
        }
      })
    })

    // IMPORTANTE: Para la vista del cliente, filtramos por enCarta=true
    // Pero guardamos todos los vinos en rawWinesData para la administración
    setWines(Array.from(uniqueWines.values()))

    // Verificar si hay vinos disponibles después del procesamiento
    if (sortedCategorizedData.length === 0) {
      setError("No hay vinos disponibles en la carta que cumplan los criterios de procesamiento.")
    } else {
      setError(null)
    }
  }

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

        // Guardar los datos crudos para futuros procesamientos
        setRawWinesData(rawWinesFromSheet)
        setRawCategoryConfig(categoryConfigData)

        // Guardar la configuración de orden en el estado
        setCategoryOrder(categoryConfigData)

        // Procesar vinos con la configuración guardada
        processWinesWithConfig(rawWinesFromSheet, categoryConfigData, savedConfig)
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
  }, [savedConfig]) // Añadimos savedConfig como dependencia para que se ejecute cuando cambie

  // Refrescar la lista cuando cambia la configuración o se solicita un refresco
  useEffect(() => {
    if (needsRefresh) {
      refreshWineList()
    }
  }, [needsRefresh])

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
    rawWinesData,

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

    // Nuevas propiedades para la configuración persistente
    savedConfig,
    saveConfiguration,
    refreshWineList,
    configLastUpdated,
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
