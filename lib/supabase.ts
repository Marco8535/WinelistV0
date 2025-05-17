import { createClient } from "@supabase/supabase-js"
import type { Wine } from "@/types/wine"

// Create a single supabase client for the entire app
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Function to fetch all wines from Supabase
export async function fetchWinesFromSupabase(): Promise<Wine[]> {
  try {
    const { data, error } = await supabase.from("wines").select("*")

    if (error) {
      throw error
    }

    return data as Wine[]
  } catch (error) {
    console.error("Error fetching wines from Supabase:", error)
    return []
  }
}

// Function to fetch wines by category
export async function fetchWinesByCategory(category: string): Promise<Wine[]> {
  try {
    let query = supabase.from("wines").select("*")

    // Apply category filters
    if (category === "glass") {
      query = query.or("precioCopa.neq.null,precioCopaR1.neq.null,precioCopaR2.neq.null,precioCopaR3.neq.null")
    } else if (category === "red") {
      query = query.or("caracteristica.ilike.%tinto%,tipo.ilike.%tinto%")
    } else if (category === "white") {
      query = query.or("caracteristica.ilike.%blanco%,tipo.ilike.%blanco%")
    } else if (category === "sparkling") {
      query = query.or(
        "caracteristica.ilike.%espumante%,caracteristica.ilike.%espumoso%,tipo.ilike.%espumante%,tipo.ilike.%espumoso%",
      )
    } else if (category === "rose") {
      query = query.or(
        "caracteristica.ilike.%rosado%,caracteristica.ilike.%rosé%,tipo.ilike.%rosado%,tipo.ilike.%rosé%",
      )
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data as Wine[]
  } catch (error) {
    console.error("Error fetching wines by category:", error)
    return []
  }
}

// Function to search wines
export async function searchWines(query: string): Promise<Wine[]> {
  try {
    const { data, error } = await supabase
      .from("wines")
      .select("*")
      .or(`nombre.ilike.%${query}%,productor.ilike.%${query}%,uva.ilike.%${query}%,region.ilike.%${query}%`)

    if (error) {
      throw error
    }

    return data as Wine[]
  } catch (error) {
    console.error("Error searching wines:", error)
    return []
  }
}

// Function to toggle bookmark status
export async function toggleWineBookmark(wineId: string, userId: string): Promise<boolean> {
  try {
    // Check if bookmark exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("wine_id", wineId)
      .eq("user_id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      throw checkError
    }

    if (existingBookmark) {
      // Delete bookmark
      const { error: deleteError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("wine_id", wineId)
        .eq("user_id", userId)

      if (deleteError) throw deleteError
      return false // Bookmark removed
    } else {
      // Add bookmark
      const { error: insertError } = await supabase.from("bookmarks").insert({ wine_id: wineId, user_id: userId })

      if (insertError) throw insertError
      return true // Bookmark added
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    throw error
  }
}

// Function to get user's bookmarked wines
export async function getUserBookmarks(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.from("bookmarks").select("wine_id").eq("user_id", userId)

    if (error) {
      throw error
    }

    return data.map((bookmark) => bookmark.wine_id)
  } catch (error) {
    console.error("Error fetching user bookmarks:", error)
    return []
  }
}
