"use client"

import { useState } from "react"
import { useWine } from "@/context/wine-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { WineFilter } from "@/types/wine"

export function WineFilters() {
  const { wines, filters, setFilters } = useWine()
  const [expanded, setExpanded] = useState<string[]>(["region"])

  // Extraer valores únicos para los filtros
  const regions = Array.from(new Set(wines.map((wine) => wine.region).filter(Boolean) as string[]))
  const grapes = Array.from(new Set(wines.map((wine) => wine.uva).filter(Boolean) as string[]))
  const styles = Array.from(new Set(wines.map((wine) => wine.estilo).filter(Boolean) as string[]))
  const types = Array.from(new Set(wines.map((wine) => wine.tipo).filter(Boolean) as string[]))

  // Función para actualizar filtros
  const updateFilter = (filterType: keyof WineFilter, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [filterType]: newValues,
      }
    })
  }

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setFilters({})
  }

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(filters).some((values) => values && values.length > 0)

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filtros</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <Accordion type="multiple" value={expanded} onValueChange={setExpanded} className="w-full">
        <AccordionItem value="region">
          <AccordionTrigger>Región</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {regions.sort().map((region) => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={(filters.region || []).includes(region)}
                    onCheckedChange={() => updateFilter("region", region)}
                  />
                  <Label htmlFor={`region-${region}`} className="text-sm cursor-pointer">
                    {region}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="grape">
          <AccordionTrigger>Uva</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {grapes.sort().map((grape) => (
                <div key={grape} className="flex items-center space-x-2">
                  <Checkbox
                    id={`grape-${grape}`}
                    checked={(filters.grape || []).includes(grape)}
                    onCheckedChange={() => updateFilter("grape", grape)}
                  />
                  <Label htmlFor={`grape-${grape}`} className="text-sm cursor-pointer">
                    {grape}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style">
          <AccordionTrigger>Estilo</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {styles.sort().map((style) => (
                <div key={style} className="flex items-center space-x-2">
                  <Checkbox
                    id={`style-${style}`}
                    checked={(filters.style || []).includes(style)}
                    onCheckedChange={() => updateFilter("style", style)}
                  />
                  <Label htmlFor={`style-${style}`} className="text-sm cursor-pointer">
                    {style}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger>Tipo</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {types.sort().map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={(filters.type || []).includes(type)}
                    onCheckedChange={() => updateFilter("type", type)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
