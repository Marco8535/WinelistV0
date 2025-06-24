import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchWinesFromSheet } from '@/lib/csv-parser'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id, name, google_sheet_id')
            .eq('user_id', session.user.id)
            .single();

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
        }

        const body = await request.json();
        const { newSheetId } = body;

        if (!newSheetId || typeof newSheetId !== 'string' || !newSheetId.trim()) {
            return NextResponse.json({ error: 'ID de Google Sheet requerido' }, { status: 400 });
        }

        const cleanSheetId = newSheetId.trim();

        await supabase
            .from('restaurants')
            .update({ google_sheet_id: cleanSheetId, updated_at: new Date().toISOString() })
            .eq('id', restaurant.id);

        const winesFromSheet = await fetchWinesFromSheet(cleanSheetId);

        if (winesFromSheet.length === 0) {
            return NextResponse.json({ error: 'No se encontraron datos en el Google Sheet. Verifica que el ID sea correcto y que el sheet sea público.' }, { status: 400 });
        }

        const winesToUpsert = winesFromSheet.map(wine => ({ ...wine, restaurant_id: restaurant.id }));

        await supabase.from('wines').upsert(winesToUpsert, { onConflict: 'id_interno,restaurant_id' });

        await supabase
            .from('restaurants')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', restaurant.id);

        return NextResponse.json({
            success: true,
            message: `Google Sheet actualizado y ${winesToUpsert.length} vinos sincronizados exitosamente`,
            winesCount: winesToUpsert.length
        });

    } catch (error) {
        console.error('[SETTINGS_SOURCE] Unexpected error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}