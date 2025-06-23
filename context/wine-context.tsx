"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Wine, WineFilter, GroupedWineData, AppConfig } from "@/types/wine"
import { createClient } from "@/lib/supabase/client"
import { processAndGroupWines } from "@/lib/process-wines"

// Category configuration type
interface CategoryConfig {
  name: string
  order: number
  visible: boolean
}

// Restaurant data type
interface RestaurantData {
  id: string
  name: string
  subdomain: string
  logo_url?: string
  primary_color: string
  secondary_color: string
}

// Props type for WineProvider
interface WineProviderProps {
  children: ReactNode
  restaurant?: RestaurantData | null
}

// Context type definition
interface WineContextType {
  wines: Wine[]
  loading: boolean
  error: string | null
  categorizedWineData: GroupedWineData
  rawWinesData: Wine[]

  // Restaurant and configuration data
  restaurant: RestaurantData | null
  appConfig: AppConfig | null
  categoriesConfig: CategoryConfig[]

  // UI state
  bookmarkedWines: Set<string>
  selectedCategory: string
  searchQuery: string
  filters: WineFilter
  filteredWines: Wine[]
  selectedWine: Wine | null

  // Actions
  toggleBookmark: (id: string) => void
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: WineFilter) => void
  setSelectedWine: (wine: Wine | null) => void
  isWineBookmarked: (id: string) => boolean
  hasBookmarkedWines: boolean

  // Configuration management
  saveAppConfiguration: (config: AppConfig) => Promise<boolean>
  saveCategoriesOrder: (categories: CategoryConfig[]) => Promise<boolean>
  saveWineOrder: (wineId: string, order: number, visible: boolean) => Promise<boolean>
  refreshData: () => Promise<void>

  // Legacy compatibility
  savedConfig: any
  saveConfiguration: (config: any) => boolean
  refreshWineList: () => void
  configLastUpdated: number | null
}

const WineContext = createContext<WineContextType | undefined>(undefined)

