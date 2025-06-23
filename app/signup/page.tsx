'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface SignupFormData {
  restaurantName: string
  subdomain: string
  adminEmail: string
  password: string
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    restaurantName: '',
    subdomain: '',
    adminEmail: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.restaurantName.trim()) {
      return 'El nombre del restaurante es requerido'
    }
    
    if (!formData.subdomain.trim()) {
      return 'El subdominio es requerido'
    }
    
    // Validar formato de subdominio
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(formData.subdomain)) {
      return 'El subdominio solo puede contener letras minúsculas, números y guiones'
    }
    
    if (formData.subdomain.length < 3) {
      return 'El subdominio debe tener al menos 3 caracteres'
    }
    
    if (!formData.adminEmail.trim()) {
      return 'El email del administrador es requerido'
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.adminEmail)) {
      return 'Por favor, ingresa un email válido'
    }
    
    if (!formData.password.trim()) {
      return 'La contraseña es requerida'
    }
    
    if (formData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulario
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el registro')
      }
      
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al procesar el registro')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">¡Registro Exitoso!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Tu restaurante ha sido registrado exitosamente.
              </p>
              <p className="text-sm text-gray-500">
                Tu sitio web estará disponible en:
                <br />
                <span className="font-mono font-medium text-blue-600">
                  {formData.subdomain}.lazysomm.app
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Recibirás un email de confirmación en: {formData.adminEmail}
              </p>
              <Button 
                onClick={() => window.location.href = `https://${formData.subdomain}.lazysomm.app`}
                className="w-full"
              >
                Ir a mi sitio web
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">Registra tu Restaurante</CardTitle>
          <p className="text-gray-600 mt-2">
            Crea tu carta de vinos digital en minutos
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Nombre del Restaurante</Label>
              <Input
                id="restaurantName"
                type="text"
                placeholder="Ej: Restaurante Los Arcos"
                value={formData.restaurantName}
                onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdominio</Label>
              <Input
                id="subdomain"
                type="text"
                placeholder="Ej: restaurante-los-arcos"
                value={formData.subdomain}
                onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase())}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500">
                Tu sitio web será: <span className="font-mono">{formData.subdomain || 'tu-subdominio'}.lazysomm.app</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email del Administrador</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@restaurante.com"
                value={formData.adminEmail}
                onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Restaurante'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 