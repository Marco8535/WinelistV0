"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WineManagementInterface } from "@/components/admin/wine-management-interface"
import { AppConfigTab } from "@/components/admin/app-config-tab"
import { PremiumWineriesTab } from "@/components/admin/premium-wineries-tab"
import { CategoriesManagementTab } from "@/components/admin/categories-management-tab"
import { ConfigStatusIndicator } from "@/components/config-status-indicator"

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("wine-management")

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            Volver a la Carta
          </Button>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
        </div>
        <ConfigStatusIndicator />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wine-management">Gestión de Carta</TabsTrigger>
          <TabsTrigger value="categories-management">Categorías y Orden</TabsTrigger>
          <TabsTrigger value="app-config">Configuración</TabsTrigger>
          <TabsTrigger value="premium-wineries">Auspiciantes</TabsTrigger>
        </TabsList>
        <TabsContent value="wine-management">
          <WineManagementInterface onBack={onBack} />
        </TabsContent>
        <TabsContent value="categories-management">
          <CategoriesManagementTab />
        </TabsContent>
        <TabsContent value="app-config">
          <AppConfigTab />
        </TabsContent>
        <TabsContent value="premium-wineries">
          <PremiumWineriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
