import Papa from "papaparse"
import type { Wine } from "@/types/wine"
import { MOCK_WINES } from "./mock-data"

// URL of the published Google Sheet CSV
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYJ_osaRfpE560QPeFdseyGCdyo0PQ10y0MutQYBaJXzk4b0oIs5twb1BliBePIANRiv0Qat_iftYF/pub?gid=0&single=true&output=csv"

interface GoogleSheetWine {
  SKU_LAZZY: string
  EnCarta_Restaurante_1: boolean | string
  Bodega: string
  Nombre_Vino_Completo: string
  Cosecha: string
  Tipo_Vino: string
  Pais_Region_Origen: string
  Categoria_Sommelier?: string
  Precio_Botella_Restaurante: number
  Orden_Visualizacion_Restaurante: number
  [key: string]: any // For any additional fields
}

export async function fetchWines(): Promise<Wine[]> {
  try {
    // Fetch the CSV data
    const response = await fetch(GOOGLE_SHEET_CSV_URL)

    if (!response.ok) {
      console.error(`Failed to fetch wine data: ${response.status} ${response.statusText}`)
      return MOCK_WINES // Return mock data if fetch fails
    }

    const csvText = await response.text()

    // Parse the CSV data
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors)
            resolve(MOCK_WINES) // Return mock data if parsing fails
            return
          }

          const data = results.data as GoogleSheetWine[]

          // Filter wines that are in the restaurant's menu
          const filteredWines = data.filter((wine) => {
            const enCartaValue = wine.EnCarta_Restaurante_1
            if (typeof enCartaValue === "string") {
              return enCartaValue.toLowerCase() === "true"
            }
            return Boolean(enCartaValue)
          })

          // Map the Google Sheet data to our Wine type
          const mappedWines = filteredWines.map((wine) => ({
            id: wine.SKU_LAZZY || String(Math.random()),
            nombre: wine.Nombre_Vino_Completo || "",
            productor: wine.Bodega || "",
            region: wine.Pais_Region_Origen?.split(",")[0]?.trim() || "",
            pais: wine.Pais_Region_Origen?.split(",")[1]?.trim() || wine.Pais_Region_Origen || "",
            ano: wine.Cosecha || "",
            tipo: wine.Tipo_Vino || "",
            precio:
              typeof wine.Precio_Botella_Restaurante === "number"
                ? `$${wine.Precio_Botella_Restaurante.toFixed(2)}`
                : String(wine.Precio_Botella_Restaurante || ""),
            categoria: wine.Categoria_Sommelier || wine.Tipo_Vino || "Otros Vinos",
            orden: wine.Orden_Visualizacion_Restaurante || 999,
            // Add other fields as needed
          }))

          resolve(mappedWines)
        },
        error: (error) => {
          console.error("Error in PapaParse:", error)
          resolve(MOCK_WINES) // Return mock data if parsing fails
        },
      })
    })
  } catch (error) {
    console.error("Error fetching or processing wines:", error)
    return MOCK_WINES // Return mock data on error
  }
}

// Function to group wines by category
export function groupWinesByCategory(wines: Wine[]): Record<string, Wine[]> {
  // Group wines by category
  const winesByCategory = wines.reduce(
    (acc, wine) => {
      const category = wine.categoria || "Otros Vinos"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(wine)
      return acc
    },
    {} as Record<string, Wine[]>,
  )

  // Sort wines within each category
  for (const category in winesByCategory) {
    winesByCategory[category].sort((a, b) => {
      // Sort by orden (Orden_Visualizacion_Restaurante)
      const ordenA = a.orden || 999
      const ordenB = b.orden || 999

      if (ordenA !== ordenB) {
        return ordenA - ordenB
      }

      // For same wine (same name and producer), sort by vintage
      if (a.nombre === b.nombre && a.productor === b.productor) {
        const cosechaA = String(a.ano || "")
        const cosechaB = String(b.ano || "")

        if (cosechaA === "N/V" && cosechaB !== "N/V") return 1
        if (cosechaA !== "N/V" && cosechaB === "N/V") return -1
        if (cosechaA === "N/V" && cosechaB === "N/V") return 0

        // Both are years, sort numerically ascending (oldest first)
        if (!isNaN(Number.parseInt(cosechaA, 10)) && !isNaN(Number.parseInt(cosechaB, 10))) {
          return Number.parseInt(cosechaA, 10) - Number.parseInt(cosechaB, 10)
        }
      }

      // Sort alphabetically by name
      return (a.nombre || "").localeCompare(b.nombre || "")
    })
  }

  return winesByCategory
}
