"use client"

import { useState, useEffect, useMemo } from "react"
import { useWine } from "@/context/wine-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Star, 
  Search, 
  Edit, 
  Save, 
  X, 
  Upload, 
  ExternalLink,
  Crown,
  DollarSign
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Wine } from "@/types/wine"

interface PremiumWineryData {
  wineryName: string
  isPremium: boolean
  content?: {
    text?: string
    imageUrl?: string
    websiteUrl?: string
  }
  expirationDate?: string
  wines: Wine[]
}

export function PremiumWineriesTab() {
  const { rawWinesData } = useWine()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWinery, setSelectedWinery] = useState<PremiumWineryData | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [premiumWineries, setPremiumWineries] = useState<Record<string, PremiumWineryData>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load premium wineries data on component mount
  useEffect(() => {
    loadPremiumWineries()
  }, [])

  // Group wines by winery/producer
  const wineriesData = useMemo(() => {
    const wineryMap: Record<string, Wine[]> = {}
    
    rawWinesData.forEach(wine => {
      const winery = wine.productor || "Sin Productor"
      if (!wineryMap[winery]) {
        wineryMap[winery] = []
      }
      wineryMap[winery].push(wine)
    })

    return Object.entries(wineryMap).map(([wineryName, wines]) => ({
      wineryName,
      wines,
      isPremium: premiumWineries[wineryName]?.isPremium || false,
      content: premiumWineries[wineryName]?.content,
      expirationDate: premiumWineries[wineryName]?.expirationDate
    }))
  }, [rawWinesData, premiumWineries])

  // Filter wineries based on search
  const filteredWineries = useMemo(() => {
    if (!searchQuery) return wineriesData
    
    return wineriesData.filter(winery =>
      winery.wineryName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [wineriesData, searchQuery])

  const loadPremiumWineries = () => {
    try {
      const saved = localStorage.getItem("premium-wineries")
      if (saved) {
        const data = JSON.parse(saved)
        setPremiumWineries(data)
      }
    } catch (error) {
      console.error("Error loading premium wineries:", error)
    }
  }

  const savePremiumWineries = () => {
    try {
      localStorage.setItem("premium-wineries", JSON.stringify(premiumWineries))
      
      // Also update the wines data with premium information
      const updatedWines = rawWinesData.map(wine => {
        const wineryData = premiumWineries[wine.productor]
        if (wineryData?.isPremium) {
          return {
            ...wine,
            isPremiumWinery: true,
            premiumContent: wineryData.content
          }
        }
        return {
          ...wine,
          isPremiumWinery: false,
          premiumContent: undefined
        }
      })

      // Store updated wines data
      localStorage.setItem("wines-with-premium-data", JSON.stringify(updatedWines))
      
      setHasUnsavedChanges(false)
      toast({
        title: "Configuración guardada",
        description: "Los cambios en bodegas premium se han guardado correctamente",
      })
    } catch (error) {
      console.error("Error saving premium wineries:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      })
    }
  }

  const toggleWineryPremium = (wineryName: string, isPremium: boolean) => {
    setPremiumWineries(prev => ({
      ...prev,
      [wineryName]: {
        ...prev[wineryName],
        wineryName,
        isPremium,
        wines: wineriesData.find(w => w.wineryName === wineryName)?.wines || [],
        content: prev[wineryName]?.content || {},
        expirationDate: prev[wineryName]?.expirationDate
      }
    }))
    setHasUnsavedChanges(true)
  }

  const updateWineryContent = (wineryName: string, content: PremiumWineryData['content']) => {
    setPremiumWineries(prev => ({
      ...prev,
      [wineryName]: {
        ...prev[wineryName],
        wineryName,
        isPremium: prev[wineryName]?.isPremium || false,
        content,
        wines: wineriesData.find(w => w.wineryName === wineryName)?.wines || [],
        expirationDate: prev[wineryName]?.expirationDate
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleEditWinery = (winery: PremiumWineryData) => {
    setSelectedWinery(winery)
    setShowEditDialog(true)
  }

  const handleSaveWineryContent = (content: PremiumWineryData['content']) => {
    if (selectedWinery) {
      updateWineryContent(selectedWinery.wineryName, content)
      setShowEditDialog(false)
      setSelectedWinery(null)
    }
  }

  const premiumCount = Object.values(premiumWineries).filter(w => w.isPremium).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            Gestión de Auspiciantes
          </h2>
          <p className="text-gray-600">
            Configura qué bodegas tienen acceso a espacio publicitario en las fichas de sus vinos
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
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Bodegas Premium</p>
                <p className="text-2xl font-bold text-gray-900">{premiumCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bodegas</p>
                <p className="text-2xl font-bold text-gray-900">{wineriesData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vinos con Premium</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wineriesData.filter(w => w.isPremium).reduce((acc, w) => acc + w.wines.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar bodega..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          onClick={savePremiumWineries}
          disabled={!hasUnsavedChanges}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      {/* Wineries List */}
      <div className="space-y-4">
        {filteredWineries.map((winery) => (
          <Card key={winery.wineryName} className={`transition-all ${winery.isPremium ? 'ring-2 ring-yellow-200 bg-yellow-50/30' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-lg text-gray-900">
                      {winery.wineryName}
                    </h3>
                    {winery.isPremium && (
                      <Crown className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {winery.wines.length} vino{winery.wines.length !== 1 ? 's' : ''} en la carta
                  </p>
                  
                  {winery.isPremium && winery.content && (
                    <div className="text-xs text-gray-500">
                      {winery.content.text && "✓ Texto personalizado"}
                      {winery.content.imageUrl && " • ✓ Imagen"}
                      {winery.content.websiteUrl && " • ✓ Sitio web"}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {winery.isPremium && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditWinery(winery)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar Contenido
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`premium-${winery.wineryName}`} className="text-sm">
                      Premium
                    </Label>
                    <Switch
                      id={`premium-${winery.wineryName}`}
                      checked={winery.isPremium}
                      onCheckedChange={(checked) => toggleWineryPremium(winery.wineryName, checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Content Dialog */}
      <PremiumContentDialog
        winery={selectedWinery}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveWineryContent}
      />
    </div>
  )
}

// Separate component for the content editing dialog
function PremiumContentDialog({
  winery,
  open,
  onOpenChange,
  onSave
}: {
  winery: PremiumWineryData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (content: PremiumWineryData['content']) => void
}) {
  const [content, setContent] = useState({
    text: "",
    imageUrl: "",
    websiteUrl: ""
  })

  useEffect(() => {
    if (winery?.content) {
      setContent({
        text: winery.content.text || "",
        imageUrl: winery.content.imageUrl || "",
        websiteUrl: winery.content.websiteUrl || ""
      })
    }
  }, [winery])

  const handleSave = () => {
    onSave(content)
    toast({
      title: "Contenido actualizado",
      description: `El contenido premium para ${winery?.wineryName} se ha actualizado`,
    })
  }

  if (!winery) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Contenido Premium - {winery.wineryName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="premium-text">Texto Promocional</Label>
            <Textarea
              id="premium-text"
              placeholder="Describe la bodega, su historia, características especiales..."
              value={content.text}
              onChange={(e) => setContent(prev => ({ ...prev, text: e.target.value }))}
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Este texto aparecerá en las fichas de todos los vinos de esta bodega
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="premium-image">URL de Imagen</Label>
            <Input
              id="premium-image"
              type="url"
              placeholder="https://ejemplo.com/imagen-bodega.jpg"
              value={content.imageUrl}
              onChange={(e) => setContent(prev => ({ ...prev, imageUrl: e.target.value }))}
            />
            <p className="text-xs text-gray-500">
              URL de una imagen representativa de la bodega (logo, viñedo, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="premium-website">Sitio Web</Label>
            <Input
              id="premium-website"
              type="url"
              placeholder="https://www.bodega.com"
              value={content.websiteUrl}
              onChange={(e) => setContent(prev => ({ ...prev, websiteUrl: e.target.value }))}
            />
            <p className="text-xs text-gray-500">
              Sitio web oficial de la bodega
            </p>
          </div>

          {/* Preview */}
          {(content.text || content.imageUrl || content.websiteUrl) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Vista Previa</h4>
              <div className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
                {content.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={content.imageUrl} 
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                {content.text && (
                  <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                    {content.text}
                  </p>
                )}
                
                {content.websiteUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visitar Sitio Web
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-yellow-600 hover:bg-yellow-700">
            <Save className="h-4 w-4 mr-2" />
            Guardar Contenido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
