-- Script para corregir las políticas RLS y permitir que el cron job inserte datos
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Verificar las políticas RLS actuales
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'wines';

-- 2. Eliminar las políticas RLS existentes que están bloqueando el cron job
DROP POLICY IF EXISTS "Users can read wines from their restaurant" ON wines;
DROP POLICY IF EXISTS "Users can modify wines from their restaurant" ON wines;

-- 3. Crear nuevas políticas RLS más permisivas
-- Política para lectura: permitir lectura de vinos del restaurante del usuario
CREATE POLICY "Users can read wines from their restaurant" ON wines
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

-- Política para inserción/actualización: permitir modificación de vinos del restaurante del usuario
-- O permitir inserción si no hay usuario autenticado (para el cron job)
CREATE POLICY "Users can modify wines from their restaurant" ON wines
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
    OR auth.uid() IS NULL  -- Permitir operaciones sin usuario autenticado (cron job)
  );

-- 4. Verificar que las nuevas políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'wines';

-- 5. Opcional: Si quieres ser más restrictivo, puedes usar esta política alternativa
-- que solo permite inserción/actualización desde el cron job con un token específico
-- (Esto requeriría modificar el código del cron job para incluir un token)

-- Alternativa más segura (opcional):
-- CREATE POLICY "Cron job can modify wines" ON wines
--   FOR ALL USING (
--     current_setting('app.cron_job_token', true) = 'your-secret-token'
--   ); 