import type { Wine } from "@/lib/data"
import { WineCard } from "./wine-card"

interface WineListProps {
  wines: Wine[]
}

export function WineList({ wines }: WineListProps) {
  // Group wines by category
  const groupedWines = wines.reduce(
    (acc, wine) => {
      // Use Categoria_Sommelier if available, otherwise use Tipo_Vino
      const category = wine.Categoria_Sommelier || wine.Tipo_Vino

      if (!acc[category]) {
        acc[category] = []
      }

      acc[category].push(wine)
      return acc
    },
    {} as Record<string, Wine[]>,
  )

  // Sort wines within each category by Orden_Visualizacion_Restaurante
  Object.keys(groupedWines).forEach((category) => {
    groupedWines[category].sort((a, b) => a.Orden_Visualizacion_Restaurante - b.Orden_Visualizacion_Restaurante)
  })

  return (
    <div className="space-y-12">
      {Object.entries(groupedWines).map(([category, categoryWines]) => (
        <section key={category} className="wine-section">
          <h2 className="text-2xl font-serif font-medium text-[#003366] mb-6 pb-2 border-b border-[#E2E8F0]">
            {category}
          </h2>

          <div className="space-y-6">
            {categoryWines.map((wine) => (
              <WineCard key={wine.SKU_LAZZY} wine={wine} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
