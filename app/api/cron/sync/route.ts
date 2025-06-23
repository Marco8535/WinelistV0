import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processAndGroupWines } from '@/lib/process-wines'
import type { Wine, GroupedWineData } from '@/types/wine'

// Function to fetch wines from a specific Google Sheet
async function fetchWinesFromSheet(sheetId: string): Promise<Wine[]> {
  if (!sheetId) {
    console.error('No sheet ID provided')
    return []
  }
  
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`
    console.log(`[fetchWinesFromSheet] Fetching from: ${csvUrl}`)
    
    const response = await fetch(csvUrl, { cache: "no-store" })
    console.log(`[fetchWinesFromSheet] Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`)
    }
    
    const csvText = await response.text()
    console.log(`[fetchWinesFromSheet] CSV length: ${csvText.length} characters`)
    
    const wines = parseCSV(csvText)
    console.log(`[fetchWinesFromSheet] Parsed wines: ${wines.length}`)
    return wines
  } catch (error) {
    console.error(`Error fetching wines from sheet ${sheetId}:`, error)
    return []
  }
}

// Simplified CSV parser for the cron job
function parseCSV(csvText: string): Wine[] {
  const lines = csvText.split('\n')
  if (lines.length <= 1) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const wines: Wine[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(',').map(v => v.trim())
    const wine: any = {}

    headers.forEach((header, index) => {
      const rawValue = values[index] || ''
      const key = mapHeaderToWineProperty(header)
      
      if (key && rawValue) {
        if (key === 'enCarta') {
          wine[key] = rawValue.toLowerCase() === 'true'
        } else if (key === 'orden') {
          const num = parseInt(rawValue, 10)
          wine[key] = isNaN(num) ? null : num
        } else if (key === 'precio' || key === 'precioCopa') {
          const cleaned = rawValue.replace(/^\$/, '').replace(/,/g, '').trim()
          const num = parseFloat(cleaned)
          wine[key] = isNaN(num) ? null : num
        } else if (key === 'ano') {
          wine[key] = rawValue.toUpperCase() === 'N/V' ? 'N/V' : (parseInt(rawValue, 10) || rawValue)
        } else {
          wine[key] = rawValue
        }
      }
    })

    // Generate ID
    wine.id = wine.idInterno || `wine-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`
    
    if (wine.nombre) {
      wines.push(wine as Wine)
    }
  }
  
  return wines
}

// Simple header mapping
function mapHeaderToWineProperty(header: string): keyof Wine | null {
  const normalizedHeader = header.trim().toUpperCase()
  const headerMap: Record<string, keyof Wine> = {
    'SKU_LAZZY': 'idInterno',
    'NOMBRE_VINO_COMPLETO': 'nombre',
    'BODEGA': 'productor',
    'COSECHA': 'ano',
    'ORDEN_VISUALIZACION_VINO': 'orden',
    'ALCOHOL': 'alcohol',
    'ENCARTA_RESTAURANTE1': 'enCarta',
    'CATEGORIA_SOMMELIER': 'estilo',
    'TIPOVINO': 'tipo',
    'PRECIO_BOTELLA_RESTAURANTE R1': 'precio',
    'PRECIO R1 COPA': 'precioCopa',
    'PAIS_REGION_ORIGEN': 'region',
    'CEPA': 'uva',
    'ENÓLOGO': 'enologo',
    'MARIDAJES': 'maridaje',
    'VISTA': 'vista',
    'NARIZ': 'nariz',
    'BOCA': 'boca',
    'OTROS': 'otros',
    'ALTITUD': 'altitud'
  }
  
  return headerMap[normalizedHeader] || null
}

// Security check for cron job authorization
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is not set')
    return false
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  let syncedRestaurants = 0
  let errors = 0
  const errorDetails: string[] = []

  try {
    // Get all restaurants with their Google Sheet IDs
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name, google_sheet_id')
      .not('google_sheet_id', 'is', null)

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError)
      return NextResponse.json(
        { error: 'Failed to fetch restaurants', details: restaurantsError.message },
        { status: 500 }
      )
    }

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No restaurants found with Google Sheet IDs',
        synced_restaurants: 0,
        errors: 0
      })
    }

    // Process each restaurant
    for (const restaurant of restaurants) {
      try {
        console.log(`Syncing restaurant: ${restaurant.name} (ID: ${restaurant.id})`)
        
        // Fetch wines from Google Sheet
        const rawWinesData = await fetchWinesFromSheet(restaurant.google_sheet_id)
        const processedWines = processAndGroupWines(rawWinesData, [])

        if (!processedWines || processedWines.length === 0) {
          console.warn(`No wines found for restaurant ${restaurant.name}`)
          continue
        }

        // Prepare wines for upsert - add restaurant_id and map field names
        const winesToUpsert = processedWines.flatMap((category: { wines: Wine[] }) => 
          category.wines.map((wine: Wine) => ({
            restaurant_id: restaurant.id,
            id_interno: wine.idInterno || wine.id,
            nombre: wine.nombre,
            productor: wine.productor,
            region: wine.region,
            pais: wine.pais,
            ano: wine.ano?.toString(),
            uva: wine.uva,
            alcohol: wine.alcohol,
            enologo: wine.enologo,
            precio: wine.precio ? parseFloat(wine.precio.toString()) : null,
            precio_copa: wine.precioCopa ? parseFloat(wine.precioCopa.toString()) : null,
            precio_copa_r1: wine.precioCopaR1,
            precio_copa_r2: wine.precioCopaR2,
            precio_copa_r3: wine.precioCopaR3,
            precio_usd: wine.precioUSD,
            vista: wine.vista,
            nariz: wine.nariz,
            boca: wine.boca,
            maridaje: wine.maridaje,
            otros: wine.otros,
            altitud: wine.altitud,
            estilo: wine.estilo,
            tipo: wine.tipo,
            caracteristica: wine.caracteristica,
            en_carta: wine.enCarta !== false, // Default to true
            orden: wine.orden || 0,
            is_premium_winery: wine.isPremiumWinery || false,
            premium_content: wine.premiumContent ? JSON.stringify(wine.premiumContent) : null
          }))
        )

        // Delete existing wines for this restaurant
        const { error: deleteError } = await supabase
          .from('wines')
          .delete()
          .eq('restaurant_id', restaurant.id)

        if (deleteError) {
          throw new Error(`Failed to delete existing wines: ${deleteError.message}`)
        }

        // Insert new wines
        const { error: upsertError } = await supabase
          .from('wines')
          .insert(winesToUpsert)

        if (upsertError) {
          throw new Error(`Failed to upsert wines: ${upsertError.message}`)
        }

        console.log(`Successfully synced ${winesToUpsert.length} wines for ${restaurant.name}`)
        syncedRestaurants++

      } catch (restaurantError) {
        errors++
        const errorMessage = `Error syncing restaurant ${restaurant.name}: ${restaurantError instanceof Error ? restaurantError.message : 'Unknown error'}`
        console.error(errorMessage)
        errorDetails.push(errorMessage)
      }
    }

    return NextResponse.json({
      success: true,
      synced_restaurants: syncedRestaurants,
      errors,
      error_details: errorDetails,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Critical error in sync process:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Critical sync failure',
        details: error instanceof Error ? error.message : 'Unknown error',
        synced_restaurants: syncedRestaurants,
        errors: errors + 1
      },
      { status: 500 }
    )
  }
}

// Also handle POST requests for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
} 