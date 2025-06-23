import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AppConfig } from '@/types/wine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id, config }: { restaurant_id: string; config: AppConfig } = body

    if (!restaurant_id || !config) {
      return NextResponse.json(
        { error: 'Missing restaurant_id or config' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update app settings in Supabase
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        restaurant_id: restaurant_id,
        sommelier_enabled: config.sommelierEnabled,
        sommelier_phone: config.sommelierPhone,
        whatsapp_enabled: config.whatsappEnabled,
        email_enabled: config.emailEnabled,
        contact_email: config.contactEmail,
        restaurant_name: config.restaurantName,
        restaurant_address: config.restaurantAddress,
        currency_symbol: config.currencySymbol,
        app_title: config.appTitle,
        show_prices: config.showPrices,
        show_alcohol: config.showAlcohol,
        compact_view: config.compactView
      })

    if (error) {
      console.error('Error updating app settings:', error)
      return NextResponse.json(
        { error: 'Failed to update app settings', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in app settings API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 