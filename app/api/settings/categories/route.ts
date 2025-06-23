import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CategoryConfig {
  name: string
  order: number
  visible: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id, categories }: { restaurant_id: string; categories: CategoryConfig[] } = body

    if (!restaurant_id || !categories) {
      return NextResponse.json(
        { error: 'Missing restaurant_id or categories' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Delete existing categories settings for this restaurant
    const { error: deleteError } = await supabase
      .from('categories_settings')
      .delete()
      .eq('restaurant_id', restaurant_id)

    if (deleteError) {
      console.error('Error deleting existing categories:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete existing categories', details: deleteError.message },
        { status: 500 }
      )
    }

    // Insert new categories settings
    const categoriesToInsert = categories.map(cat => ({
      restaurant_id: restaurant_id,
      name: cat.name,
      display_order: cat.order,
      visible: cat.visible
    }))

    const { error: insertError } = await supabase
      .from('categories_settings')
      .insert(categoriesToInsert)

    if (insertError) {
      console.error('Error inserting categories:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert categories', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in categories settings API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
