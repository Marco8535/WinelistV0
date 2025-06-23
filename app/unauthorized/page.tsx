'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, LogIn, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-orange-100 rounded-full">
              <Shield className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-800">Acceso No Autorizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            No tienes permisos para acceder al panel de administración de este restaurante.
          </p>
          <p className="text-sm text-gray-500">
            Solo el administrador del restaurante puede acceder a esta sección.
          </p>
          
          <div className="pt-4 space-y-3">
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => window.location.href = '/login'}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión con Otra Cuenta
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-amber-600 text-amber-600 hover:bg-amber-50"
              onClick={() => window.location.href = '/'}
            >
              <Home className="mr-2 h-4 w-4" />
              Ir a la Página Principal
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-400">
              ¿Eres el propietario de este restaurante?{' '}
              <a href="/signup" className="text-amber-600 hover:underline">
                Registra tu cuenta aquí
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 