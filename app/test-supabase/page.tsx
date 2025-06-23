import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default async function TestSupabasePage() {
  let connectionStatus = "unknown"
  let errorMessage = ""
  let projectDetails = null
  let authStatus = "unknown"

  try {
    const supabase = createClient()

    // Test 1: Verificar configuración básica
    const config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurada" : "No configurada",
    }

    // Test 2: Intentar una consulta simple para verificar la conexión
    try {
      const { data, error } = await supabase.from("_realtime_schema_migrations").select("version").limit(1)

      if (error) {
        // Si la tabla no existe, es normal, pero significa que la conexión funciona
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          connectionStatus = "connected"
        } else {
          connectionStatus = "error"
          errorMessage = error.message
        }
      } else {
        connectionStatus = "connected"
      }
    } catch (err) {
      connectionStatus = "error"
      errorMessage = err instanceof Error ? err.message : "Error desconocido"
    }

    // Test 3: Verificar el estado de autenticación
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError) {
        authStatus = "no_user"
      } else {
        authStatus = user ? "authenticated" : "anonymous"
      }
    } catch (err) {
      authStatus = "error"
    }

    projectDetails = config
  } catch (err) {
    connectionStatus = "error"
    errorMessage = err instanceof Error ? err.message : "Error al inicializar Supabase"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-500">
            Conectado
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "authenticated":
        return (
          <Badge variant="default" className="bg-blue-500">
            Autenticado
          </Badge>
        )
      case "anonymous":
        return <Badge variant="secondary">Anónimo</Badge>
      case "no_user":
        return <Badge variant="outline">Sin usuario</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Test de Conexión Supabase</h1>
        <p className="text-muted-foreground">Verificación del estado de la conexión con tu proyecto de Supabase</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Estado de Conexión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(connectionStatus)}
              Estado de Conexión
            </CardTitle>
            <CardDescription>Verificación de la conectividad con Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Estado:</span>
                {getStatusBadge(connectionStatus)}
              </div>
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {errorMessage}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuración del Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Proyecto</CardTitle>
            <CardDescription>Detalles de la configuración de Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-medium">URL del Proyecto:</span>
                <p className="text-sm text-muted-foreground break-all">{projectDetails?.url || "No configurada"}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Clave Anónima:</span>
                <Badge variant={projectDetails?.anonKey === "Configurada" ? "default" : "destructive"}>
                  {projectDetails?.anonKey || "No configurada"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Autenticación */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Autenticación</CardTitle>
            <CardDescription>Verificación del sistema de autenticación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span>Estado del Usuario:</span>
              {getStatusBadge(authStatus)}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Pasos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Pasos</CardTitle>
            <CardDescription>Recomendaciones basadas en el estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {connectionStatus === "connected" ? (
                <>
                  <p className="text-green-700">✅ Conexión exitosa</p>
                  <p>Puedes proceder a crear tablas y implementar funcionalidades.</p>
                </>
              ) : connectionStatus === "error" ? (
                <>
                  <p className="text-red-700">❌ Error de conexión</p>
                  <p>Verifica las variables de entorno en Vercel.</p>
                </>
              ) : (
                <>
                  <p className="text-yellow-700">⚠️ Estado desconocido</p>
                  <p>Revisa la configuración de Supabase.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-900 mb-2">Información</h3>
        <p className="text-sm text-blue-700">
          Esta página de prueba verifica la conexión básica con Supabase. Una vez que confirmes que todo funciona
          correctamente, puedes eliminar esta página o mantenerla para futuras verificaciones.
        </p>
      </div>
    </div>
  )
}
