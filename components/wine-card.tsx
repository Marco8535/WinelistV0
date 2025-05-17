import type { Wine } from "@/lib/data"

interface WineCardProps {
  wine: Wine
}

export function WineCard({ wine }: WineCardProps) {
  // Format price as currency
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(wine.Precio_Botella_Restaurante)

  return (
    <div className="wine-card bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:border hover:border-[#E2E8F0]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#212529] mb-1">{wine.Nombre_Vino_Completo}</h3>

          <div className="flex flex-wrap items-baseline gap-x-2 mb-2">
            <span className="text-[#4A5568] font-medium">{wine.Bodega}</span>

            <span className="text-[#4A5568]">{wine.Cosecha}</span>
          </div>

          <p className="text-sm text-[#4A5568] mb-3">{wine.Pais_Region_Origen}</p>
        </div>

        <div className="mt-2 md:mt-0 md:ml-4">
          <span className="text-xl font-semibold text-[#212529]">{formattedPrice}</span>
        </div>
      </div>
    </div>
  )
}
