import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let supabase: SupabaseClient | undefined // Usamos undefined para el estado inicial y para indicar si no se pudo crear

export function createClient(): SupabaseClient | undefined {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error(
      "Supabase URL o Anon Key no están configuradas. No se puede crear el cliente de Supabase en el navegador.",
    )
    return undefined // Retorna undefined si las variables no están presentes
  }

  // Patrón Singleton para evitar crear múltiples clientes
  if (!supabase) {
    supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }
  return supabase
}
