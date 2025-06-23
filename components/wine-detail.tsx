"use client"

import { useWine } from "@/context/wine-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  Bookmark, 
  BookmarkCheck, 
  PhoneCall, 
  ExternalLink, 
  Wine,
  MapPin,
  Calendar,
  User,
  Mountain,
  Info,
  DollarSign
} from "lucide-react"

export function WineDetail() {
  const { selectedWine, setSelectedWine, toggleBookmark, isWineBookmarked } = useWine()

  // Load sommelier config from localStorage (simplified)
  const getSommelierConfig = () => {
    try {
      const savedConfig = localStorage.getItem("app-config")
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        return {
          enabled: config.sommelierEnabled !== false,
          phone: config.sommelierPhone || "+1234567890"
        }
      }
    } catch (error) {
      console.error("Error loading app config:", error)
    }
    return { enabled: true, phone: "+1234567890" }
  }

  const sommelierConfig = getSommelierConfig()

  // Improved function to format prices correctly
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "-"
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return `$${Math.floor(numericPrice)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  // Format glass prices
  const formatGlassPrice = (priceString: string | undefined) => {
    if (!priceString) return null
    const numericPrice = Number.parseFloat(priceString)
    if (isNaN(numericPrice)) return null
    return formatPrice(numericPrice)
  }

  // Handle sommelier call
  const handleSommelierCall = () => {
    if (sommelierConfig.phone) {
      window.open(`tel:${sommelierConfig.phone}`, '_self')
    }
  }

  if (!selectedWine) return null

  return (
    <Dialog open={!!selectedWine} onOpenChange={(open) => !open && setSelectedWine(null)}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {selectedWine.nombre}
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600 mb-2">
                {selectedWine.productor}
              </DialogDescription>
              
              {/* Simple badges using spans */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedWine.tipo && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {selectedWine.tipo}
                  </span>
                )}
                {selectedWine.estilo && (
                  <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {selectedWine.estilo}
                  </span>
                )}
                {selectedWine.caracteristica && (
                  <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {selectedWine.caracteristica}
                  </span>
                )}
              </div>
            </div>

            {/* Price section */}
            <div className="text-right flex-shrink-0">
              {selectedWine.precio && (
                <div className="font-bold text-2xl text-gray-900 mb-1">
                  {formatPrice(selectedWine.precio)}
                </div>
              )}
              {selectedWine.precioUSD && (
                <div className="text-sm text-gray-600 mb-2">
                  USD {selectedWine.precioUSD}
                </div>
              )}
              
              {/* Glass prices */}
              <div className="space-y-1">
                {selectedWine.precioCopa && (
                  <div className="text-sm text-gray-600">
                    Copa: {formatPrice(selectedWine.precioCopa)}
                  </div>
                )}
                {formatGlassPrice(selectedWine.precioCopaR1) && (
                  <div className="text-xs text-gray-500">
                    R1: {formatGlassPrice(selectedWine.precioCopaR1)}
                  </div>
                )}
                {formatGlassPrice(selectedWine.precioCopaR2) && (
                  <div className="text-xs text-gray-500">
                    R2: {formatGlassPrice(selectedWine.precioCopaR2)}
                  </div>
                )}
                {formatGlassPrice(selectedWine.precioCopaR3) && (
                  <div className="text-xs text-gray-500">
                    R3: {formatGlassPrice(selectedWine.precioCopaR3)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Wine Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {selectedWine.region && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Región:</span>
                  <span>{selectedWine.region}</span>
                </div>
              )}
              
              {selectedWine.pais && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">País:</span>
                  <span>{selectedWine.pais}</span>
                </div>
              )}

              {selectedWine.uva && (
                <div className="flex items-center gap-2 text-sm">
                  <Wine className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Uva:</span>
                  <span>{selectedWine.uva}</span>
                </div>
              )}

              {selectedWine.ano && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Cosecha:</span>
                  <span>{selectedWine.ano}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {selectedWine.alcohol && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Alcohol:</span>
                  <span>{selectedWine.alcohol}</span>
                </div>
              )}

              {selectedWine.enologo && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Enólogo:</span>
                  <span>{selectedWine.enologo}</span>
                </div>
              )}

              {selectedWine.altitud && (
                <div className="flex items-center gap-2 text-sm">
                  <Mountain className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Altitud:</span>
                  <span>{selectedWine.altitud}</span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Tasting Notes */}
          {(selectedWine.vista || selectedWine.nariz || selectedWine.boca) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Wine className="h-5 w-5 text-red-600" />
                Notas de Cata
              </h3>
              
              <div className="space-y-3">
                {selectedWine.vista && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-sm text-gray-700">Vista:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedWine.vista}</p>
                  </div>
                )}
                
                {selectedWine.nariz && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-sm text-gray-700">Nariz:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedWine.nariz}</p>
                  </div>
                )}
                
                {selectedWine.boca && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-sm text-gray-700">Boca:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedWine.boca}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Food Pairing */}
          {selectedWine.maridaje && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Maridaje</h3>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-gray-700">{selectedWine.maridaje}</p>
              </div>
            </div>
          )}

          {/* Additional Information */}
          {selectedWine.otros && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Información Adicional
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-700">{selectedWine.otros}</p>
              </div>
            </div>
          )}

          {/* Premium Winery Content */}
          {selectedWine.isPremiumWinery && selectedWine.premiumContent && (
            <>
              <hr className="border-gray-200" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Contenido Destacado de la Bodega
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-300">
                    Patrocinado
                  </span>
                </div>
                
                <div className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
                  {selectedWine.premiumContent.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={selectedWine.premiumContent.imageUrl} 
                        alt="Contenido de la bodega"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {selectedWine.premiumContent.text && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {selectedWine.premiumContent.text}
                    </p>
                  )}
                  
                  {selectedWine.premiumContent.websiteUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(selectedWine.premiumContent!.websiteUrl, '_blank')}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visitar Sitio Web
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
          <div className="flex gap-2">
            {/* Bookmark Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleBookmark(selectedWine.id)}
              className="flex items-center gap-2"
            >
              {isWineBookmarked(selectedWine.id) ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-red-600" />
                  <span className="hidden sm:inline">Guardado</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  <span className="hidden sm:inline">Guardar</span>
                </>
              )}
            </Button>

            {/* Sommelier Button */}
            {sommelierConfig.enabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSommelierCall}
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
              >
                <PhoneCall className="h-4 w-4" />
                <span className="hidden sm:inline">Concierge</span>
                <span className="sm:hidden">Concierge</span>
              </Button>
            )}
          </div>

          <Button 
            variant="default" 
            onClick={() => setSelectedWine(null)}
            className="bg-red-600 hover:bg-red-700"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
