"use client"

import { useWine } from "@/context/wine-context"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bookmark, Mail, MessageCircle, PhoneCall, Trash2, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function BookmarkedWinesManager() {
  const { wines, bookmarkedWines, toggleBookmark, isWineBookmarked } = useWine()
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportType, setExportType] = useState<'whatsapp' | 'email'>('whatsapp')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [showSommelierCall, setShowSommelierCall] = useState(true)

  // Load app configuration
  const getAppConfig = () => {
    try {
      const savedConfig = localStorage.getItem("app-config")
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        return {
          sommelierEnabled: config.sommelierEnabled !== false,
          sommelierPhone: config.sommelierPhone || "+1234567890",
          whatsappEnabled: config.whatsappEnabled !== false,
          emailEnabled: config.emailEnabled !== false,
          contactEmail: config.contactEmail || "sommelier@restaurant.com"
        }
      }
    } catch (error) {
      console.error("Error loading app config:", error)
    }
    return {
      sommelierEnabled: true,
      sommelierPhone: "+1234567890",
      whatsappEnabled: true,
      emailEnabled: true,
      contactEmail: "sommelier@restaurant.com"
    }
  }

  const appConfig = getAppConfig()

  // Get bookmarked wines with full details
  const bookmarkedWinesList = useMemo(() => {
    return wines.filter(wine => bookmarkedWines.has(wine.id))
  }, [wines, bookmarkedWines])

  // Format price function
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "-"
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return `$${Math.floor(numericPrice)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  // Generate wine list text for export
  const generateWineListText = () => {
    if (bookmarkedWinesList.length === 0) return "No hay vinos guardados."

    let text = "🍷 MI SELECCIÓN DE VINOS 🍷\n\n"
    
    bookmarkedWinesList.forEach((wine, index) => {
      text += `${index + 1}. ${wine.nombre}\n`
      text += `   📍 ${wine.productor}\n`
      if (wine.region) text += `   🌍 ${wine.region}\n`
      if (wine.uva) text += `   🍇 ${wine.uva}\n`
      if (wine.ano) text += `   📅 Cosecha: ${wine.ano}\n`
      if (wine.precio) text += `   💰 ${formatPrice(wine.precio)}\n`
      if (wine.precioCopa) text += `   🥂 Copa: ${formatPrice(wine.precioCopa)}\n`
      text += "\n"
    })

    text += "---\n"
    text += "Lista generada desde nuestra carta digital\n"
    return text
  }

  // Handle WhatsApp export
  const handleWhatsAppExport = () => {
    const text = generateWineListText()
    const phoneNumber = recipientPhone.replace(/\D/g, '') // Remove non-digits
    const encodedText = encodeURIComponent(text)
    
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
    
    toast({
      title: "Compartido por WhatsApp",
      description: "La lista se ha abierto en WhatsApp",
    })
    setShowExportDialog(false)
    setRecipientPhone('')
  }

  // Handle Email export
  const handleEmailExport = () => {
    const text = generateWineListText()
    const subject = "Mi Selección de Vinos"
    const body = text.replace(/\n/g, '%0D%0A')
    
    const emailUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${body}`
    window.location.href = emailUrl
    
    toast({
      title: "Email preparado",
      description: "Se ha abierto tu cliente de email",
    })
    setShowExportDialog(false)
    setRecipientEmail('')
  }

  // Handle sommelier call
  const handleSommelierCall = () => {
    if (appConfig.sommelierPhone) {
      window.open(`tel:${appConfig.sommelierPhone}`, '_self')
    }
  }

  // Clear all bookmarks
  const handleClearAll = () => {
    bookmarkedWinesList.forEach(wine => {
      toggleBookmark(wine.id)
    })
    toast({
      title: "Lista limpiada",
      description: "Se han eliminado todos los vinos guardados",
    })
  }

  const showEmptyState = bookmarkedWines.size === 0

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap gap-2 justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-red-600" />
          <span className="font-medium text-gray-900">
            {bookmarkedWinesList.length} vino{bookmarkedWinesList.length !== 1 ? 's' : ''} guardado{bookmarkedWinesList.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Sommelier Call Button */}
          {appConfig.sommelierEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSommelierCall}
              className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
            >
              <PhoneCall className="h-4 w-4" />
              <span className="hidden sm:inline">{""}</span>
              <span className="sm:hidden">Concierge</span>
            </Button>
          )}

          {/* Export Buttons */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {setExportType('whatsapp'); setShowExportDialog(true)}}
                disabled={!appConfig.whatsappEnabled}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </DialogTrigger>
          </Dialog>

          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {setExportType('email'); setShowExportDialog(true)}}
                disabled={!appConfig.emailEnabled}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </Button>
            </DialogTrigger>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Limpiar Todo</span>
          </Button>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {exportType === 'whatsapp' ? 'Enviar por WhatsApp' : 'Enviar por Email'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {exportType === 'whatsapp' ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Número de teléfono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Si no ingresa un número, se abrirá WhatsApp para que pueda elegir el contacto
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">Dirección de email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={exportType === 'whatsapp' ? handleWhatsAppExport : handleEmailExport}
                className="bg-green-600 hover:bg-green-700"
              >
                {exportType === 'whatsapp' ? (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar por WhatsApp
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar por Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State Message */}
      {showEmptyState && (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
          <Bookmark className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes vinos guardados</h3>
          <p className="text-gray-500 mb-4">
            Marca tus vinos favoritos con el ícono de bookmark para verlos aquí
          </p>
        </div>
      )}

      {/* Bookmarked Wines List */}
      {!showEmptyState && (
        <div className="space-y-4">
          {bookmarkedWinesList.map((wine) => (
          <Card key={wine.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-gray-900 mb-1">
                    {wine.nombre}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {wine.productor}
                    {wine.ano && ` • ${wine.ano}`}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {wine.region && (
                      <span>📍 {wine.region}</span>
                    )}
                    {wine.uva && (
                      <span>🍇 {wine.uva}</span>
                    )}
                    {wine.alcohol && (
                      <span>🍾 {wine.alcohol}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {wine.precio && (
                      <div className="font-bold text-lg text-gray-900">
                        {formatPrice(wine.precio)}
                      </div>
                    )}
                    {wine.precioCopa && (
                      <div className="text-sm text-gray-600">
                        Copa: {formatPrice(wine.precioCopa)}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBookmark(wine.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
    </div>
  )
}
