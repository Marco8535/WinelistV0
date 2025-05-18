"use client"

import { useWine } from "@/context/wine-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bookmark, WineOff, Wine } from "lucide-react"

export function CategoryTabs() {
  const { categorizedWineData, selectedCategory, setSelectedCategory, hasBookmarkedWines } = useWine()

  // Crear un ID seguro para usar en el DOM
  const createSafeId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-")
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mb-2">Categorías</h2>
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full" orientation="vertical">
        <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
          <TabsTrigger value="all" className="justify-start">
            <Wine className="h-4 w-4 mr-2" />
            Todos los Vinos
          </TabsTrigger>

          {hasBookmarkedWines && (
            <TabsTrigger value="favorites" className="justify-start">
              <Bookmark className="h-4 w-4 mr-2" />
              Mis Favoritos
            </TabsTrigger>
          )}

          <TabsTrigger value="glass" className="justify-start">
            <WineOff className="h-4 w-4 mr-2" />
            Por Copa
          </TabsTrigger>

          {categorizedWineData.map((category) => (
            <TabsTrigger
              key={category.categoryName}
              value={createSafeId(category.categoryName)}
              className="justify-start"
            >
              {category.categoryName}
              <span className="ml-2 text-xs text-muted-foreground">({category.wines.length})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
