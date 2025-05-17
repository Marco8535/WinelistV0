"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { useWine } from "@/context/wine-context"
import { FilterPanel } from "./filter-panel"

export function ActionBar() {
  const { searchQuery, setSearchQuery } = useWine()
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (showFilter) setShowFilter(false)
    if (!showSearch) setSearchQuery("")
  }

  const toggleFilter = () => {
    setShowFilter(!showFilter)
    if (showSearch) setShowSearch(false)
  }

  return (
    <div className="px-4 py-2">
      <div className="flex justify-end space-x-2">
        <button
          onClick={toggleSearch}
          className="p-2 rounded-full border border-gray-300 e-ink-button"
          aria-label="Search wines"
        >
          <Search size={20} />
        </button>
        <button
          onClick={toggleFilter}
          className="p-2 rounded-full border border-gray-300 e-ink-button"
          aria-label="Filter wines"
        >
          <Filter size={20} />
        </button>
      </div>

      {showSearch && (
        <div className="mt-2 p-2 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wines..."
              className="flex-1 p-2 bg-transparent outline-none"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchQuery("")
                setShowSearch(false)
              }}
              className="p-1 e-ink-button"
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {showFilter && <FilterPanel onClose={() => setShowFilter(false)} />}
    </div>
  )
}
