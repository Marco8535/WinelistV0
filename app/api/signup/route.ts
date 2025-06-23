import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SignupRequest {
  restaurantName: string
  subdomain: string
  adminEmail: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    
    // Validar datos de entrada
    const validation = validateSignupData(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { restaurantName, subdomain, adminEmail, password } = body
    
    // Crear cliente de Supabase
    const supabase = createClient()
    
    // Verificar si el subdominio ya existe
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('subdomain', subdomain)
      .single()
    
    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Este subdominio ya está en uso. Por favor, elige otro.' },
        { status: 409 }
      )
    }
    
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: password,
      options: {
        data: {
          restaurant_name: restaurantName,
          subdomain: subdomain
        }
      }
    })
    
    if (authError) {
      console.error('Error creating user:', authError)
      return NextResponse.json(
        { error: authError.message || 'Error al crear el usuario' },
        { status: 400 }
      )
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      )
    }
    
    // Crear el restaurante en la base de datos
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        user_id: authData.user.id,
        name: restaurantName,
        subdomain: subdomain,
        admin_email: adminEmail,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (restaurantError) {
      console.error('Error creating restaurant:', restaurantError)
      return NextResponse.json(
        { error: 'Error al crear el restaurante. Por favor, inténtalo de nuevo.' },
        { status: 500 }
      )
    }
    
    // Crear configuración inicial de la aplicación
    await createInitialAppSettings(supabase, restaurant.id)
    
    // Crear configuración inicial de categorías
    await createInitialCategorySettings(supabase, restaurant.id)
    
    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Restaurante registrado exitosamente',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        subdomain: restaurant.subdomain,
        url: `https://${restaurant.subdomain}.lazysomm.app`
      }
    })
    
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function validateSignupData(data: SignupRequest): { isValid: boolean; error?: string } {
  // Validar nombre del restaurante
  if (!data.restaurantName || data.restaurantName.trim().length < 2) {
    return {
      isValid: false,
      error: 'El nombre del restaurante debe tener al menos 2 caracteres'
    }
  }
  
  // Validar subdominio
  if (!data.subdomain || data.subdomain.trim().length < 3) {
    return {
      isValid: false,
      error: 'El subdominio debe tener al menos 3 caracteres'
    }
  }
  
  const subdomainRegex = /^[a-z0-9-]+$/
  if (!subdomainRegex.test(data.subdomain)) {
    return {
      isValid: false,
      error: 'El subdominio solo puede contener letras minúsculas, números y guiones'
    }
  }
  
  // Validar que no empiece o termine con guión
  if (data.subdomain.startsWith('-') || data.subdomain.endsWith('-')) {
    return {
      isValid: false,
      error: 'El subdominio no puede empezar o terminar con guión'
    }
  }
  
  // Validar email
  if (!data.adminEmail) {
    return {
      isValid: false,
      error: 'El email del administrador es requerido'
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.adminEmail)) {
    return {
      isValid: false,
      error: 'Por favor, ingresa un email válido'
    }
  }
  
  // Validar contraseña
  if (!data.password || data.password.length < 6) {
    return {
      isValid: false,
      error: 'La contraseña debe tener al menos 6 caracteres'
    }
  }
  
  return { isValid: true }
}

async function createInitialAppSettings(supabase: any, restaurantId: string) {
  try {
    await supabase
      .from('app_settings')
      .insert({
        restaurant_id: restaurantId,
        google_sheet_id: '',
        google_sheet_published_id: '',
        sync_enabled: false,
        last_sync: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error creating initial app settings:', error)
    // No lanzamos error aquí para no bloquear el registro
  }
}

async function createInitialCategorySettings(supabase: any, restaurantId: string) {
  try {
    // Categorías por defecto
    const defaultCategories = [
      { name: 'Tintos', order_index: 0, is_active: true },
      { name: 'Blancos', order_index: 1, is_active: true },
      { name: 'Rosados', order_index: 2, is_active: true },
      { name: 'Espumantes', order_index: 3, is_active: true },
      { name: 'Dulces', order_index: 4, is_active: true }
    ]
    
    const categoriesToInsert = defaultCategories.map(category => ({
      restaurant_id: restaurantId,
      category_name: category.name,
      order_index: category.order_index,
      is_active: category.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    await supabase
      .from('categories_settings')
      .insert(categoriesToInsert)
      
  } catch (error) {
    console.error('Error creating initial category settings:', error)
    // No lanzamos error aquí para no bloquear el registro
  }
} 