import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Parse URL and query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("bookmarks").select("wine_id").eq("user_id", userId)

    if (error) {
      throw error
    }

    return NextResponse.json(data.map((bookmark) => bookmark.wine_id))
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, wineId } = await request.json()

    if (!userId || !wineId) {
      return NextResponse.json({ error: "User ID and Wine ID are required" }, { status: 400 })
    }

    // Check if bookmark already exists
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
      return NextResponse.json({ bookmarked: false })
    } else {
      // Add bookmark
      const { error: insertError } = await supabase.from("bookmarks").insert({ wine_id: wineId, user_id: userId })

      if (insertError) throw insertError
      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 })
  }
}
