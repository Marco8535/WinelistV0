import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface LoginRequest {
  subdomain: string
  adminEmail: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    
    // Validar datos de entrada
    const validation = validateLoginData(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { subdomain, adminEmail, password } = body
    
    // Crear cliente de Supabase
    const supabase = createClient()
    
    // Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: password,
    })
    
    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }
    
    // Buscar el restaurante por user_id y subdominio para validar
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single()
    
    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado o inactivo' },
        { status: 401 }
      )
    }
    
    // Actualizar último login
    await supabase
      .from('restaurants')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurant.id)
    
    // Construir la URL de redirección
    const redirectUrl = `https://${restaurant.subdomain}.lazysomm.app`
    
    // Respuesta exitosa con redirectUrl
    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      redirectUrl: redirectUrl,
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        subdomain: restaurant.subdomain
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function validateLoginData(data: LoginRequest): { isValid: boolean; error?: string } {
  // Validar subdominio
  if (!data.subdomain || data.subdomain.trim().length < 3) {
    return {
      isValid: false,
      error: 'El subdominio debe tener al menos 3 caracteres'
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
  if (!data.password) {
    return {
      isValid: false,
      error: 'La contraseña es requerida'
    }
  }
  
  return { isValid: true }
} 