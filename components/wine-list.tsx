"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Bookmark,
  Filter,
  MapPin,
  Heart,
  User,
  Search,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ConfigPanel } from "./config-panel"
import { PasswordDialog } from "./password-dialog"
import { WineCarousel } from "./wine-carousel"

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
  // Campos adicionales inventados
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

// Estados del bookmark
export type BookmarkState = "none" | "bookmark"

// Modos de visualización
type ViewMode = "cards" | "list" | "carousel" | "cards-no-image"

// Colores para las categorías principales de vino
const wineTypeColors: Record<string, string> = {
  Tinto: "bg-red-100 text-red-800 border-red-200",
  Blanco: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Rosado: "bg-pink-100 text-pink-800 border-pink-200",
  Espumoso: "bg-blue-100 text-blue-800 border-blue-200",
  Postre: "bg-amber-100 text-amber-800 border-amber-200",
}

// Orden de tipos de vino para la sección "Todos"
const wineTypeOrder: Record<string, number> = {
  Espumoso: 1,
  Blanco: 2,
  Rosado: 3,
  Tinto: 4,
  Postre: 5,
}

// Nombres de enólogos para generar datos
const winemakers = [
  "Alejandro Vigil",
  "Laura Catena",
  "Marcelo Pelleriti",
  "Susana Balbo",
  "Roberto de la Mota",
  "José Galante",
  "Matías Riccitelli",
  "Sebastián Zuccardi",
  "Mariana Onofri",
  "Alejandro Sejanovich",
  "Daniel Pi",
  "Karim Mussi",
  "Matías Michelini",
  "Andrea Mufatto",
  "Gerardo Michelini",
]

// Regiones de origen para generar datos
const wineOrigins = [
  "Valle de Uco, Mendoza",
  "Luján de Cuyo, Mendoza",
  "Maipú, Mendoza",
  "San Rafael, Mendoza",
  "Valle de Pedernal, San Juan",
  "Valle Calchaquí, Salta",
  "Valle de Cafayate, Salta",
  "Alto Valle, Río Negro",
  "Valle de Calamuchita, Córdoba",
  "Valle de Traslasierra, Córdoba",
]

// Modificar la función parseCSV para asignar imágenes según el tipo de vino
const parseCSV = (csvText: string): Wine[] => {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))

  // Mapeo de nombres de columnas
  const columnMap: Record<string, string> = {
    "Nombre en carta": "displayName",
    Gama: "range",
    Nombre: "name",
    Estilo: "type",
    Cepa: "grape",
    Añada: "year",
    SKU: "sku",
    Bodega: "winery",
    "Sugerido Vinoteca": "price",
    Proveedor: "supplier",
  }

  // Terroirs inventados
  const terroirs = [
    "Arcilloso calcáreo",
    "Granítico",
    "Aluvial",
    "Arenoso",
    "Volcánico",
    "Calizo",
    "Pizarra",
    "Arcilloso ferroso",
  ]

  // Tipos de vino para clasificación
  const wineTypes: Record<string, string> = {
    tinto: "Tinto",
    blanco: "Blanco",
    rosado: "Rosado",
    espumoso: "Espumoso",
    espumante: "Espumoso",
    postre: "Postre",
    dulce: "Postre",
  }

  // Mapeo de tipos de vino a imágenes
  const wineImages: Record<string, string> = {
    Tinto: "/images/red-wine.png",
    Blanco: "/images/white-wine.png",
    Rosado: "/images/rose-wine.png",
    Espumoso: "/images/sparkling-wine.png",
    Postre: "/images/dessert-wine.png",
  }

  const wines: Wine[] = []

  // Empezar desde la segunda línea (índice 1) para omitir los encabezados
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue // Saltar líneas vacías

    const values = lines[i].split(",").map((value) => value.trim().replace(/"/g, ""))
    if (values.length < 5) continue // Saltar líneas con datos insuficientes

    const wine: Record<string, any> = {}

    // Asignar valores según el mapeo de columnas
    headers.forEach((header, index) => {
      const mappedKey = columnMap[header]
      if (mappedKey && values[index]) {
        wine[mappedKey] = values[index]
      }
    })

    // Determinar el tipo de vino
    let wineType = "Tinto" // Valor por defecto
    if (wine.type) {
      const typeLower = wine.type.toLowerCase()
      for (const [key, value] of Object.entries(wineTypes)) {
        if (typeLower.includes(key)) {
          wineType = value
          break
        }
      }
    }

    // Convertir precio a número o generar uno aleatorio si no existe
    let price = 0
    if (wine.price) {
      // Eliminar caracteres no numéricos excepto punto y coma
      const priceStr = wine.price.replace(/[^\d.,]/g, "").replace(",", ".")
      price = Number.parseFloat(priceStr) || 0
    }

    // Si no hay precio o es 0, generar uno aleatorio entre 25000 y 120000
    if (price === 0) {
      price = Math.floor(Math.random() * 95000) + 25000
    }

    // Generar datos aleatorios para campos faltantes
    const randomTerroir = terroirs[Math.floor(Math.random() * terroirs.length)]
    const isSommelierFavorite = Math.random() < 0.2 // 20% de probabilidad de ser favorito del sommelier
    const randomWinemaker = winemakers[Math.floor(Math.random() * winemakers.length)]
    const randomOrigin = wineOrigins[Math.floor(Math.random() * wineOrigins.length)]

    // Determinar si tiene precio por copa (50% de probabilidad)
    const hasGlassPrice = Math.random() < 0.5
    const glassPrice = hasGlassPrice ? Math.round(price * 0.3) : undefined

    // Generar coordenadas aleatorias para Argentina
    const baseLatitude = -33.8
    const baseLongitude = -68.9
    const randomOffset = () => (Math.random() - 0.5) * 0.5

    // Asignar imagen según el tipo de vino
    const imageUrl = wineImages[wineType] || wineImages.Tinto

    // Crear objeto Wine con datos del CSV y datos inventados
    wines.push({
      id: `wine-${i}`,
      name: wine.name || `Vino ${i}`,
      displayName: wine.displayName || wine.name || `Vino ${i}`,
      type: wineType,
      region: randomOrigin, // Origen aleatorio
      year: wine.year || new Date().getFullYear().toString(),
      price: price,
      glass: glassPrice,
      description: generateDescription(wineType, wine.grape),
      winery: wine.winery || "Bodega Desconocida",
      grape: wine.grape || "Blend",
      range: wine.range || "",
      sku: wine.sku || "",
      supplier: wine.supplier || "",
      alcohol: `${13 + Math.random() * 2.5}%`,
      volume: "750ml",
      origin: randomOrigin,
      notes: generateTastingNotes(wineType, wine.grape || ""),
      pairings: generatePairings(wineType),
      latitude: baseLatitude + randomOffset(),
      longitude: baseLongitude + randomOffset(),
      terroir: randomTerroir,
      isSommelierFavorite: isSommelierFavorite,
      imageUrl: imageUrl,
      winemaker: randomWinemaker,
    })
  }

  return wines
}

