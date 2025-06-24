import { headers } from 'next/headers'
import { WineProvider } from '@/context/wine-context'
import { ReactNode } from 'react'

interface RestaurantData {
  id: string
  name: string
  subdomain: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  google_sheet_id?: string
  last_synced_at?: string
}

interface RestaurantProviderProps {
  children: ReactNode
}

export async function RestaurantProvider({ children }: RestaurantProviderProps) {
  // Obtener información del restaurante de los headers del middleware
  const headersList = await headers()
  const restaurantId = headersList.get('x-restaurant-id')
  const restaurantName = headersList.get('x-restaurant-name')
  const restaurantSubdomain = headersList.get('x-restaurant-subdomain')
  const logoUrl = headersList.get('x-restaurant-logo-url')
  const primaryColor = headersList.get('x-restaurant-primary-color')
  const secondaryColor = headersList.get('x-restaurant-secondary-color')
  const googleSheetId = headersList.get('x-restaurant-google-sheet-id')
  const lastSyncedAt = headersList.get('x-restaurant-last-synced-at')

  // Si no hay información del restaurante, usar valores por defecto o null
  let restaurant: RestaurantData | null = null

  if (restaurantId && restaurantName && restaurantSubdomain) {
    restaurant = {
      id: restaurantId,
      name: restaurantName,
      subdomain: restaurantSubdomain,
      logo_url: logoUrl || undefined,
      primary_color: primaryColor || '#C11119',
      secondary_color: secondaryColor || '#F8F8F8',
      google_sheet_id: googleSheetId || undefined,
      last_synced_at: lastSyncedAt || undefined,
    }

    // Debug log para verificar que los datos se están recibiendo
    console.log('[RESTAURANT_PROVIDER] Restaurant data received:', {
      name: restaurant.name,
      google_sheet_id: restaurant.google_sheet_id,
      last_synced_at: restaurant.last_synced_at
    })
  }

  return (
    <>
      {/* Inyectar colores dinámicos */}
      {restaurant && (
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${restaurant.primary_color};
              --background: ${restaurant.secondary_color};
              --primary-foreground: #ffffff;
              --secondary: ${restaurant.secondary_color};
              --secondary-foreground: #1a1a1a;
              --accent: ${restaurant.primary_color}20;
              --accent-foreground: ${restaurant.primary_color};
            }
          `
        }} />
      )}
      
      <WineProvider restaurant={restaurant}>
        {children}
      </WineProvider>
    </>
  )
} 