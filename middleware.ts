import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define las rutas que no requieren autenticación
const publicRoutes = ['/login', '/signup', '/restaurant-not-found']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options })
          const response = NextResponse.next({ request })
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: '', ...options })
          const response = NextResponse.next({ request })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 1. Obtener la sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 2. Extraer el subdominio
  const host = request.headers.get('host')!
  const subdomain = host.split('.')[0]
  
  // Excepciones para el dominio principal y URLs de Vercel
  const isMainDomain = subdomain === 'lazysomm' || host.endsWith('.vercel.app');
  const onPublicRoute = publicRoutes.includes(pathname)

  // Si está en el dominio principal y no es una ruta pública, redirigir al login
  if (isMainDomain && !onPublicRoute && !session) {
      if(pathname === '/') return NextResponse.next(); // Permitir landing page
      return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Si no hay sesión y la ruta no es pública, redirigir al login
  if (!session && !onPublicRoute && !isMainDomain) {
    return NextResponse.redirect(new URL('/login', `https://${host.split(':')[0]}`))
  }

  // 4. Lógica para subdominios
  if (!isMainDomain) {
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name, subdomain, user_id, logo_url, primary_color, secondary_color, google_sheet_id, last_synced_at')
      .eq('subdomain', subdomain)
      .single()

    if (error || !restaurant) {
      return NextResponse.redirect(new URL('/restaurant-not-found', request.url))
    }
    
    // Si la ruta es privada (contiene /admin), verificar que el usuario logueado es el dueño
    if(pathname.includes('/admin')) {
        if(!session || session.user.id !== restaurant.user_id) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // 5. Pasar datos del restaurante a la aplicación a través de headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-restaurant-id', restaurant.id)
    requestHeaders.set('x-restaurant-name', restaurant.name)
    requestHeaders.set('x-restaurant-subdomain', restaurant.subdomain)
    requestHeaders.set('x-restaurant-logo-url', restaurant.logo_url || '')
    requestHeaders.set('x-restaurant-primary-color', restaurant.primary_color || '#C11119')
    requestHeaders.set('x-restaurant-secondary-color', restaurant.secondary_color || '#F8F8F8')
    requestHeaders.set('x-restaurant-google-sheet-id', restaurant.google_sheet_id || '')
    requestHeaders.set('x-restaurant-last-synced-at', restaurant.last_synced_at || '')

    // Debug log para verificar que los nuevos campos se están pasando
    console.log(`[MIDDLEWARE] Restaurant data for ${restaurant.name}:`, {
      id: restaurant.id,
      google_sheet_id: restaurant.google_sheet_id,
      last_synced_at: restaurant.last_synced_at
    })

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons/|images/).*)',
  ],
}
