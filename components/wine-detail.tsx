"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Bookmark } from "lucide-react"
import { useWine } from "@/context/wine-context"

export function WineDetail() {
  const { selectedWine, setSelectedWine, toggleBookmark, isWineBookmarked } = useWine()
  const [bookmarked, setBookmarked] = useState(selectedWine ? isWineBookmarked(selectedWine.id) : false)
  const [animateBookmark, setAnimateBookmark] = useState(false)

  useEffect(() => {
    if (selectedWine) {
      setBookmarked(isWineBookmarked(selectedWine.id))
    }
  }, [selectedWine, isWineBookmarked])

  if (!selectedWine) return null

  const handleBookmarkClick = () => {
    toggleBookmark(selectedWine.id)
    setAnimateBookmark(true)

    // Reset animation after it completes
    setTimeout(() => {
      setAnimateBookmark(false)
    }, 300)
  }

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedWine(null)}
            className="p-2 rounded-full border border-gray-300 e-ink-button"
            aria-label="Back to wine list"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            onClick={handleBookmarkClick}
            className={`p-2 rounded-full border border-gray-300 e-ink-button ${animateBookmark ? "bookmark-animation" : ""}`}
            aria-label={bookmarked ? "Remove from favorites" : "Add to favorites"}
          >
            <Bookmark size={20} className={bookmarked ? "fill-[#4A0404] text-[#4A0404]" : ""} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Wine name and basic info */}
          <div>
            <h1 className="text-2xl font-bold">{selectedWine.nombre}</h1>
            <p className="text-lg">{selectedWine.productor}</p>

            <div className="flex flex-wrap gap-x-2 mt-2 text-sm text-gray-600">
              {selectedWine.region && <span>{selectedWine.region}</span>}
              {selectedWine.region && selectedWine.pais && <span>•</span>}
              {selectedWine.pais && <span>{selectedWine.pais}</span>}
              {(selectedWine.region || selectedWine.pais) && selectedWine.ano && <span>•</span>}
              {selectedWine.ano && <span>{selectedWine.ano}</span>}
            </div>
          </div>

          {/* Wine details */}
          <div className="grid grid-cols-2 gap-4">
            {selectedWine.uva && (
              <div>
                <h3 className="font-medium text-sm text-gray-600">Grape</h3>
                <p>{selectedWine.uva}</p>
              </div>
            )}

            {selectedWine.alcohol && (
              <div>
                <h3 className="font-medium text-sm text-gray-600">Alcohol</h3>
                <p>{selectedWine.alcohol}</p>
              </div>
            )}

            {selectedWine.enologo && (
              <div>
                <h3 className="font-medium text-sm text-gray-600">Winemaker</h3>
                <p>{selectedWine.enologo}</p>
              </div>
            )}

            {selectedWine.tipo && (
              <div>
                <h3 className="font-medium text-sm text-gray-600">Type</h3>
                <p>{selectedWine.tipo}</p>
              </div>
            )}

            {selectedWine.estilo && (
              <div>
                <h3 className="font-medium text-sm text-gray-600">Style</h3>
                <p>{selectedWine.estilo}</p>
              </div>
            )}

            {selectedWine.altitud && (
              <div>
                <h3 className="font-medium text-sm text-gray-600">Altitude</h3>
                <p>{selectedWine.altitud}</p>
              </div>
            )}
          </div>

          {/* Prices */}
          <div className="border-t border-b border-gray-200 py-4">
            <h3 className="font-medium mb-2">Prices</h3>
            <div className="space-y-2">
              {selectedWine.precio && (
                <div className="flex justify-between">
                  <span>Bottle</span>
                  <span className="font-medium">{selectedWine.precio}</span>
                </div>
              )}

              {selectedWine.precioUSD && (
                <div className="flex justify-between">
                  <span>Price USD</span>
                  <span>{selectedWine.precioUSD}</span>
                </div>
              )}

              {selectedWine.precioCopaR1 && (
                <div className="flex justify-between">
                  <span>Glass R1</span>
                  <span>{selectedWine.precioCopaR1}</span>
                </div>
              )}

              {selectedWine.precioCopaR2 && (
                <div className="flex justify-between">
                  <span>Glass R2</span>
                  <span>{selectedWine.precioCopaR2}</span>
                </div>
              )}

              {selectedWine.precioCopaR3 && (
                <div className="flex justify-between">
                  <span>Glass R3</span>
                  <span>{selectedWine.precioCopaR3}</span>
                </div>
              )}

              {selectedWine.precioCopa &&
                !selectedWine.precioCopaR1 &&
                !selectedWine.precioCopaR2 &&
                !selectedWine.precioCopaR3 && (
                  <div className="flex justify-between">
                    <span>Glass</span>
                    <span>{selectedWine.precioCopa}</span>
                  </div>
                )}
            </div>
          </div>

          {/* Tasting notes */}
          {(selectedWine.vista || selectedWine.nariz || selectedWine.boca) && (
            <div>
              <h3 className="font-medium mb-2">Tasting Notes</h3>
              <div className="space-y-2">
                {selectedWine.vista && (
                  <div>
                    <h4 className="text-sm font-medium">Vista:</h4>
                    <p className="text-gray-800">{selectedWine.vista}</p>
                  </div>
                )}
                {selectedWine.nariz && (
                  <div>
                    <h4 className="text-sm font-medium">Nariz:</h4>
                    <p className="text-gray-800">{selectedWine.nariz}</p>
                  </div>
                )}
                {selectedWine.boca && (
                  <div>
                    <h4 className="text-sm font-medium">Boca:</h4>
                    <p className="text-gray-800">{selectedWine.boca}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Food pairing */}
          {selectedWine.maridaje && (
            <div>
              <h3 className="font-medium mb-2">Recommended Pairing</h3>
              <p className="text-gray-800">{selectedWine.maridaje}</p>
            </div>
          )}

          {/* Other information */}
          {selectedWine.otros && (
            <div>
              <h3 className="font-medium mb-2">Additional Information</h3>
              <p className="text-gray-800">{selectedWine.otros}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
