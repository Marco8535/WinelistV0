import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface LoginRequest {
  email: string // Changed from adminEmail
  password: string
}

export async function POST(request: NextRequest) {
  let supabase; // Declare supabase client variable
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body; // Destructure email and password

    // Validar input data using the updated email field
    const validation = validateLoginData({ email, password });
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // const { adminEmail, password } = body // Original line, now email and password are directly from body
    
    // Attempt to create Supabase client with new error handling
    try {
      supabase = createClient();
      console.log('[login API] Attempted to create Supabase client.');
    } catch (e) {
      console.error('[login API] CRITICAL: Error thrown during createClient() call.', e);
      return NextResponse.json({ error: 'Server configuration error during client creation.' }, { status: 500 });
    }

    if (!supabase) {
      console.error('[login API] CRITICAL: Supabase client is null or undefined after creation.');
      return NextResponse.json({ error: 'Failed to initialize Supabase client on the server.' }, { status: 500 });
    }
    console.log('[login API] Supabase client created successfully, proceeding to login.');
    
    // Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email, // Use the destructured email
      password,
    })
    
    if (authError || !authData.user) {
      console.error('[login API] Supabase signInWithPassword error:', authError); // Added more specific log
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    console.log('[login API] User authenticated successfully:', authData.user.id);

    // Buscar el restaurante asociado al user_id
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (restaurantError || !restaurant) {
      console.error('[login API] Restaurant not found or error:', restaurantError); // Added more specific log
      return NextResponse.json(
        { error: 'No se encontró un restaurante activo asociado a esta cuenta o hay un problema con la consulta.' },
        { status: 404 }
      );
    }
    console.log('[login API] Active restaurant found:', restaurant.id);

    // Actualizar último login
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurant.id);

    if (updateError) {
      console.error('[login API] Failed to update last_login:', updateError);
      // Non-critical error, so we can proceed but should log it
    } else {
      console.log('[login API] Last login updated for restaurant:', restaurant.id);
    }
    
    // Construir la URL de redirección
    // Ensure your environment is configured for this or have a fallback
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'lazysomm.app';
    const redirectUrl = `https://${restaurant.subdomain}.${appDomain}`;
    console.log(`[login API] Redirect URL constructed: ${redirectUrl}`);

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
    
  } catch (error: any) { // Catching potential errors from request.json() or other unexpected issues
    console.error('[login API] Unhandled exception in POST handler:', error);
    // Check if it's a known error type, otherwise generic message
    const errorMessage = error.message || 'Error interno del servidor';
    const errorStatus = error.status || 500; // Use error status if available
    return NextResponse.json(
      { error: errorMessage },
      { status: errorStatus }
    );
  }
}

function validateLoginData(data: LoginRequest): { isValid: boolean; error?: string } {
  // Validar email
  if (!data.email) { // Changed from data.adminEmail
    return {
      isValid: false,
      error: 'El email es requerido' // Changed message
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) { // Changed from data.adminEmail
    return {
      isValid: false,
      error: 'Por favor, ingresa un email válido'
    };
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