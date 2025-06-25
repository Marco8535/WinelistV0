import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  console.log('[server.ts] Attempting to create Supabase server client...');
  const cookieStore = cookies();
  console.log('[server.ts] Cookie store object created:', !!cookieStore); // Log para ver si el objeto de cookies se creó

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('[server.ts] Supabase URL is set:', !!supabaseUrl); // Log para ver si la variable de entorno está presente
  console.log('[server.ts] Supabase Anon Key is set:', !!supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    console.error('[server.ts] CRITICAL: Supabase URL or Key is missing in the environment.');
    // No podemos crear el cliente, devolvemos null o lanzamos un error
    return null;
  }

  // El resto de la función sigue igual...
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { try { cookieStore.set({ name, value, ...options }) } catch (error) {} },
        remove(name: string, options: CookieOptions) { try { cookieStore.set({ name, value: '', ...options }) } catch (error) {} },
      },
    }
  );
}
