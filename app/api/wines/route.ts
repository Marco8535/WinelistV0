import { NextResponse } from "next/server"

// Esta ruta API puede ser utilizada como alternativa para obtener los datos
// si prefieres no exponer tu clave de API de Google en el cliente

export async function GET() {
  try {
    // ID de la hoja de cálculo de Google
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    // Utilizamos la API pública de Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Wines?key=${process.env.GOOGLE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error("No se pudieron cargar los datos de vinos")
    }

    const data = await response.json()

    // Procesamos los datos de la hoja de cálculo
    // Asumimos que la primera fila contiene los encabezados
    const headers = data.values[0]
    const rows = data.values.slice(1)

    const wines = rows.map((row: any[], index: number) => {
      const wine: Record<string, any> = {}
      headers.forEach((header: string, i: number) => {
        wine[header.toLowerCase()] = row[i]
      })

      return {
        id: (index + 1).toString(),
        name: wine.name || "",
        type: wine.type || "Tinto",
        region: wine.region || "",
        year: Number.parseInt(wine.year) || new Date().getFullYear(),
        price: Number.parseFloat(wine.price) || 0,
        description: wine.description || "",
        glass: wine.glass ? Number.parseFloat(wine.glass) : undefined,
        winery: wine.winery || "",
        grape: wine.grape || "",
        range: wine.range || "",
      }
    })

    return NextResponse.json(wines)
  } catch (error) {
    console.error("Error al obtener los vinos:", error)
    return NextResponse.json({ error: "No se pudieron cargar los datos de vinos" }, { status: 500 })
  }
}
