// Archivo: components/wine-list.tsx

"use client"

import { useWine } from "@/context/wine-context"
import { WineItem } from "./wine-item" // Asumo que este componente está listo para mostrar un vino
import { WineDetail } from "./wine-detail" // Asumo que este componente está listo

export function WineList() {
  const {
    loading,
    error,
    categorizedWineData, // Usaremos esto para la vista "all"
    selectedCategory, // Para decidir qué mostrar y para mensajes
    searchQuery, // Para mensajes
    selectedWine,
    filteredWines, // Usaremos esto para cuando selectedCategory NO es "all"
  } = useWine()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg">Cargando selección de vinos...</p>
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

  // Lógica para determinar si mostrar un mensaje de "no hay vinos"
  let showNoWinesMessage = false
  let noWinesMessageText = "No hay vinos disponibles para mostrar según los criterios actuales."

  if (selectedCategory === "all") {
    const noCategorizedWines =
      !categorizedWineData ||
      categorizedWineData.length === 0 ||
      categorizedWineData.every((category) => !category.wines || category.wines.length === 0)
    if (noCategorizedWines) {
      showNoWinesMessage = true
      // Mensaje específico si la búsqueda no arrojó resultados en la vista "all"
      if (searchQuery) {
        // Nota: searchQuery actualmente no filtra categorizedWineData directamente aquí
        noWinesMessageText = `No se encontraron vinos que coincidan con "${searchQuery}" en la vista general.`
      }
    }
  } else if (selectedCategory === "favorites") {
    // filteredWines ya debería estar filtrado por favoritos en el contexto si es necesario,
    // o esta lógica de mensaje podría necesitar basarse en `bookmarkedWines.size` directamente.
    // Asumiendo que filteredWines se actualiza correctamente para "favoritos":
    if (filteredWines.length === 0) {
      showNoWinesMessage = true
      noWinesMessageText = "Aún no has marcado ningún vino como favorito."
    }
  } else {
    // Para otras categorías específicas que usan filteredWines
    if (filteredWines.length === 0) {
      showNoWinesMessage = true
      if (searchQuery) {
        noWinesMessageText = `No se encontraron vinos que coincidan con "${searchQuery}" en la categoría "${selectedCategory}".`
      } else {
        noWinesMessageText = `No hay vinos disponibles en la categoría "${selectedCategory}".`
      }
    }
  }

  if (showNoWinesMessage) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-center max-w-md">{noWinesMessageText}</p>
      </div>
    )
  }

  // Renderizado principal
  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
      {selectedCategory === "all" ? (
        // VISTA "ALL WINES": Mostrar vinos agrupados por categorías
        categorizedWineData.map((category) =>
          category.wines && category.wines.length > 0 ? (
            <div key={category.categoryName} className="mb-8">
              <h2 className="text-xl font-bold mb-3 sticky top-0 bg-[#F8F8F8] py-2 z-10 border-b">
                {category.categoryName}
              </h2>
              <ul className="space-y-2">
                {category.wines.map((wine) => (
                  <WineItem key={`${category.categoryName}-${wine.id}`} wine={wine} />
                ))}
              </ul>
            </div>
          ) : null,
        )
      ) : (
        // VISTA PARA OTRAS CATEGORÍAS: Lista plana de vinos filtrados
        <ul className="space-y-2">
          {filteredWines.map((wine) => (
            <WineItem key={wine.id} wine={wine} />
          ))}
        </ul>
      )}
    </div>
  )
}
