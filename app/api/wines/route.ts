import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Parse URL and query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = supabase.from("wines").select("*")

    // Apply category filters if provided
    if (category) {
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
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(
        `nombre.ilike.%${search}%,productor.ilike.%${search}%,uva.ilike.%${search}%,region.ilike.%${search}%`,
      )
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching wines:", error)
    return NextResponse.json({ error: "Failed to fetch wines" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const wine = await request.json()

    const { data, error } = await supabase.from("wines").insert(wine).select()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating wine:", error)
    return NextResponse.json({ error: "Failed to create wine" }, { status: 500 })
  }
}
