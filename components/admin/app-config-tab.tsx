"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MessageCircle, Settings, Save, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { AppConfig } from "@/types/wine"

export function AppConfigTab() {
  const [config, setConfig] = useState<AppConfig>({
    sommelierEnabled: true,
    sommelierPhone: "+1234567890",
    whatsappEnabled: true,
    emailEnabled: true,
    contactEmail: "sommelier@restaurant.com",
    restaurantName: "",
    restaurantAddress: "",
    currencySymbol: "$",
    appTitle: "Carta de Vinos",
    showPrices: true,
    showAlcohol: true,
    compactView: false
  })
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = () => {
    try {
      const savedConfig = localStorage.getItem("app-config")
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig) as AppConfig
        setConfig(parsedConfig)
        console.log("Configuración de app cargada:", parsedConfig)
      }
    } catch (error) {
      console.error("Error al cargar la configuración de la app:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive"
      })
    }
  }

  const saveConfiguration = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem("app-config", JSON.stringify(config))
      setHasUnsavedChanges(false)
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      })
      console.log("Configuración de app guardada:", config)
    } catch (error) {
      console.error("Error al guardar la configuración de la app:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
    setHasUnsavedChanges(true)
  }

  const resetToDefaults = () => {
    const defaultConfig: AppConfig = {
      sommelierEnabled: true,
      sommelierPhone: "+1234567890",
      whatsappEnabled: true,
      emailEnabled: true,
      contactEmail: "sommelier@restaurant.com",
      restaurantName: "",
      restaurantAddress: "",
      currencySymbol: "$",
      appTitle: "Carta de Vinos",
      showPrices: true,
      showAlcohol: true,
      compactView: false
    }
    setConfig(defaultConfig)
    setHasUnsavedChanges(true)
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores por defecto",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración de la Aplicación</h2>
          <p className="text-gray-600">
            Configura las opciones generales de la aplicación y funcionalidades del cliente
          </p>
        </div>
        
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Cambios sin guardar
          </Badge>
        )}
      </div>

      <div className="grid gap-6">
        {/* Sommelier Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Configuración del Sommelier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sommelier-enabled">Habilitar botón "Llamar al Sommelier"</Label>
                <p className="text-sm text-gray-500">
                  Permite a los clientes llamar directamente al sommelier desde la ficha del vino y vinos guardados
                </p>
              </div>
              <Switch
                id="sommelier-enabled"
                checked={config.sommelierEnabled}
                onCheckedChange={(checked) => handleConfigChange('sommelierEnabled', checked)}
              />
            </div>
            
            {config.sommelierEnabled && (
              <div className="space-y-2">
                <Label htmlFor="sommelier-phone">Número del Sommelier</Label>
                <Input
                  id="sommelier-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={config.sommelierPhone || ''}
                  onChange={(e) => handleConfigChange('sommelierPhone', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Incluye el código de país (ej: +54 para Argentina, +1 para Estados Unidos)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Communication Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Métodos de Comunicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* WhatsApp Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-enabled">Habilitar exportar por WhatsApp</Label>
                  <p className="text-sm text-gray-500">
                    Permite a los clientes enviar su lista de vinos guardados por WhatsApp
                  </p>
                </div>
                <Switch
                  id="whatsapp-enabled"
                  checked={config.whatsappEnabled}
                  onCheckedChange={(checked) => handleConfigChange('whatsappEnabled', checked)}
                />
              </div>
            </div>

            <Separator />

            {/* Email Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-enabled">Habilitar exportar por Email</Label>
                  <p className="text-sm text-gray-500">
                    Permite a los clientes enviar su lista de vinos guardados por email
                  </p>
                </div>
                <Switch
                  id="email-enabled"
                  checked={config.emailEnabled}
                  onCheckedChange={(checked) => handleConfigChange('emailEnabled', checked)}
                />
              </div>
              
              {config.emailEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email de contacto por defecto</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="sommelier@restaurant.com"
                    value={config.contactEmail || ''}
                    onChange={(e) => handleConfigChange('contactEmail', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Email que aparecerá como sugerencia cuando los clientes exporten por email
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Información del Restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">Nombre del Restaurante</Label>
              <Input
                id="restaurant-name"
                placeholder="Restaurante El Viñedo"
                value={config.restaurantName || ''}
                onChange={(e) => handleConfigChange('restaurantName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurant-address">Dirección</Label>
              <Input
                id="restaurant-address"
                placeholder="Av. Principal 123, Ciudad"
                value={config.restaurantAddress || ''}
                onChange={(e) => handleConfigChange('restaurantAddress', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency-symbol">Símbolo de Moneda</Label>
              <Input
                id="currency-symbol"
                placeholder="$"
                value={config.currencySymbol || '$'}
                onChange={(e) => handleConfigChange('currencySymbol', e.target.value)}
                className="max-w-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Interface Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configuración de Interfaz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app-title">Título de la Aplicación</Label>
              <Input
                id="app-title"
                placeholder="Carta de Vinos"
                value={config.appTitle || 'Carta de Vinos'}
                onChange={(e) => handleConfigChange('appTitle', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="show-prices">Mostrar precios en la carta</Label>
                <p className="text-sm text-gray-500">
                  Activa o desactiva la visualización de precios para los clientes
                </p>
              </div>
              <Switch
                id="show-prices"
                checked={config.showPrices !== false}
                onCheckedChange={(checked) => handleConfigChange('showPrices', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="show-alcohol">Mostrar grado alcohólico</Label>
                <p className="text-sm text-gray-500">
                  Muestra el contenido de alcohol en las fichas de vino
                </p>
              </div>
              <Switch
                id="show-alcohol"
                checked={config.showAlcohol !== false}
                onCheckedChange={(checked) => handleConfigChange('showAlcohol', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="compact-view">Vista compacta</Label>
                <p className="text-sm text-gray-500">
                  Reduce el espaciado para mostrar más vinos en pantalla
                </p>
              </div>
              <Switch
                id="compact-view"
                checked={config.compactView || false}
                onCheckedChange={(checked) => handleConfigChange('compactView', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Restablecer por Defecto
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadConfiguration}
            disabled={!hasUnsavedChanges}
          >
            Descartar Cambios
          </Button>
          
          <Button
            onClick={saveConfiguration}
            disabled={!hasUnsavedChanges || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuration Preview */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">Vista Previa de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <strong>Restaurante:</strong> {config.restaurantName || 'Sin configurar'}
              {config.restaurantAddress && (
                <div className="text-gray-600 ml-2">📍 {config.restaurantAddress}</div>
              )}
            </div>
            
            <div>
              <strong>Moneda:</strong> {config.currencySymbol || '$'}
            </div>
            
            <div>
              <strong>Sommelier:</strong> {config.sommelierEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}
              {config.sommelierEnabled && config.sommelierPhone && (
                <div className="text-gray-600 ml-2">📞 {config.sommelierPhone}</div>
              )}
            </div>
            
            <div>
              <strong>WhatsApp:</strong> {config.whatsappEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}
            </div>
            
            <div>
              <strong>Email:</strong> {config.emailEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}
              {config.emailEnabled && config.contactEmail && (
                <div className="text-gray-600 ml-2">📧 {config.contactEmail}</div>
              )}
            </div>
            
            <div>
              <strong>Mostrar precios:</strong> {config.showPrices !== false ? '✅ Sí' : '❌ No'}
            </div>
            
            <div>
              <strong>Mostrar alcohol:</strong> {config.showAlcohol !== false ? '✅ Sí' : '❌ No'}
            </div>
            
            <div>
              <strong>Vista compacta:</strong> {config.compactView ? '✅ Sí' : '❌ No'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 