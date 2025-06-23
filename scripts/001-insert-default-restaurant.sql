-- Asegúrate de que la tabla 'restaurants' exista.
-- Si no existe, primero debes crearla con una estructura similar a esta:
-- CREATE TABLE IF NOT EXISTS restaurants (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     subdomain TEXT NOT NULL UNIQUE,
--     logo_url TEXT,
--     primary_color TEXT DEFAULT '#8B0000', -- Ejemplo: DarkRed
--     secondary_color TEXT DEFAULT '#F5F5DC', -- Ejemplo: Beige
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Insertar el restaurante 'open' si no existe
INSERT INTO restaurants (name, subdomain, logo_url, primary_color, secondary_color)
SELECT 
    'Default Restaurant (Open)', 
    'open', 
    '/placeholder.svg?width=100&height=40', 
    '#8B0000', 
    '#F5F5DC'
WHERE NOT EXISTS (
    SELECT 1 FROM restaurants WHERE subdomain = 'open'
);

-- Opcionalmente, si quieres que el subdominio de preview de Vercel también funcione,
-- puedes añadirlo. Reemplaza 'kzmh42y7jw9sd8u99duh' con el subdominio actual si cambia.
-- INSERT INTO restaurants (name, subdomain, logo_url, primary_color, secondary_color)
-- SELECT 
--     'Vercel Preview Restaurant', 
--     'kzmh42y7jw9sd8u99duh', 
--     '/placeholder.svg?width=100&height=40', 
--     '#00008B', -- Ejemplo: DarkBlue
--     '#E6E6FA'  -- Ejemplo: Lavender
-- WHERE NOT EXISTS (
--     SELECT 1 FROM restaurants WHERE subdomain = 'kzmh42y7jw9sd8u99duh'
-- );

-- Después de insertar el restaurante, necesitarás insertar configuraciones asociadas
-- en 'app_settings' y 'categories_settings' para este nuevo restaurante.
-- Ejemplo para app_settings (asumiendo que el ID del restaurante 'open' es conocido o se puede obtener):
-- WITH open_restaurant AS (
--   SELECT id FROM restaurants WHERE subdomain = 'open'
-- )
-- INSERT INTO app_settings (restaurant_id, app_title, currency_symbol, show_prices, show_alcohol, compact_view, sommelier_enabled, whatsapp_enabled, email_enabled)
-- SELECT 
--     (SELECT id FROM open_restaurant),
--     'Default Wine List',
--     '$',
--     true,
--     true,
--     false,
--     false,
--     false,
--     false
-- WHERE NOT EXISTS (
--     SELECT 1 FROM app_settings WHERE restaurant_id = (SELECT id FROM open_restaurant)
-- );

-- Deberías hacer algo similar para 'categories_settings' y también poblar la tabla 'wines'
-- con vinos asociados al ID de este restaurante 'open'.
