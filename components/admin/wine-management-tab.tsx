"use client"

import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowUp, ArrowDown, ArrowUpDown, EyeOff } from "lucide-react"
import { useWine } from "@/context/wine-context"
import { useToast } from "@/hooks/use-toast"
import type { WineConfig } from "@/lib/storage-service"

// Interfaces para los datos de gestión
interface WineManagementData {
  id: string
  idInterno: string
  nombre: string
  productor: string
  estilo: string
  tipo: string
  uva: string
  region: string
  ano: string | number | null
  orden: number
  visible: boolean
  precio: number | null
  precioCopa: number | null
  alcohol: string | null
  enologo: string | null
  maridaje: string | null
  vista: string | null
  nariz: string | null
  boca: string | null
  otros: string | null
  altitud: string | null
}

// Tipo para las opciones de ordenamiento
type SortField =
  | "idInterno"
  | "nombre"
  | "productor"
  | "estilo"
  | "tipo"
  | "uva"
  | "region"
  | "ano"
  | "orden"
  | "precio"
  | "precioCopa"
  | "visible"
type SortDirection = "asc" | "desc"

export function WineManagementTab() {
  const { rawWinesData, categorizedWineData, savedConfig, saveConfiguration, refreshWineList } = useWine()
  const [managementWines, setManagementWines] = useState<WineManagementData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas las Categorías")
  const [selectedCepa, setSelectedCepa] = useState<string>("Todas las Cepas")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [cepas, setCepas] = useState<Record<string, string[]>>({})
  const [sortField, setSortField] = useState<SortField>("orden")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  // Ref to track if we have unsaved changes
  const hasUnsavedChanges = useRef(false)

  // Inicializar datos de gestión desde los datos crudos (rawWinesData)
  useEffect(() => {
    if (rawWinesData.length > 0) {
      // Only initialize if we don't have unsaved changes
      if (!hasUnsavedChanges.current) {
        console.log(
          "Initializing managementWines with rawWinesData:",
          rawWinesData
            .slice(0, 3)
            .map((w) => ({ id: w.id, idInterno: w.idInterno, nombre: w.nombre, enCarta: w.enCarta })),
        )

        // Convertir vinos a formato de gestión
        const wineData: WineManagementData[] = rawWinesData.map((wine) => {
          // Buscar configuración guardada para este vino
          let visible = wine.enCarta !== false // Por defecto, todos los vinos son visibles
          let orden = wine.orden || 0

          if (savedConfig) {
            const savedWine = savedConfig.wines.find((w) => w.id === wine.id)
            if (savedWine) {
              visible = savedWine.visible
              orden = savedWine.order
            }
          }

          return {
            id: wine.id,
            idInterno: wine.idInterno || "",
            nombre: wine.nombre || "",
            productor: wine.productor || "",
            estilo: wine.estilo || "",
            tipo: wine.tipo || "",
            uva: wine.uva || "",
            region: wine.region || "",
            ano: wine.ano,
            orden: orden,
            visible: visible,
            precio: wine.precio,
            precioCopa: wine.precioCopa,
            alcohol: wine.alcohol || null,
            enologo: wine.enologo || null,
            maridaje: wine.maridaje || null,
            vista: wine.vista || null,
            nariz: wine.nariz || null,
            boca: wine.boca || null,
            otros: wine.otros || null,
            altitud: wine.altitud || null,
          }
        })

        setManagementWines(wineData)
        hasUnsavedChanges.current = false
      } else {
        console.log("Skipping managementWines initialization because there are unsaved changes")
      }

      // Extraer categorías únicas de todos los vinos, no solo los visibles
      const uniqueCategories = Array.from(new Set(rawWinesData.map((wine) => wine.estilo).filter(Boolean) as string[]))
      setCategories(uniqueCategories)

      // Extraer cepas únicas por categoría de todos los vinos
      const cepasByCategory: Record<string, string[]> = {}

      // Agrupar vinos por categoría primero
      const winesByCategory: Record<string, typeof rawWinesData> = {}
      rawWinesData.forEach((wine) => {
        if (wine.estilo) {
          if (!winesByCategory[wine.estilo]) {
            winesByCategory[wine.estilo] = []
          }
          winesByCategory[wine.estilo].push(wine)
        }
      })

      // Extraer cepas únicas por categoría
      Object.entries(winesByCategory).forEach(([categoryName, categoryWines]) => {
        const uniqueCepas = Array.from(new Set(categoryWines.map((wine) => wine.uva).filter(Boolean) as string[]))
        cepasByCategory[categoryName] = uniqueCepas
      })

      setCepas(cepasByCategory)
    }
  }, [rawWinesData, savedConfig])

  // Reset hasUnsavedChanges when savedConfig changes (after a successful save)
  useEffect(() => {
    hasUnsavedChanges.current = false
  }, [savedConfig])

  // Filtrar vinos basados en categoría, cepa y búsqueda
  // IMPORTANTE: No filtramos por visibilidad aquí para mantener todos los vinos visibles en la interfaz de administración
  const filteredWines = managementWines.filter((wine) => {
    const matchesCategory = selectedCategory !== "Todas las Categorías" ? wine.estilo === selectedCategory : true
    const matchesCepa = selectedCepa !== "Todas las Cepas" ? wine.uva === selectedCepa : true
    const matchesVisibility =
      visibilityFilter === "all" ? true : visibilityFilter === "visible" ? wine.visible : !wine.visible
    const matchesSearch = searchQuery
      ? wine.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wine.productor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wine.idInterno && wine.idInterno.toLowerCase().includes(searchQuery.toLowerCase()))
      : true

    return matchesCategory && matchesCepa && matchesVisibility && matchesSearch
  })

  // Ordenar vinos según el campo y dirección seleccionados
  const sortedWines = [...filteredWines].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "idInterno":
        comparison = (a.idInterno || "").localeCompare(b.idInterno || "")
        break
      case "nombre":
        comparison = a.nombre.localeCompare(b.nombre)
        break
      case "productor":
        comparison = a.productor.localeCompare(b.productor)
        break
      case "estilo":
        comparison = a.estilo.localeCompare(b.estilo)
        break
      case "tipo":
        comparison = a.tipo.localeCompare(b.tipo)
        break
      case "uva":
        comparison = a.uva.localeCompare(b.uva)
        break
      case "region":
        comparison = a.region.localeCompare(b.region)
        break
      case "ano":
        const anoA = typeof a.ano === "number" ? a.ano : 0
        const anoB = typeof b.ano === "number" ? b.ano : 0
        comparison = anoA - anoB
        break
      case "orden":
        comparison = a.orden - b.orden
        break
      case "precio":
        comparison = (a.precio || 0) - (b.precio || 0)
        break
      case "precioCopa":
        comparison = (a.precioCopa || 0) - (b.precioCopa || 0)
        break
      case "visible":
        comparison = a.visible === b.visible ? 0 : a.visible ? -1 : 1
        break
      default:
        comparison = 0
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleWineOrderChange = (wineId: string, value: string) => {
    setManagementWines((prevWines) =>
      prevWines.map((wine) => (wine.id === wineId ? { ...wine, orden: Number.parseInt(value) || 0 } : wine)),
    )
    setHasChanges(true)
    hasUnsavedChanges.current = true
  }

  const handleWineVisibleChange = (wineId: string, value: boolean) => {
    console.log(`Toggling visibility for wine ID: ${wineId} to: ${value}`)

    // Use the functional update pattern to ensure we're working with the latest state
    setManagementWines((prevWines) => {
      const updatedWines = prevWines.map((wine) => (wine.id === wineId ? { ...wine, visible: value } : wine))

      // Log the first few wines before and after the update for debugging
      console.log(
        "Before update:",
        prevWines.slice(0, 3).map((w) => ({ id: w.id, nombre: w.nombre, visible: w.visible })),
      )
      console.log(
        "After update:",
        updatedWines.slice(0, 3).map((w) => ({ id: w.id, nombre: w.nombre, visible: w.visible })),
      )

      return updatedWines
    })

    setHasChanges(true)
    hasUnsavedChanges.current = true
  }

  const moveWineOrder = (wineId: string, direction: "up" | "down") => {
    const wineIndex = managementWines.findIndex((w) => w.id === wineId)
    const wine = managementWines[wineIndex]

    // Find wines in the same category and cepa
    const winesInSameGroup = managementWines.filter((w) => w.estilo === wine.estilo && w.uva === wine.uva)

    const groupIndex = winesInSameGroup.findIndex((w) => w.id === wineId)

    if (
      (direction === "up" && groupIndex === 0) ||
      (direction === "down" && groupIndex === winesInSameGroup.length - 1)
    ) {
      return
    }

    // Update the order of the wine and the one it's swapping with
    const targetGroupIndex = direction === "up" ? groupIndex - 1 : groupIndex + 1
    const targetWine = winesInSameGroup[targetGroupIndex]

    setManagementWines((prevWines) => {
      return prevWines.map((w) => {
        if (w.id === wineId) {
          return { ...w, orden: targetWine.orden }
        } else if (w.id === targetWine.id) {
          return { ...w, orden: wine.orden }
        }
        return w
      })
    })

    setHasChanges(true)
    hasUnsavedChanges.current = true
  }

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to ascending
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSave = () => {
    try {
      // Preparar datos para guardar
      const wineConfigs: WineConfig[] = managementWines.map((wine) => {
        console.log(
          `Saving config for wine: ${wine.nombre} with ID: ${wine.id} (idInterno: ${wine.idInterno}), visible: ${wine.visible}`,
        )
        return {
          id: wine.id,
          visible: wine.visible,
          order: wine.orden,
        }
      })

      // Mantener la configuración de categorías y cepas existente o crear una vacía
      const categoryConfigs = savedConfig?.categories || []
      const cepaConfigs = savedConfig?.cepas || []

      // Crear la configuración completa
      const newConfig = {
        categories: categoryConfigs,
        cepas: cepaConfigs,
        wines: wineConfigs,
        lastUpdated: Date.now(),
      }

      // Log para depuración
      console.log("Wine configs being sent to context:", JSON.stringify(wineConfigs.slice(0, 5), null, 2))

      // Guardar la configuración
      const success = saveConfiguration(newConfig)

      if (success) {
        // Refrescar la lista de vinos con la nueva configuración
        refreshWineList()
        setHasChanges(false)
        hasUnsavedChanges.current = false
        toast({
          title: "Cambios guardados",
          description: "La configuración de vinos se ha guardado correctamente.",
          variant: "default",
        })
      } else {
        toast({
          title: "Error al guardar",
          description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        title: "Error al guardar",
        description: "Ocurrió un error inesperado. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    // Recargar los vinos desde la configuración guardada
    if (savedConfig) {
      const savedWines = savedConfig.wines

      setManagementWines((prevWines) => {
        return prevWines.map((wine) => {
          const savedWine = savedWines.find((w) => w.id === wine.id)
          return {
            ...wine,
            visible: savedWine?.visible ?? true, // Si no hay configuración, por defecto es visible
            orden: savedWine?.order || wine.orden,
          }
        })
      })
    }

    setHasChanges(false)
    hasUnsavedChanges.current = false
    toast({
      title: "Cambios descartados",
      description: "Se han restaurado los valores anteriores.",
      variant: "default",
    })
  }

  // Botón para restablecer todos los vinos a visibles
  const handleResetAllVisible = () => {
    setManagementWines((prevWines) => {
      return prevWines.map((wine) => ({
        ...wine,
        visible: true,
      }))
    })

    setHasChanges(true)
    hasUnsavedChanges.current = true
    toast({
      title: "Visibilidad restablecida",
      description: "Todos los vinos han sido marcados como visibles.",
      variant: "default",
    })
  }

  if (managementWines.length === 0) {
    return <div className="p-8 text-center">Cargando vinos...</div>
  }

  // Estadísticas para mostrar en la interfaz
  const totalWines = managementWines.length
  const visibleWines = managementWines.filter((w) => w.visible).length
  const hiddenWines = totalWines - visibleWines

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por Categoría..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas las Categorías">Todas las Categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={selectedCepa}
            onValueChange={setSelectedCepa}
            disabled={selectedCategory === "Todas las Categorías"}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por Cepa..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas las Cepas">Todas las Cepas</SelectItem>
              {selectedCategory !== "Todas las Categorías" &&
                cepas[selectedCategory]?.map((cepa) => (
                  <SelectItem key={cepa} value={cepa}>
                    {cepa}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={visibilityFilter}
            onValueChange={(value: "all" | "visible" | "hidden") => setVisibilityFilter(value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por Visibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Vinos</SelectItem>
              <SelectItem value="visible">Solo Visibles ({visibleWines})</SelectItem>
              <SelectItem value="hidden">Solo Ocultos ({hiddenWines})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar vino, bodega o SKU..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={handleResetAllVisible}>
          Restablecer Visibilidad
        </Button>
      </div>

      <div className="text-sm text-gray-500 mb-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            Total: {totalWines} vinos ({visibleWines} visibles, {hiddenWines} ocultos)
          </span>
          <span>Mostrando: {sortedWines.length} vinos</span>
          {visibilityFilter !== "all" && (
            <span>{visibilityFilter === "visible" ? "Solo visibles" : "Solo ocultos"}</span>
          )}
          {selectedCategory !== "Todas las Categorías" && <span>Categoría: {selectedCategory}</span>}
          {selectedCepa !== "Todas las Cepas" && <span>Cepa: {selectedCepa}</span>}
          {searchQuery && <span>Búsqueda: "{searchQuery}"</span>}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("idInterno")}>
                <div className="flex items-center">
                  SKU_LAZZY
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("productor")}>
                <div className="flex items-center">
                  BODEGA
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("nombre")}>
                <div className="flex items-center">
                  NOMBRE_VINO_COMPLETO
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("estilo")}>
                <div className="flex items-center">
                  CATEGORIA_SOMMELIER
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("tipo")}>
                <div className="flex items-center">
                  TIPOVINO
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("uva")}>
                <div className="flex items-center">
                  CEPA
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("orden")}>
                <div className="flex items-center">
                  ORDEN_VISUALIZACION_VINO
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("visible")}>
                <div className="flex items-center">
                  ENCARTA_RESTAURANTE1
                  <div className="ml-1 text-xs text-gray-500">(Visibilidad)</div>
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("precio")}>
                <div className="flex items-center">
                  PRECIO_BOTELLA_RESTAURANTE R1
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("precioCopa")}>
                <div className="flex items-center">
                  PRECIO R1 COPA
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("ano")}>
                <div className="flex items-center">
                  COSECHA
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("region")}>
                <div className="flex items-center">
                  PAIS_REGION_ORIGEN
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedWines.map((wine) => (
              <TableRow key={wine.id} className={!wine.visible ? "bg-gray-100" : ""}>
                <TableCell>{wine.idInterno}</TableCell>
                <TableCell>{wine.productor}</TableCell>
                <TableCell className="font-medium relative">
                  {wine.nombre}
                  {!wine.visible && (
                    <span className="absolute top-1/2 right-2 transform -translate-y-1/2">
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    </span>
                  )}
                </TableCell>
                <TableCell>{wine.estilo}</TableCell>
                <TableCell>{wine.tipo}</TableCell>
                <TableCell>{wine.uva}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={wine.orden}
                      onChange={(e) => handleWineOrderChange(wine.id, e.target.value)}
                      className="w-16 h-8"
                    />
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => moveWineOrder(wine.id, "up")}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => moveWineOrder(wine.id, "down")}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={wine.visible}
                      onCheckedChange={(value) => handleWineVisibleChange(wine.id, value)}
                      id={`visibility-${wine.id}`}
                    />
                    <label
                      htmlFor={`visibility-${wine.id}`}
                      className={`text-sm ${!wine.visible ? "text-gray-500" : ""}`}
                    >
                      {wine.visible ? "Visible" : "Oculto"}
                    </label>
                  </div>
                </TableCell>
                <TableCell className={!wine.visible ? "text-gray-500" : ""}>
                  {wine.precio !== null ? `$${wine.precio.toFixed(0)}` : "-"}
                </TableCell>
                <TableCell className={!wine.visible ? "text-gray-500" : ""}>
                  {wine.precioCopa !== null ? `$${wine.precioCopa.toFixed(0)}` : "-"}
                </TableCell>
                <TableCell className={!wine.visible ? "text-gray-500" : ""}>{wine.ano || "-"}</TableCell>
                <TableCell className={!wine.visible ? "text-gray-500" : ""}>{wine.region || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={handleCancel} disabled={!hasChanges}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges}>
          Aplicar Cambios
        </Button>
      </div>
    </div>
  )
}
