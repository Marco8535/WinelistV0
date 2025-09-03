"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { WineProvider } from "@/context/wine-context"

interface Restaurant {
  id: string
  name: string
  subdomain: string
  primary_color: string
  secondary_color: string
  logo_url?: string
  google_sheet_id?: string
  created_at: string
  updated_at: string
}

interface RestaurantContextType {
  restaurant: Restaurant | null
  loading: boolean
  error: string | null
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  loading: true,
  error: null,
})

export const useRestaurant = () => {
  const context = useContext(RestaurantContext)
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider")
  }
  return context
}

interface RestaurantProviderProps {
  children: ReactNode
}

export function RestaurantProvider({ children }: RestaurantProviderProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRestaurant() {
      try {
        setLoading(true)
        setError(null)

        // Determinar el subdominio
        let subdomain = "open" // default

        if (typeof window !== "undefined") {
          const hostname = window.location.hostname

          // Si estamos en localhost o en un dominio de Vercel, usar 'open'
          if (hostname === "localhost" || hostname.includes("vercel.app")) {
            subdomain = "open"
          } else {
            // Extraer subdominio del hostname
            const parts = hostname.split(".")
            if (parts.length > 2) {
              subdomain = parts[0]
            }
          }
        }

        console.log("Loading restaurant for subdomain:", subdomain)

        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("subdomain", subdomain)
          .single()

        if (fetchError) {
          console.error("Error loading restaurant:", fetchError)
          setError(`Error loading restaurant: ${fetchError.message}`)
          return
        }

        if (!data) {
          setError("Restaurant not found")
          return
        }

        console.log("Restaurant loaded:", data)
        setRestaurant(data)
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Unexpected error loading restaurant")
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [])

  const contextValue: RestaurantContextType = {
    restaurant,
    loading,
    error,
  }

  // Si hay error o está cargando, mostrar el estado sin WineProvider
  if (loading || error || !restaurant) {
    return <RestaurantContext.Provider value={contextValue}>{children}</RestaurantContext.Provider>
  }

  // Una vez que tenemos el restaurante, envolver con WineProvider
  return (
    <RestaurantContext.Provider value={contextValue}>
      <WineProvider restaurant={restaurant}>{children}</WineProvider>
    </RestaurantContext.Provider>
  )
}
