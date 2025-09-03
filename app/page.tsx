"use client"

import { useWine } from "@/context/wine-context"
import { useRestaurant } from "@/components/restaurant-provider"
import { Header } from "@/components/header"
import { CategoryNavigation } from "@/components/category-navigation"
import { WineList } from "@/components/wine-list"
import { WineDetail } from "@/components/wine-detail"
import { SearchBar } from "@/components/search-bar"
import { WineFilters } from "@/components/wine-filters"
import { ActionBar } from "@/components/action-bar"
import { AdminPanel } from "@/components/admin-panel"
import { WelcomePage } from "@/components/welcome-page"
import { ConfigStatusIndicator } from "@/components/config-status-indicator"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

export default function HomePage() {
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant()
  const wineContext = useWine()
  const { wines, categories, selectedWine, loading: winesLoading, error: winesError, isConfigured } = wineContext

  // Si hay error del restaurante, mostrar error
  if (restaurantError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Error de Configuración</h2>
              <p className="text-sm text-muted-foreground mb-4">{restaurantError}</p>
              <p className="text-xs text-muted-foreground">Contacta al administrador del sistema.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si está cargando el restaurante, mostrar loading
  if (restaurantLoading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  // Si hay error de vinos, mostrar error
  if (winesError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Error cargando datos</h2>
              <p className="text-sm text-muted-foreground mb-4">{winesError}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si está cargando los vinos, mostrar loading
  if (winesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando carta de vinos...</p>
        </div>
      </div>
    )
  }

  // Si no está configurado, mostrar página de bienvenida
  if (!isConfigured) {
    return <WelcomePage />
  }

  // Mostrar la aplicación principal
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ConfigStatusIndicator />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <SearchBar />
            <CategoryNavigation categories={categories} />
            <WineFilters />
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <ActionBar />
            <WineList wines={wines} />
          </div>
        </div>
      </main>

      {/* Wine Detail Modal */}
      {selectedWine && <WineDetail wine={selectedWine} />}

      {/* Admin Panel */}
      <AdminPanel />
    </div>
  )
}
