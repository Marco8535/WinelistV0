import { google } from "googleapis"
import type { Wine } from "@/types/wine"

// Create a Google Sheets API client
const getGoogleSheetsClient = () => {
  try {
    // Check if environment variables are set
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      throw new Error("Google Sheets API credentials are not properly configured")
    }

    // Create a JWT auth client
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    // Create the Google Sheets API client
    return google.sheets({ version: "v4", auth })
  } catch (error) {
    console.error("Error creating Google Sheets client:", error)
    throw error
  }
}

// Fetch data from Google Sheets
const fetchSheetData = async () => {
  try {
    const sheets = getGoogleSheetsClient()
    const sheetId = process.env.GOOGLE_SHEET_ID

    // Get the first sheet
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    })

    const firstSheetTitle = sheetMetadata.data.sheets?.[0]?.properties?.title

    if (!firstSheetTitle) {
      throw new Error("Could not find the first sheet")
    }

    // Get the data from the first sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: firstSheetTitle,
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return []
    }

    // First row contains headers
    const headers = rows[0]

    // Convert rows to objects
    const data = rows.slice(1).map((row) => {
      const item: Record<string, string> = {}
      headers.forEach((header, index) => {
        if (row[index] !== undefined) {
          item[header] = row[index]
        }
      })
      return item
    })

    return data
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error)
    throw error
  }
}

// Map sheet data to Wine objects
const mapToWines = (data: Record<string, string>[]): Wine[] => {
  return data.map((item) => ({
    id: item.SKU || item.id || String(Math.random()),
    nombre: item["Nombre en Carta"] || item.Nombre || "",
    productor: item.Bodega || item.productor || "",
    region: item["Región 1"] || item.region || "",
    pais: item.pais || "",
    ano: item.Añada || item.ano || "",
    uva: item.Cepa || item.uva || "",
    alcohol: item.Alcohol || item.alcohol || "",
    enologo: item.Enólogo || item.enologo || "",
    precio: item["Precio R1"] || item.precio || "",
    precioCopa: item["Precio por copa"] || item.precioCopa || "",
    precioCopaR1: item["Precio R1 copa"] || item.precioCopaR1 || "",
    precioCopaR2: item["Precio R2 copa"] || item.precioCopaR2 || "",
    precioCopaR3: item["Precio R3 copa"] || item.precioCopaR3 || "",
    precioUSD: item["Precio USD"] || item.precioUSD || "",
    vista: item.vista || "",
    nariz: item.nariz || "",
    boca: item.boca || "",
    maridaje: item.Maridajes || item.maridaje || "",
    otros: item.Otros || item.otros || "",
    altitud: item.Altitud || item.altitud || "",
    estilo: item.Estilo || item.estilo || "",
    tipo: item.Tipo || item.tipo || "",
    caracteristica: item["Característica del Vino"] || item.caracteristica || "",
  }))
}

// Parse tasting notes from a combined field
const parseTastingNotes = (wines: Wine[]): Wine[] => {
  return wines.map((wine) => {
    // If we already have separate vista, nariz, boca fields, return as is
    if (wine.vista || wine.nariz || wine.boca) {
      return wine
    }

    // Try to parse from "Notas de Cata" field if it exists
    const notasDeCata = (wine as any)["Notas de Cata"] || ""

    if (notasDeCata) {
      const vista = notasDeCata.match(/Vista:([^.]*)/i)?.[1]?.trim() || ""
      const nariz = notasDeCata.match(/Nariz:([^.]*)/i)?.[1]?.trim() || ""
      const boca = notasDeCata.match(/Boca:([^.]*)/i)?.[1]?.trim() || ""

      return {
        ...wine,
        vista,
        nariz,
        boca,
      }
    }

    return wine
  })
}

// Fetch all wines from Google Sheets
export const fetchAllWinesFromSheet = async (): Promise<Wine[]> => {
  try {
    const data = await fetchSheetData()
    let wines = mapToWines(data)
    wines = parseTastingNotes(wines)
    return wines
  } catch (error) {
    console.error("Error fetching all wines:", error)
    throw error
  }
}

// Fetch wines by category
export const fetchWinesByCategoryFromSheet = async (category: string): Promise<Wine[]> => {
  try {
    const allWines = await fetchAllWinesFromSheet()

    // Filter wines by category
    if (category === "all") {
      return allWines
    } else if (category === "glass") {
      return allWines.filter((wine) => wine.precioCopa || wine.precioCopaR1 || wine.precioCopaR2 || wine.precioCopaR3)
    } else if (category === "red") {
      return allWines.filter(
        (wine) => wine.caracteristica?.toLowerCase().includes("tinto") || wine.tipo?.toLowerCase().includes("tinto"),
      )
    } else if (category === "white") {
      return allWines.filter(
        (wine) => wine.caracteristica?.toLowerCase().includes("blanco") || wine.tipo?.toLowerCase().includes("blanco"),
      )
    } else if (category === "sparkling") {
      return allWines.filter(
        (wine) =>
          wine.caracteristica?.toLowerCase().includes("espumante") ||
          wine.caracteristica?.toLowerCase().includes("espumoso") ||
          wine.tipo?.toLowerCase().includes("espumante") ||
          wine.tipo?.toLowerCase().includes("espumoso"),
      )
    } else if (category === "rose") {
      return allWines.filter(
        (wine) =>
          wine.caracteristica?.toLowerCase().includes("rosado") ||
          wine.caracteristica?.toLowerCase().includes("rosé") ||
          wine.tipo?.toLowerCase().includes("rosado") ||
          wine.tipo?.toLowerCase().includes("rosé"),
      )
    }

    return allWines
  } catch (error) {
    console.error("Error fetching wines by category:", error)
    throw error
  }
}

// Search wines
export const searchWinesFromSheet = async (query: string): Promise<Wine[]> => {
  try {
    const allWines = await fetchAllWinesFromSheet()

    if (!query) {
      return allWines
    }

    const lowerQuery = query.toLowerCase()

    return allWines.filter(
      (wine) =>
        wine.nombre.toLowerCase().includes(lowerQuery) ||
        wine.productor.toLowerCase().includes(lowerQuery) ||
        wine.uva?.toLowerCase().includes(lowerQuery) ||
        wine.region?.toLowerCase().includes(lowerQuery) ||
        wine.pais?.toLowerCase().includes(lowerQuery),
    )
  } catch (error) {
    console.error("Error searching wines:", error)
    throw error
  }
}

// Get a single wine by ID
export const getWineByIdFromSheet = async (id: string): Promise<Wine | null> => {
  try {
    const allWines = await fetchAllWinesFromSheet()
    return allWines.find((wine) => wine.id === id) || null
  } catch (error) {
    console.error("Error getting wine by ID:", error)
    throw error
  }
}
