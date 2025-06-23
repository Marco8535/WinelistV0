import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // Si las variables de entorno de Supabase no están configuradas,
  // saltamos el middleware para evitar errores en el despliegue inicial.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are not set. Skipping middleware.")
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        request.cookies.set({ name, value: "", ...options })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({ name, value: "", ...options })
      },
    },
  })

  // Extraer el subdominio de la URL
  const host = request.headers.get('host') || ''
  const subdomain = extractSubdomain(host)
  
  // Si no hay subdominio o es 'www', permitir acceso normal
  if (!subdomain || subdomain === 'www') {
    await supabase.auth.getUser()
    return response
  }

  // Buscar el restaurante por subdominio
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('is_active', true)
    .single()

  // Si no se encuentra el restaurante, redirigir a página de error
  if (restaurantError || !restaurant) {
    const url = new URL('/restaurant-not-found', request.url)
    return NextResponse.redirect(url)
  }

  // Obtener la sesión del usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  
  // Determinar si la ruta es privada (admin)
  const isPrivateRoute = isAdminRoute(request.nextUrl.pathname)
  
  if (isPrivateRoute) {
    // Para rutas privadas, verificar autenticación y permisos
    if (!user) {
      // Usuario no autenticado, redirigir al login
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verificar que el usuario pertenece a este restaurante
    if (restaurant.user_id !== user.id) {
      // Usuario no autorizado para este restaurante
      const unauthorizedUrl = new URL('/unauthorized', request.url)
      return NextResponse.redirect(unauthorizedUrl)
    }
  }

  // Agregar headers con información del restaurante para uso en la aplicación
  response.headers.set('x-restaurant-id', restaurant.id)
  response.headers.set('x-restaurant-name', restaurant.name)
  response.headers.set('x-restaurant-subdomain', restaurant.subdomain)
  
  if (user) {
    response.headers.set('x-user-id', user.id)
  }

  return response
}

// Función para extraer el subdominio de la URL
function extractSubdomain(host: string): string | null {
  // Remover puerto si existe
  const hostname = host.split(':')[0]
  
  // Si es localhost o IP, no hay subdominio
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null
  }
  
  // Dividir por puntos
  const parts = hostname.split('.')
  
  // Si tiene menos de 3 partes, no hay subdominio (ej: example.com)
  if (parts.length < 3) {
    return null
  }
  
  // El subdominio es la primera parte
  return parts[0]
}

// Función para determinar si una ruta es privada (admin)
function isAdminRoute(pathname: string): boolean {
  const adminRoutes = [
    '/admin',
    '/dashboard',
    '/settings'
  ]
  
  return adminRoutes.some(route => pathname.startsWith(route))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (manifest file)
     * - icons/ (PWA icons)
     * - images/ (public images)
     * - login (página de login global)
     * - signup (página de registro global)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons/|images/|login|signup|restaurant-not-found|unauthorized).*)',
  ],
}
