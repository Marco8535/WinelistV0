"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { LayoutGrid, List, Sliders, RotateCcw, Smartphone } from "lucide-react"

type ViewMode = "cards" | "list" | "carousel" | "cards-no-image"

interface ConfigPanelProps {
  isOpen: boolean
  onClose: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onEnableReordering: () => void
  onResetOrder: () => void
  isReorderingEnabled: boolean
}

export function ConfigPanel({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  onEnableReordering,
  onResetOrder,
  isReorderingEnabled,
}: ConfigPanelProps) {
  const [activeTab, setActiveTab] = useState("visualizacion")

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Configuración</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="visualizacion" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="visualizacion">Visualización</TabsTrigger>
            <TabsTrigger value="orden">Orden</TabsTrigger>
          </TabsList>

          <TabsContent value="visualizacion" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Modo de visualización</h3>
              <RadioGroup
                value={viewMode}
                onValueChange={(value) => onViewModeChange(value as ViewMode)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="list" id="view-list" />
                  <Label htmlFor="view-list" className="flex items-center gap-2 cursor-pointer">
                    <List className="h-4 w-4" />
                    Lista
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cards" id="view-cards" />
                  <Label htmlFor="view-cards" className="flex items-center gap-2 cursor-pointer">
                    <LayoutGrid className="h-4 w-4" />
                    Tarjetas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="carousel" id="view-carousel" />
                  <Label htmlFor="view-carousel" className="flex items-center gap-2 cursor-pointer">
                    <Smartphone className="h-4 w-4" />
                    Carrusel
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cards-no-image" id="view-cards-no-image" />
                  <Label htmlFor="view-cards-no-image" className="flex items-center gap-2 cursor-pointer">
                    <LayoutGrid className="h-4 w-4" />
                    Tarjetas sin imágenes
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="orden" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Reordenamiento</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="reordering-mode" className="flex items-center gap-2 cursor-pointer">
                  <Sliders className="h-4 w-4" />
                  Habilitar reordenamiento
                </Label>
                <Switch id="reordering-mode" checked={isReorderingEnabled} onCheckedChange={onEnableReordering} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Permite arrastrar y soltar los vinos para cambiar su orden.
              </p>
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onResetOrder}
                disabled={!isReorderingEnabled}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Volver a orden default
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
