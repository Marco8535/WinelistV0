"use client"

import { useWine } from "@/context/wine-context"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useWine()

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar por nombre, bodega, región o uva..."
        className="pl-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  )
}
