import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Asegúrate de que importe el cliente de SERVIDOR

// Función para parsear CSV y convertir a objetos de vino
function parseCSVToWines(csvText: string): any[] {
  try {
    console.log('[SYNC] Starting CSV parsing...');
    
    // Dividir por líneas y filtrar líneas vacías
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      console.log('[SYNC] CSV has less than 2 lines (header + data)');
      return [];
    }
    
    // Obtener headers (primera línea)
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('[SYNC] CSV Headers found:', headers.length, 'columns');
    console.log('[SYNC] First 10 headers:', headers.slice(0, 10));
    
    // Parsear cada línea de datos
    const wines = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Parsear línea CSV (manejar comas dentro de comillas)
      const values = parseCSVLine(line);
      
      if (values.length > 0 && values[0]) { // Al menos debe tener SKU
        const wine: any = {};
        
        // Mapear headers a valores usando índices conocidos o buscar por nombre
        headers.forEach((header, index) => {
          const value = values[index] ? values[index].replace(/"/g, '').trim() : '';
          
          // Mapear columnas del Google Sheet a campos de la base de datos
          switch (header) {
            case 'sku_lazzy':
              wine.id_interno = value;
              break;
            case 'Nombre':
            case 'Nombre_Vino_Completo':
              if (value && value !== '') wine.nombre = value;
              break;
            case 'Bodega':
              wine.productor = value;
              break;
            case 'TipoVino':
              wine.tipo = value;
              wine.estilo = value; // También mapeamos a estilo
              break;
            case 'Cepa':
              wine.uva = value;
              break;
            case 'Cosecha':
              wine.ano = value;
              break;
            case 'Enólogo':
              wine.enologo = value;
              break;
            case 'Región 1':
              wine.region = value;
              break;
            case 'Región 2':
              if (value && wine.region) {
                wine.region += `, ${value}`;
              } else if (value) {
                wine.region = value;
              }
              break;
            case 'Precio_Botella_Restaurante R1':
              if (value) {
                const cleanPrice = value.replace(/[$,"]/g, '');
                const numPrice = parseFloat(cleanPrice);
                if (!isNaN(numPrice)) wine.precio = numPrice;
              }
              break;
            case 'Precio R1 copa':
              if (value) {
                const cleanPrice = value.replace(/[$,"]/g, '');
                const numPrice = parseFloat(cleanPrice);
                if (!isNaN(numPrice)) wine.precio_copa = numPrice;
              }
              break;
            case 'Descripción':
              wine.vista = value;
              break;
            case 'Maridajes':
              wine.maridaje = value;
              break;
            case 'Notas de Cata':
              wine.boca = value;
              break;
            case 'Alcohol':
              wine.alcohol = value;
              break;
            case 'EnCarta_Restaurante1':
              wine.en_carta = value === 'TRUE' || value === 'true';
              break;
            case 'Orden_Visualizacion_Restaurante':
              const ordenNum = parseInt(value);
              if (!isNaN(ordenNum)) wine.orden = ordenNum;
              break;
            case 'Característica del Vino':
              wine.caracteristica = value;
              break;
            // Solo incluir campos que existen en la tabla wines
            // Ignorar campos como: coordenadas, stock_total, depo_1, etc.
          }
        });
        
        // Solo incluir vinos que tengan al menos ID interno o nombre
        if ((wine.id_interno && wine.id_interno.trim()) || (wine.nombre && wine.nombre.trim())) {
          // Asegurar valores por defecto
          wine.en_carta = wine.en_carta !== false; // Por defecto true si no se especifica
          wine.orden = wine.orden || 0;
          
          wines.push(wine);
        }
      }
    }
    
    console.log(`[SYNC] Successfully parsed ${wines.length} wines from CSV`);
    if (wines.length > 0) {
      console.log('[SYNC] Sample wine:', JSON.stringify(wines[0], null, 2));
    }
    return wines;
    
  } catch (error) {
    console.error('[SYNC] Error parsing CSV:', error);
    return [];
  }
}

// Función auxiliar para parsear líneas CSV con comas dentro de comillas
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      // Check for escaped quote
      if (i + 1 < line.length && line[i + 1] === quoteChar) {
        current += char;
        i++; // Skip next quote
      } else {
        inQuotes = false;
        quoteChar = '';
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

async function fetchWinesFromSheet(sheetId: string): Promise<any[]> {
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
    try {
        console.log(`[SYNC] Fetching sheet: ${csvUrl}`);
        const response = await fetch(csvUrl, { cache: 'no-store' });
        if (!response.ok) {
            console.error(`[SYNC] Error fetching sheet ${sheetId}. Status: ${response.status}`);
            return [];
        }
        const csvText = await response.text();
        console.log(`[SYNC] CSV Text for sheet ${sheetId} fetched, length: ${csvText.length}`);
        
        // Parsear CSV a objetos de vino
        const wines = parseCSVToWines(csvText);
        console.log(`[SYNC] Parsed ${wines.length} wines from sheet ${sheetId}`);
        
        return wines;
    } catch (error) {
        console.error(`[SYNC] Exception fetching sheet ${sheetId}:`, error);
        return [];
    }
}

export async function GET(request: Request) {
  // 1. Autorización
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[CRON_SYNC] Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('[CRON_SYNC] Job started.');
  const supabase = createClient();

  try {
    // 2. Obtener todos los restaurantes
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name, google_sheet_id');

    if (restaurantsError) {
      console.error('[CRON_SYNC] Error fetching restaurants:', restaurantsError);
      return NextResponse.json({ success: false, error: 'Could not fetch restaurants' }, { status: 500 });
    }

    console.log(`[CRON_SYNC] Found ${restaurants.length} restaurants to process.`);

    // 3. Iterar y sincronizar cada uno
    for (const restaurant of restaurants) {
      console.log(`[CRON_SYNC] Processing restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
      
      if (!restaurant.google_sheet_id) {
        console.warn(`[CRON_SYNC] Skipping ${restaurant.name}, no google_sheet_id configured.`);
        continue;
      }
      
      console.log(`[CRON_SYNC] Attempting to fetch wines from Google Sheet: ${restaurant.google_sheet_id}`);
      const winesFromSheet = await fetchWinesFromSheet(restaurant.google_sheet_id);
      
      if (winesFromSheet.length > 0) {
        console.log(`[CRON_SYNC] Found ${winesFromSheet.length} wines for ${restaurant.name}. Preparing for upsert.`);
        
        const winesToUpsert = winesFromSheet.map(wine => ({
          ...wine,
          restaurant_id: restaurant.id,
        }));

        // 4. Hacer Upsert en Supabase
        const { error: upsertError } = await supabase
          .from('wines')
          .upsert(winesToUpsert, { 
            onConflict: 'id_interno,restaurant_id',
            ignoreDuplicates: false 
          });

        if (upsertError) {
          console.error(`[CRON_SYNC] Error upserting wines for ${restaurant.name}:`, upsertError);
          console.error(`[CRON_SYNC] Error details:`, JSON.stringify(upsertError, null, 2));
        } else {
          console.log(`[CRON_SYNC] Successfully upserted ${winesToUpsert.length} wines for ${restaurant.name}.`);
        }
      } else {
         console.warn(`[CRON_SYNC] No wines found in Google Sheet for ${restaurant.name}. This could mean: 1) Sheet is empty, 2) Parsing failed, 3) No valid wine data.`);
      }
    }

    console.log('[CRON_SYNC] Job finished successfully.');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[CRON_SYNC] A critical error occurred:', error);
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
}
