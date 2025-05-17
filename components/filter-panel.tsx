"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useWine } from "@/context/wine-context"
import type { WineFilter } from "@/types/wine"

interface FilterPanelProps {
  onClose: () => void
}

export function FilterPanel({ onClose }: FilterPanelProps) {
  const { wines, filters, setFilters } = useWine()
  const [localFilters, setLocalFilters] = useState<WineFilter>(filters)

  // Extract unique values for filter options
  const regions = Array.from(new Set(wines.map((wine) => wine.region).filter(Boolean) as string[]))

  const grapes = Array.from(new Set(wines.map((wine) => wine.uva).filter(Boolean) as string[]))

  const styles = Array.from(new Set(wines.map((wine) => wine.estilo).filter(Boolean) as string[]))

  const types = Array.from(new Set(wines.map((wine) => wine.tipo).filter(Boolean) as string[]))

  // Handle checkbox changes
  const handleFilterChange = (filterType: keyof WineFilter, value: string, checked: boolean) => {
    setLocalFilters((prev) => {
      const currentValues = prev[filterType] || []
      const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value)

      return {
        ...prev,
        [filterType]: newValues,
      }
    })
  }

  // Apply filters
  const applyFilters = () => {
    setFilters(localFilters)
    onClose()
  }

  // Reset filters
  const resetFilters = () => {
    setLocalFilters({})
    setFilters({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-white p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Filter Wines</h2>
        <button onClick={onClose} className="p-2 e-ink-button">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Region Filter */}
        {regions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Region</h3>
            <div className="space-y-2">
              {regions.map((region) => (
                <label key={region} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(localFilters.region || []).includes(region)}
                    onChange={(e) => handleFilterChange("region", region, e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span>{region}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Grape Filter */}
        {grapes.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Grape (Uva)</h3>
            <div className="space-y-2">
              {grapes.map((grape) => (
                <label key={grape} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(localFilters.grape || []).includes(grape)}
                    onChange={(e) => handleFilterChange("grape", grape, e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span>{grape}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Style Filter */}
        {styles.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Style (Estilo)</h3>
            <div className="space-y-2">
              {styles.map((style) => (
                <label key={style} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(localFilters.style || []).includes(style)}
                    onChange={(e) => handleFilterChange("style", style, e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span>{style}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Type Filter */}
        {types.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Type (Tipo)</h3>
            <div className="space-y-2">
              {types.map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(localFilters.type || []).includes(type)}
                    onChange={(e) => handleFilterChange("type", type, e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button onClick={applyFilters} className="flex-1 py-3 bg-[#4A0404] text-white rounded-md e-ink-button">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="flex-1 py-3 border border-gray-300 rounded-md e-ink-button">
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}
