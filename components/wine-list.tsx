// Archivo: components/wine-list.tsx

"use client"

import { useWine } from "@/context/wine-context"
import { WineItem } from "./wine-item" // Asumo que este componente está listo para mostrar un vino
import { WineDetail } from "./wine-detail" // Asumo que este componente está listo

export function WineList() {
  // Obtenemos categorizedWineData en lugar de filteredWines para la lista principal
  const {
    loading,
    error,
    categorizedWineData, // <--- Usaremos este
    selectedCategory, // Todavía puede ser útil para mensajes o lógica de UI
    searchQuery, // Todavía puede ser útil para mensajes o lógica de UI
    selectedWine,
    filteredWines,
  } = useWine()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg">Cargando selección de vinos...</p> {/* Cambiado a español */}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    )
  }

  // Si hay un vino seleccionado, mostramos el detalle primero
  if (selectedWine) {
    return <WineDetail />
  }

  // Comprobamos si hay datos para mostrar después de la carga y sin errores.
  const noWinesToShow =
    !categorizedWineData ||
    categorizedWineData.length === 0 ||
    categorizedWineData.every((category) => !category.wines || category.wines.length === 0)

  if (noWinesToShow) {
    let message = "No hay vinos disponibles para mostrar según los criterios actuales."
    if (selectedCategory === "favorites") {
      // Esta lógica de mensaje puede mantenerse si 'selectedCategory' aún es relevante
      message = "Aún no has marcado ningún vino como favorito. Toca el ícono de marcador junto a un vino para añadirlo."
    }
    // Podrías añadir un mensaje específico si hay un searchQuery activo y no hay resultados
    // if (searchQuery && noWinesToShow) {
    //   message = `No se encontraron vinos que coincidan con "${searchQuery}".`;
    // }
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-center max-w-md">{message}</p>
      </div>
    )
  }

  // Si no hay vino seleccionado, y tenemos datos categorizados, mostramos la lista por categorías
  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
      {selectedCategory === "all" ? (
        // Para "All Wines", mostrar vinos agrupados por categoría
        categorizedWineData.map(
          (category) =>
            category.wines &&
            category.wines.length > 0 && (
              <div key={category.categoryName} className="mb-8">
                <h2 className="text-xl font-bold mb-3 sticky top-0 bg-background py-2 z-10 border-b">
                  {category.categoryName}
                </h2>
                <ul className="space-y-2">
                  {category.wines.map((wine) => (
                    <WineItem key={wine.id} wine={wine} />
                  ))}
                </ul>
              </div>
            ),
        )
      ) : (
        // Para otras categorías, mostrar lista plana de vinos filtrados
        <ul className="space-y-2">
          {filteredWines.map((wine) => (
            <WineItem key={wine.id} wine={wine} />
          ))}
        </ul>
      )}
    </div>
  )
}
