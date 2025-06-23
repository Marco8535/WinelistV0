'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home } from 'lucide-react'

export default function RestaurantNotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-800">Restaurante No Encontrado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Lo sentimos, no pudimos encontrar el restaurante que estás buscando.
          </p>
          <p className="text-sm text-gray-500">
            Es posible que:
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1">
            <li>• El subdominio sea incorrecto</li>
            <li>• El restaurante esté temporalmente inactivo</li>
            <li>• La URL haya cambiado</li>
          </ul>
          
          <div className="pt-4 space-y-3">
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => window.location.href = '/'}
            >
              <Home className="mr-2 h-4 w-4" />
              Ir a la Página Principal
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-amber-600 text-amber-600 hover:bg-amber-50"
              onClick={() => window.location.href = '/signup'}
            >
              Registrar mi Restaurante
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-400">
              ¿Eres el propietario de este restaurante?{' '}
              <a href="/login" className="text-amber-600 hover:underline">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 