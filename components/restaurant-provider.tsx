"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { WineProvider } from "@/context/wine-context"

// Restaurant data type
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

// Context type definition
interface RestaurantContextType {
  restaurant: RestaurantData | null
  loading: boolean
  error: string | null
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined)

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Get restaurant ID from subdomain or use default
  const getRestaurantIdentifier = (): string => {
    if (typeof window === "undefined") {
      return "open"
    }
    const hostname = window.location.hostname
    const parts = hostname.split(".")

    // Si estamos en localhost o en una URL de preview de Vercel, usamos 'open' como default.
    if (parts[0] === "localhost" || hostname.endsWith(".vercel.app")) {
      return "open"
    }

    // En producción, usamos el subdominio real.
    return parts[0]
  }

  // Load restaurant data
  const loadRestaurant = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        setError(
          "Error: Las credenciales de Supabase no están configuradas. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        )
        setLoading(false)
        return
      }

      const restaurantIdentifier = getRestaurantIdentifier()
      console.log(`[RestaurantProvider] Loading restaurant for identifier: ${restaurantIdentifier}`)

      // Get restaurant info
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("subdomain", restaurantIdentifier)
        .single()

      if (restaurantError) {
        console.error("Restaurant not found:", restaurantError)
        throw new Error(`Restaurant "${restaurantIdentifier}" not found. Please contact support.`)
      }

      console.log(`[RestaurantProvider] Found restaurant:`, restaurantData)
      setRestaurant(restaurantData)
    } catch (err) {
      console.error("Error loading restaurant:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadRestaurant()
  }, [])

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, error }}>
      <WineProvider restaurant={restaurant}>{children}</WineProvider>
    </RestaurantContext.Provider>
  )
}

export function useRestaurant() {
  const context = useContext(RestaurantContext)
  if (context === undefined) {
    throw new Error("useRestaurant must be used within a RestaurantProvider")
  }
  return context
}
