'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface LoginFormData {
  subdomain: string
  adminEmail: string
  password: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    subdomain: '',
    adminEmail: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.subdomain.trim()) {
      return 'El subdominio es requerido'
    }
    
    if (!formData.adminEmail.trim()) {
      return 'El email es requerido'
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.adminEmail)) {
      return 'Por favor, ingresa un email válido'
    }
    
    if (!formData.password.trim()) {
      return 'La contraseña es requerida'
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
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }
      
      // Redirigir al sitio del restaurante
      window.location.href = `https://${formData.subdomain}.lazysomm.app`
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">Iniciar Sesión</CardTitle>
          <p className="text-gray-600 mt-2">
            Accede a tu carta de vinos digital
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
                Tu sitio web: <span className="font-mono">{formData.subdomain || 'tu-subdominio'}.lazysomm.app</span>
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
                placeholder="Tu contraseña"
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes una cuenta?{' '}
              <a href="/signup" className="text-blue-600 hover:underline">
                Registra tu restaurante aquí
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 