export default function WineList() {
  const [wines, setWines] = useState<Wine[]>([])
  const [originalWines, setOriginalWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarkedWines, setBookmarkedWines] = useState<Record<string, BookmarkState>>({})
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isReorderingEnabled, setIsReorderingEnabled] = useState(false)
  const [draggedWine, setDraggedWine] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<Wine[]>([])

  // Filtros
  const [selectedWineries, setSelectedWineries] = useState<string[]>([])
  const [selectedGrapes, setSelectedGrapes] = useState<string[]>([])
  const [selectedTerroirs, setSelectedTerroirs] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [openFilterSections, setOpenFilterSections] = useState<Record<string, boolean>>({
    tipos: true,
    precios: false,
    bodegas: false,
    cepas: false,
    terroirs: false,
  })

  // Listen for the custom event
  useEffect(() => {
    const handleSecretActivation = () => {
      setIsPasswordDialogOpen(true)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("secretModeActivated", handleSecretActivation)

      return () => {
        window.removeEventListener("secretModeActivated", handleSecretActivation)
      }
    }
  }, [])

  useEffect(() => {
    async function fetchWines() {
      try {
        setLoading(true)

        // Cargar el archivo CSV
        const response = await fetch(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/180325%20Master%20Vinos%20El%20Bordo-lq3VyMHle5okOIxSqA7fSN5Y5S0WgH.csv",
        )

        if (!response.ok) {
          throw new Error("No se pudo cargar el archivo CSV")
        }

        const csvText = await response.text()
        const parsedWines = parseCSV(csvText)
        setWines(parsedWines)
        setOriginalWines(parsedWines) // Guardar el orden original
      } catch (err) {
        console.error("Error al cargar los vinos:", err)
        setError("No se pudieron cargar los datos. Usando datos de ejemplo.")

        // Cargar datos de ejemplo en caso de error
        setWines(exampleWines)
        setOriginalWines(exampleWines) // Guardar el orden original
      } finally {
        setLoading(false)
      }
    }

    fetchWines()
  }, [])

  // Efecto para manejar el foco en el campo de búsqueda cuando se abre
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Update search results when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = wines.filter(
      (wine) =>
        wine.displayName.toLowerCase().includes(query) ||
        wine.winery.toLowerCase().includes(query) ||
        wine.grape.toLowerCase().includes(query) ||
        (wine.origin && wine.origin.toLowerCase().includes(query)),
    )
    setSearchResults(results)
  }, [searchQuery, wines])

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation() // Evitar que el clic se propague a la tarjeta

    setBookmarkedWines((prev) => {
      const newBookmarks = { ...prev }

      if (newBookmarks[id] === "bookmark") {
        delete newBookmarks[id]
      } else {
        newBookmarks[id] = "bookmark"
      }

      return newBookmarks
    })
  }

  // Función para quitar un vino de favoritos
  const removeFromBookmarks = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Evitar que el clic se propague
      e.preventDefault()
    }

    setBookmarkedWines((prev) => {
      const newBookmarks = { ...prev }
      delete newBookmarks[id]
      return newBookmarks
    })
  }

  // Función para verificar si un vino está marcado
  const getBookmarkState = (id: string): BookmarkState => {
    return bookmarkedWines[id] || "none"
  }

  // Agrupar vinos por tipo
  const winesByType = {
    tinto: wines.filter((wine) => wine.type === "Tinto"),
    blanco: wines.filter((wine) => wine.type === "Blanco"),
    espumoso: wines.filter((wine) => wine.type === "Espumoso"),
    rosado: wines.filter((wine) => wine.type === "Rosado"),
    postre: wines.filter((wine) => wine.type === "Postre"),
  }

  // Obtener vinos disponibles por copa
  const winesByGlass = wines.filter((wine) => wine.glass !== undefined)

  // Obtener vinos marcados como favoritos (cualquier estado de bookmark)
  const bookmarkedWinesList = wines.filter((wine) => bookmarkedWines[wine.id])

  // Obtener listas únicas de bodegas, cepas y terroirs
  const wineries = [...new Set(wines.map((wine) => wine.winery))].filter(Boolean).sort()
  const grapes = [...new Set(wines.map((wine) => wine.grape))].filter(Boolean).sort()
  const terroirs = [...new Set(wines.map((wine) => wine.terroir))].filter(Boolean).sort()
  const wineTypes = ["Tinto", "Blanco", "Rosado", "Espumoso", "Postre"]

  // Rangos de precios
  const priceRanges = ["Hasta $30.000", "$30.000 - $50.000", "$50.000 - $80.000", "Más de $80.000"]

  // Función para verificar si un vino está en un rango de precio
  const isInPriceRange = (wine: Wine, range: string): boolean => {
    const price = wine.price
    switch (range) {
      case "Hasta $30.000":
        return price < 30000
      case "$30.000 - $50.000":
        return price >= 30000 && price < 50000
      case "$50.000 - $80.000":
        return price >= 50000 && price < 80000
      case "Más de $80.000":
        return price >= 80000
      default:
        return false
    }
  }

  // Filtrar vinos según selecciones y búsqueda
  const applyFilters = (wineList: Wine[]) => {
    return wineList.filter((wine) => {
      const matchesWinery = selectedWineries.length === 0 || selectedWineries.includes(wine.winery)
      const matchesGrape = selectedGrapes.length === 0 || selectedGrapes.includes(wine.grape)
      const matchesTerroir = selectedTerroirs.length === 0 || (wine.terroir && selectedTerroirs.includes(wine.terroir))
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(wine.type)

      // Filtro de rango de precios
      const matchesPriceRange =
        selectedPriceRanges.length === 0 || selectedPriceRanges.some((range) => isInPriceRange(wine, range))

      // Filtro de búsqueda
      const matchesSearch =
        searchQuery === "" ||
        wine.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wine.winery.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wine.grape.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wine.origin && wine.origin.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesWinery && matchesGrape && matchesTerroir && matchesType && matchesPriceRange && matchesSearch
    })
  }

  // Ordenar vinos por tipo para la sección "Todos"
  const sortWinesByType = (wineList: Wine[]) => {
    return [...wineList].sort((a, b) => {
      const orderA = wineTypeOrder[a.type] || 999
      const orderB = wineTypeOrder[b.type] || 999
      return orderA - orderB
    })
  }

  // Agrupar vinos por cepa y ordenar por precio
  const groupWinesByGrape = (wineList: Wine[]) => {
    // Obtener todas las cepas únicas en la lista
    const uniqueGrapes = [...new Set(wineList.map((wine) => wine.grape))].filter(Boolean).sort()

    // Crear un objeto con las cepas como claves y arrays de vinos como valores
    const groupedWines: Record<string, Wine[]> = {}

    uniqueGrapes.forEach((grape) => {
      // Filtrar vinos por cepa y ordenar por precio
      groupedWines[grape] = wineList.filter((wine) => wine.grape === grape).sort((a, b) => a.price - b.price)
    })

    return groupedWines
  }

  // Encontrar vinos similares para recomendaciones
  const getSimilarWines = (wine: Wine, count = 3): Wine[] => {
    if (!wine) return []

    // Criterios de similitud: mismo tipo, misma cepa o misma bodega
    return wines
      .filter((w) => w.id !== wine.id) // Excluir el vino actual
      .sort((a, b) => {
        let scoreA = 0
        let scoreB = 0

        // Mismo tipo de vino (mayor prioridad)
        if (a.type === wine.type) scoreA += 3
        if (b.type === wine.type) scoreB += 3

        // Misma cepa
        if (a.grape === wine.grape) scoreA += 2
        if (b.grape === wine.grape) scoreB += 2

        // Misma bodega
        if (a.winery === wine.winery) scoreA += 1
        if (b.winery === wine.winery) scoreB += 1

        // Ordenar por puntaje de similitud (descendente)
        return scoreB - scoreA
      })
      .slice(0, count)
  }

  // Abrir la ficha detallada del vino
  const openWineDetail = (wine: Wine) => {
    setSelectedWine(wine)
  }

  // Cerrar la ficha detallada
  const closeWineDetail = () => {
    setSelectedWine(null)
  }

  // Resetear filtros
  const resetFilters = () => {
    setSelectedWineries([])
    setSelectedGrapes([])
    setSelectedTerroirs([])
    setSelectedTypes([])
    setSelectedPriceRanges([])
    setSearchQuery("")
  }

  // Manejar cambios en los checkboxes de filtros
  const handleWineryChange = (winery: string) => {
    setSelectedWineries((prev) => (prev.includes(winery) ? prev.filter((w) => w !== winery) : [...prev, winery]))
  }

  const handleGrapeChange = (grape: string) => {
    setSelectedGrapes((prev) => (prev.includes(grape) ? prev.filter((g) => g !== grape) : [...prev, grape]))
  }

  const handleTerroirChange = (terroir: string) => {
    setSelectedTerroirs((prev) => (prev.includes(terroir) ? prev.filter((t) => t !== terroir) : [...prev, terroir]))
  }

  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRanges((prev) => (prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]))
  }

  // Manejar apertura/cierre de secciones de filtro
  const toggleFilterSection = (section: string) => {
    setOpenFilterSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Activar el panel de configuración
  const activateConfigPanel = () => {
    setIsPasswordDialogOpen(true)
  }

  // Manejar el éxito de la autenticación
  const handlePasswordSuccess = () => {
    setIsPasswordDialogOpen(false)
    setIsConfigOpen(true)
  }

  // Obtener color para el tipo de vino
  const getWineTypeColor = (type: string): string => {
    return wineTypeColors[type] || "bg-gray-100 text-gray-800 border-gray-200" // Color por defecto
  }

  // Contar filtros activos
  const countActiveFilters = () => {
    return (
      selectedWineries.length +
      selectedGrapes.length +
      selectedTerroirs.length +
      selectedTypes.length +
      selectedPriceRanges.length
    )
  }

  // Habilitar/deshabilitar el modo de reordenamiento
  const toggleReordering = () => {
    setIsReorderingEnabled(!isReorderingEnabled)
  }

  // Restaurar el orden original de los vinos
  const resetOrder = () => {
    setWines([...originalWines])
  }

  // Funciones mejoradas para el arrastre y soltar
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (!isReorderingEnabled) return

    // Establecer los datos que se transferirán
    e.dataTransfer.setData("text/plain", id)

    // Establecer el efecto visual
    e.dataTransfer.effectAllowed = "move"

    // Guardar el ID del elemento arrastrado
    setDraggedWine(id)

    // Añadir clase para estilo visual
    if (e.currentTarget) {
      e.currentTarget.classList.add("opacity-50")
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevenir el comportamiento por defecto para permitir soltar
    e.preventDefault()

    if (!isReorderingEnabled) return

    // Establecer el efecto de cursor
    e.dataTransfer.dropEffect = "move"

    // Añadir estilo al elemento sobre el que se arrastra
    if (e.currentTarget) {
      e.currentTarget.classList.add("bg-gray-50")
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Quitar estilo cuando el elemento arrastrado sale
    if (e.currentTarget) {
      e.currentTarget.classList.remove("bg-gray-50")
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    // Prevenir el comportamiento por defecto
    e.preventDefault()

    if (!isReorderingEnabled) return

    // Obtener el ID del elemento arrastrado
    const draggedId = e.dataTransfer.getData("text/plain")

    // No hacer nada si se suelta sobre sí mismo
    if (draggedId === targetId) return

    // Reordenar los vinos
    setWines((prevWines) => {
      const newWines = [...prevWines]
      const draggedIndex = newWines.findIndex((wine) => wine.id === draggedId)
      const targetIndex = newWines.findIndex((wine) => wine.id === targetId)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Mover el elemento arrastrado a la nueva posición
        const [draggedItem] = newWines.splice(draggedIndex, 1)
        newWines.splice(targetIndex, 0, draggedItem)
      }

      return newWines
    })

    // Limpiar estilos y estado
    if (e.currentTarget) {
      e.currentTarget.classList.remove("bg-gray-50")
    }

    setDraggedWine(null)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Limpiar estilos y estado cuando termina el arrastre
    if (e.currentTarget) {
      e.currentTarget.classList.remove("opacity-50")
    }

    setDraggedWine(null)
  }

  // Toggle search
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      setSearchQuery("")
      setSearchResults([])
    }
  }

  if (loading) {
    return <WineListSkeleton />
  }

  return (
    <div className="w-full">
      {/* Controles superiores */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="search-button" onClick={toggleSearch} title="Buscar vinos">
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="Filtrar vinos"
          >
            <Filter className="h-4 w-4" />
            {countActiveFilters() > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {countActiveFilters()}
              </span>
            )}
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={activateConfigPanel} title="Configuración">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Barra de búsqueda */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-background z-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Buscar por nombre, bodega, cepa o región..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button variant="ghost" size="icon" className="ml-2" onClick={toggleSearch}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {searchQuery.trim() !== "" && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-4">Resultados de búsqueda</h3>
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {viewMode === "list" ? (
                      <WineListByGrape
                        wines={searchResults}
                        onWineClick={openWineDetail}
                        bookmarkStates={bookmarkedWines}
                        onBookmarkToggle={toggleBookmark}
                        isFavoriteTab={false}
                        onRemoveBookmark={removeFromBookmarks}
                        isReorderingEnabled={false}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        draggedWine={draggedWine}
                      />
                    ) : viewMode === "cards" ? (
                      <WineCardGrid
                        wines={searchResults}
                        onWineClick={openWineDetail}
                        bookmarkStates={bookmarkedWines}
                        onBookmarkToggle={toggleBookmark}
                        isFavoriteTab={false}
                        onRemoveBookmark={removeFromBookmarks}
                        isReorderingEnabled={false}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        draggedWine={draggedWine}
                      />
                    ) : (
                      <WineCarousel
                        wines={searchResults}
                        onWineClick={openWineDetail}
                        bookmarkStates={bookmarkedWines}
                        onBookmarkToggle={toggleBookmark}
                        isFavoriteTab={false}
                        onRemoveBookmark={removeFromBookmarks}
                        wineTypeColors={wineTypeColors}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No se encontraron vinos que coincidan con tu búsqueda.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded mb-6">{error}</div>
      )}

      {!isSearchOpen && (
        <>
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="grid grid-cols-9 mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="porcopa">Por Copa</TabsTrigger>
              <TabsTrigger value="tinto">Tintos</TabsTrigger>
              <TabsTrigger value="blanco">Blancos</TabsTrigger>
              <TabsTrigger value="espumoso">Espumosos</TabsTrigger>
              <TabsTrigger value="rosado">Rosados</TabsTrigger>
              <TabsTrigger value="postre">Postre</TabsTrigger>
              <TabsTrigger value="favoritos-sommelier">
                <Heart className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger value="favoritos">
                <Bookmark className="h-5 w-5" />
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-end mb-6">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveTab("favoritos")}
              >
                <Bookmark className="h-4 w-4" />
                Mi selección
                {bookmarkedWinesList.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {bookmarkedWinesList.length}
                  </Badge>
                )}
              </Button>
            </div>

            {isFilterOpen && (
              <div className="mt-4 border rounded-md p-4 bg-card mb-6">
                <div className="space-y-4">
                  {/* Filtro por tipo de vino */}
                  <Collapsible open={openFilterSections.tipos} onOpenChange={() => toggleFilterSection("tipos")}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between font-medium">
                      <span>Tipo de vino</span>
                      {openFilterSections.tipos ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-1">
                      <div className="grid grid-cols-2 gap-2">
                        {wineTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={() => handleTypeChange(type)}
                            />
                            <Label htmlFor={`type-${type}`} className="text-sm flex items-center gap-1">
                              {type}
                              <Badge
                                variant="outline"
                                className={cn("h-2 w-2 p-0 rounded-full", wineTypeColors[type])}
                              />
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Filtro por rango de precio */}
                  <Collapsible open={openFilterSections.precios} onOpenChange={() => toggleFilterSection("precios")}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between font-medium">
                      <span>Rango de precio</span>
                      {openFilterSections.precios ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-1">
                      <div className="grid grid-cols-2 gap-2">
                        {priceRanges.map((range) => (
                          <div key={range} className="flex items-center space-x-2">
                            <Checkbox
                              id={`price-${range}`}
                              checked={selectedPriceRanges.includes(range)}
                              onCheckedChange={() => handlePriceRangeChange(range)}
                            />
                            <Label htmlFor={`price-${range}`} className="text-sm">
                              {range}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Filtro de Bodegas */}
                  <Collapsible open={openFilterSections.bodegas} onOpenChange={() => toggleFilterSection("bodegas")}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between font-medium">
                      <span>Bodega</span>
                      {openFilterSections.bodegas ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-1">
                      <div className="max-h-40 overflow-y-auto grid grid-cols-1 gap-2">
                        {wineries.map((winery) => (
                          <div key={winery} className="flex items-center space-x-2">
                            <Checkbox
                              id={`winery-${winery}`}
                              checked={selectedWineries.includes(winery)}
                              onCheckedChange={() => handleWineryChange(winery)}
                            />
                            <Label htmlFor={`winery-${winery}`} className="text-sm">
                              {winery}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Filtro de Cepas */}
                  <Collapsible open={openFilterSections.cepas} onOpenChange={() => toggleFilterSection("cepas")}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between font-medium">
                      <span>Cepa</span>
                      {openFilterSections.cepas ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-1">
                      <div className="max-h-40 overflow-y-auto grid grid-cols-1 gap-2">
                        {grapes.map((grape) => (
                          <div key={grape} className="flex items-center space-x-2">
                            <Checkbox
                              id={`grape-${grape}`}
                              checked={selectedGrapes.includes(grape)}
                              onCheckedChange={() => handleGrapeChange(grape)}
                            />
                            <Label htmlFor={`grape-${grape}`} className="text-sm">
                              {grape}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Filtro de Terroirs */}
                  <Collapsible open={openFilterSections.terroirs} onOpenChange={() => toggleFilterSection("terroirs")}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between font-medium">
                      <span>Terroir</span>
                      {openFilterSections.terroirs ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-1">
                      <div className="max-h-40 overflow-y-auto grid grid-cols-1 gap-2">
                        {terroirs.map((terroir) => (
                          <div key={terroir} className="flex items-center space-x-2">
                            <Checkbox
                              id={`terroir-${terroir}`}
                              checked={selectedTerroirs.includes(terroir)}
                              onCheckedChange={() => handleTerroirChange(terroir)}
                            />
                            <Label htmlFor={`terroir-${terroir}`} className="text-sm">
                              {terroir}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {countActiveFilters() > 0 && (
                    <Button variant="outline" onClick={resetFilters} className="w-full mt-4">
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Contenido de la pestaña "Todos" */}
            <TabsContent value="todos">
              {applyFilters(wines).length > 0 ? (
                viewMode === "list" ? (
                  <WineListByType
                    wines={sortWinesByType(applyFilters(wines))}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : viewMode === "cards" ? (
                  <WineCardGrid
                    wines={sortWinesByType(applyFilters(wines))}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : viewMode === "cards-no-image" ? (
                  <WineCardNoImageGrid
                    wines={sortWinesByType(applyFilters(wines))}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : (
                  <WineCarousel
                    wines={sortWinesByType(applyFilters(wines))}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    wineTypeColors={wineTypeColors}
                  />
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No se encontraron vinos con los filtros seleccionados.</p>
                </div>
              )}
            </TabsContent>

            {/* Sección Por Copa */}
            <TabsContent value="porcopa">
              {applyFilters(winesByGlass).length > 0 ? (
                viewMode === "list" ? (
                  <WineListByGrape
                    wines={applyFilters(winesByGlass)}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : viewMode === "cards" ? (
                  <WineCardGrid
                    wines={applyFilters(winesByGlass)}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : viewMode === "cards-no-image" ? (
                  <WineCardNoImageGrid
                    wines={applyFilters(winesByGlass)}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : (
                  <WineCarousel
                    wines={applyFilters(winesByGlass)}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    wineTypeColors={wineTypeColors}
                  />
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    No hay vinos disponibles por copa con los filtros seleccionados.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Pestañas por tipo de vino */}
            {Object.entries(winesByType).map(([type, typeWines]) => (
              <TabsContent key={type} value={type}>
                {applyFilters(typeWines).length > 0 ? (
                  viewMode === "list" ? (
                    <WineListByGrape
                      wines={applyFilters(typeWines)}
                      onWineClick={openWineDetail}
                      bookmarkStates={bookmarkedWines}
                      onBookmarkToggle={toggleBookmark}
                      isFavoriteTab={false}
                      onRemoveBookmark={removeFromBookmarks}
                      isReorderingEnabled={isReorderingEnabled}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      draggedWine={draggedWine}
                    />
                  ) : viewMode === "cards" ? (
                    <WineCardGrid
                      wines={applyFilters(typeWines)}
                      onWineClick={openWineDetail}
                      bookmarkStates={bookmarkedWines}
                      onBookmarkToggle={toggleBookmark}
                      isFavoriteTab={false}
                      onRemoveBookmark={removeFromBookmarks}
                      isReorderingEnabled={isReorderingEnabled}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      draggedWine={draggedWine}
                    />
                  ) : viewMode === "cards-no-image" ? (
                    <WineCardNoImageGrid
                      wines={applyFilters(typeWines)}
                      onWineClick={openWineDetail}
                      bookmarkStates={bookmarkedWines}
                      onBookmarkToggle={toggleBookmark}
                      isFavoriteTab={false}
                      onRemoveBookmark={removeFromBookmarks}
                      isReorderingEnabled={isReorderingEnabled}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      draggedWine={draggedWine}
                    />
                  ) : (
                    <WineCarousel
                      wines={applyFilters(typeWines)}
                      onWineClick={openWineDetail}
                      bookmarkStates={bookmarkedWines}
                      onBookmarkToggle={toggleBookmark}
                      isFavoriteTab={false}
                      onRemoveBookmark={removeFromBookmarks}
                      wineTypeColors={wineTypeColors}
                    />
                  )
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      No se encontraron vinos de tipo {type} con los filtros seleccionados.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}

            {/* Pestaña de favoritos del sommelier */}
            <TabsContent value="favoritos-sommelier">
              {wines.filter((wine) => wine.isSommelierFavorite).length > 0 ? (
                viewMode === "list" ? (
                  <WineListByGrape
                    wines={applyFilters(wines.filter((wine) => wine.isSommelierFavorite))}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : viewMode === "cards" ? (
                  <WineCardGrid
                    wines={applyFilters(wines.filter((wine) => wine.isSommelierFavorite))}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : viewMode === "cards-no-image" ? (
                  <WineCardNoImageGrid
                    wines={applyFilters(wines.filter((wine) => wine.isSommelierFavorite))}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : (
                  <WineCarousel
                    wines={applyFilters(wines.filter((wine) => wine.isSommelierFavorite))}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={false}
                    onRemoveBookmark={removeFromBookmarks}
                    wineTypeColors={wineTypeColors}
                  />
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    No hay vinos favoritos del sommelier con los filtros seleccionados.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Pestaña de favoritos */}
            <TabsContent value="favoritos">
              {bookmarkedWinesList.length > 0 ? (
                viewMode === "list" ? (
                  <WineListByGrape
                    wines={applyFilters(bookmarkedWinesList)}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={true}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : viewMode === "cards" ? (
                  <WineCardGrid
                    wines={applyFilters(bookmarkedWinesList)}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={true}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : viewMode === "cards-no-image" ? (
                  <WineCardNoImageGrid
                    wines={applyFilters(bookmarkedWinesList)}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={true}
                    onRemoveBookmark={removeFromBookmarks}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedWine={draggedWine}
                  />
                ) : (
                  <WineCarousel
                    wines={applyFilters(bookmarkedWinesList)}
                    onWineClick={openWineDetail}
                    bookmarkStates={bookmarkedWines}
                    onBookmarkToggle={toggleBookmark}
                    isFavoriteTab={true}
                    onRemoveBookmark={removeFromBookmarks}
                    wineTypeColors={wineTypeColors}
                  />
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    No hay vinos marcados. Haz clic en el icono de marcador en cualquier vino para guardarlo aquí.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Diálogo de detalle del vino */}
      <Dialog open={!!selectedWine} onOpenChange={(open) => !open && closeWineDetail()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedWine && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedWine.displayName}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-medium">{selectedWine.winery}</p>
                    <p className="text-muted-foreground">
                      {selectedWine.origin} • {selectedWine.year}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedWine.isSommelierFavorite && (
                      <span className="text-rose-500" title="Favorito del Sommelier">
                        <Heart className="h-5 w-5 fill-current" />
                      </span>
                    )}
                    <button
                      onClick={(e) => toggleBookmark(selectedWine.id, e)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Marcar vino"
                    >
                      {renderBookmarkIcon(getBookmarkState(selectedWine.id))}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="relative h-80 w-full rounded-lg overflow-hidden border bg-gray-50 p-4 flex items-center justify-center">
                      <Image
                        src={selectedWine.imageUrl || "/placeholder.svg?height=300&width=100&text=Vino"}
                        alt={selectedWine.name}
                        width={200}
                        height={300}
                        className="object-contain max-h-full"
                      />
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      {selectedWine.name} - {selectedWine.year}
                    </p>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Detalles</h3>
                      <dl className="grid grid-cols-2 gap-2">
                        <dt className="text-muted-foreground">Tipo:</dt>
                        <dd>
                          <Badge variant="outline" className={cn("rounded-full", getWineTypeColor(selectedWine.type))}>
                            {selectedWine.type}
                          </Badge>
                        </dd>

                        <dt className="text-muted-foreground">Cepa:</dt>
                        <dd>{selectedWine.grape}</dd>

                        <dt className="text-muted-foreground">Gama:</dt>
                        <dd>{selectedWine.range || "N/A"}</dd>

                        <dt className="text-muted-foreground">Terroir:</dt>
                        <dd>{selectedWine.terroir}</dd>

                        <dt className="text-muted-foreground">Enólogo:</dt>
                        <dd className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {selectedWine.winemaker}
                        </dd>

                        <dt className="text-muted-foreground">Alcohol:</dt>
                        <dd>{selectedWine.alcohol}</dd>

                        <dt className="text-muted-foreground">Volumen:</dt>
                        <dd>{selectedWine.volume}</dd>

                        <dt className="text-muted-foreground">SKU:</dt>
                        <dd>{selectedWine.sku || "N/A"}</dd>

                        <dt className="text-muted-foreground">Proveedor:</dt>
                        <dd>{selectedWine.supplier || "N/A"}</dd>
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Precios</h3>
                      <p className="text-xl font-bold mb-2">${selectedWine.price.toLocaleString("es-AR")}</p>
                      {selectedWine.glass && (
                        <p className="text-muted-foreground">Copa: ${selectedWine.glass.toLocaleString("es-AR")}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{selectedWine.description}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Notas de cata</h3>
                  <p className="text-muted-foreground">{selectedWine.notes}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Maridaje recomendado</h3>
                  <p className="text-muted-foreground">{selectedWine.pairings}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación del viñedo
                  </h3>
                  <div className="relative h-64 w-full rounded-lg overflow-hidden border">
                    <div className="absolute inset-0 bg-gray-200">
                      {/* Mapa simulado */}
                      <div className="relative w-full h-full">
                        <Image
                          src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/static/${selectedWine.longitude},${selectedWine.latitude},10,0/600x400?access_token=pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xhbXBsZXRva2VuIn0.456example123token`}
                          alt={`Ubicación del viñedo ${selectedWine.winery}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="h-6 w-6 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Coordenadas: {selectedWine.latitude?.toFixed(6)}, {selectedWine.longitude?.toFixed(6)}
                  </p>
                </div>

                {/* Sección de vinos recomendados */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Vinos similares que podrían interesarte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getSimilarWines(selectedWine).map((wine) => (
                      <RecommendedWineCard
                        key={wine.id}
                        wine={wine}
                        onClick={() => {
                          closeWineDetail()
                          setTimeout(() => openWineDetail(wine), 100)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de contraseña */}
      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        onSuccess={handlePasswordSuccess}
      />

      {/* Panel de configuración */}
      <ConfigPanel
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewMode(mode)}
        onEnableReordering={toggleReordering}
        onResetOrder={resetOrder}
        isReorderingEnabled={isReorderingEnabled}
      />
    </div>
  )
}

// Componente para mostrar la lista de vinos agrupados por cepa
interface WineListByGrapeProps {
  wines: Wine[]
  onWineClick: (wine: Wine) => void
  bookmarkStates: Record<string, BookmarkState>
  onBookmarkToggle: (id: string, e?: React.MouseEvent) => void
  isFavoriteTab: boolean
  onRemoveBookmark: (id: string, e?: React.MouseEvent) => void
  isReorderingEnabled: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void
  draggedWine: string | null
}

function WineListByGrape({
  wines,
  onWineClick,
  bookmarkStates,
  onBookmarkToggle,
  isFavoriteTab,
  onRemoveBookmark,
  isReorderingEnabled,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedWine,
}: WineListByGrapeProps) {
  // Agrupar vinos por cepa
  const grapeGroups: Record<string, Wine[]> = {}

  // Obtener todas las cepas únicas
  const uniqueGrapes = [...new Set(wines.map((wine) => wine.grape))].sort()

  // Agrupar vinos por cepa y ordenar por precio
  uniqueGrapes.forEach((grape) => {
    grapeGroups[grape] = wines.filter((wine) => wine.grape === grape).sort((a, b) => a.price - b.price)
  })

  return (
    <div className="space-y-8">
      {uniqueGrapes.map((grape) => (
        <div key={grape} className="space-y-2">
          <h3 className="text-lg font-medium border-b pb-2">{grape}</h3>
          <div className="space-y-1">
            {grapeGroups[grape].map((wine) => (
              <WineListItem
                key={wine.id}
                wine={wine}
                onClick={() => onWineClick(wine)}
                bookmarkState={bookmarkStates[wine.id] || "none"}
                onBookmarkToggle={onBookmarkToggle}
                isFavoriteTab={isFavoriteTab}
                onRemoveBookmark={onRemoveBookmark}
                isReorderingEnabled={isReorderingEnabled}
                onDragStart={(e) => onDragStart(e, wine.id)}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, wine.id)}
                onDragEnd={onDragEnd}
                isDragging={draggedWine === wine.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente para mostrar la lista de vinos agrupados por tipo
interface WineListByTypeProps {
  wines: Wine[]
  onWineClick: (wine: Wine) => void
  bookmarkStates: Record<string, BookmarkState>
  onBookmarkToggle: (id: string, e?: React.MouseEvent) => void
  isFavoriteTab: boolean
  onRemoveBookmark: (id: string, e?: React.MouseEvent) => void
  isReorderingEnabled: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void
  draggedWine: string | null
}

function WineListByType({
  wines,
  onWineClick,
  bookmarkStates,
  onBookmarkToggle,
  isFavoriteTab,
  onRemoveBookmark,
  isReorderingEnabled,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedWine,
}: WineListByTypeProps) {
  // Agrupar vinos por tipo
  const typeGroups: Record<string, any> = {}

  // Obtener todos los tipos únicos
  const uniqueTypes = [...new Set(wines.map((wine) => wine.type))]

  // Ordenar los tipos según el orden definido
  const sortedTypes = uniqueTypes.sort((a, b) => {
    const orderA = wineTypeOrder[a] || 999
    const orderB = wineTypeOrder[b] || 999
    return orderA - orderB
  })

  // Para cada tipo, agrupar por cepa y ordenar por precio
  sortedTypes.forEach((type) => {
    const winesOfType = wines.filter((wine) => wine.type === type)

    // Agrupar por cepa
    const grapeGroups: Record<string, Wine[]> = {}
    const uniqueGrapes = [...new Set(winesOfType.map((wine) => wine.grape))].sort()

    uniqueGrapes.forEach((grape) => {
      grapeGroups[grape] = winesOfType.filter((wine) => wine.grape === grape).sort((a, b) => a.price - b.price)
    })

    typeGroups[type] = { wines: winesOfType, grapeGroups, uniqueGrapes }
  })

  return (
    <div className="space-y-12">
      {sortedTypes.map((type) => (
        <div key={type} className="space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">
            <Badge variant="outline" className={cn("mr-2 rounded-full", wineTypeColors[type])}>
              {type}
            </Badge>
          </h2>

          {typeGroups[type].uniqueGrapes.map((grape) => (
            <div key={`${type}-${grape}`} className="space-y-2">
              <h3 className="text-lg font-medium border-b pb-2">{grape}</h3>
              <div className="space-y-1">
                {typeGroups[type].grapeGroups[grape].map((wine) => (
                  <WineListItem
                    key={wine.id}
                    wine={wine}
                    onClick={() => onWineClick(wine)}
                    bookmarkState={bookmarkStates[wine.id] || "none"}
                    onBookmarkToggle={onBookmarkToggle}
                    isFavoriteTab={isFavoriteTab}
                    onRemoveBookmark={onRemoveBookmark}
                    isReorderingEnabled={isReorderingEnabled}
                    onDragStart={(e) => onDragStart(e, wine.id)}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, wine.id)}
                    onDragEnd={onDragEnd}
                    isDragging={draggedWine === wine.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Componente para mostrar la cuadrícula de tarjetas de vino
interface WineCardGridProps {
  wines: Wine[]
  onWineClick: (wine: Wine) => void
  bookmarkStates: Record<string, BookmarkState>
  onBookmarkToggle: (id: string, e?: React.MouseEvent) => void
  isFavoriteTab: boolean
  onRemoveBookmark: (id: string, e?: React.MouseEvent) => void
  isReorderingEnabled: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void
  draggedWine: string | null
}

function WineCardGrid({
  wines,
  onWineClick,
  bookmarkStates,
  onBookmarkToggle,
  isFavoriteTab,
  onRemoveBookmark,
  isReorderingEnabled,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedWine,
}: WineCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {wines.map((wine) => (
        <div
          key={wine.id}
          draggable={isReorderingEnabled}
          onDragStart={(e) => onDragStart(e, wine.id)}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, wine.id)}
          onDragEnd={onDragEnd}
          className={`${draggedWine === wine.id ? "opacity-50" : ""} ${
            isReorderingEnabled ? "border border-dashed border-gray-300 rounded-lg" : ""
          }`}
        >
          <WineCard
            wine={wine}
            bookmarkState={bookmarkStates[wine.id] || "none"}
            onBookmarkToggle={onBookmarkToggle}
            onClick={() => onWineClick(wine)}
            isFavoriteTab={isFavoriteTab}
            onRemoveBookmark={onRemoveBookmark}
          />
        </div>
      ))}
    </div>
  )
}

// Componente para mostrar la cuadrícula de tarjetas de vino sin imágenes
interface WineCardNoImageGridProps {
  wines: Wine[]
  onWineClick: (wine: Wine) => void
  bookmarkStates: Record<string, BookmarkState>
  onBookmarkToggle: (id: string, e?: React.MouseEvent) => void
  isFavoriteTab: boolean
  onRemoveBookmark: (id: string, e?: React.MouseEvent) => void
  isReorderingEnabled: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void
  draggedWine: string | null
}

function WineCardNoImageGrid({
  wines,
  onWineClick,
  bookmarkStates,
  onBookmarkToggle,
  isFavoriteTab,
  onRemoveBookmark,
  isReorderingEnabled,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedWine,
}: WineCardNoImageGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {wines.map((wine) => (
        <div
          key={wine.id}
          draggable={isReorderingEnabled}
          onDragStart={(e) => onDragStart(e, wine.id)}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, wine.id)}
          onDragEnd={onDragEnd}
          className={`${draggedWine === wine.id ? "opacity-50" : ""} ${
            isReorderingEnabled ? "border border-dashed border-gray-300 rounded-lg" : ""
          }`}
        >
          <WineCardNoImage
            wine={wine}
            bookmarkState={bookmarkStates[wine.id] || "none"}
            onBookmarkToggle={onBookmarkToggle}
            onClick={() => onWineClick(wine)}
            isFavoriteTab={isFavoriteTab}
            onRemoveBookmark={onRemoveBookmark}
          />
        </div>
      ))}
    </div>
  )
}

// Add the WineCardNoImage component
function WineCardNoImage({
  wine,
  bookmarkState,
  onBookmarkToggle,
  onClick,
  isFavoriteTab,
  onRemoveBookmark,
}: {
  wine: Wine
  bookmarkState: BookmarkState
  onBookmarkToggle: (id: string, e: React.MouseEvent) => void
  onClick: () => void
  isFavoriteTab: boolean
  onRemoveBookmark: (id: string, e?: React.MouseEvent) => void
}) {
  // Obtener color para el tipo de vino
  const getWineTypeColor = (type: string): string => {
    return wineTypeColors[type] || "bg-gray-100 text-gray-800 border-gray-200" // Color por defecto
  }

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex flex-col h-full">
        {/* Contenido del vino */}
        <CardHeader className="relative pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {wine.displayName}
                {wine.isSommelierFavorite && <Heart className="h-4 w-4 text-rose-500 fill-current" />}
              </CardTitle>
              <CardDescription>
                {wine.winery} • {wine.origin} • {wine.year}
              </CardDescription>
            </div>
            <div>
              {!isFavoriteTab ? (
                <button
                  onClick={(e) => onBookmarkToggle(wine.id, e)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Marcar vino"
                >
                  {renderBookmarkIcon(bookmarkState)}
                </button>
              ) : (
                <button
                  onClick={(e) => onRemoveBookmark(wine.id, e)}
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
            <Badge variant="outline" className={cn("rounded-full", getWineTypeColor(wine.type))}>
              {wine.type}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {wine.grape}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {wine.terroir}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{wine.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm">
            <span className="font-medium">${wine.price.toLocaleString("es-AR")}</span>
            {wine.glass && (
              <span className="ml-3 text-muted-foreground">Copa: ${wine.glass.toLocaleString("es-AR")}</span>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  )
}

// Update the WineListItem component to move the bookmark icon to the right
// Replace the WineListItem function with:

interface WineListItemProps {
  wine: Wine
  onClick: () => void
  bookmarkState: BookmarkState
  onBookmarkToggle: (id: string, e: React.MouseEvent) => void
  isFavoriteTab: boolean
  onRemoveBookmark: (id: string, e?: React.MouseEvent) => void
  isReorderingEnabled: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void
  isDragging: boolean
}
function WineListItem({
  wine,
  onClick,
  bookmarkState,
  onBookmarkToggle,
  isFavoriteTab,
  onRemoveBookmark,
  isReorderingEnabled,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging,
}: WineListItemProps) {
  return (
    <div
      className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors ${
        isDragging ? "opacity-50 bg-gray-100" : ""
      } ${isReorderingEnabled ? "border border-dashed border-gray-300" : ""}`}
      onClick={onClick}
      draggable={isReorderingEnabled}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center gap-2 flex-grow">
        {isReorderingEnabled && (
          <div className="flex items-center justify-center w-6">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
          </div>
        )}
        <div className="flex items-center gap-2">
          {wine.isSommelierFavorite && <Heart className="h-4 w-4 text-rose-500 fill-current" />}
          <div>
            <p className="font-medium">{wine.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {wine.winery} • {wine.origin} • {wine.year}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="font-medium">${wine.price.toLocaleString("es-AR")}</span>
          {wine.glass && (
            <span className="text-xs text-muted-foreground">Copa: ${wine.glass.toLocaleString("es-AR")}</span>
          )}
        </div>
        <div>
          {!isFavoriteTab ? (
            <button
              onClick={(e) => onBookmarkToggle(wine.id, e)}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Marcar vino"
            >
              {renderBookmarkIcon(bookmarkState)}
            </button>
          ) : (
            <button
              onClick={(e) => onRemoveBookmark(wine.id, e)}
              className="text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Quitar de favoritos"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Update the conditional rendering in the TabsContent sections to include the new cards-no-image view
// For each TabsContent, add this condition after the cards view check:
// viewMode === "cards-no-image" ? (
//   <WineCardNoImageGrid
//     wines={...}
//     onWineClick={openWineDetail}
//     bookmarkStates={bookmarkedWines}
//     onBookmarkToggle={toggleBookmark}
//     isFavoriteTab={false}
//     onRemoveBookmark={removeFromBookmarks}
//     isReorderingEnabled={isReorderingEnabled}
//     onDragStart={handleDragStart}
//     onDragOver={handleDragOver}
//     onDragLeave={handleDragLeave}
//     onDrop={handleDrop}
//     onDragEnd={handleDragEnd}
//     draggedWine={draggedWine}
//   />
// ) :

// Componente para tarjeta de vino (vista de cards)
interface WineCardProps {
  wine: Wine
  bookmarkState: BookmarkState
  onBookmarkToggle: (id: string, e: React.MouseEvent) => void
  onClick: () => void
  isFavoriteTab: boolean
  onRemoveBookmark: (id: string, e?: React.MouseEvent) => void
}

function WineCard({ wine, bookmarkState, onBookmarkToggle, onClick, isFavoriteTab, onRemoveBookmark }: WineCardProps) {
  // Obtener color para el tipo de vino
  const getWineTypeColor = (type: string): string => {
    return wineTypeColors[type] || "bg-gray-100 text-gray-800 border-gray-200" // Color por defecto
  }

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex h-full">
        {/* Imagen del vino */}
        <div className="w-[30%] relative bg-gray-50 border-r p-2 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src={wine.imageUrl || "/placeholder.svg?height=300&width=100&text=Vino"}
              alt={wine.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 30vw, 150px"
            />
          </div>
        </div>

        {/* Contenido del vino */}
        <div className="w-[70%] flex flex-col">
          <CardHeader className="relative pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">{wine.displayName}</CardTitle>
                <CardDescription>
                  {wine.winery} • {wine.origin} • {wine.year}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {wine.isSommelierFavorite && (
                  <span className="text-rose-500" title="Favorito del Sommelier">
                    <Heart className="h-4 w-4 fill-current" />
                  </span>
                )}
                {!isFavoriteTab ? (
                  <button
                    onClick={(e) => onBookmarkToggle(wine.id, e)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Marcar vino"
                  >
                    {renderBookmarkIcon(bookmarkState)}
                  </button>
                ) : (
                  <button
                    onClick={(e) => onRemoveBookmark(wine.id, e)}
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
                {wine.grape}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {wine.terroir}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm">
              <span className="font-medium">${wine.price.toLocaleString("es-AR")}</span>
              {wine.glass && (
                <span className="ml-3 text-muted-foreground">Copa: ${wine.glass.toLocaleString("es-AR")}</span>
              )}
            </div>
            <Badge variant="outline" className={cn("rounded-full", getWineTypeColor(wine.type))}>
              {wine.type}
            </Badge>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}

// Componente para las tarjetas de vinos recomendados (versión más compacta)
interface RecommendedWineCardProps {
  wine: Wine
  onClick: () => void
}

function RecommendedWineCard({ wine, onClick }: RecommendedWineCardProps) {
  // Obtener color para el tipo de vino
  const getWineTypeColor = (type: string): string => {
    return wineTypeColors[type] || "bg-gray-100 text-gray-800 border-gray-200" // Color por defecto
  }

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex h-full">
        {/* Imagen más pequeña */}
        <div className="w-1/4 relative bg-gray-50 border-r p-2 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src={wine.imageUrl || "/placeholder.svg?height=300&width=100&text=Vino"}
              alt={wine.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 25vw, 100px"
            />
          </div>
        </div>

        {/* Contenido del vino */}
        <div className="w-3/4 flex flex-col">
          <CardHeader className="p-3">
            <CardTitle className="text-sm">{wine.displayName}</CardTitle>
            <CardDescription className="text-xs">{wine.winery}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">${wine.price.toLocaleString("es-AR")}</span>
              <Badge variant="outline" className={cn("rounded-full text-xs", getWineTypeColor(wine.type))}>
                {wine.type}
              </Badge>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

// Función para renderizar el icono de bookmark según el estado
function renderBookmarkIcon(state: BookmarkState) {
  return state === "bookmark" ? (
    <Bookmark className="h-6 w-6 fill-current" />
  ) : (
    <Bookmark className="h-6 w-6 fill-none" />
  )
}

// Componente de esqueleto para mostrar durante la carga
function WineListSkeleton() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <Skeleton className="h-10 w-full mb-6" />
      <Skeleton className="h-10 w-full mb-8" />
      <div className="space-y-8">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-40 mb-2" />
              {Array(4)
                .fill(0)
                .map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
            </div>
          ))}
      </div>
    </div>
  )
}

// Función para generar descripción
function generateDescription(type: string, grape: string): string {
  const typeDescriptions: Record<string, string[]> = {
    Tinto: [
      "Un vino elegante y estructurado con carácter distintivo.",
      "Expresión auténtica del terroir con notas intensas y complejas.",
      "Equilibrio perfecto entre fruta y madera, con taninos sedosos.",
      "Vino de gran personalidad y potencial de guarda.",
      "Elaborado con uvas seleccionadas de viñedos de altura.",
    ],
    Blanco: [
      "Vino fresco y aromático con notable expresión varietal.",
      "Equilibrio perfecto entre acidez y dulzor, con final persistente.",
      "Elaborado con uvas cosechadas en su punto óptimo de madurez.",
      "Expresión pura y elegante del terroir, con notas minerales.",
      "Vino de gran frescura y complejidad aromática.",
    ],
    Rosado: [
      "Rosado elegante y fresco con aromas a frutos rojos.",
      "Equilibrio perfecto entre acidez y dulzor, ideal para el verano.",
      "Elaborado con uvas seleccionadas de viñedos de altura.",
      "Expresión pura y delicada del terroir, con final persistente.",
      "Vino de gran frescura y versatilidad gastronómica.",
    ],
    Espumoso: [
      "Espumoso de método tradicional con finas burbujas y elegancia.",
      "Equilibrio perfecto entre acidez y complejidad aromática.",
      "Elaborado con uvas seleccionadas y crianza sobre lías.",
      "Expresión pura y elegante, con notas de panadería y frutas.",
      "Vino de gran frescura y versatilidad para cualquier ocasión.",
    ],
    Postre: [
      "Vino dulce de gran concentración y complejidad aromática.",
      "Equilibrio perfecto entre dulzor y acidez, con final persistente.",
      "Elaborado con uvas afectadas por podredumbre noble.",
      "Expresión pura y elegante del terroir, con notas de miel y frutas confitadas.",
      "Vino de gran untuosidad y potencial de guarda.",
    ],
  }

  const grapeDescriptions: Record<string, string> = {
    Malbec: "con la intensidad y carácter típicos del Malbec argentino",
    "Cabernet Sauvignon": "con la estructura y elegancia características del Cabernet Sauvignon",
    Chardonnay: "con la cremosidad y complejidad propias del Chardonnay",
    Torrontés: "con la expresión aromática única del Torrontés argentino",
    "Sauvignon Blanc": "con la frescura y vivacidad típicas del Sauvignon Blanc",
    "Pinot Noir": "con la delicadeza y elegancia propias del Pinot Noir",
    Syrah: "con la intensidad y especiado característicos del Syrah",
    Bonarda: "con la frutosidad y suavidad típicas de la Bonarda argentina",
  }

  const typeKey = Object.keys(typeDescriptions).find((key) => type.includes(key)) || "Tinto"
  const typeDesc = typeDescriptions[typeKey][Math.floor(Math.random() * typeDescriptions[typeKey].length)]

  let grapeDesc = ""
  for (const [key, desc] of Object.entries(grapeDescriptions)) {
    if (grape && grape.includes(key)) {
      grapeDesc = desc
      break
    }
  }

  if (!grapeDesc && grape) {
    grapeDesc = `con las características distintivas de la cepa ${grape}`
  } else if (!grapeDesc) {
    grapeDesc = "con un perfil aromático complejo y equilibrado"
  }

  return `${typeDesc} ${grapeDesc}.`
}

// Función para generar notas de cata
function generateTastingNotes(type: string, grape: string): string {
  const typeNotes: Record<string, string[]> = {
    Tinto: [
      "Aromas intensos a frutos rojos maduros",
      "Notas de cereza negra y ciruela",
      "Toques de vainilla y especias",
      "Aromas a chocolate negro y café",
      "Notas terrosas y minerales",
    ],
    Blanco: [
      "Aromas cítricos y frescos",
      "Notas de manzana verde y pera",
      "Toques florales y de hierbas frescas",
      "Aromas tropicales de piña y maracuyá",
      "Notas minerales y salinas",
    ],
    Rosado: [
      "Aromas a frutos rojos frescos",
      "Notas de fresa y frambuesa",
      "Toques florales y cítricos",
      "Aromas a melocotón y sandía",
      "Notas herbáceas sutiles",
    ],
    Espumoso: [
      "Aromas a pan tostado y brioche",
      "Notas de manzana y cítricos",
      "Toques de almendras y avellanas",
      "Aromas a frutas blancas maduras",
      "Notas de levadura y galleta",
    ],
    Postre: [
      "Aromas intensos a miel y frutas confitadas",
      "Notas de albaricoque y melocotón",
      "Toques de azahar y jazmín",
      "Aromas a caramelo y frutos secos",
      "Notas de pasas y orejones",
    ],
  }

  const grapeNotes: Record<string, string[]> = {
    Malbec: [
      "taninos aterciopelados",
      "estructura robusta",
      "final largo y persistente",
      "cuerpo medio-alto",
      "acidez equilibrada",
    ],
    Cabernet: [
      "taninos firmes y estructurados",
      "cuerpo completo",
      "final persistente",
      "acidez vibrante",
      "potencial de guarda",
    ],
    Chardonnay: [
      "textura cremosa",
      "acidez refrescante",
      "final largo y elegante",
      "cuerpo medio",
      "equilibrio perfecto",
    ],
    Sauvignon: [
      "acidez vibrante",
      "frescura notable",
      "final limpio y directo",
      "cuerpo ligero",
      "expresión varietal pura",
    ],
  }

  const typeKey = Object.keys(typeNotes).find((key) => type.includes(key)) || "Tinto"
  const typeNote = typeNotes[typeKey][Math.floor(Math.random() * typeNotes[typeKey].length)]

  let grapeKey = ""
  for (const key of Object.keys(grapeNotes)) {
    if (grape.includes(key)) {
      grapeKey = key
      break
    }
  }

  const mouthNote = grapeKey
    ? grapeNotes[grapeKey][Math.floor(Math.random() * grapeNotes[grapeKey].length)]
    : "equilibrio perfecto entre acidez y estructura"

  return `${typeNote}. En boca presenta ${mouthNote}, con un final elegante y persistente que invita a seguir degustando.`
}

// Función para generar maridajes
function generatePairings(type: string): string {
  const typePairings: Record<string, string[]> = {
    Tinto: [
      "carnes rojas a la parrilla",
      "estofados de carne",
      "quesos curados",
      "pastas con salsas intensas",
      "caza menor",
    ],
    Blanco: ["pescados a la plancha", "mariscos", "ensaladas frescas", "quesos suaves", "aves de corral"],
    Rosado: ["arroces", "tapas variadas", "pescados grasos", "cocina asiática suave", "quesos semicurados"],
    Espumoso: ["aperitivos", "mariscos crudos", "sushi", "quesos cremosos", "postres ligeros"],
    Postre: ["foie gras", "quesos azules", "postres de frutas", "pastelería fina", "frutos secos"],
  }

  const typeKey = Object.keys(typePairings).find((key) => type.includes(key)) || "Tinto"

  const pairing1 = typePairings[typeKey][Math.floor(Math.random() * typePairings[typeKey].length)]
  let pairing2
  do {
    pairing2 = typePairings[typeKey][Math.floor(Math.random() * typePairings[typeKey].length)]
  } while (pairing1 === pairing2)

  return `Ideal para acompañar ${pairing1} y ${pairing2}. Servir a ${type.includes("Tinto") ? "16-18" : "8-10"}°C.`
}

// Modificar los datos de ejemplo para incluir las imágenes, enólogos y origen
const exampleWines: Wine[] = [
  {
    id: "1",
    name: "Malbec Reserva",
    displayName: "Malbec Reserva",
    type: "Tinto",
    region: "Valle de Uco, Mendoza",
    year: "2018",
    price: 45000,
    glass: 12000,
    description: "Intenso y complejo con notas de frutos rojos maduros y especias.",
    winery: "Bodega Catena Zapata",
    grape: "Malbec",
    range: "Reserva",
    sku: "CAT001",
    supplier: "Distribuidora Premium",
    alcohol: "14.5%",
    volume: "750ml",
    origin: "Valle de Uco, Mendoza",
    notes: "Aromas a ciruelas maduras, chocolate negro y un toque de vainilla. En boca es potente con taninos suaves.",
    pairings: "Carnes rojas, cordero y quesos maduros.",
    latitude: -33.83,
    longitude: -68.92,
    terroir: "Arcilloso calcáreo",
    isSommelierFavorite: true,
    imageUrl: "/images/red-wine.png",
    winemaker: "Alejandro Vigil",
  },
  {
    id: "2",
    name: "Chardonnay Gran Reserva",
    displayName: "Chardonnay Gran Reserva",
    type: "Blanco",
    region: "Valle de Casablanca, Chile",
    year: "2020",
    price: 38000,
    glass: 10000,
    description: "Elegante y fresco con notas cítricas y un toque mineral.",
    winery: "Viña Concha y Toro",
    grape: "Chardonnay",
    range: "Gran Reserva",
    sku: "CCT002",
    supplier: "Importadora Andina",
    alcohol: "13.5%",
    volume: "750ml",
    origin: "Valle de Casablanca, Chile",
    notes: "Aromas a frutas tropicales, manzana verde y un toque de vainilla. En boca es fresco y equilibrado.",
    pairings: "Pescados, mariscos y quesos suaves.",
    latitude: -33.32,
    longitude: -71.41,
    terroir: "Granítico",
    isSommelierFavorite: false,
    imageUrl: "/images/white-wine.png",
    winemaker: "Marcelo Retamal",
  },
  {
    id: "3",
    name: "Cabernet Sauvignon",
    displayName: "Cabernet Sauvignon",
    type: "Tinto",
    region: "Valle del Maipo, Chile",
    year: "2019",
    price: 42000,
    glass: 11000,
    description: "Potente y estructurado con notas de frutos negros y especias.",
    winery: "Viña Santa Rita",
    grape: "Cabernet Sauvignon",
    range: "Clásico",
    sku: "VSR003",
    supplier: "Importadora Andina",
    alcohol: "14%",
    volume: "750ml",
    origin: "Valle del Maipo, Chile",
    notes: "Aromas a cassis, pimienta negra y un toque de cedro. En boca es potente con taninos firmes.",
    pairings: "Carnes rojas, estofados y quesos curados.",
    latitude: -33.65,
    longitude: -70.57,
    terroir: "Aluvial",
    isSommelierFavorite: false,
    imageUrl: "/images/red-wine.png",
    winemaker: "José Olmedo",
  },
  {
    id: "4",
    name: "Espumoso Brut Nature",
    displayName: "Espumoso Brut Nature",
    type: "Espumoso",
    region: "Agrelo, Mendoza",
    year: "2021",
    price: 55000,
    glass: 15000,
    description: "Fino y elegante con burbujas persistentes y notas cítricas.",
    winery: "Bodega Chandon",
    grape: "Chardonnay/Pinot Noir",
    range: "Brut Nature",
    sku: "BCH004",
    supplier: "Distribuidora Premium",
    alcohol: "12%",
    volume: "750ml",
    origin: "Agrelo, Mendoza",
    notes: "Aromas a manzana verde, pan tostado y un toque de levadura. En boca es fresco y equilibrado.",
    pairings: "Aperitivos, mariscos y sushi.",
    latitude: -33.05,
    longitude: -68.84,
    terroir: "Arenoso",
    isSommelierFavorite: true,
    imageUrl: "/images/sparkling-wine.png",
    winemaker: "Onofri Mariana",
  },
  {
    id: "5",
    name: "Rosado de Malbec",
    displayName: "Rosado de Malbec",
    type: "Rosado",
    region: "Luján de Cuyo, Mendoza",
    year: "2022",
    price: 32000,
    glass: 9000,
    description: "Fresco y frutado con aromas a cereza y frambuesa.",
    winery: "Bodega Salentein",
    grape: "Malbec",
    range: "Joven",
    sku: "BSL005",
    supplier: "Distribuidora del Sol",
    alcohol: "13%",
    volume: "750ml",
    origin: "Luján de Cuyo, Mendoza",
    notes: "Aromas a fresas, rosas y un toque cítrico. En boca es ligero y refrescante.",
    pairings: "Ensaladas, tapas y pescados a la plancha.",
    latitude: -33.15,
    longitude: -68.94,
    terroir: "Arcilloso ferroso",
    isSommelierFavorite: false,
    imageUrl: "/images/rose-wine.png",
    winemaker: "Sebastián Zuccardi",
  },
]
