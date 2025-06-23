import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wine, Users, Settings, Sparkles } from 'lucide-react'

export function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-100 rounded-full">
              <Wine className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Lazy<span className="text-amber-600">Somm</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La plataforma más fácil para crear y gestionar la carta de vinos digital de tu restaurante
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
              onClick={() => window.location.href = '/signup'}
            >
              Registrar mi Restaurante
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-3"
              onClick={() => window.location.href = '/login'}
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Sparkles className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle>Configuración Automática</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Conecta tu Google Sheets y sincroniza automáticamente tu carta de vinos. Sin complicaciones técnicas.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle>Multi-Restaurante</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cada restaurante tiene su propio subdominio y datos completamente aislados. Perfecto para cadenas.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Settings className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle>Fácil de Gestionar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Panel de administración intuitivo para gestionar categorías, precios y disponibilidad en tiempo real.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Regístrate</h3>
              <p className="text-gray-600">
                Crea tu cuenta en menos de 2 minutos con el nombre de tu restaurante y subdominio deseado.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Conecta tu Google Sheets</h3>
              <p className="text-gray-600">
                Sube tu carta de vinos a Google Sheets y conecta la URL. La sincronización es automática.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">¡Listo!</h3>
              <p className="text-gray-600">
                Tu carta digital está lista. Comparte el enlace con tus clientes y gestiona todo desde el panel.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para digitalizar tu carta de vinos?
          </h2>
          <p className="text-gray-600 mb-6">
            Únete a cientos de restaurantes que ya usan LazySomm
          </p>
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-3"
            onClick={() => window.location.href = '/signup'}
          >
            Comenzar Gratis
          </Button>
        </div>
      </div>
    </div>
  )
} 