export function WineProvider({ children, restaurant: restaurantProp }: WineProviderProps) {
  // Core states
  const [wines, setWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categorizedWineData, setCategorizedWineData] = useState<GroupedWineData>([])
  const [rawWinesData, setRawWinesData] = useState<Wine[]>([])

  // Restaurant and configuration data
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(restaurantProp || null)
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [categoriesConfig, setCategoriesConfig] = useState<CategoryConfig[]>([])

  // UI states
  const [bookmarkedWines, setBookmarkedWines] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<WineFilter>({})
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)

  const supabase = createClient() // Ahora puede ser SupabaseClient | undefined

  // Update restaurant when prop changes
  useEffect(() => {
    setRestaurant(restaurantProp || null)
  }, [restaurantProp])

  // Load initial data from Supabase (Prompt A.1 - Solo Lectura)
  const loadInitialData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        setError(
          "Error: Las credenciales de Supabase no están configuradas. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        )
        setLoading(false)
        return
      }

      // Si no hay información del restaurante, no podemos cargar datos
      if (!restaurant) {
        console.log("[WineContext] No restaurant information available, skipping data load")
        setLoading(false)
        return
      }

      console.log(`[WineContext] Loading data for restaurant: ${restaurant.name} (ID: ${restaurant.id})`)

      // Step 1: Get wines for this restaurant
      const { data: winesData, error: winesError } = await supabase
        .from("wines")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("orden", { ascending: true })

      if (winesError) {
        console.error("Error fetching wines:", winesError)
        throw new Error(`Error loading wines: ${winesError.message}`)
      }

      console.log(`[WineContext] Found ${winesData?.length || 0} wines`)

      // Convert Supabase data to Wine interface
      const convertedWines: Wine[] = (winesData || []).map((wine: any) => ({
        id: wine.id,
        idInterno: wine.id_interno,
        nombre: wine.nombre,
        productor: wine.productor,
        region: wine.region,
        pais: wine.pais,
        ano: wine.ano,
        uva: wine.uva,
        alcohol: wine.alcohol,
        enologo: wine.enologo,
        precio: wine.precio,
        precioCopa: wine.precio_copa,
        precioCopaR1: wine.precio_copa_r1,
        precioCopaR2: wine.precio_copa_r2,
        precioCopaR3: wine.precio_copa_r3,
        precioUSD: wine.precio_usd,
        vista: wine.vista,
        nariz: wine.nariz,
        boca: wine.boca,
        maridaje: wine.maridaje,
        otros: wine.otros,
        altitud: wine.altitud,
        estilo: wine.estilo,
        tipo: wine.tipo,
        caracteristica: wine.caracteristica,
        enCarta: wine.en_carta,
        orden: wine.orden,
        isPremiumWinery: wine.is_premium_winery,
        premiumContent: wine.premium_content ? JSON.parse(wine.premium_content) : undefined,
      }))

      setRawWinesData(convertedWines)

      // Step 2: Get app settings
      const { data: appSettingsData, error: appSettingsError } = await supabase
        .from("app_settings")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .single()

      if (!appSettingsError && appSettingsData) {
        const appConfigData: AppConfig = {
          sommelierEnabled: appSettingsData.sommelier_enabled,
          sommelierPhone: appSettingsData.sommelier_phone,
          whatsappEnabled: appSettingsData.whatsapp_enabled,
          emailEnabled: appSettingsData.email_enabled,
          contactEmail: appSettingsData.contact_email,
          restaurantName: appSettingsData.restaurant_name,
          restaurantAddress: appSettingsData.restaurant_address,
          currencySymbol: appSettingsData.currency_symbol,
          appTitle: appSettingsData.app_title,
          showPrices: appSettingsData.show_prices,
          showAlcohol: appSettingsData.show_alcohol,
          compactView: appSettingsData.compact_view,
        }
        setAppConfig(appConfigData)
        console.log(`[WineContext] Loaded app config:`, appConfigData)
      } else {
        console.warn("No app settings found for restaurant")
      }

      // Step 3: Get categories settings
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories_settings")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("display_order", { ascending: true })

      const categoriesConfigData: CategoryConfig[] = (categoriesData || []).map((cat: any) => ({
        name: cat.name,
        order: cat.display_order,
        visible: cat.visible,
      }))
      setCategoriesConfig(categoriesConfigData)
      console.log(`[WineContext] Loaded ${categoriesConfigData.length} category configs`)

      // Step 4: Process wines with categories configuration
      const processedData = processAndGroupWines(convertedWines, categoriesConfigData)
      setCategorizedWineData(processedData)

      // Step 5: Set wines for UI (only wines that are en_carta = true)
      const visibleWines = convertedWines.filter((wine) => wine.enCarta !== false)
      setWines(visibleWines)

      console.log(
        `[WineContext] Successfully loaded ${visibleWines.length} visible wines in ${processedData.length} categories`,
      )
    } catch (err) {
      console.error("Error loading initial data:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Save app configuration (Prompt A.2 - Escritura)
  const saveAppConfiguration = async (config: AppConfig): Promise<boolean> => {
    try {
      if (!restaurant) {
        console.error("No restaurant data available")
        return false
      }

      const response = await fetch("/api/settings/app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          config,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save app configuration: ${response.statusText}`)
      }

      setAppConfig(config)
      console.log("App configuration saved successfully")
      return true
    } catch (error) {
      console.error("Error saving app configuration:", error)
      return false
    }
  }

  // Save categories order (Prompt A.2 - Escritura)
  const saveCategoriesOrder = async (categories: CategoryConfig[]): Promise<boolean> => {
    try {
      if (!restaurant) {
        console.error("No restaurant data available")
        return false
      }

      const response = await fetch("/api/settings/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          categories,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save categories order: ${response.statusText}`)
      }

      setCategoriesConfig(categories)
      console.log("Categories order saved successfully")
      return true
    } catch (error) {
      console.error("Error saving categories order:", error)
      return false
    }
  }

  // Save wine order and visibility (Prompt A.2 - Escritura)
  const saveWineOrder = async (wineId: string, order: number, visible: boolean): Promise<boolean> => {
    try {
      if (!restaurant) {
        console.error("No restaurant data available")
        return false
      }

      const response = await fetch("/api/settings/wines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          wine_id: wineId,
          order,
          visible,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save wine order: ${response.statusText}`)
      }

      // Update local state
      setRawWinesData((prev) =>
        prev.map((wine) => (wine.id === wineId ? { ...wine, orden: order, enCarta: visible } : wine)),
      )

      console.log("Wine order saved successfully")
      return true
    } catch (error) {
      console.error("Error saving wine order:", error)
      return false
    }
  }

  // Refresh all data
  const refreshData = async (): Promise<void> => {
    await loadInitialData()
  }

  // Load bookmarks from localStorage (only remaining localStorage usage)
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedWines")
    if (savedBookmarks) {
      setBookmarkedWines(new Set(JSON.parse(savedBookmarks)))
    }
  }, [])

  // Save bookmarks to localStorage (only remaining localStorage usage)
  useEffect(() => {
    localStorage.setItem("bookmarkedWines", JSON.stringify(Array.from(bookmarkedWines)))
  }, [bookmarkedWines])

  // Initial data load when restaurant changes
  useEffect(() => {
    if (restaurant) {
      loadInitialData()
    }
  }, [restaurant])

  // Bookmark functions
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

  const isWineBookmarked = (id: string) => bookmarkedWines.has(id)
  const hasBookmarkedWines = bookmarkedWines.size > 0

  // Filter wines based on current filters and search
  const filteredWinesLogic = wines.filter((wine) => {
    // Only show wines that are in the menu
    if (wine.enCarta === false) return false

    // Filter by category
    if (selectedCategory === "favorites") {
      if (!bookmarkedWines.has(wine.id)) return false
    } else if (selectedCategory === "glass") {
      if (wine.precioCopa === undefined || wine.precioCopa === null) return false
    } else if (selectedCategory !== "all") {
      const categoryName = selectedCategory.replace(/-/g, " ")
      const category = categorizedWineData.find((cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase())

      if (category) {
        const wineInCategory = category.wines.some((w) => w.id === wine.id)
        if (!wineInCategory) return false
      } else {
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

  // Sort filtered wines
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

  // Legacy compatibility functions
  const savedConfig = appConfig
  const saveConfiguration = (config: any) => {
    console.warn("saveConfiguration is deprecated, use saveAppConfiguration instead")
    return true
  }
  const refreshWineList = () => {
    console.warn("refreshWineList is deprecated, use refreshData instead")
    refreshData()
  }
  const configLastUpdated = null

  const value: WineContextType = {
    // Core data
    wines,
    loading,
    error,
    categorizedWineData,
    rawWinesData,

    // Restaurant data
    restaurant,
    appConfig,
    categoriesConfig,

    // UI state
    bookmarkedWines,
    selectedCategory,
    searchQuery,
    filters,
    filteredWines: sortedFilteredWines,
    selectedWine,

    // Actions
    toggleBookmark,
    setSelectedCategory,
    setSearchQuery,
    setFilters,
    setSelectedWine,
    isWineBookmarked,
    hasBookmarkedWines,

    // Configuration management
    saveAppConfiguration,
    saveCategoriesOrder,
    saveWineOrder,
    refreshData,

    // Legacy compatibility
    savedConfig,
    saveConfiguration,
    refreshWineList,
    configLastUpdated,
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
