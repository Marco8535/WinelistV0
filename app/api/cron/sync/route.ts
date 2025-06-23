import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Asegúrate de que importe el cliente de SERVIDOR
// Simula la función de fetchWines aquí o impórtala si la refactorizaste
async function fetchWinesFromSheet(sheetId: string): Promise<any[]> {
    // Esta es una versión simplificada de la lógica que tenías en fetch-wines.ts
    // ¡Asegúrate de que la URL y el parseo sean correctos!
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
    try {
        console.log(`[SYNC] Fetching sheet: ${csvUrl}`);
        const response = await fetch(csvUrl, { cache: 'no-store' });
        if (!response.ok) {
            console.error(`[SYNC] Error fetching sheet ${sheetId}. Status: ${response.status}`);
            return [];
        }
        const csvText = await response.text();
        // Aquí iría tu lógica de parseo de CSV para convertir el texto en un array de objetos de vino
        // Por simplicidad, asumimos que tienes una función parseCSV
        // const wines = parseCSV(csvText);
        // console.log(`[SYNC] Found ${wines.length} wines in sheet ${sheetId}`);
        // return wines;
        console.log(`[SYNC] CSV Text for sheet ${sheetId} fetched, length: ${csvText.length}`);
        // Devuelve un array vacío por ahora para no romper el código, la lógica de parseo es compleja de re-implementar aquí
        // El objetivo es ver si el fetch funciona.
        return []; // Reemplaza esto con tu lógica de parseo real si es posible.
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
          ...wine, // todos los campos del vino parseado
          restaurant_id: restaurant.id,
          // Asegúrate de que 'idInterno' se mapea a una columna que uses para el 'onConflict'
        }));

        // 4. Hacer Upsert en Supabase
        const { error: upsertError } = await supabase
          .from('wines')
          .upsert(winesToUpsert, { onConflict: 'idInterno, restaurant_id' }); // O la columna que uses como identificador único

        if (upsertError) {
          console.error(`[CRON_SYNC] Error upserting wines for ${restaurant.name}:`, upsertError);
        } else {
          console.log(`[CRON_SYNC] Successfully upserted ${winesToUpsert.length} wines for ${restaurant.name}.`);
        }
      } else {
         console.warn(`[CRON_SYNC] No wines found in Google Sheet for ${restaurant.name}. This could mean: 1) Sheet is empty, 2) Sheet is not published, 3) Sheet ID is invalid.`);
      }
    }

    console.log('[CRON_SYNC] Job finished successfully.');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[CRON_SYNC] A critical error occurred:', error);
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
}
