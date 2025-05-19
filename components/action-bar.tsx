"use client"

import { useState, useEffect } from "react"
import { useWine } from "@/context/wine-context"
import { Search, X, Filter, Bookmark } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ActionBar() {
  const {
    searchQuery,
    setSearchQuery,
    wines,
    setFilters,
    filters,
    setSelectedWine,
    hasBookmarkedWines,
    bookmarkedWines,
    setSelectedCategory,
  } = useWine()
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [filterOptions, setFilterOptions] = useState({
    regions: [] as string[],
    grapes: [] as string[],
    styles: [] as string[],
    types: [] as string[],
  })
  const [selectedFilters, setSelectedFilters] = useState({
    region: [] as string[],
    grape: [] as string[],
    style: [] as string[],
    type: [] as string[],
  })

  // Estado local para verificar si hay vinos guardados
  const [hasBookmarks, setHasBookmarks] = useState(false)

  // Actualizar el estado local cuando cambia bookmarkedWines
  useEffect(() => {
    // Verificar explícitamente si hay vinos guardados
    const hasAnyBookmarks = bookmarkedWines && bookmarkedWines.size > 0
    console.log("Bookmarked wines count:", bookmarkedWines ? bookmarkedWines.size : 0)
    setHasBookmarks(hasAnyBookmarks)
  }, [bookmarkedWines])

  // Improved function to format prices correctly
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "-"

    // Ensure we're working with a number
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price

    // Format with thousands separator and NO decimal places
    return `$${Math.floor(numericPrice)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  // Extraer opciones de filtro únicas de los vinos
  useEffect(() => {
    if (wines.length > 0) {
      const regions = Array.from(new Set(wines.map((wine) => wine.region).filter(Boolean) as string[])).sort()
      const grapes = Array.from(new Set(wines.map((wine) => wine.uva).filter(Boolean) as string[])).sort()
      const styles = Array.from(new Set(wines.map((wine) => wine.estilo).filter(Boolean) as string[])).sort()
      const types = Array.from(new Set(wines.map((wine) => wine.tipo).filter(Boolean) as string[])).sort()

      setFilterOptions({ regions, grapes, styles, types })
    }
  }, [wines])

  // Inicializar los filtros seleccionados desde el contexto
  useEffect(() => {
    setSelectedFilters({
      region: filters.region || [],
      grape: filters.grape || [],
      style: filters.style || [],
      type: filters.type || [],
    })
  }, [filters])

  // Función para buscar vinos
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.trim().length > 1) {
      const results = wines
        .filter((wine) => {
          const searchIn = [wine.nombre, wine.productor, wine.uva, wine.region, wine.estilo, wine.tipo]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()

          return searchIn.includes(query.toLowerCase())
        })
        .slice(0, 10) // Limitar a 10 resultados para mejor rendimiento

      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setSearchOpen(false)
  }

  // Manejar cambios en los filtros
  const handleFilterChange = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters((prev) => {
      const current = [...prev[type]]
      const index = current.indexOf(value)

      if (index === -1) {
        current.push(value)
      } else {
        current.splice(index, 1)
      }

      return { ...prev, [type]: current }
    })
  }

  // Aplicar filtros
  const applyFilters = () => {
    setFilters(selectedFilters)
    setFilterOpen(false)
  }

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSelectedFilters({
      region: [],
      grape: [],
      style: [],
      type: [],
    })
    setFilters({})
    setFilterOpen(false)
  }

  return (
    <div className="border-b border-gray-200 py-2 px-4">
      <div className="max-w-screen-xl mx-auto flex justify-end gap-2">
        <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Buscar">
          <Search className="h-5 w-5 text-gray-500" />
        </button>

        <button onClick={() => setFilterOpen(true)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Filtrar">
          <Filter className="h-5 w-5 text-gray-500" />
        </button>

        <button
          onClick={() => setSelectedCategory("favorites")}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Ver favoritos"
        >
          <Bookmark
            className="h-5 w-5 text-gray-500"
            fill={hasBookmarks ? "#c11119" : "none"}
            stroke={hasBookmarks ? "#c11119" : "currentColor"}
          />
        </button>

        {/* Diálogo de búsqueda */}
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, bodega, región o uva..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <ScrollArea className="mt-4 max-h-[300px]">
                <div className="space-y-2">
                  {searchResults.map((wine) => (
                    <div
                      key={wine.id}
                      className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        setSelectedWine(wine)
                        setSearchOpen(false)
                      }}
                    >
                      <div className="font-medium">{wine.nombre}</div>
                      <div className="text-sm text-gray-500">
                        {wine.productor} • {wine.uva || "Sin uva"} • {wine.region || "Sin región"}
                      </div>
                      <div className="text-sm font-medium mt-1">{formatPrice(wine.precio)}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="mt-4 text-center text-gray-500">No se encontraron resultados para "{searchQuery}"</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de filtros */}
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent className="sm:max-w-md">
            <h2 className="text-lg font-semibold mb-4">Filtrar vinos</h2>

            <ScrollArea className="max-h-[400px] pr-4">
              {/* Filtro por región */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Región</h3>
                <div className="space-y-2">
                  {filterOptions.regions.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={selectedFilters.region.includes(region)}
                        onCheckedChange={() => handleFilterChange("region", region)}
                      />
                      <Label htmlFor={`region-${region}`} className="text-sm cursor-pointer">
                        {region}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por uva */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Uva</h3>
                <div className="space-y-2">
                  {filterOptions.grapes.map((grape) => (
                    <div key={grape} className="flex items-center space-x-2">
                      <Checkbox
                        id={`grape-${grape}`}
                        checked={selectedFilters.grape.includes(grape)}
                        onCheckedChange={() => handleFilterChange("grape", grape)}
                      />
                      <Label htmlFor={`grape-${grape}`} className="text-sm cursor-pointer">
                        {grape}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por estilo */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Estilo</h3>
                <div className="space-y-2">
                  {filterOptions.styles.map((style) => (
                    <div key={style} className="flex items-center space-x-2">
                      <Checkbox
                        id={`style-${style}`}
                        checked={selectedFilters.style.includes(style)}
                        onCheckedChange={() => handleFilterChange("style", style)}
                      />
                      <Label htmlFor={`style-${style}`} className="text-sm cursor-pointer">
                        {style}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por tipo */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Tipo</h3>
                <div className="space-y-2">
                  {filterOptions.types.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedFilters.type.includes(type)}
                        onCheckedChange={() => handleFilterChange("type", type)}
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
              <Button onClick={applyFilters}>Aplicar filtros</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
