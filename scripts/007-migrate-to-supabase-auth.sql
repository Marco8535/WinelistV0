-- Migración a Supabase Auth: Actualizar esquema de tabla restaurants
-- Este script debe ejecutarse DESPUÉS de 006-add-login-fields.sql

-- 1. Agregar columna user_id como foreign key a auth.users
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Eliminar la columna admin_password (ya no la necesitamos)
ALTER TABLE restaurants 
DROP COLUMN IF EXISTS admin_password;

-- 3. Crear índice para mejorar performance en consultas por user_id
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id);

-- 4. Actualizar las políticas RLS para usar auth.uid() en lugar de verificación manual
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own restaurant data" ON restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurant data" ON restaurants;
DROP POLICY IF EXISTS "Service role can insert restaurants" ON restaurants;

-- Crear nuevas políticas basadas en auth.uid()
CREATE POLICY "Users can view their own restaurant data" ON restaurants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurant data" ON restaurants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own restaurant data" ON restaurants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política especial para permitir que el cron job funcione (cuando auth.uid() es NULL)
CREATE POLICY "Allow cron job operations" ON restaurants
    FOR ALL USING (auth.uid() IS NULL);

-- 5. Actualizar políticas para las tablas relacionadas (wines, app_settings, categories_settings)
-- Wines table
DROP POLICY IF EXISTS "Users can view wines for their restaurant" ON wines;
DROP POLICY IF EXISTS "Users can manage wines for their restaurant" ON wines;
DROP POLICY IF EXISTS "Allow cron job wine operations" ON wines;

CREATE POLICY "Users can view wines for their restaurant" ON wines
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage wines for their restaurant" ON wines
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Allow cron job wine operations" ON wines
    FOR ALL USING (auth.uid() IS NULL);

-- App Settings table
DROP POLICY IF EXISTS "Users can view their app settings" ON app_settings;
DROP POLICY IF EXISTS "Users can update their app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow cron job app settings operations" ON app_settings;

CREATE POLICY "Users can view their app settings" ON app_settings
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their app settings" ON app_settings
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Allow cron job app settings operations" ON app_settings
    FOR ALL USING (auth.uid() IS NULL);

-- Categories Settings table
DROP POLICY IF EXISTS "Users can view their category settings" ON categories_settings;
DROP POLICY IF EXISTS "Users can update their category settings" ON categories_settings;
DROP POLICY IF EXISTS "Allow cron job category operations" ON categories_settings;

CREATE POLICY "Users can view their category settings" ON categories_settings
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their category settings" ON categories_settings
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Allow cron job category operations" ON categories_settings
    FOR ALL USING (auth.uid() IS NULL);

-- Premium Wineries table
DROP POLICY IF EXISTS "Users can view their premium wineries" ON premium_wineries;
DROP POLICY IF EXISTS "Users can update their premium wineries" ON premium_wineries;
DROP POLICY IF EXISTS "Allow cron job premium wineries operations" ON premium_wineries;

CREATE POLICY "Users can view their premium wineries" ON premium_wineries
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their premium wineries" ON premium_wineries
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Allow cron job premium wineries operations" ON premium_wineries
    FOR ALL USING (auth.uid() IS NULL);

-- 6. Comentarios para documentar los cambios
COMMENT ON COLUMN restaurants.user_id IS 'Foreign key to auth.users table from Supabase Auth';
COMMENT ON TABLE restaurants IS 'Updated to use Supabase Auth instead of custom authentication'; 