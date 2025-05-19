"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { useWine } from "@/context/wine-context"
import { useToast } from "@/hooks/use-toast"
import type { CategoryConfig, CepaConfig } from "@/lib/storage-service"

// Interfaces para los datos de categorías
interface CategoryData {
  id: string
  name: string
  order: number
  cepas: CepaData[]
}

interface CepaData {
  id: string
  name: string
  order: number
}

export function CategoryManagementTab() {
  const { categorizedWineData, savedConfig, saveConfiguration, refreshWineList, rawWinesData } = useWine()
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  // Inicializar categorías desde los datos reales
  useEffect(() => {
    if (categorizedWineData.length > 0 || rawWinesData.length > 0) {
      // Extraer categorías únicas de todos los vinos, no solo los visibles
      const uniqueCategories = new Map<string, Set<string>>()

      // Primero intentamos usar categorizedWineData
      if (categorizedWineData.length > 0) {
        categorizedWineData.forEach((category) => {
          const categoryName = category.categoryName

          if (!uniqueCategories.has(categoryName)) {
            uniqueCategories.set(categoryName, new Set())
          }

          // Extraer cepas (uva) de los vinos en esta categoría
          category.wines.forEach((wine) => {
            if (wine.uva) {
              uniqueCategories.get(categoryName)?.add(wine.uva)
            }
          })
        })
      }
      // Si no hay categorizedWineData, usamos rawWinesData
      else if (rawWinesData.length > 0) {
        // Agrupar vinos por categoría (estilo)
        rawWinesData.forEach((wine) => {
          if (wine.estilo) {
            if (!uniqueCategories.has(wine.estilo)) {
              uniqueCategories.set(wine.estilo, new Set())
            }

            if (wine.uva) {
              uniqueCategories.get(wine.estilo)?.add(wine.uva)
            }
          }

          // También considerar el tipo como categoría si es diferente del estilo
          if (wine.tipo && wine.tipo !== wine.estilo) {
            if (!uniqueCategories.has(wine.tipo)) {
              uniqueCategories.set(wine.tipo, new Set())
            }

            if (wine.uva) {
              uniqueCategories.get(wine.tipo)?.add(wine.uva)
            }
          }
        })
      }

      // Convertir a formato de categorías para la UI
      const categoryData: CategoryData[] = Array.from(uniqueCategories.entries()).map(
        ([categoryName, cepaSet], index) => {
          // Buscar el orden en la configuración guardada
          let order = index + 1 // Orden por defecto

          // Si hay configuración guardada, usar ese orden
          if (savedConfig) {
            const savedCategory = savedConfig.categories.find((c) => c.name === categoryName)
            if (savedCategory) {
              order = savedCategory.order
            }
          }

          return {
            id: categoryName.toLowerCase().replace(/\s+/g, "-"),
            name: categoryName,
            order: order,
            cepas: Array.from(cepaSet).map((cepaName, cepaIndex) => {
              const cepaId = `${categoryName}-${cepaName}`.toLowerCase().replace(/\s+/g, "-")
              let cepaOrder = cepaIndex + 1

              // Si hay configuración guardada, usar ese orden
              if (savedConfig) {
                const savedCepa = savedConfig.cepas.find((c) => c.id === cepaId)
                if (savedCepa) {
                  cepaOrder = savedCepa.order
                }
              }

              return {
                id: cepaId,
                name: cepaName,
                order: cepaOrder,
              }
            }),
          }
        },
      )

      // Ordenar categorías por el orden configurado
      categoryData.sort((a, b) => a.order - b.order)

      // Ordenar cepas dentro de cada categoría
      categoryData.forEach((category) => {
        category.cepas.sort((a, b) => a.order - b.order)
      })

      setCategories(categoryData)
    }
  }, [categorizedWineData, savedConfig, rawWinesData])

  const handleCategoryOrderChange = (categoryId: string, value: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId ? { ...category, order: Number.parseInt(value) || 0 } : category,
      ),
    )
    setHasChanges(true)
  }

  const handleCepaOrderChange = (categoryId: string, cepaId: string, value: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              cepas: category.cepas.map((cepa) =>
                cepa.id === cepaId ? { ...cepa, order: Number.parseInt(value) || 0 } : cepa,
              ),
            }
          : category,
      ),
    )
    setHasChanges(true)
  }

  const moveCategory = (categoryId: string, direction: "up" | "down") => {
    const categoryIndex = categories.findIndex((c) => c.id === categoryId)
    if (
      (direction === "up" && categoryIndex === 0) ||
      (direction === "down" && categoryIndex === categories.length - 1)
    ) {
      return
    }

    const newCategories = [...categories]
    const targetIndex = direction === "up" ? categoryIndex - 1 : categoryIndex + 1
    const temp = newCategories[targetIndex]
    newCategories[targetIndex] = newCategories[categoryIndex]
    newCategories[categoryIndex] = temp

    // Update order values
    newCategories[targetIndex].order = targetIndex + 1
    newCategories[categoryIndex].order = categoryIndex + 1

    setCategories(newCategories)
    setHasChanges(true)
  }

  const moveCepa = (categoryId: string, cepaId: string, direction: "up" | "down") => {
    const categoryIndex = categories.findIndex((c) => c.id === categoryId)
    const category = categories[categoryIndex]
    const cepaIndex = category.cepas.findIndex((c) => c.id === cepaId)

    if ((direction === "up" && cepaIndex === 0) || (direction === "down" && cepaIndex === category.cepas.length - 1)) {
      return
    }

    const newCategories = [...categories]
    const newCepas = [...newCategories[categoryIndex].cepas]
    const targetIndex = direction === "up" ? cepaIndex - 1 : cepaIndex + 1
    const temp = newCepas[targetIndex]
    newCepas[targetIndex] = newCepas[cepaIndex]
    newCepas[cepaIndex] = temp

    // Update order values
    newCepas[targetIndex].order = targetIndex + 1
    newCepas[cepaIndex].order = cepaIndex + 1

    newCategories[categoryIndex].cepas = newCepas
    setCategories(newCategories)
    setHasChanges(true)
  }

  const handleSave = () => {
    try {
      // Preparar datos para guardar
      const categoryConfigs: CategoryConfig[] = categories.map((category) => ({
        id: category.id,
        name: category.name,
        order: category.order,
      }))

      const cepaConfigs: CepaConfig[] = categories.flatMap((category) =>
        category.cepas.map((cepa) => ({
          id: cepa.id,
          categoryId: category.id,
          name: cepa.name,
          order: cepa.order,
        })),
      )

      // Mantener la configuración de vinos existente o crear una vacía
      const wineConfigs = savedConfig?.wines || []

      // Crear la configuración completa
      const newConfig = {
        categories: categoryConfigs,
        cepas: cepaConfigs,
        wines: wineConfigs,
        lastUpdated: Date.now(),
      }

      // Guardar la configuración
      const success = saveConfiguration(newConfig)

      if (success) {
        // Refrescar la lista de vinos con la nueva configuración
        refreshWineList()
        setHasChanges(false)
        toast({
          title: "Cambios guardados",
          description: "La configuración de categorías se ha guardado correctamente.",
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
    // Recargar las categorías desde la configuración guardada
    if (savedConfig) {
      const savedCategories = savedConfig.categories
      const savedCepas = savedConfig.cepas

      setCategories(
        categories.map((category) => {
          const savedCategory = savedCategories.find((c) => c.id === category.id)
          return {
            ...category,
            order: savedCategory?.order || category.order,
            cepas: category.cepas.map((cepa) => {
              const savedCepa = savedCepas.find((c) => c.id === cepa.id)
              return {
                ...cepa,
                order: savedCepa?.order || cepa.order,
              }
            }),
          }
        }),
      )
    }

    setHasChanges(false)
    toast({
      title: "Cambios descartados",
      description: "Se han restaurado los valores anteriores.",
      variant: "default",
    })
  }

  if (categories.length === 0) {
    return <div className="p-8 text-center">Cargando categorías...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id} className="border-l-4" style={{ borderLeftColor: "#4a0404" }}>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="font-medium text-lg flex-1">{category.name}</div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`category-order-${category.id}`} className="text-sm">
                    Orden:
                  </Label>
                  <Input
                    id={`category-order-${category.id}`}
                    type="number"
                    value={category.order}
                    onChange={(e) => handleCategoryOrderChange(category.id, e.target.value)}
                    className="w-16 h-8"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveCategory(category.id, "up")}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveCategory(category.id, "down")}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pl-6 space-y-3 mt-4 border-l-2 border-gray-200">
                {category.cepas.map((cepa) => (
                  <div key={cepa.id} className="flex items-center gap-4">
                    <div className="font-medium flex-1">{cepa.name}</div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`cepa-order-${cepa.id}`} className="text-sm">
                        Orden:
                      </Label>
                      <Input
                        id={`cepa-order-${cepa.id}`}
                        type="number"
                        value={cepa.order}
                        onChange={(e) => handleCepaOrderChange(category.id, cepa.id, e.target.value)}
                        className="w-16 h-8"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveCepa(category.id, cepa.id, "up")}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveCepa(category.id, cepa.id, "down")}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
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
