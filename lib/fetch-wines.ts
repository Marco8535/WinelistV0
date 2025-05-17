import type { Wine } from "@/types/wine"

export async function fetchWines(): Promise<Wine[]> {
  try {
    // URL del CSV público de Google Sheets
    // Asegúrate de que tu hoja de cálculo esté publicada como CSV
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYJ_osaRfpE560QPeFdseyGCdyo0PQ10y0MutQYBaJXzk4b0oIs5twb1BliBePIANRiv0Qat_iftYF/pub?output=csv"

    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch wine data: ${response.status}`)
    }

    const csvText = await response.text()
    const wines = parseCSV(csvText)
    return wines
  } catch (error) {
    console.error("Error fetching wine data:", error)
    return []
  }
}

function parseCSV(csvText: string): Wine[] {
  const lines = csvText.split("\n")
  if (lines.length <= 1) {
    return []
  }

  const headers = lines[0].split(",").map((header) => header.trim())
  const wines: Wine[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = parseCSVLine(lines[i])
    if (values.length < headers.length / 2) continue // Skip malformed lines

    const wine: any = { id: `wine-${i}` }

    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        const key = mapHeaderToWineProperty(header)
        if (key) {
          // Convert boolean strings to actual booleans
          if (values[index].toLowerCase() === "true") {
            wine[key] = true
          } else if (values[index].toLowerCase() === "false") {
            wine[key] = false
          } else {
            wine[key] = values[index]
          }
        }
      }
    })

    // Only add wines that have at least a name and are in the menu
    if (wine.nombre && wine.enCarta !== false) {
      wines.push(wine as Wine)
    }
  }

  return wines
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let currentValue = ""
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === "," && !insideQuotes) {
      values.push(currentValue.trim())
      currentValue = ""
    } else {
      currentValue += char
    }
  }

  values.push(currentValue.trim())
  return values
}

// Helper function to map spreadsheet headers to Wine properties
function mapHeaderToWineProperty(header: string): string | null {
  // Este mapeo debe ajustarse según los encabezados reales de tu hoja de cálculo
  const headerMap: Record<string, string> = {
    // Mapeos específicos según las instrucciones
    Nombre_Vino_Completo: "nombre",
    Bodega: "productor",
    Cosecha: "ano",
    "Precio_Botella_Restaurante R1": "precio",
    "Precio R1 copa": "precioCopa",
    EnCarta_Restaurante1: "enCarta",

    // Otros mapeos que pueden ser útiles
    Pais_Region_Origen: "region",
    Categoria_Sommelier: "estilo",
    Tipo_Vino: "tipo",
    Variedad: "uva",
    Alcohol: "alcohol",
    Enologo: "enologo",
    Vista: "vista",
    Nariz: "nariz",
    Boca: "boca",
    Maridaje: "maridaje",
    Otros: "otros",
    Altitud: "altitud",
    Orden_Visualizacion_Restaurante: "orden",
    SKU_LAZZY: "id",
  }

  // Intenta encontrar una coincidencia en nuestro mapeo
  const normalizedHeader = header.trim()
  return headerMap[normalizedHeader] || null
}
