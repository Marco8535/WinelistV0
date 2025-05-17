import { NextResponse } from "next/server"
import { google } from "googleapis"
import type { Wine } from "@/types/wine"

export async function GET() {
  try {
    // Set up Google Sheets authentication
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Get data from the Google Sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:Z", // Adjust the range as needed
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No data found in the spreadsheet" }, { status: 404 })
    }

    // The first row contains the headers
    const headers = rows[0]

    // Convert the rows to Wine objects
    const wines: Wine[] = rows.slice(1).map((row) => {
      const wine: any = {}

      headers.forEach((header: string, index: number) => {
        // Map the spreadsheet headers to our Wine interface properties
        // This mapping might need to be adjusted based on your actual spreadsheet structure
        const key = mapHeaderToWineProperty(header)
        if (key && row[index]) {
          wine[key] = row[index]
        }
      })

      // Generate an ID if none exists
      if (!wine.id) {
        wine.id = Math.random().toString(36).substring(2, 15)
      }

      return wine as Wine
    })

    return NextResponse.json(wines)
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error)
    return NextResponse.json({ error: "Failed to fetch wine data" }, { status: 500 })
  }
}

// Helper function to map spreadsheet headers to Wine properties
function mapHeaderToWineProperty(header: string): string | null {
  // This mapping should be adjusted based on your actual spreadsheet headers
  const headerMap: Record<string, string> = {
    Nombre: "nombre",
    Productor: "productor",
    Bodega: "productor",
    Region: "region",
    País: "pais",
    Pais: "pais",
    Año: "ano",
    Cosecha: "ano",
    Uva: "uva",
    Variedad: "uva",
    Alcohol: "alcohol",
    Enólogo: "enologo",
    Enologo: "enologo",
    Precio: "precio",
    "Precio Botella": "precio",
    "Precio Copa": "precioCopa",
    "Precio Copa R1": "precioCopaR1",
    "Precio Copa R2": "precioCopaR2",
    "Precio Copa R3": "precioCopaR3",
    "Precio USD": "precioUSD",
    Vista: "vista",
    Nariz: "nariz",
    Boca: "boca",
    Maridaje: "maridaje",
    Otros: "otros",
    Altitud: "altitud",
    Estilo: "estilo",
    Tipo: "tipo",
    Característica: "caracteristica",
    Caracteristica: "caracteristica",
    Nombre_Vino_Completo: "nombre",
    Bodega: "productor",
    Pais_Region_Origen: "region",
    Categoria_Sommelier: "estilo",
    Tipo_Vino: "tipo",
    EnCarta_Restaurante_1: "enCarta",
    Precio_Botella_Restaurante: "precio",
    Orden_Visualizacion_Restaurante: "orden",
  }

  // Try to find a match in our mapping
  const normalizedHeader = header.trim()
  return headerMap[normalizedHeader] || null
}
