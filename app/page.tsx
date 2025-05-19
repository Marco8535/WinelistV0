"use client"

import { useState } from "react"
import { useWine } from "@/context/wine-context"
import { Header } from "@/components/header"
import { CategoryNavigation } from "@/components/category-navigation"
import { ActionBar } from "@/components/action-bar"
import { WineList } from "@/components/wine-list"
import { WineManagementInterface } from "@/components/admin/wine-management-interface"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { loading, error } = useWine()
  const [isAdminMode, setIsAdminMode] = useState(false)

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando carta de vinos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar la carta</h2>
          <p className="text-red-600">{error}</p>
          <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (isAdminMode) {
    return <WineManagementInterface onBack={toggleAdminMode} />
  }

  return (
    <div className="min-h-screen flex flex-col prevent-overscroll">
      <Header onAdminClick={toggleAdminMode} />
      <CategoryNavigation />
      <ActionBar />
      <WineList />
    </div>
  )
}
