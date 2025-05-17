import type { Wine } from "@/types/wine"

interface WineCardProps {
  wine: Wine
}

export function WineCard({ wine }: WineCardProps) {
  return (
    <div className="wine-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:border hover:border-[#E2E8F0] dark:hover:border-gray-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#212529] dark:text-white mb-1">{wine.nombre}</h3>

          <div className="flex flex-wrap items-baseline gap-x-2 mb-2">
            <span className="text-[#4A5568] dark:text-gray-300 font-medium">{wine.productor}</span>

            <span className="text-[#4A5568] dark:text-gray-300">{wine.ano}</span>
          </div>

          <p className="text-sm text-[#4A5568] dark:text-gray-400 mb-3">
            {wine.region}
            {wine.region && wine.pais && ", "}
            {wine.pais}
          </p>
        </div>

        <div className="mt-2 md:mt-0 md:ml-4">
          <span className="text-xl font-semibold text-[#212529] dark:text-white">{wine.precio}</span>
        </div>
      </div>
    </div>
  )
}
