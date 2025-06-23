"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CategoryManagementTab } from "@/components/admin/category-management-tab"
import { WineManagementTab } from "@/components/admin/wine-management-tab"
import { ConfigStatusIndicator } from "@/components/config-status-indicator"
import { useWine } from "@/context/wine-context"
import { diagnoseWineData } from "@/lib/diagnostic"
// import { storageService } from "@/lib/storage-service" // Removed - now using Supabase

interface WineManagementInterfaceProps {
  onBack: () => void
}

export function WineManagementInterface({ onBack }: WineManagementInterfaceProps) {
  const { wines, categorizedWineData, savedConfig, rawWinesData } = useWine()
  const [activeTab, setActiveTab] = useState("wines") // Cambiamos el tab por defecto a "wines"

  const handleDiagnose = () => {
    // Ejecutar diagnóstico
    diagnoseWineData(wines, wines, categorizedWineData, savedConfig)
    console.log("Diagnóstico completado. Revisa la consola del navegador para más detalles.")
  }

  const handleResetConfig = () => {
    if (
      confirm(
        "ATENCIÓN: Esta función resetea la configuración local. " +
          "La configuración en Supabase no se verá afectada. " +
          "¿Estás seguro de que deseas recargar la página?",
      )
    ) {
      // Clear any local storage except bookmarks
      Object.keys(localStorage).forEach(key => {
        if (key !== 'bookmarkedWines') {
          localStorage.removeItem(key)
        }
      })
      window.location.reload() // Reload page to refresh from Supabase
    }
  }

  // Eliminamos el useEffect que causaba el bucle infinito

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Volver al Panel
          </Button>
          <Button variant="outline" onClick={handleDiagnose}>
            Diagnosticar Datos
          </Button>
          <Button variant="outline" onClick={handleResetConfig} className="text-red-500 hover:bg-red-50 border-red-300">
            Restablecer Configuración
          </Button>
        </div>
        <ConfigStatusIndicator />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Organización de Categorías y Cepas</TabsTrigger>
          <TabsTrigger value="wines">Gestión de Vinos</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoryManagementTab />
        </TabsContent>
        <TabsContent value="wines">
          <WineManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
