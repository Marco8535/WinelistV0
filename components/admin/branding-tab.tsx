"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, Palette, Image as ImageIcon } from "lucide-react"
import { useWine } from "@/context/wine-context"
import { createClient } from "@/lib/supabase/client"

export function BrandingTab() {
  const { restaurant } = useWine()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState(restaurant?.primary_color || '#C11119')
  const [secondaryColor, setSecondaryColor] = useState(restaurant?.secondary_color || '#F8F8F8')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen valido' })
      return
    }

    // Validar tamaño (maximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'El archivo debe ser menor a 5MB' })
      return
    }

    setLogoFile(file)
    
    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setMessage(null)
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !restaurant || !supabase) return null

    try {
      // Generar nombre unico para el archivo
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${restaurant.subdomain}-logo-${Date.now()}.${fileExt}`
      const filePath = `restaurant-logos/${fileName}`

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading logo:', error)
        throw new Error('Error al subir el logo')
      }

      // Obtener URL publica
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleSave = async () => {
    if (!restaurant || !supabase) {
      setMessage({ type: 'error', text: 'No se encontro informacion del restaurante' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      let logoUrl = restaurant.logo_url

      // Si hay un nuevo logo, subirlo
      if (logoFile) {
        const uploadedUrl = await uploadLogo()
        if (!uploadedUrl) {
          throw new Error('Error al subir el logo')
        }
        logoUrl = uploadedUrl
      }

      // Actualizar la informacion del restaurante
      const { error } = await supabase
        .from('restaurants')
        .update({
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurant.id)

      if (error) {
        console.error('Error updating restaurant:', error)
        throw new Error('Error al guardar los cambios')
      }

      setMessage({ type: 'success', text: 'Personalizacion guardada exitosamente' })
      setLogoFile(null)
      setLogoPreview(null)
      
      // Recargar la pagina para aplicar los cambios
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('Save error:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al guardar los cambios' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              No se pudo cargar la informacion del restaurante.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Personalizacion Visual</h2>
        <p className="text-muted-foreground">
          Personaliza la apariencia de tu carta de vinos con tu logo y colores de marca.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo del Restaurante
            </CardTitle>
            <CardDescription>
              Sube el logo de tu restaurante. Se mostrara en la parte superior de tu carta de vinos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Preview del logo" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : restaurant.logo_url ? (
                  <img 
                    src={restaurant.logo_url} 
                    alt="Logo actual" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Sin logo</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="logo-upload">Seleccionar nuevo logo</Label>
              <Input
                ref={fileInputRef}
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos soportados: JPG, PNG, SVG. Maximo 5MB.
              </p>
            </div>

            {logoFile && (
              <Button variant="outline" size="sm" onClick={resetLogo}>
                Cancelar cambio de logo
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colores de Marca
            </CardTitle>
            <CardDescription>
              Personaliza los colores principales de tu carta de vinos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Color Primario</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#C11119"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Se usa para botones, enlaces y elementos destacados.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Color Secundario</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#F8F8F8"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Se usa para fondos y elementos secundarios.
              </p>
            </div>

            <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: secondaryColor }}>
              <div 
                className="inline-block px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Vista previa
              </div>
              <p className="mt-2 text-sm" style={{ color: primaryColor }}>
                Asi se veran tus colores en la carta de vinos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
