import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchWinesFromSheet } from '@/lib/csv-parser';

export async function GET(request: Request) {
  // 1. Autorización
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[CRON_SYNC] Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('[CRON_SYNC] Job started.');
  const supabase = await createClient();

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
          
          // Actualizar last_synced_at
          await supabase
            .from('restaurants')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', restaurant.id);
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
