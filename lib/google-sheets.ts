import { GoogleSpreadsheet, type GoogleSpreadsheetRow } from "google-spreadsheet"
import { JWT } from "google-auth-library"
import type { Wine } from "@/types/wine"

// Initialize the Google Spreadsheet
async function getAuthenticatedDoc() {
  try {
    // Check if environment variables are set
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      throw new Error("Google Sheets API credentials are not properly configured")
    }

    // Create a JWT client using the service account credentials
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Create a new document instance
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)

    // Load document properties and worksheets
    await doc.loadInfo()

    return doc
  } catch (error) {
    console.error("Error initializing Google Sheet:", error)
    throw error
  }
}

// Map Google Sheets row data to Wine type
const mapRowToWine = (row: GoogleSpreadsheetRow): Wine => {
  // Get the raw data from the row
  const rowData = row.toObject()

  return {
    id: rowData.SKU || rowData.id || String(Math.random()),
    nombre: rowData["Nombre en Carta"] || rowData.Nombre || "",
    productor: rowData.Bodega || rowData.productor || "",
    region: rowData["Región 1"] || rowData.region || "",
    pais: rowData.pais || "",
    ano: rowData.Añada || rowData.ano || "",
    uva: rowData.Cepa || rowData.uva || "",
    alcohol: rowData.Alcohol || rowData.alcohol || "",
    enologo: rowData.Enólogo || rowData.enologo || "",
    precio: rowData["Precio R1"] || rowData.precio || "",
    precioCopa: rowData["Precio por copa"] || rowData.precioCopa || "",
    precioCopaR1: rowData["Precio R1 copa"] || rowData.precioCopaR1 || "",
    precioCopaR2: rowData["Precio R2 copa"] || rowData.precioCopaR2 || "",
    precioCopaR3: rowData["Precio R3 copa"] || rowData.precioCopaR3 || "",
    precioUSD: rowData["Precio USD"] || rowData.precioUSD || "",
    vista: rowData.vista || "",
    nariz: rowData.nariz || "",
    boca: rowData.boca || "",
    maridaje: rowData.Maridajes || rowData.maridaje || "",
    otros: rowData.Otros || rowData.otros || "",
    altitud: rowData.Altitud || rowData.altitud || "",
    estilo: rowData.Estilo || rowData.estilo || "",
    tipo: rowData.Tipo || rowData.tipo || "",
    caracteristica: rowData["Característica del Vino"] || rowData.caracteristica || "",
  }
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
    const doc = await getAuthenticatedDoc()

    // Assuming the first sheet contains the wine data
    const sheet = doc.sheetsByIndex[0]

    // Load all rows
    const rows = await sheet.getRows()

    // Map rows to Wine objects
    let wines = rows.map((row) => mapRowToWine(row))

    // Parse tasting notes
    wines = parseTastingNotes(wines)

    return wines
  } catch (error) {
    console.error("Error fetching wines from Google Sheet:", error)
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
