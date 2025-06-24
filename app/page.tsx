"use client"

import { useState, useEffect } from "react"
import { useWine } from "@/context/wine-context"
import { Header } from "@/components/header"
import { CategoryNavigation } from "@/components/category-navigation"
import { ActionBar } from "@/components/action-bar"
import { WineList } from "@/components/wine-list"
import { WineDetail } from "@/components/wine-detail"
import { BookmarkedWinesManager } from "@/components/bookmarked-wines-manager"
import { AdminPanel } from "@/components/admin-panel"
import { Loader2 } from "lucide-react"
import Script from "next/script"

export default function Home() {
  const { loading, error, selectedCategory, restaurant } = useWine()
  const [isAdminMode, setIsAdminMode] = useState(false)

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode)
  }

  // Efecto para manejar la pantalla completa en iOS
  useEffect(() => {
    // Función para manejar el cambio de orientación
    const handleOrientationChange = () => {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.log(`Error attempting to enable full-screen mode: ${err.message}`)
        })
      }
    }

    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

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
    return <AdminPanel onBack={toggleAdminMode} />
  }

  return (
    <>
      <Script src="/register-sw.js" strategy="afterInteractive" />
      <div className="min-h-screen flex flex-col prevent-overscroll">
        <Header 
          onAdminClick={toggleAdminMode} 
          logoUrl={restaurant?.logo_url}
          restaurantName={restaurant?.name}
        />
        <CategoryNavigation />
        <ActionBar />
        {selectedCategory === "favorites" ? (
          <div className="flex-1 overflow-auto prevent-overscroll">
            <div className="max-w-screen-xl mx-auto px-4 py-6">
              <BookmarkedWinesManager />
            </div>
          </div>
        ) : (
          <WineList />
        )}
        <WineDetail />
      </div>
    </>
  )
}
