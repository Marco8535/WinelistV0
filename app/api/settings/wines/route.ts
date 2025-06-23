import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id, wine_id, order, visible }: { 
      restaurant_id: string
      wine_id: string
      order: number
      visible: boolean 
    } = body

    if (!restaurant_id || !wine_id || typeof order !== 'number' || typeof visible !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid parameters: restaurant_id, wine_id, order, visible' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update wine order and visibility in Supabase
    const { error } = await supabase
      .from('wines')
      .update({
        orden: order,
        en_carta: visible
      })
      .eq('id', wine_id)
      .eq('restaurant_id', restaurant_id)

    if (error) {
      console.error('Error updating wine:', error)
      return NextResponse.json(
        { error: 'Failed to update wine', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in wines settings API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 