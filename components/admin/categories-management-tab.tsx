"use client"

import { useState, useEffect, useMemo } from "react"
import { useWine } from "@/context/wine-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  List, 
  Search, 
  Edit, 
  Save, 
  Plus,
  X, 
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CategoryConfig {
  name: string
  order: number
  visible: boolean
  wineCount: number
}

interface SortConfig {
  field: 'name' | 'price' | 'year' | 'producer' | 'custom'
  direction: 'asc' | 'desc'
  applyToAll: boolean
}

export function CategoriesManagementTab() {
  const { categorizedWineData, rawWinesData, savedConfig, saveConfiguration } = useWine()
  const [categories, setCategories] = useState<CategoryConfig[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'custom',
    direction: 'asc',
    applyToAll: true
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  // Load categories from wine data
  useEffect(() => {
    if (categorizedWineData.length > 0) {
      const categoryConfigs = categorizedWineData.map((category, index) => ({
        name: category.categoryName,
        order: savedConfig?.categories?.find(c => c.name === category.categoryName)?.order ?? index,
        visible: savedConfig?.categories?.find(c => c.name === category.categoryName)?.visible ?? true,
        wineCount: category.wines.length
      }))

      // Sort by order
      categoryConfigs.sort((a, b) => a.order - b.order)
      setCategories(categoryConfigs)
    }
  }, [categorizedWineData, savedConfig])

  // Get all available wine types/styles for new categories
  const availableWineTypes = useMemo(() => {
    const types = new Set<string>()
    rawWinesData.forEach(wine => {
      if (wine.estilo) types.add(wine.estilo)
      if (wine.tipo) types.add(wine.tipo)
    })
    return Array.from(types).sort()
  }, [rawWinesData])

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [categories, searchQuery])

  const updateCategoryOrder = (categoryName: string, newOrder: number) => {
    setCategories(prev => {
      const updated = prev.map(cat => {
        if (cat.name === categoryName) {
          return { ...cat, order: newOrder }
        }
        return cat
      })
      // Re-sort by order
      return updated.sort((a, b) => a.order - b.order)
    })
    setHasUnsavedChanges(true)
  }

  const toggleCategoryVisibility = (categoryName: string) => {
    setCategories(prev => prev.map(cat => 
      cat.name === categoryName 
        ? { ...cat, visible: !cat.visible }
        : cat
    ))
    setHasUnsavedChanges(true)
  }

  const moveCategoryUp = (categoryName: string) => {
    const categoryIndex = categories.findIndex(cat => cat.name === categoryName)
    if (categoryIndex > 0) {
      const newCategories = [...categories]
      // Swap with previous category
      const temp = newCategories[categoryIndex].order
      newCategories[categoryIndex].order = newCategories[categoryIndex - 1].order
      newCategories[categoryIndex - 1].order = temp
      
      setCategories(newCategories.sort((a, b) => a.order - b.order))
      setHasUnsavedChanges(true)
    }
  }

  const moveCategoryDown = (categoryName: string) => {
    const categoryIndex = categories.findIndex(cat => cat.name === categoryName)
    if (categoryIndex < categories.length - 1) {
      const newCategories = [...categories]
      // Swap with next category
      const temp = newCategories[categoryIndex].order
      newCategories[categoryIndex].order = newCategories[categoryIndex + 1].order
      newCategories[categoryIndex + 1].order = temp
      
      setCategories(newCategories.sort((a, b) => a.order - b.order))
      setHasUnsavedChanges(true)
    }
  }

  const saveChanges = () => {
    if (!savedConfig) return

    const updatedConfig = {
      ...savedConfig,
      categories: categories.map(cat => ({
        name: cat.name,
        order: cat.order,
        visible: cat.visible
      }))
    }

    const success = saveConfiguration(updatedConfig)
    if (success) {
      setHasUnsavedChanges(false)
      toast({
        title: "Configuración guardada",
        description: "Los cambios en categorías se han guardado correctamente",
      })
    }
  }

  const resetToOriginal = () => {
    if (categorizedWineData.length > 0) {
      const originalCategories = categorizedWineData.map((category, index) => ({
        name: category.categoryName,
        order: index,
        visible: true,
        wineCount: category.wines.length
      }))
      setCategories(originalCategories)
      setHasUnsavedChanges(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <List className="h-6 w-6 text-blue-600" />
            Gestión de Categorías y Orden
          </h2>
          <p className="text-gray-600">
            Configura el orden y visibilidad de las categorías en tu carta
          </p>
        </div>
        
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Cambios sin guardar
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categorías</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Categorías Visibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.visible).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Categorías Ocultas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => !c.visible).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={resetToOriginal}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restablecer Orden
        </Button>
        
        <Button
          onClick={saveChanges}
          disabled={!hasUnsavedChanges}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      {/* Sorting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración de Ordenamiento de Vinos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort-field">Ordenar vinos por:</Label>
              <Select 
                value={sortConfig.field} 
                onValueChange={(value) => setSortConfig(prev => ({ ...prev, field: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Orden personalizado</SelectItem>
                  <SelectItem value="name">Nombre del vino</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                  <SelectItem value="year">Año de cosecha</SelectItem>
                  <SelectItem value="producer">Productor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort-direction">Dirección:</Label>
              <Select 
                value={sortConfig.direction} 
                onValueChange={(value) => setSortConfig(prev => ({ ...prev, direction: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendente (A-Z, menor a mayor)</SelectItem>
                  <SelectItem value="desc">Descendente (Z-A, mayor a menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="apply-to-all">Aplicar a todas las categorías</Label>
              <p className="text-sm text-gray-500">
                Si está desactivado, cada categoría mantendrá su orden individual
              </p>
            </div>
            <Switch
              id="apply-to-all"
              checked={sortConfig.applyToAll}
              onCheckedChange={(checked) => setSortConfig(prev => ({ ...prev, applyToAll: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Categorías ({filteredCategories.length})</h3>
        
        {filteredCategories.map((category, index) => (
          <Card key={category.name} className={`transition-all ${!category.visible ? 'opacity-60 bg-gray-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveCategoryUp(category.name)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-mono text-gray-500 min-w-[2ch] text-center">
                      {category.order + 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveCategoryDown(category.name)}
                      disabled={index === filteredCategories.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-lg text-gray-900">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {category.wineCount} vino{category.wineCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`visible-${category.name}`} className="text-sm">
                      {category.visible ? 'Visible' : 'Oculta'}
                    </Label>
                    <Switch
                      id={`visible-${category.name}`}
                      checked={category.visible}
                      onCheckedChange={() => toggleCategoryVisibility(category.name)}
                    />
                  </div>
                  
                  {category.visible ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Instrucciones de uso</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Usa las flechas ↑↓ para cambiar el orden de las categorías</li>
            <li>• Activa/desactiva la visibilidad con el switch correspondiente</li>
            <li>• Las categorías ocultas no aparecerán en la carta para los clientes</li>
            <li>• El orden se aplica tanto en la navegación como en la vista general</li>
            <li>• Los cambios se guardan en tu configuración local</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
