"use client"

import { useWine } from "@/context/wine-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck } from "lucide-react"

export function WineDetail() {
  const { selectedWine, setSelectedWine, toggleBookmark, isWineBookmarked } = useWine()

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

  if (!selectedWine) return null

  return (
    <Dialog open={!!selectedWine} onOpenChange={(open) => !open && setSelectedWine(null)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="pr-8">{selectedWine.nombre}</DialogTitle>
          <DialogDescription>{selectedWine.productor}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              {selectedWine.region && (
                <div className="text-sm">
                  <span className="font-medium">Región:</span> {selectedWine.region}
                </div>
              )}
              {selectedWine.uva && (
                <div className="text-sm">
                  <span className="font-medium">Uva:</span> {selectedWine.uva}
                </div>
              )}
              {selectedWine.ano && (
                <div className="text-sm">
                  <span className="font-medium">Cosecha:</span> {selectedWine.ano}
                </div>
              )}
              {selectedWine.alcohol && (
                <div className="text-sm">
                  <span className="font-medium">Alcohol:</span> {selectedWine.alcohol}
                </div>
              )}
            </div>
            <div className="text-right">
              {selectedWine.precio && <div className="font-bold text-lg">{formatPrice(selectedWine.precio)}</div>}
              {selectedWine.precioCopa && <div className="text-sm">Copa: {formatPrice(selectedWine.precioCopa)}</div>}
            </div>
          </div>

          {(selectedWine.vista || selectedWine.nariz || selectedWine.boca) && (
            <div className="space-y-2 mt-2">
              <h4 className="font-medium">Notas de Cata</h4>
              {selectedWine.vista && (
                <div className="text-sm">
                  <span className="font-medium">Vista:</span> {selectedWine.vista}
                </div>
              )}
              {selectedWine.nariz && (
                <div className="text-sm">
                  <span className="font-medium">Nariz:</span> {selectedWine.nariz}
                </div>
              )}
              {selectedWine.boca && (
                <div className="text-sm">
                  <span className="font-medium">Boca:</span> {selectedWine.boca}
                </div>
              )}
            </div>
          )}

          {selectedWine.maridaje && (
            <div className="space-y-1 mt-2">
              <h4 className="font-medium">Maridaje</h4>
              <p className="text-sm">{selectedWine.maridaje}</p>
            </div>
          )}

          {selectedWine.otros && (
            <div className="space-y-1 mt-2">
              <h4 className="font-medium">Información Adicional</h4>
              <p className="text-sm">{selectedWine.otros}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleBookmark(selectedWine.id)}
            aria-label={isWineBookmarked(selectedWine.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {isWineBookmarked(selectedWine.id) ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
          <Button variant="default" onClick={() => setSelectedWine(null)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
