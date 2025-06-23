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

  // Si no hay información del restaurante, usar valores por defecto o null
  let restaurant: RestaurantData | null = null

  if (restaurantId && restaurantName && restaurantSubdomain) {
    restaurant = {
      id: restaurantId,
      name: restaurantName,
      subdomain: restaurantSubdomain,
      primary_color: '#C11119', // Valor por defecto
      secondary_color: '#F8F8F8' // Valor por defecto
    }
  }

  return (
    <WineProvider restaurant={restaurant}>
      {children}
    </WineProvider>
  )
} 