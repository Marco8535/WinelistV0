"use client"

import type React from "react"

import { useState } from "react"
import { useWine } from "@/context/wine-context"
import { Search, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function ActionBar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { searchQuery, setSearchQuery } = useWine()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchOpen(false)
  }

  return (
    <div className="border-b border-gray-200 py-2 px-4">
      <div className="max-w-screen-xl mx-auto flex justify-end">
        <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Buscar">
          <Search className="h-5 w-5 text-gray-500" />
        </button>

        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, bodega, región o uva..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={handleSearch}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
